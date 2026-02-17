"use client";

import { useMemo } from "react";
import type { DayInfo } from "@/lib/hair-scheduler-types";
import { ChevronLeft, ChevronRight, Droplets, Star } from "lucide-react";
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
  if (phase === "wash") return "bg-wash-day/15 border-wash-day/40 text-foreground";
  if (phase === "building") return "bg-building-day/15 border-building-day/40 text-foreground";
  if (phase === "ideal") return "bg-ideal-day/15 border-ideal-day/40 text-foreground";
  if (phase === "good") return "bg-good-day/12 border-good-day/35 text-foreground";
  if (phase === "declining") return "bg-bad-day/12 border-bad-day/35 text-foreground";
  return "bg-secondary/50 border-border text-muted-foreground";
}

function getQualityBar(quality: number): string {
  if (quality >= 90) return "bg-ideal-day";
  if (quality >= 70) return "bg-good-day";
  if (quality >= 50) return "bg-building-day";
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
              className="text-center text-xs font-semibold text-muted-foreground py-1"
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
                      aspect-square rounded-xl border-2 text-sm relative flex flex-col items-center justify-center gap-0.5
                      transition-all duration-150 cursor-pointer
                      ${info ? getQualityColor(info.curlQuality, info.phase) : "bg-secondary/30 border-border text-muted-foreground"}
                      ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                      ${isSelected ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-105" : ""}
                      hover:scale-105 hover:shadow-md
                    `}
                  >
                    <span className={`text-xs font-bold ${isToday ? "text-primary" : ""}`}>
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
                      <p className="font-bold text-sm">{new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
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
                        <p className="text-xs font-bold text-wash-day">
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

        {/* Legend */}
        <div className="mt-5 p-4 rounded-xl bg-secondary/50 border border-border">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
            What the colors mean
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-md bg-wash-day/25 border-2 border-wash-day/50 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">Wash Day</span>
                <span className="text-muted-foreground">Hair is freshly washed. Curls are resetting.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-md bg-building-day/25 border-2 border-building-day/50 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">Building</span>
                <span className="text-muted-foreground">Curls are forming and getting better each day. Not at peak yet.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-md bg-ideal-day/25 border-2 border-ideal-day/50 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">Ideal</span>
                <span className="text-muted-foreground">Your curls are at their absolute best! Schedule events here.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-md bg-good-day/20 border-2 border-good-day/45 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">Still Good</span>
                <span className="text-muted-foreground">Past peak but still presentable. Starting to lose definition.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-md bg-bad-day/20 border-2 border-bad-day/45 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">Declining</span>
                <span className="text-muted-foreground">Time to wash again! Hair is losing its style.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-event-day shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">Event</span>
                <span className="text-muted-foreground">A day you want your hair to look great for.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
