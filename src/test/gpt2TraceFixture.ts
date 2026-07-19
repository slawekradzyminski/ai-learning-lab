import type { Gpt2EmbeddingForestResponse, Gpt2EmbeddingSpaceResponse, Gpt2TraceResponse } from '../types/gpt2';

const vector = Array.from({ length: 24 }, (_, index) => Number(((index - 12) / 10).toFixed(2)));
const prediction = (token: string, probability: number, id: number) => ({ rank: 1, id, token, probability, logit: 2.1 });

export function makeGpt2Trace(overrides: Partial<Gpt2TraceResponse> = {}): Gpt2TraceResponse {
  return {
    source: 'gpt2-live', modelLabel: 'openai-community/gpt2', modelRevision: '607a30d7', prompt: 'The animal was too',
    layer: 0, head: 0, selectedTokenIndex: 3, layerCount: 12, headCount: 12, headDimension: 64, hiddenSize: 768,
    tokens: [
      { index: 0, id: 464, text: 'The', vocabularyForm: 'The' },
      { index: 1, id: 5044, text: ' animal', vocabularyForm: 'Ġanimal' },
      { index: 2, id: 373, text: ' was', vocabularyForm: 'Ġwas' },
      { index: 3, id: 1165, text: ' too', vocabularyForm: 'Ġtoo' },
    ],
    query: Array(64).fill(0.1), keys: [], values: [], rawScoreRow: [], attentionRow: [0.2, 0.3, 0.1, 0.4], attentionMatrix: [], weightedValue: Array(64).fill(0.1),
    sampledDimensions: Array.from({ length: 24 }, (_, index) => index * 33),
    tokenEmbedding: vector, positionEmbedding: vector, residualPre: vector, attentionOutput: vector.map((value) => value / 2), residualMid: vector.map((value) => value * 1.5), mlpOutput: vector.map((value) => -value / 3), residualPost: vector.map((value) => value * 1.17),
    predictions: [prediction(' tired', 0.5, 100)],
    logitLens: {
      pre: [prediction(' much', 0.31, 101)],
      attention: [prediction(' frightened', 0.37, 102)],
      mlp: [prediction(' tired', 0.46, 100)],
    },
    checks: { attentionRowSum: 1, futureAttentionMass: 0, attentionReconstructionMaxError: 0, residualMidMaxError: 0, residualPostMaxError: 0 },
    ...overrides,
  };
}

export function makeGpt2EmbeddingSpace(overrides: Partial<Gpt2EmbeddingSpaceResponse> = {}): Gpt2EmbeddingSpaceResponse {
  return {
    source: 'gpt2-embedding-table', modelLabel: 'openai-community/gpt2', modelRevision: '607a30d7', vocabularySize: 50257, hiddenSize: 768, selectedTokenId: 3290, projection: 'local-pca-3',
    points: Array.from({ length: 15 }, (_, index) => ({ id: 3290 + index, text: index === 0 ? ' dog' : ` neighbor${index}`, vocabularyForm: index === 0 ? 'Ġdog' : `Ġneighbor${index}`, similarity: 1 - index * 0.025, x: (index % 4 - 1.5) / 2, y: (Math.floor(index / 4) - 1.5) / 2, z: ((index * 3) % 7 - 3) / 3 })),
    ...overrides,
  };
}

export function makeGpt2EmbeddingForest(overrides: Partial<Gpt2EmbeddingForestResponse> = {}): Gpt2EmbeddingForestResponse {
  return {
    source: 'gpt2-embedding-table', modelLabel: 'openai-community/gpt2', modelRevision: '607a30d7', vocabularySize: 50257, hiddenSize: 768, projection: 'global-pca-3',
    points: Array.from({ length: 50 }, (_, index) => ({ id: 3290 + index, text: index === 0 ? ' dog' : ` token${index}`, x: (index % 8 - 3.5) / 4, y: (Math.floor(index / 8) - 3) / 4, z: ((index * 5) % 11 - 5) / 5 })),
    ...overrides,
  };
}
