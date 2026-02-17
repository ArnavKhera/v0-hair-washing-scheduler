export interface HairSettings {
  daysToIdeal: number;
  styleDuration: number;
  toleranceDays: number;
  flexibilityMode: "strict" | "moderate" | "relaxed";
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
}

export interface DayInfo {
  date: string;
  daysSinceLastWash: number | null;
  curlQuality: number;
  weather: WeatherDay | null;
  isWashDay: boolean;
  washType?: "completed" | "scheduled" | "suggested";
  isIdealWindow: boolean;
  isGoodWindow: boolean;
  events: CalendarEvent[];
  phase: "wash" | "building" | "ideal" | "good" | "declining" | "none";
}

export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}
