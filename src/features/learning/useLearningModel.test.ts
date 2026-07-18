import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ollama } from '../../lib/api';
import { useLiveEmbeddings, useLiveTokenCount } from './useLearningModel';

vi.mock('../../lib/api', () => ({
  ollama: {
    getLearningTokenCount: vi.fn(),
    getLearningEmbeddings: vi.fn(),
  },
}));

describe('learning model hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  test('stores successful Bonsai token-count verification', async () => {
    vi.mocked(ollama.getLearningTokenCount).mockResolvedValue({
      source: 'ollama-live', modelLabel: 'bonsai', prompt: 'hello', promptTokenCount: 1, generatedToken: ' world',
    });
    const { result } = renderHook(() => useLiveTokenCount());

    await act(() => result.current.run({ model: 'bonsai', prompt: 'hello' }));

    expect(result.current.result?.promptTokenCount).toBe(1);
    expect(result.current.error).toBeNull();
  });

  test('keeps a live embedding failure explicit and clears old data', async () => {
    vi.mocked(ollama.getLearningEmbeddings).mockRejectedValue({ response: { data: { message: 'Embedding model unavailable' } } });
    const { result } = renderHook(() => useLiveEmbeddings());

    await act(() => result.current.run({ model: 'embeddinggemma', inputs: ['one', 'two'] }));

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBe('Embedding model unavailable');
  });
});
