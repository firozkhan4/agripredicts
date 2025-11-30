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
  PH: 'ph',
  NITROGEN: 'nitrogen',
  PHOSPHORUS: 'phosphorus',
  POTASSIUM: 'potassium',
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  RAINFALL: 'rainfall'
} as const;

export type FeatureType = typeof FeatureType[keyof typeof FeatureType];

export interface FeatureStats {
  feature: FeatureType;
  accuracy: number;
  fScore: number;
  description: string;
  importance: number; // Added importance score (0-1)
  correlation: number; // Added correlation with crop type
}

export interface PredictionResult {
  predictedCrop: string;
  confidence: number;
  probabilities: Record<string, number>;
  featuresUsed: FeatureType[]; // Added to track which features were used
  featureContributions?: Record<FeatureType, number>; // Optional: individual feature contributions
}

// Additional utility types you might find useful
export interface FeatureAnalysis {
  feature: FeatureType;
  stats: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
  cropDistributions: Record<string, {
    mean: number;
    std: number;
    count: number;
  }>;
}

export interface ModelPerformance {
  overallAccuracy: number;
  featureImportances: Record<FeatureType, number>;
  confusionMatrix: Record<string, Record<string, number>>;
  precision: number;
  recall: number;
  f1Score: number;
}
