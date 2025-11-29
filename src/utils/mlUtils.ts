import type { FarmRecord, PredictionResult, FeatureStats } from '../type';
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

export const analyzeFeatures = (data: FarmRecord[]): FeatureStats[] => {
  const features = [
    FeatureType.PH,
    FeatureType.MOISTURE,
    FeatureType.TEMPERATURE,
    FeatureType.RAINFALL,
    FeatureType.HUMIDITY
  ];

  return features.map(feature => {
    // Group data by crop
    const crops = Array.from(new Set(data.map(d => d.crop_type)));
    const cropGroups: Record<string, number[]> = {};

    crops.forEach(crop => {
      cropGroups[crop] = data
        .filter(d => d.crop_type === crop)
        .map(d => d[feature === FeatureType.PH ? 'soil_pH' : feature === FeatureType.MOISTURE ? 'soil_moisture' : feature]);
    });

    // Calculate F-Score (Variance between means / Average variance within)
    // This is a simplified ANOVA F-statistic proxy to rank feature importance
    const globalMean = getStats(data.map(d => d[feature === FeatureType.PH ? 'soil_pH' : feature === FeatureType.MOISTURE ? 'soil_moisture' : feature])).mean;

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

    // Normalize accuracy simulation based on F-Score (higher separation = better accuracy)
    // This is a heuristic for the UI simulation
    const simulatedAccuracy = Math.min(0.98, 0.4 + (Math.log(fScore + 1) / 10));

    return {
      feature,
      fScore,
      accuracy: simulatedAccuracy,
      description: getDescription(feature)
    };
  });
};

const getDescription = (feature: FeatureType): string => {
  switch (feature) {
    case FeatureType.PH: return "Acidity or alkalinity of soil.";
    case FeatureType.MOISTURE: return "Water content in the soil.";
    case FeatureType.TEMPERATURE: return "Ambient temperature during growth.";
    case FeatureType.RAINFALL: return "Total rainfall during the season.";
    case FeatureType.HUMIDITY: return "Relative humidity levels.";
    default: return "";
  }
};

export const predictCrop = (data: FarmRecord[], feature: FeatureType, value: number): PredictionResult => {
  const crops = Array.from(new Set(data.map(d => d.crop_type)));
  const probabilities: Record<string, number> = {};
  let totalProb = 0;

  // Train a simple Gaussian Naive Bayes model on the fly
  crops.forEach(crop => {
    const cropData = data
      .filter(d => d.crop_type === crop)
      .map(d => d[feature === FeatureType.PH ? 'soil_pH' : feature === FeatureType.MOISTURE ? 'soil_moisture' : feature]);

    const { mean, std } = getStats(cropData);
    // Prior probability (simplified to uniform if balanced, but let's use actual counts)
    const prior = cropData.length / data.length;
    const likelihood = calculateProbability(value, mean, std);

    const posterior = likelihood * prior;
    probabilities[crop] = posterior;
    totalProb += posterior;
  });

  // Normalize
  let maxProb = -1;
  let predictedCrop = "Unknown";

  if (totalProb === 0) {
    // Fallback to nearest mean if probability underflow
    let minDiff = Infinity;
    crops.forEach(crop => {
      const cropData = data
        .filter(d => d.crop_type === crop)
        .map(d => d[feature === FeatureType.PH ? 'soil_pH' : feature === FeatureType.MOISTURE ? 'soil_moisture' : feature]);
      const { mean } = getStats(cropData);
      const diff = Math.abs(mean - value);
      if (diff < minDiff) {
        minDiff = diff;
        predictedCrop = crop;
        maxProb = 1.0; // Artificial confidence
      }
      probabilities[crop] = 0; // Reset for visual consistency if needed
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
    probabilities
  };
};
