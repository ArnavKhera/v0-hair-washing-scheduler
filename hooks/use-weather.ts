"use client";

import { useState, useCallback } from "react";
import type { WeatherDay, LocationResult } from "@/lib/hair-scheduler-types";

export function useWeather() {
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocation = useCallback(
    async (query: string): Promise<LocationResult[]> => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
        );
        const data = await res.json();
        return (data.results || []).map((r: Record<string, unknown>) => ({
          name: r.name as string,
          latitude: r.latitude as number,
          longitude: r.longitude as number,
          country: r.country as string,
          admin1: (r.admin1 as string) || "",
        }));
      } catch {
        return [];
      }
    },
    []
  );

  const fetchWeather = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=relative_humidity_2m_mean,precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16`
        );
        const data = await res.json();
        if (!data.daily) throw new Error("No weather data available");

        const days: WeatherDay[] = data.daily.time.map(
          (date: string, i: number) => ({
            date,
            humidity: data.daily.relative_humidity_2m_mean?.[i] ?? 50,
            precipitationProbability:
              data.daily.precipitation_probability_max?.[i] ?? 0,
            temperatureMax: data.daily.temperature_2m_max?.[i] ?? 20,
            temperatureMin: data.daily.temperature_2m_min?.[i] ?? 10,
          })
        );
        setWeather(days);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to fetch weather data"
        );
        setWeather([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { weather, loading, error, fetchWeather, searchLocation };
}
