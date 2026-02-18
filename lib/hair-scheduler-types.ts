export const HAIRSTYLES = [
  "Blowout/Straightening",
  "Curls (diffused)",
  "Curls (air-dried)",
  "Waves",
  "Dutch braids",
  "French braids",
  "Twist-out",
  "Braid-out",
  "Wash & go",
  "Slicked back/updo",
] as const;

export type Hairstyle = (typeof HAIRSTYLES)[number];

/**
 * Default days to reach optimal hair quality for each hairstyle.
 * weatherSensitivity: how much humidity/rain degrades this style.
 *   - "high" = straight/blowout/heat styles degrade quickly in humidity/rain
 *   - "medium" = moderate impact
 *   - "low"  = curly/braid styles are more resistant to humidity
 */
export const HAIRSTYLE_DEFAULTS: Record<
  Hairstyle,
  { daysToOptimal: number; isInstant: boolean; weatherSensitivity: "high" | "medium" | "low" }
> = {
  "Blowout/Straightening": { daysToOptimal: 0, isInstant: true, weatherSensitivity: "high" },
  "Curls (diffused)":      { daysToOptimal: 1, isInstant: false, weatherSensitivity: "low" },
  "Curls (air-dried)":     { daysToOptimal: 2, isInstant: false, weatherSensitivity: "low" },
  "Waves":                 { daysToOptimal: 1, isInstant: false, weatherSensitivity: "medium" },
  "Dutch braids":          { daysToOptimal: 1, isInstant: false, weatherSensitivity: "low" },
  "French braids":         { daysToOptimal: 1, isInstant: false, weatherSensitivity: "low" },
  "Twist-out":             { daysToOptimal: 1, isInstant: false, weatherSensitivity: "low" },
  "Braid-out":             { daysToOptimal: 1, isInstant: false, weatherSensitivity: "low" },
  "Wash & go":             { daysToOptimal: 0, isInstant: true, weatherSensitivity: "medium" },
  "Slicked back/updo":     { daysToOptimal: 0, isInstant: true, weatherSensitivity: "medium" },
};

export interface HairSettings {
  daysToIdeal: number;
  styleDuration: number;
  toleranceDays: number;
  flexibilityMode: "strict" | "moderate" | "relaxed";
  humidityThreshold: number;
}

export interface WeatherDay {
  date: string;
  humidity: number;
  precipitationProbability: number;
  temperatureMax: number;
  temperatureMin: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  important: boolean;
}

export interface WashDay {
  date: string;
  type: "completed" | "scheduled" | "suggested";
  reason?: string;
  hairstyle?: Hairstyle;
  daysToOptimal?: number;
}

export interface DayInfo {
  date: string;
  daysSinceLastWash: number | null;
  hairQuality: number;
  weather: WeatherDay | null;
  isWashDay: boolean;
  washType?: "completed" | "scheduled" | "suggested";
  isIdealWindow: boolean;
  isGoodWindow: boolean;
  events: CalendarEvent[];
  phase: "wash" | "building" | "ideal" | "good" | "declining" | "none";
  lastWashHairstyle?: Hairstyle;
  lastWashDaysToOptimal?: number;
}

export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}
