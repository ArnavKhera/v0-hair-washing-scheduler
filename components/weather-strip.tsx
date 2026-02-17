"use client";

import type { WeatherDay } from "@/lib/hair-scheduler-types";
import { Droplets, CloudRain, Sun, Cloud } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeatherStripProps {
  weather: WeatherDay[];
}

function getWeatherIcon(w: WeatherDay) {
  if (w.precipitationProbability > 60)
    return <CloudRain className="w-4 h-4 text-wash-day" />;
  if (w.humidity > 70) return <Droplets className="w-4 h-4 text-wash-day" />;
  if (w.precipitationProbability > 30)
    return <Cloud className="w-4 h-4 text-muted-foreground" />;
  return <Sun className="w-4 h-4 text-event-day" />;
}

function getHumidityBar(humidity: number): string {
  if (humidity >= 80) return "bg-bad-day";
  if (humidity >= 60) return "bg-event-day";
  return "bg-ideal-day";
}

export function WeatherStrip({ weather }: WeatherStripProps) {
  if (weather.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div>
        <h3 className="text-xs font-mono font-bold uppercase text-muted-foreground mb-3 tracking-wider">
          16-Day Weather Forecast
        </h3>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weather.map((day) => {
            const dateObj = new Date(day.date + "T12:00:00");
            const dayLabel = dateObj.toLocaleDateString("en-US", {
              weekday: "narrow",
            });
            const dateLabel = dateObj.getDate();

            return (
              <Tooltip key={day.date}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1 min-w-[2.5rem] p-1.5 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-colors cursor-default">
                    <span className="text-[10px] text-muted-foreground">
                      {dayLabel}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {dateLabel}
                    </span>
                    {getWeatherIcon(day)}
                    <div className="w-4 h-8 rounded-full bg-secondary overflow-hidden flex flex-col-reverse">
                      <div
                        className={`w-full rounded-full ${getHumidityBar(day.humidity)} transition-all`}
                        style={{ height: `${day.humidity}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      {day.humidity}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-card border-border text-card-foreground"
                >
                  <div className="text-xs space-y-1">
                    <p className="font-medium">
                      {dateObj.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p>Humidity: {day.humidity}%</p>
                    <p>Rain: {day.precipitationProbability}%</p>
                    <p>
                      Temp: {Math.round(day.temperatureMin)}--
                      {Math.round(day.temperatureMax)}C
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
