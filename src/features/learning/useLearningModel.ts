import { useState } from 'react';
import { ollama } from '../../lib/api';
import type {
  LearningEmbeddingRequest,
  LearningEmbeddingResponse,
  LearningTokenCountRequest,
  LearningTokenCountResponse,
} from '../../types/ollama';

function readableError(error: unknown): string {
  const responseData = (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
  if (responseData?.message) return responseData.message;
  if (responseData?.error) return responseData.error;
  return error instanceof Error ? error.message : 'The live model request failed.';
}

function useLearningRequest<TRequest, TResponse>(provider: (request: TRequest) => Promise<TResponse>) {
  const [result, setResult] = useState<TResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async (request: TRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await provider(request);
      setResult(response);
      return response;
    } catch (requestError) {
      setResult(null);
      setError(readableError(requestError));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, error, loading, run, reset };
}

export function useLiveTokenCount() {
  return useLearningRequest<LearningTokenCountRequest, LearningTokenCountResponse>(ollama.getLearningTokenCount);
}

export function useLiveEmbeddings() {
  return useLearningRequest<LearningEmbeddingRequest, LearningEmbeddingResponse>(ollama.getLearningEmbeddings);
}
