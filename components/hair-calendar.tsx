"use client";

import { useMemo } from "react";
import type { DayInfo, WashDay, CalendarEvent } from "@/lib/hair-scheduler-types";
import { ChevronLeft, ChevronRight, Droplets, Star, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HairCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  dayInfoMap: Map<string, DayInfo>;
  onDayClick: (date: string) => void;
  selectedDate: string | null;
  today: string;
}

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getQualityColor(quality: number, phase: DayInfo["phase"]): string {
  if (phase === "wash") return "bg-wash-day/20 border-wash-day/50 text-foreground";
  if (phase === "ideal") return "bg-ideal-day/20 border-ideal-day/50 text-foreground";
  if (phase === "good") return "bg-good-day/15 border-good-day/40 text-foreground";
  if (phase === "building") return "bg-primary/10 border-primary/30 text-foreground";
  if (phase === "declining") return "bg-bad-day/15 border-bad-day/40 text-foreground";
  return "bg-secondary/50 border-border text-muted-foreground";
}

function getQualityBar(quality: number): string {
  if (quality >= 90) return "bg-ideal-day";
  if (quality >= 70) return "bg-good-day";
  if (quality >= 50) return "bg-event-day";
  if (quality >= 30) return "bg-bad-day";
  return "bg-destructive";
}

export function HairCalendar({
  currentMonth,
  onMonthChange,
  dayInfoMap,
  onDayClick,
  selectedDate,
  today,
}: HairCalendarProps) {
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const days: (string | null)[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(dateStr(new Date(year, month, d)));
    }
    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    onMonthChange(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    onMonthChange(d);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold text-foreground">{monthName}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-center text-xs font-mono text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const info = dayInfoMap.get(date);
            const isToday = date === today;
            const isSelected = date === selectedDate;
            const dayNum = parseInt(date.split("-")[2]);

            return (
              <Tooltip key={date}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onDayClick(date)}
                    className={`
                      aspect-square rounded-lg border text-sm relative flex flex-col items-center justify-center gap-0.5
                      transition-all duration-150 cursor-pointer
                      ${info ? getQualityColor(info.curlQuality, info.phase) : "bg-secondary/30 border-border text-muted-foreground"}
                      ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}
                      ${isSelected ? "ring-2 ring-foreground ring-offset-1 ring-offset-background" : ""}
                      hover:scale-105 hover:shadow-md
                    `}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-primary font-bold" : ""}`}>
                      {dayNum}
                    </span>
                    {info && info.phase !== "none" && (
                      <div className={`w-3/4 h-1 rounded-full ${getQualityBar(info.curlQuality)}`} />
                    )}
                    <div className="absolute top-0.5 right-0.5 flex gap-px">
                      {info?.isWashDay && (
                        <Droplets className="w-2.5 h-2.5 text-wash-day" />
                      )}
                      {info?.events && info.events.length > 0 && (
                        <Star className="w-2.5 h-2.5 text-event-day" />
                      )}
                    </div>
                  </button>
                </TooltipTrigger>
                {info && (
                  <TooltipContent side="top" className="max-w-xs bg-card border-border text-card-foreground">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getQualityBar(info.curlQuality)}`} />
                        <span className="text-xs">
                          Curl quality: {info.curlQuality}% ({info.phase})
                        </span>
                      </div>
                      {info.daysSinceLastWash !== null && (
                        <p className="text-xs text-muted-foreground">
                          Day {info.daysSinceLastWash} since last wash
                        </p>
                      )}
                      {info.weather && (
                        <p className="text-xs text-muted-foreground">
                          Humidity: {info.weather.humidity}% | Rain: {info.weather.precipitationProbability}%
                        </p>
                      )}
                      {info.isWashDay && (
                        <p className="text-xs font-medium text-wash-day">
                          Wash day ({info.washType})
                        </p>
                      )}
                      {info.events.map((e) => (
                        <p key={e.id} className="text-xs text-event-day">
                          {e.important ? "Important: " : ""}{e.title}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-wash-day/30 border border-wash-day/60" />
            <span className="text-muted-foreground">Wash day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/15 border border-primary/40" />
            <span className="text-muted-foreground">Building</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-ideal-day/25 border border-ideal-day/60" />
            <span className="text-muted-foreground">Ideal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-bad-day/20 border border-bad-day/50" />
            <span className="text-muted-foreground">Declining</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3 h-3 text-event-day" />
            <span className="text-muted-foreground">Event</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
