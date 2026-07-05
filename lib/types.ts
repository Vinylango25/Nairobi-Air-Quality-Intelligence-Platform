// ─── AirIQ Types ────────────────────────────────────────────────────────────

export type AqiCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'
  | 'Unknown';

export interface Pollutant {
  key: 'pm25' | 'pm10' | 'no2' | 'o3' | 'co' | 'so2';
  label: string;
  unit: string;
  value: number | null;
  aqi: number | null;
  description: string;
  sources: string;
  healthEffects: string;
  whoLimit: string;
}

export interface HourlyReading {
  hour: string;    // "00:00", "01:00" …
  aqi: number;
  pm25: number;
}

export interface SubcountyData {
  id: string;
  name: string;
  aqi: number;
  category: AqiCategory;
  dominantPollutant: string;
  pollutants: Pollutant[];
  lastUpdated: string;
  stationName: string | null;   // null = modelled
  isModelled: boolean;
  hourlyTrend: HourlyReading[];
  weeklyAvg: number;
  lat: number;
  lng: number;
}

export interface ExposureProfile {
  subcounty: string;
  aqi: number;
  safeOutdoorMinutes: number;   // minutes safe for a healthy adult
  sensitiveGroupMinutes: number;
  cumulativeExposureIndex: number;  // 0–100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  recommendations: string[];
}

export interface AirIQResponse {
  subcounties: SubcountyData[];
  cityAqi: number;
  cityCategory: AqiCategory;
  worstSubcounty: string;
  bestSubcounty: string;
  timestamp: string;
}

export interface RegulatoryStandard {
  body: string;
  shortName: string;
  color: string;
  annual?: number;
  daily?: number;
  hourly?: number;
  note: string;
}

export interface PollutantInfo {
  key: string;
  name: string;
  formula: string;
  color: string;
  bgColor?: string;
  unit: string;
  whoGuideline: string;
  description: string;
  nairobiContext?: string;
  fairmode?: string;
  sources: string[];
  healthEffects: string[];
  standards?: RegulatoryStandard[];
  aqiBands: { range: string; label: string; color: string }[];
}

export interface AIRecommendation {
  subcounty: string;
  aqi: number;
  healthProfile: string;
  summary: string;
  outdoorAdvice: string;
  indoorAdvice: string;
  sensitiveGroupNote: string;
  activities: { activity: string; safe: boolean; note: string }[];
  forecast: string;
}
