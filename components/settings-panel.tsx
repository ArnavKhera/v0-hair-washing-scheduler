"use client";

import { useState, useEffect, useCallback } from "react";
import type { HairSettings, LocationResult } from "@/lib/hair-scheduler-types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MapPin,
  Droplets,
  Timer,
  Shield,
  Search,
  Loader2,
} from "lucide-react";

interface SettingsPanelProps {
  settings: HairSettings;
  onSettingsChange: (settings: HairSettings) => void;
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  searchLocation: (query: string) => Promise<LocationResult[]>;
  locationName: string;
  weatherLoading: boolean;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onLocationSelect,
  searchLocation,
  locationName,
  weatherLoading,
}: SettingsPanelProps) {
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!locationQuery.trim()) return;
    setSearching(true);
    const results = await searchLocation(locationQuery);
    setLocationResults(results);
    setShowResults(true);
    setSearching(false);
  }, [locationQuery, searchLocation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationQuery.length >= 2) {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [locationQuery, handleSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </h2>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search city..."
                className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
          </div>
          {showResults && locationResults.length > 0 && (
            <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              {locationResults.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onLocationSelect(
                      loc.latitude,
                      loc.longitude,
                      `${loc.name}, ${loc.admin1 ? loc.admin1 + ", " : ""}${loc.country}`
                    );
                    setLocationQuery(
                      `${loc.name}, ${loc.admin1 ? loc.admin1 + ", " : ""}${loc.country}`
                    );
                    setShowResults(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/80 transition-colors text-foreground border-b border-border last:border-0"
                >
                  <span className="font-medium">{loc.name}</span>
                  <span className="text-muted-foreground">
                    {", "}
                    {loc.admin1 ? `${loc.admin1}, ` : ""}
                    {loc.country}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        {locationName && (
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            {weatherLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <MapPin className="w-3 h-3" />
            )}
            {locationName}
          </p>
        )}
      </div>

      <div className="h-px bg-border" />

      <div>
        <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary mb-4 flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          Curl Timeline
        </h2>

        <div className="space-y-5">
          <div>
            <Label className="text-sm text-foreground mb-2 block">
              Days until ideal curls
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              How many days after washing until your curls look their best
            </p>
            <div className="flex items-center gap-4">
              <Slider
                min={0}
                max={7}
                step={1}
                value={[settings.daysToIdeal]}
                onValueChange={([v]) =>
                  onSettingsChange({ ...settings, daysToIdeal: v })
                }
                className="flex-1"
              />
              <span className="text-sm font-bold text-primary w-12 text-right">
                {settings.daysToIdeal}d
              </span>
            </div>
          </div>

          <div>
            <Label className="text-sm text-foreground mb-2 block">
              Style duration
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              How many days the style looks good for
            </p>
            <div className="flex items-center gap-4">
              <Slider
                min={1}
                max={10}
                step={1}
                value={[settings.styleDuration]}
                onValueChange={([v]) =>
                  onSettingsChange({ ...settings, styleDuration: v })
                }
                className="flex-1"
              />
              <span className="text-sm font-bold text-primary w-12 text-right">
                {settings.styleDuration}d
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Flexibility
        </h2>

        <RadioGroup
          value={settings.flexibilityMode}
          onValueChange={(v) =>
            onSettingsChange({
              ...settings,
              flexibilityMode: v as HairSettings["flexibilityMode"],
            })
          }
          className="space-y-2"
        >
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <RadioGroupItem value="strict" id="strict" className="mt-0.5" />
            <Label htmlFor="strict" className="cursor-pointer flex-1">
              <span className="text-sm font-medium text-foreground block">
                Strict
              </span>
              <span className="text-xs text-muted-foreground">
                Hair must look good every day. More frequent washes.
              </span>
            </Label>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <RadioGroupItem
              value="moderate"
              id="moderate"
              className="mt-0.5"
            />
            <Label htmlFor="moderate" className="cursor-pointer flex-1">
              <span className="text-sm font-medium text-foreground block">
                Moderate
              </span>
              <span className="text-xs text-muted-foreground">
                Tolerate some off days between cycles.
              </span>
            </Label>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <RadioGroupItem value="relaxed" id="relaxed" className="mt-0.5" />
            <Label htmlFor="relaxed" className="cursor-pointer flex-1">
              <span className="text-sm font-medium text-foreground block">
                Relaxed
              </span>
              <span className="text-xs text-muted-foreground">
                Fewer washes, more off days between cycles.
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary mb-3 flex items-center gap-2">
          <Timer className="w-4 h-4" />
          Bad Hair Tolerance
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Max consecutive days you can tolerate not-ideal hair
        </p>
        <div className="flex items-center gap-4">
          <Slider
            min={0}
            max={5}
            step={1}
            value={[settings.toleranceDays]}
            onValueChange={([v]) =>
              onSettingsChange({ ...settings, toleranceDays: v })
            }
            className="flex-1"
          />
              <span className="text-sm font-bold text-primary w-12 text-right">
                {settings.toleranceDays}d
              </span>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
        <p className="text-xs font-bold text-muted-foreground mb-1">
          Current Cycle
        </p>
        <p className="text-sm text-foreground">
          <span className="text-primary font-bold">
            {settings.daysToIdeal + settings.styleDuration + settings.toleranceDays}
          </span>{" "}
          days between washes
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {settings.daysToIdeal}d build-up + {settings.styleDuration}d ideal +{" "}
          {settings.toleranceDays}d tolerance
        </p>
      </div>
    </div>
  );
}
