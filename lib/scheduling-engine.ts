import type {
  HairSettings,
  WeatherDay,
  CalendarEvent,
  WashDay,
  DayInfo,
} from "./hair-scheduler-types";

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return dateStr(d);
}

function diffDays(a: string, b: string): number {
  const da = parseDate(a);
  const db = parseDate(b);
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

export function calculateCurlQuality(
  daysSinceWash: number,
  settings: HairSettings,
  weather: WeatherDay | null
): number {
  const { daysToIdeal, styleDuration } = settings;
  let quality: number;

  if (daysSinceWash === 0) {
    quality = 50;
  } else if (daysSinceWash < daysToIdeal) {
    quality = 50 + (50 * daysSinceWash) / daysToIdeal;
  } else if (daysSinceWash < daysToIdeal + styleDuration) {
    const progress =
      (daysSinceWash - daysToIdeal) / Math.max(1, styleDuration - 1);
    quality = 100 - 10 * progress;
  } else {
    const overtime = daysSinceWash - daysToIdeal - styleDuration;
    quality = Math.max(5, 90 - 20 * overtime);
  }

  if (weather) {
    if (weather.humidity > 60) {
      quality -= (weather.humidity - 60) * 0.4;
    }
    if (weather.precipitationProbability > 40) {
      quality -= (weather.precipitationProbability - 40) * 0.3;
    }
  }

  return Math.max(0, Math.min(100, Math.round(quality)));
}

export function getPhase(
  daysSinceWash: number,
  settings: HairSettings
): DayInfo["phase"] {
  const { daysToIdeal, styleDuration } = settings;
  if (daysSinceWash === 0) return "wash";
  if (daysSinceWash < daysToIdeal) return "building";
  if (daysSinceWash < daysToIdeal + styleDuration) return "ideal";
  if (daysSinceWash < daysToIdeal + styleDuration + 2) return "good";
  return "declining";
}

export function getEffectiveCycleLength(settings: HairSettings): number {
  const base = settings.daysToIdeal + settings.styleDuration;
  switch (settings.flexibilityMode) {
    case "strict":
      return base;
    case "moderate":
      return base + Math.floor(settings.toleranceDays / 2);
    case "relaxed":
      return base + settings.toleranceDays;
  }
}

export function getWeatherAdjustedStyleDuration(
  startDate: string,
  settings: HairSettings,
  weatherMap: Map<string, WeatherDay>
): number {
  let reductionDays = 0;
  for (let i = 0; i < settings.styleDuration + settings.daysToIdeal; i++) {
    const d = addDays(startDate, i);
    const w = weatherMap.get(d);
    if (w) {
      if (w.humidity > 70) reductionDays += 0.3;
      if (w.precipitationProbability > 60) reductionDays += 0.2;
    }
  }
  return Math.max(1, settings.styleDuration - Math.floor(reductionDays));
}

export function suggestWashDays(
  events: CalendarEvent[],
  existingWashes: WashDay[],
  settings: HairSettings,
  weatherMap: Map<string, WeatherDay>,
  today: string,
  rangeEnd: string
): WashDay[] {
  const suggestions: WashDay[] = [];
  const cycleLength = getEffectiveCycleLength(settings);

  const importantEvents = events
    .filter((e) => e.important && e.date >= today && e.date <= rangeEnd)
    .sort((a, b) => a.date.localeCompare(b.date));

  const allWashDates = new Set(existingWashes.map((w) => w.date));

  const targetWashDays: { date: string; reason: string }[] = [];

  for (const event of importantEvents) {
    const idealWashDate = addDays(event.date, -settings.daysToIdeal);
    if (idealWashDate >= today) {
      targetWashDays.push({
        date: idealWashDate,
        reason: `Wash for "${event.title}" on ${event.date}`,
      });
    }
  }

  const consolidatedTargets: { date: string; reason: string }[] = [];
  for (const target of targetWashDays) {
    const existing = consolidatedTargets.find(
      (c) => Math.abs(diffDays(c.date, target.date)) <= 2
    );
    if (existing) {
      existing.reason += ` & ${target.reason}`;
    } else {
      consolidatedTargets.push({ ...target });
    }
  }

  for (const target of consolidatedTargets) {
    if (!allWashDates.has(target.date)) {
      suggestions.push({
        date: target.date,
        type: "suggested",
        reason: target.reason,
      });
      allWashDates.add(target.date);
    }
  }

  const allDates = [...allWashDates].sort();
  if (allDates.length === 0) {
    let current = today;
    while (current <= rangeEnd) {
      suggestions.push({
        date: current,
        type: "suggested",
        reason: "Maintenance wash",
      });
      allWashDates.add(current);
      current = addDays(current, cycleLength);
    }
  } else {
    let current = allDates[allDates.length - 1];
    let nextWash = addDays(current, cycleLength);
    while (nextWash <= rangeEnd) {
      if (!allWashDates.has(nextWash)) {
        suggestions.push({
          date: nextWash,
          type: "suggested",
          reason: "Maintenance wash",
        });
        allWashDates.add(nextWash);
      }
      current = nextWash;
      nextWash = addDays(current, cycleLength);
    }
  }

  return suggestions;
}

export function backCalculateWashes(
  targetWashDate: string,
  today: string,
  settings: HairSettings,
  weatherMap: Map<string, WeatherDay>
): WashDay[] {
  const cycleLength = getEffectiveCycleLength(settings);
  const washes: WashDay[] = [];

  let current = targetWashDate;
  const allWashDays: string[] = [current];

  while (true) {
    const prevWash = addDays(current, -cycleLength);
    if (prevWash <= today) {
      if (diffDays(current, today) > 2) {
        allWashDays.unshift(today);
      }
      break;
    }
    allWashDays.unshift(prevWash);
    current = prevWash;
  }

  for (const d of allWashDays) {
    washes.push({
      date: d,
      type: "suggested",
      reason:
        d === targetWashDate
          ? "Target wash for event"
          : "Scheduled wash in back-calculated plan",
    });
  }

  return washes;
}

export function buildDayInfoMap(
  startDate: string,
  endDate: string,
  washes: WashDay[],
  events: CalendarEvent[],
  settings: HairSettings,
  weatherMap: Map<string, WeatherDay>
): Map<string, DayInfo> {
  const map = new Map<string, DayInfo>();
  const sortedWashes = [...washes].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  let current = startDate;
  while (current <= endDate) {
    const weather = weatherMap.get(current) || null;
    const dayEvents = events.filter((e) => e.date === current);

    let lastWash: string | null = null;
    for (const w of sortedWashes) {
      if (w.date <= current) lastWash = w.date;
    }

    const daysSinceLastWash =
      lastWash !== null ? diffDays(current, lastWash) : null;
    const isWashDay = sortedWashes.some((w) => w.date === current);
    const washEntry = sortedWashes.find((w) => w.date === current);

    const curlQuality =
      daysSinceLastWash !== null
        ? calculateCurlQuality(daysSinceLastWash, settings, weather)
        : 0;

    const phase =
      daysSinceLastWash !== null
        ? getPhase(daysSinceLastWash, settings)
        : "none";

    const isIdealWindow = phase === "ideal";
    const isGoodWindow = phase === "ideal" || phase === "good";

    map.set(current, {
      date: current,
      daysSinceLastWash,
      curlQuality,
      weather,
      isWashDay,
      washType: washEntry?.type,
      isIdealWindow,
      isGoodWindow,
      events: dayEvents,
      phase,
    });

    current = addDays(current, 1);
  }

  return map;
}

export function generateFullSchedule(
  events: CalendarEvent[],
  manualWashes: WashDay[],
  settings: HairSettings,
  weatherMap: Map<string, WeatherDay>,
  today: string
): { washes: WashDay[]; dayInfoMap: Map<string, DayInfo> } {
  const rangeEnd = addDays(today, 60);

  const importantEvents = events
    .filter((e) => e.important && e.date > today)
    .sort((a, b) => a.date.localeCompare(b.date));

  let allWashes: WashDay[] = [...manualWashes];

  for (const event of importantEvents) {
    const idealWash = addDays(event.date, -settings.daysToIdeal);
    if (idealWash >= today) {
      const exists = allWashes.some(
        (w) => Math.abs(diffDays(w.date, idealWash)) <= 1
      );
      if (!exists) {
        const backCalc = backCalculateWashes(
          idealWash,
          today,
          settings,
          weatherMap
        );
        for (const bw of backCalc) {
          const alreadyExists = allWashes.some(
            (w) => Math.abs(diffDays(w.date, bw.date)) <= 1
          );
          if (!alreadyExists) {
            allWashes.push(bw);
          }
        }
      }
    }
  }

  const suggestions = suggestWashDays(
    events,
    allWashes,
    settings,
    weatherMap,
    today,
    rangeEnd
  );

  for (const s of suggestions) {
    const alreadyExists = allWashes.some(
      (w) => Math.abs(diffDays(w.date, s.date)) <= 1
    );
    if (!alreadyExists) {
      allWashes.push(s);
    }
  }

  allWashes.sort((a, b) => a.date.localeCompare(b.date));

  const dayInfoMap = buildDayInfoMap(
    today,
    rangeEnd,
    allWashes,
    events,
    settings,
    weatherMap
  );

  return { washes: allWashes, dayInfoMap };
}
