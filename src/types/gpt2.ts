export interface Gpt2InspectorStatus {
  available: boolean;
  mode: 'full-local';
  message: string;
  modelLabel?: string;
  modelRevision?: string;
  layerCount?: number;
  headCount?: number;
  maxTokens?: number;
}

export interface Gpt2TraceRequest {
  prompt: string;
  layer: number;
  head: number;
  selectedTokenIndex?: number;
}

export interface Gpt2TraceToken {
  index: number;
  id: number;
  text: string;
  vocabularyForm: string;
}

export interface Gpt2Prediction {
  rank: number;
  id: number;
  token: string;
  probability: number;
  logit: number;
}

export interface Gpt2EmbeddingSpaceRequest {
  query?: string;
  tokenId?: number;
  neighborCount?: number;
}

export interface Gpt2EmbeddingPoint {
  id: number;
  text: string;
  vocabularyForm: string;
  similarity: number;
  x: number;
  y: number;
  z: number;
}

export interface Gpt2EmbeddingSpaceResponse {
  source: 'gpt2-embedding-table';
  modelLabel: string;
  modelRevision: string;
  vocabularySize: number;
  hiddenSize: number;
  selectedTokenId: number;
  projection: 'local-pca-3';
  points: Gpt2EmbeddingPoint[];
}

export interface Gpt2EmbeddingForestPoint {
  id: number;
  text: string;
  x: number;
  y: number;
  z: number;
}

export interface Gpt2EmbeddingForestResponse {
  source: 'gpt2-embedding-table';
  modelLabel: string;
  modelRevision: string;
  vocabularySize: number;
  hiddenSize: number;
  projection: 'global-pca-3';
  points: Gpt2EmbeddingForestPoint[];
}

export interface Gpt2TraceResponse {
  source: 'gpt2-live';
  modelLabel: string;
  modelRevision: string;
  prompt: string;
  layer: number;
  head: number;
  selectedTokenIndex: number;
  layerCount: number;
  headCount: number;
  headDimension: number;
  hiddenSize: number;
  tokens: Gpt2TraceToken[];
  query: number[];
  keys: number[][];
  values: number[][];
  rawScoreRow: number[];
  attentionRow: number[];
  attentionMatrix: number[][];
  weightedValue: number[];
  sampledDimensions: number[];
  tokenEmbedding: number[];
  positionEmbedding: number[];
  residualPre: number[];
  attentionOutput: number[];
  residualMid: number[];
  mlpOutput: number[];
  residualPost: number[];
  predictions: Gpt2Prediction[];
  logitLens: {
    pre: Gpt2Prediction[];
    attention: Gpt2Prediction[];
    mlp: Gpt2Prediction[];
  };
  checks: {
    attentionRowSum: number;
    futureAttentionMass: number;
    attentionReconstructionMaxError: number;
    residualMidMaxError: number;
    residualPostMaxError: number;
  };
}
