import type { FarmData, PredictionResult, FeatureStats } from '../type';
import { FeatureType } from '../type';

// Helper to calculate mean and standard deviation
const getStats = (values: number[]) => {
  const n = values.length;
  if (n === 0) return { mean: 0, std: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return { mean, std: Math.sqrt(variance) };
};

// Calculate probability density for Gaussian distribution
const calculateProbability = (x: number, mean: number, std: number) => {
  if (std === 0) return x === mean ? 1 : 0;
  const exponent = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(std, 2)));
  return (1 / (Math.sqrt(2 * Math.PI) * std)) * exponent;
};

// Helper function to get feature value from FarmData
const getFeatureValue = (data: FarmData, feature: FeatureType): number => {
  switch (feature) {
    case FeatureType.PH: return data.ph;
    case FeatureType.NITROGEN: return data.nitrogen;
    case FeatureType.PHOSPHORUS: return data.phosphorus;
    case FeatureType.POTASSIUM: return data.potassium;
    case FeatureType.TEMPERATURE: return data.temperature;
    case FeatureType.HUMIDITY: return data.humidity;
    case FeatureType.RAINFALL: return data.rainfall;
    default: return 0;
  }
};

export const analyzeFeatures = (data: FarmData[]): FeatureStats[] => {
  const features = [
    FeatureType.PH,
    FeatureType.NITROGEN,
    FeatureType.PHOSPHORUS,
    FeatureType.POTASSIUM,
    FeatureType.TEMPERATURE,
    FeatureType.HUMIDITY,
    FeatureType.RAINFALL
  ];

  return features.map(feature => {
    // Group data by crop
    const crops = Array.from(new Set(data.map(d => d.cropType)));
    const cropGroups: Record<string, number[]> = {};

    crops.forEach(crop => {
      cropGroups[crop] = data
        .filter(d => d.cropType === crop)
        .map(d => getFeatureValue(d, feature));
    });

    // Calculate F-Score (Variance between means / Average variance within)
    const globalMean = getStats(data.map(d => getFeatureValue(d, feature))).mean;

    let betweenVariance = 0;
    let withinVariance = 0;

    crops.forEach(crop => {
      const groupStats = getStats(cropGroups[crop]);
      const n = cropGroups[crop].length;
      betweenVariance += n * Math.pow(groupStats.mean - globalMean, 2);
      withinVariance += n * Math.pow(groupStats.std, 2);
    });

    // Avoid division by zero
    const fScore = withinVariance === 0 ? 0 : betweenVariance / withinVariance;

    // Calculate correlation with crop type (simplified)
    const correlation = Math.min(1, fScore / 10);

    // Normalize accuracy simulation based on F-Score
    const simulatedAccuracy = Math.min(0.98, 0.4 + (Math.log(fScore + 1) / 10));

    // Calculate importance (combination of F-score and correlation)
    const importance = (fScore * 0.7 + correlation * 0.3) / 10;

    return {
      feature,
      fScore,
      accuracy: simulatedAccuracy,
      importance,
      correlation,
      description: getDescription(feature)
    };
  });
};

const getDescription = (feature: FeatureType): string => {
  switch (feature) {
    case FeatureType.PH: return "Acidity or alkalinity of soil.";
    case FeatureType.NITROGEN: return "Nitrogen content in the soil.";
    case FeatureType.PHOSPHORUS: return "Phosphorus content in the soil.";
    case FeatureType.POTASSIUM: return "Potassium content in the soil.";
    case FeatureType.TEMPERATURE: return "Ambient temperature during growth.";
    case FeatureType.RAINFALL: return "Total rainfall during the season.";
    case FeatureType.HUMIDITY: return "Relative humidity levels.";
    default: return "";
  }
};

// Multi-feature prediction function
export const predictCropMultiFeature = (
  data: FarmData[],
  features: FeatureType[],
  values: Record<FeatureType, number>
): PredictionResult => {
  if (features.length === 0) {
    throw new Error('No features selected for prediction');
  }

  const crops = Array.from(new Set(data.map(d => d.cropType)));
  const probabilities: Record<string, number> = {};
  const featureContributions: Record<FeatureType, number> = {} as Record<FeatureType, number>;
  let totalProb = 0;

  // Initialize feature contributions
  features.forEach(feature => {
    featureContributions[feature] = 0;
  });

  // Train a multi-feature Gaussian Naive Bayes model
  crops.forEach(crop => {
    let posterior = 1.0;

    // Calculate prior probability
    const cropData = data.filter(d => d.cropType === crop);
    const prior = cropData.length / data.length;

    // Calculate likelihood for each feature
    features.forEach(feature => {
      const featureValue = values[feature];
      const cropFeatureData = cropData.map(d => getFeatureValue(d, feature));

      const { mean, std } = getStats(cropFeatureData);
      const likelihood = calculateProbability(featureValue, mean, std);

      posterior *= likelihood;

      // Track feature contribution (simplified)
      featureContributions[feature] += likelihood;
    });

    // Multiply by prior
    posterior *= prior;
    probabilities[crop] = posterior;
    totalProb += posterior;
  });

  // Normalize feature contributions
  features.forEach(feature => {
    featureContributions[feature] = featureContributions[feature] / crops.length;
  });

  // Normalize probabilities and find prediction
  let maxProb = -1;
  let predictedCrop = "Unknown";

  if (totalProb === 0) {
    // Fallback: find crop with closest average feature values
    let minDistance = Infinity;
    crops.forEach(crop => {
      const cropData = data.filter(d => d.cropType === crop);
      let distance = 0;

      features.forEach(feature => {
        const featureValue = values[feature];
        const cropFeatureData = cropData.map(d => getFeatureValue(d, feature));
        const { mean } = getStats(cropFeatureData);
        distance += Math.pow(mean - featureValue, 2);
      });

      distance = Math.sqrt(distance);
      if (distance < minDistance) {
        minDistance = distance;
        predictedCrop = crop;
        maxProb = 1.0;
      }
      probabilities[crop] = 0;
    });
    probabilities[predictedCrop] = 1;
  } else {
    crops.forEach(crop => {
      probabilities[crop] /= totalProb;
      if (probabilities[crop] > maxProb) {
        maxProb = probabilities[crop];
        predictedCrop = crop;
      }
    });
  }

  return {
    predictedCrop,
    confidence: maxProb,
    probabilities,
    featuresUsed: features,
    featureContributions
  };
};

export const predictCrop = (data: FarmData[], feature: FeatureType, value: number): PredictionResult => {
  // Create a record with all features set to 0, then override the selected feature
  const initialValues: Record<FeatureType, number> = {
    [FeatureType.PH]: 0,
    [FeatureType.NITROGEN]: 0,
    [FeatureType.PHOSPHORUS]: 0,
    [FeatureType.POTASSIUM]: 0,
    [FeatureType.TEMPERATURE]: 0,
    [FeatureType.HUMIDITY]: 0,
    [FeatureType.RAINFALL]: 0,
  };

  // Set the actual value for the selected feature
  const values = {
    ...initialValues,
    [feature]: value
  };

  return predictCropMultiFeature(data, [feature], values);
};
