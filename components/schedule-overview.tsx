"use client";

import type { WashDay, HairSettings, DayInfo } from "@/lib/hair-scheduler-types";
import { Badge } from "@/components/ui/badge";
import { Droplets, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

interface ScheduleOverviewProps {
  washes: WashDay[];
  settings: HairSettings;
  dayInfoMap: Map<string, DayInfo>;
  today: string;
}

export function ScheduleOverview({
  washes,
  settings,
  dayInfoMap,
  today,
}: ScheduleOverviewProps) {
  const upcomingWashes = washes
    .filter((w) => w.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  if (upcomingWashes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          No wash schedule yet. Add events or mark a wash day to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wide">
        Upcoming Wash Schedule
      </h3>
      <div className="space-y-2">
        {upcomingWashes.map((wash, i) => {
          const dateObj = new Date(wash.date + "T12:00:00");
          const dayInfo = dayInfoMap.get(wash.date);

          const idealStart = new Date(wash.date + "T12:00:00");
          idealStart.setDate(idealStart.getDate() + settings.daysToIdeal);
          const idealEnd = new Date(idealStart);
          idealEnd.setDate(idealEnd.getDate() + settings.styleDuration - 1);

          const nextWash = upcomingWashes[i + 1];
          let gapWarning = false;
          if (nextWash) {
            const washDateMs = new Date(wash.date + "T12:00:00").getTime();
            const nextWashMs = new Date(nextWash.date + "T12:00:00").getTime();
            const gap = Math.round((nextWashMs - washDateMs) / 86400000);
            const maxCycle =
              settings.daysToIdeal +
              settings.styleDuration +
              settings.toleranceDays;
            gapWarning = gap > maxCycle;
          }

          return (
            <div
              key={wash.date}
              className="p-3 rounded-lg bg-secondary/40 border border-border"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-wash-day" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {dateObj.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {wash.reason && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {wash.reason}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  className={`text-[10px] ${
                    wash.type === "completed"
                      ? "bg-wash-day/20 text-wash-day border-wash-day/40"
                      : wash.type === "scheduled"
                        ? "bg-building-day/15 text-building-day border-building-day/40"
                        : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  {wash.type}
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Wash</span>
                <ArrowRight className="w-3 h-3" />
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-ideal-day" />
                  Ideal:{" "}
                  {idealStart.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  {" - "}
                  {idealEnd.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {gapWarning && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-bad-day">
                  <AlertTriangle className="w-3 h-3" />
                  <span>
                    Gap to next wash exceeds your tolerance. Hair may decline
                    before the next cycle.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
