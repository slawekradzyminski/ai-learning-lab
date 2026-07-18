import axios from 'axios';
import type {
  LearningEmbeddingRequest,
  LearningEmbeddingResponse,
  LearningNextTokenRequest,
  LearningNextTokenResponse,
  LearningTokenCountRequest,
  LearningTokenCountResponse,
} from '../types/ollama';

const baseURL = import.meta.env.VITE_AI_API_BASE_URL?.trim() || '';
const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

const LEARNING_API = '/api/v1/ollama/learning';

export const ollama = {
  getLearningNextToken: async (data: LearningNextTokenRequest) =>
    (await api.post<LearningNextTokenResponse>(`${LEARNING_API}/next-token`, data)).data,
  getLearningTokenCount: async (data: LearningTokenCountRequest) =>
    (await api.post<LearningTokenCountResponse>(`${LEARNING_API}/token-count`, data)).data,
  getLearningEmbeddings: async (data: LearningEmbeddingRequest) =>
    (await api.post<LearningEmbeddingResponse>(`${LEARNING_API}/embeddings`, data)).data,
};
