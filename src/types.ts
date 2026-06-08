export interface TokenInfo {
  token: string;
  id: number;
  typeId: number;
  mask: number;
}

export interface SentimentSample {
  id: string;
  text: string;
  label: "positive" | "negative";
  isCustom?: boolean;
}

export interface Hyperparameters {
  learningRate: number;
  batchSize: number;
  epochs: number;
  dropoutRate: number;
  optimizer: "AdamW" | "SGD" | "Adam";
  maxLen: number;
  warmupRatio: number;
}

export interface EpochMetric {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  valAccuracy: number;
  lr: number;
}

export interface InferenceResult {
  text: string;
  sentiment: "positive" | "negative";
  score: number; // 0 to 1 confidence
  tokens: string[];
  attentionScores: number[]; // Index aligned with tokens, weights sum to 1
}

export interface TrainingSimulationResult {
  metrics: EpochMetric[];
  logs: string[];
  reportMarkdown: string;
}

export interface TokenIdMap {
  text: string;
  tokens: TokenInfo[];
}
