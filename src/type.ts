export interface FarmRecord {
  farm_id: string;
  region: string;
  crop_type: string;
  soil_moisture: number;
  soil_pH: number;
  temperature: number;
  rainfall: number;
  humidity: number;
  sunlight_hours: number;
  yield_kg: number;
  disease_status: string;
}

export interface FarmData {
  id: number;
  cropType: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  rainfall: number;
}

export const FeatureType = {
  PH: 'soil_pH',
  MOISTURE: 'soil_moisture',
  TEMPERATURE: 'temperature',
  RAINFALL: 'rainfall',
  HUMIDITY: 'humidity'
} as const;

export type FeatureType = typeof FeatureType[keyof typeof FeatureType];

export interface FeatureStats {
  feature: FeatureType;
  accuracy: number;
  fScore: number;
  description: string;
}

export interface PredictionResult {
  predictedCrop: string;
  confidence: number;
  probabilities: Record<string, number>;
}
