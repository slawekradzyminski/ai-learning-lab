import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { gpt2, ollama } from '../../../lib/api';
import { makeGpt2Trace } from '../../../test/gpt2TraceFixture';
import { PredictionActivity } from './PredictionActivity';

vi.mock('../../../lib/api', () => ({
  gpt2: { getStatus: vi.fn(), getTrace: vi.fn() },
  ollama: { getLearningNextToken: vi.fn() },
}));

describe('PredictionActivity evidence sources', () => {
  beforeEach(() => vi.clearAllMocks());

  test('keeps the offline teaching distribution available and identifies unavailable live lanes', () => {
    render(<PredictionActivity liveRuntimeEnabled={false} />);

    expect(screen.getByTestId('prediction-source-switch')).toHaveTextContent('Teaching model');
    expect(screen.getByTestId('prediction-source-gpt2')).toBeDisabled();
    expect(screen.getByTestId('prediction-source-bonsai')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'tired' }));
    fireEvent.click(screen.getByTestId('course-prediction-reveal'));
    expect(screen.getByTestId('course-prediction-distribution')).toHaveTextContent('48%');
    expect(screen.getByTestId('prediction-source-provenance')).toHaveTextContent('Curated teaching distribution');
  });

  test('runs a real GPT-2 forward pass and exposes its logits', async () => {
    vi.mocked(gpt2.getStatus).mockResolvedValue({ available: true, mode: 'full-local', message: 'ready', layerCount: 12 });
    vi.mocked(gpt2.getTrace).mockResolvedValue(makeGpt2Trace({
      predictions: [
        { rank: 1, id: 100, token: ' tired', probability: 0.51, logit: 8.25 },
        { rank: 2, id: 101, token: ' frightened', probability: 0.19, logit: 7.26 },
      ],
    }));
    render(<PredictionActivity liveRuntimeEnabled />);

    const source = await screen.findByTestId('prediction-source-gpt2');
    await waitFor(() => expect(source).toBeEnabled());
    fireEvent.click(source);
    fireEvent.click(screen.getByRole('button', { name: 'tired' }));
    fireEvent.click(screen.getByTestId('course-prediction-reveal'));

    expect(await screen.findByTestId('course-prediction-distribution')).toHaveTextContent('logit 8.25');
    expect(screen.getByTestId('prediction-source-provenance')).toHaveTextContent('openai-community/gpt2');
    expect(gpt2.getTrace).toHaveBeenCalledWith(expect.objectContaining({ prompt: expect.stringContaining('too'), layer: 11 }));
  });

  test('runs Bonsai through Ollama and labels logprobs without calling them logits', async () => {
    vi.mocked(gpt2.getStatus).mockRejectedValue(new Error('not installed'));
    vi.mocked(ollama.getLearningNextToken).mockResolvedValue({
      source: 'ollama-live',
      modelLabel: 'Bonsai 27B',
      prompt: 'The animal did not cross the street because it was too',
      generatedToken: ' late',
      capturedProbabilityMass: 0.82,
      truncated: true,
      candidates: [
        { token: ' late', rank: 1, logprob: -0.3, probability: 0.74, normalizedProbability: 0.9 },
        { token: ' tired', rank: 2, logprob: -2.1, probability: 0.08, normalizedProbability: 0.1 },
      ],
    });
    render(<PredictionActivity liveRuntimeEnabled />);

    fireEvent.click(screen.getByTestId('prediction-source-bonsai'));
    fireEvent.click(screen.getByRole('button', { name: 'late' }));
    fireEvent.click(screen.getByTestId('course-prediction-reveal'));

    const distribution = await screen.findByTestId('course-prediction-distribution');
    expect(distribution).toHaveTextContent('log p -0.30');
    expect(screen.getByTestId('prediction-candidate-list')).not.toHaveTextContent('logit');
    expect(screen.getByTestId('prediction-source-provenance')).toHaveTextContent('Ollama does not expose raw logits');
  });
});
