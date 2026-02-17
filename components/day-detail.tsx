"use client";

import type { DayInfo, WashDay } from "@/lib/hair-scheduler-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  Cloud,
  Thermometer,
  Star,
  CalendarPlus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface DayDetailProps {
  dayInfo: DayInfo | null;
  suggestedWashes: WashDay[];
  onScheduleWash: (date: string) => void;
  onMarkCompleted: (date: string) => void;
}

function getPhaseLabel(phase: DayInfo["phase"]): string {
  switch (phase) {
    case "wash":
      return "Wash Day";
    case "building":
      return "Building Up";
    case "ideal":
      return "Ideal Curls";
    case "good":
      return "Still Good";
    case "declining":
      return "Needs Wash";
    default:
      return "No Data";
  }
}

function getPhaseIcon(phase: DayInfo["phase"]) {
  switch (phase) {
    case "wash":
      return <Droplets className="w-4 h-4" />;
    case "building":
      return <TrendingUp className="w-4 h-4" />;
    case "ideal":
      return <Sparkles className="w-4 h-4" />;
    case "good":
      return <Star className="w-4 h-4" />;
    case "declining":
      return <TrendingDown className="w-4 h-4" />;
    default:
      return null;
  }
}

function getPhaseColor(phase: DayInfo["phase"]): string {
  switch (phase) {
    case "wash":
      return "bg-wash-day/20 text-wash-day border-wash-day/40";
    case "building":
      return "bg-primary/15 text-primary border-primary/40";
    case "ideal":
      return "bg-ideal-day/20 text-ideal-day border-ideal-day/40";
    case "good":
      return "bg-good-day/15 text-good-day border-good-day/40";
    case "declining":
      return "bg-bad-day/15 text-bad-day border-bad-day/40";
    default:
      return "bg-secondary text-muted-foreground";
  }
}

function getQualityGradient(quality: number): string {
  if (quality >= 80) return "from-ideal-day to-good-day";
  if (quality >= 60) return "from-good-day to-event-day";
  if (quality >= 40) return "from-event-day to-bad-day";
  return "from-bad-day to-destructive";
}

export function DayDetail({
  dayInfo,
  suggestedWashes,
  onScheduleWash,
  onMarkCompleted,
}: DayDetailProps) {
  if (!dayInfo) {
    return (
      <div className="text-center py-8">
        <CalendarPlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Select a day on the calendar to see details
        </p>
      </div>
    );
  }

  const dateLabel = new Date(dayInfo.date + "T12:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" }
  );

  const suggested = suggestedWashes.find((w) => w.date === dayInfo.date);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-foreground">{dateLabel}</h3>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={`${getPhaseColor(dayInfo.phase)} text-xs`}>
            <span className="flex items-center gap-1">
              {getPhaseIcon(dayInfo.phase)}
              {getPhaseLabel(dayInfo.phase)}
            </span>
          </Badge>
          {dayInfo.daysSinceLastWash !== null && (
            <Badge
              variant="secondary"
              className="text-xs bg-secondary text-secondary-foreground"
            >
              Day {dayInfo.daysSinceLastWash}
            </Badge>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Curl Quality</span>
          <span className="text-sm font-mono font-bold text-foreground">
            {dayInfo.curlQuality}%
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getQualityGradient(dayInfo.curlQuality)} transition-all duration-300`}
            style={{ width: `${dayInfo.curlQuality}%` }}
          />
        </div>
      </div>

      {dayInfo.weather && (
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <h4 className="text-xs font-mono font-bold uppercase text-muted-foreground mb-2">
            Weather Forecast
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-wash-day" />
              <div>
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="text-sm font-medium text-foreground">
                  {dayInfo.weather.humidity}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Rain Chance</p>
                <p className="text-sm font-medium text-foreground">
                  {dayInfo.weather.precipitationProbability}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Thermometer className="w-4 h-4 text-bad-day" />
              <div>
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="text-sm font-medium text-foreground">
                  {Math.round(dayInfo.weather.temperatureMin)}--
                  {Math.round(dayInfo.weather.temperatureMax)}C
                </p>
              </div>
            </div>
          </div>
          {(dayInfo.weather.humidity > 60 ||
            dayInfo.weather.precipitationProbability > 40) && (
            <p className="text-xs text-bad-day mt-2 italic">
              {dayInfo.weather.humidity > 60 && "High humidity may affect curl hold. "}
              {dayInfo.weather.precipitationProbability > 40 && "Rain expected -- consider covering hair."}
            </p>
          )}
        </div>
      )}

      {dayInfo.events.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-mono font-bold uppercase text-muted-foreground">
            Events
          </h4>
          {dayInfo.events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-event-day/10 border border-event-day/30"
            >
              <Star className="w-3.5 h-3.5 text-event-day" />
              <span className="text-sm text-foreground">{event.title}</span>
              {event.important && (
                <Badge className="ml-auto text-[10px] bg-event-day/20 text-event-day border-event-day/40">
                  Hair day
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {suggested && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <p className="text-xs text-primary font-medium mb-1">
            Suggested wash day
          </p>
          <p className="text-xs text-muted-foreground">{suggested.reason}</p>
        </div>
      )}

      <div className="flex gap-2">
        {!dayInfo.isWashDay && (
          <>
            <Button
              onClick={() => onScheduleWash(dayInfo.date)}
              variant="outline"
              size="sm"
              className="flex-1 border-primary/40 text-primary hover:bg-primary/10"
            >
              <CalendarPlus className="w-3.5 h-3.5 mr-1" />
              Schedule Wash
            </Button>
            <Button
              onClick={() => onMarkCompleted(dayInfo.date)}
              variant="outline"
              size="sm"
              className="flex-1 border-wash-day/40 text-wash-day hover:bg-wash-day/10"
            >
              <Droplets className="w-3.5 h-3.5 mr-1" />
              Mark Washed
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
