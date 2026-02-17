"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type {
  HairSettings,
  CalendarEvent,
  WashDay,
  WeatherDay,
  DayInfo,
} from "@/lib/hair-scheduler-types";
import { generateFullSchedule } from "@/lib/scheduling-engine";
import { useWeather } from "@/hooks/use-weather";
import { SettingsPanel } from "@/components/settings-panel";
import { HairCalendar } from "@/components/hair-calendar";
import { EventManager } from "@/components/event-manager";
import { DayDetail } from "@/components/day-detail";
import { WeatherStrip } from "@/components/weather-strip";
import { ScheduleOverview } from "@/components/schedule-overview";
import { Droplets, Settings, CalendarDays, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function HairSchedulerPage() {
  const today = dateStr(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "events">(
    "settings"
  );

  const [settings, setSettings] = useState<HairSettings>({
    daysToIdeal: 2,
    styleDuration: 3,
    toleranceDays: 2,
    flexibilityMode: "moderate",
  });

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [manualWashes, setManualWashes] = useState<WashDay[]>([]);
  const [locationName, setLocationName] = useState("");

  const { weather, loading: weatherLoading, fetchWeather, searchLocation } = useWeather();

  const weatherMap = useMemo(() => {
    const map = new Map<string, WeatherDay>();
    for (const w of weather) {
      map.set(w.date, w);
    }
    return map;
  }, [weather]);

  const { washes, dayInfoMap } = useMemo(() => {
    return generateFullSchedule(
      events,
      manualWashes,
      settings,
      weatherMap,
      today
    );
  }, [events, manualWashes, settings, weatherMap, today]);

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, name: string) => {
      setLocationName(name);
      fetchWeather(lat, lng);
    },
    [fetchWeather]
  );

  const handleAddEvent = useCallback((event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  const handleRemoveEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleAddWash = useCallback((wash: WashDay) => {
    setManualWashes((prev) => {
      const filtered = prev.filter((w) => w.date !== wash.date);
      return [...filtered, wash];
    });
  }, []);

  const handleRemoveWash = useCallback((date: string) => {
    setManualWashes((prev) => prev.filter((w) => w.date !== date));
  }, []);

  const handleMarkWashToday = useCallback(() => {
    handleAddWash({
      date: today,
      type: "completed",
      reason: "Washed today",
    });
  }, [today, handleAddWash]);

  const handleScheduleWash = useCallback(
    (date: string) => {
      handleAddWash({
        date,
        type: "scheduled",
        reason: "Manually scheduled",
      });
    },
    [handleAddWash]
  );

  const handleMarkCompleted = useCallback(
    (date: string) => {
      handleAddWash({
        date,
        type: "completed",
        reason: "Completed wash",
      });
    },
    [handleAddWash]
  );

  const selectedDayInfo = selectedDate
    ? dayInfoMap.get(selectedDate) || null
    : null;

  const suggestedWashes = washes.filter((w) => w.type === "suggested");

  // Load saved data from state persistence
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem("hair-scheduler-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.manualWashes) setManualWashes(parsed.manualWashes);
        if (parsed.locationName) setLocationName(parsed.locationName);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save state
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        "hair-scheduler-state",
        JSON.stringify({ settings, events, manualWashes, locationName })
      );
    } catch {
      // ignore
    }
  }, [settings, events, manualWashes, locationName]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground leading-tight tracking-tight">
                Hair Washing Scheduler
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Plan your curls around weather, events, and life
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-30 w-80 
              bg-card border-r border-border lg:border-2 lg:rounded-2xl lg:shadow-sm 
              transform transition-transform duration-300 lg:transform-none
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              overflow-y-auto max-h-[calc(100vh-4rem)] lg:max-h-none
              pt-16 lg:pt-0 shrink-0
            `}
          >
            <div className="p-4">
              {/* Tab Switcher */}
              <div className="flex gap-1 p-1 bg-secondary rounded-lg mb-4">
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    activeTab === "settings"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    activeTab === "events"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Events
                </button>
              </div>

              {activeTab === "settings" ? (
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                  onLocationSelect={handleLocationSelect}
                  searchLocation={searchLocation}
                  locationName={locationName}
                  weatherLoading={weatherLoading}
                />
              ) : (
                <EventManager
                  events={events}
                  onAddEvent={handleAddEvent}
                  onRemoveEvent={handleRemoveEvent}
                  washes={manualWashes}
                  onAddWash={handleAddWash}
                  onRemoveWash={handleRemoveWash}
                  onMarkWashToday={handleMarkWashToday}
                />
              )}
            </div>
          </aside>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <button
              className="fixed inset-0 bg-background/60 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Weather Strip */}
            {weather.length > 0 && (
              <div className="p-4 rounded-2xl bg-card border-2 border-border shadow-sm">
                <WeatherStrip weather={weather} />
              </div>
            )}

            {/* Calendar + Day Detail */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 p-5 rounded-2xl bg-card border-2 border-border shadow-sm">
                <HairCalendar
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  dayInfoMap={dayInfoMap}
                  onDayClick={setSelectedDate}
                  selectedDate={selectedDate}
                  today={today}
                />
              </div>

              <div className="p-5 rounded-2xl bg-card border-2 border-border shadow-sm">
                <DayDetail
                  dayInfo={selectedDayInfo}
                  suggestedWashes={suggestedWashes}
                  onScheduleWash={handleScheduleWash}
                  onMarkCompleted={handleMarkCompleted}
                />
              </div>
            </div>

            {/* Schedule Overview */}
            <div className="p-5 rounded-2xl bg-card border-2 border-border shadow-sm">
              <ScheduleOverview
                washes={washes}
                settings={settings}
                dayInfoMap={dayInfoMap}
                today={today}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
