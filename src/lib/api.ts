import { createAuthenticatedAxios } from '@awesome-testing/platform-client';
import axios from 'axios';
import type {
  LearningEmbeddingRequest,
  LearningEmbeddingResponse,
  LearningNextTokenRequest,
  LearningNextTokenResponse,
  LearningTokenCountRequest,
  LearningTokenCountResponse,
} from '../types/ollama';
import type { Gpt2EmbeddingForestResponse, Gpt2EmbeddingSpaceRequest, Gpt2EmbeddingSpaceResponse, Gpt2InspectorStatus, Gpt2TraceRequest, Gpt2TraceResponse } from '../types/gpt2';

const baseURL = import.meta.env.VITE_AI_API_BASE_URL?.trim() || '';
const api = createAuthenticatedAxios({
  client: axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } }),
});

const LEARNING_API = '/api/v1/ollama/learning';
const GPT2_API = '/api/v1/learning/gpt2';

export const auth = {
  me: async () => (await api.get('/api/v1/users/me')).data,
};

export const ollama = {
  getLearningNextToken: async (data: LearningNextTokenRequest) =>
    (await api.post<LearningNextTokenResponse>(`${LEARNING_API}/next-token`, data)).data,
  getLearningTokenCount: async (data: LearningTokenCountRequest) =>
    (await api.post<LearningTokenCountResponse>(`${LEARNING_API}/token-count`, data)).data,
  getLearningEmbeddings: async (data: LearningEmbeddingRequest) =>
    (await api.post<LearningEmbeddingResponse>(`${LEARNING_API}/embeddings`, data)).data,
};

export const gpt2 = {
  getStatus: async () => (await api.get<Gpt2InspectorStatus>(`${GPT2_API}/status`)).data,
  getTrace: async (data: Gpt2TraceRequest) =>
    (await api.post<Gpt2TraceResponse>(`${GPT2_API}/trace`, data)).data,
  getEmbeddingSpace: async (data: Gpt2EmbeddingSpaceRequest) =>
    (await api.post<Gpt2EmbeddingSpaceResponse>(`${GPT2_API}/embedding-space`, data)).data,
  getEmbeddingForest: async () =>
    (await api.get<Gpt2EmbeddingForestResponse>(`${GPT2_API}/embedding-forest`)).data,
};
