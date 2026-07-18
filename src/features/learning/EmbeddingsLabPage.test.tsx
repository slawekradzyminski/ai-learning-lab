import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ollama } from '../../lib/api';
import { renderWithProviders } from '../../test/test-utils';
import { EmbeddingsLabPage } from './EmbeddingsLabPage';

vi.mock('../../lib/api', () => ({
  ollama: { getLearningEmbeddings: vi.fn() },
}));

describe('EmbeddingsLabPage', () => {
  beforeEach(() => vi.clearAllMocks());

  test('shows the guided semantic map, vector dimensions, and similarity matrix', () => {
    renderWithProviders(<EmbeddingsLabPage />);

    expect(screen.getByTestId('embeddings-track-note')).toHaveTextContent('not an intermediate Bonsai pipeline stage');
    expect(screen.getByTestId('embedding-map')).toBeInTheDocument();
    expect(screen.getByTestId('embeddings-metadata')).toHaveTextContent('Inspectable 4D vectors');
    expect(screen.getByTestId('embedding-similarity-matrix')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^embedding-point-/)).toHaveLength(4);
  });

  test('runs a live embedding request without falling back to guided vectors', async () => {
    vi.mocked(ollama.getLearningEmbeddings).mockResolvedValue({
      source: 'ollama-live',
      modelLabel: 'embeddinggemma:latest',
      dimensions: 3,
      promptTokenCount: 12,
      vectors: [[1, 0, 0], [0.8, 0.2, 0], [0, 0, 1]],
    });
    renderWithProviders(<EmbeddingsLabPage />);

    fireEvent.click(screen.getByTestId('embeddings-mode-live'));
    expect(screen.getByTestId('embeddings-empty')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('embeddings-run'));

    await waitFor(() => expect(screen.getByTestId('embeddings-metadata')).toHaveTextContent('embeddinggemma:latest'));
    expect(ollama.getLearningEmbeddings).toHaveBeenCalledWith({
      model: 'embeddinggemma',
      inputs: [
        'A puppy is playing outside.',
        'A dog runs through the park.',
        'The database migration failed.',
      ],
    });
    expect(screen.getAllByTestId(/^embedding-point-/)).toHaveLength(3);
  });

  test('keeps live failures explicit and does not substitute guided data', async () => {
    vi.mocked(ollama.getLearningEmbeddings).mockRejectedValue({
      response: { data: { message: 'Embedding model unavailable' } },
    });
    renderWithProviders(<EmbeddingsLabPage />);

    fireEvent.click(screen.getByTestId('embeddings-mode-live'));
    fireEvent.click(screen.getByTestId('embeddings-run'));

    await waitFor(() => expect(screen.getByTestId('embeddings-error')).toHaveTextContent('Embedding model unavailable'));
    expect(screen.getByTestId('embeddings-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('embeddings-workspace')).not.toBeInTheDocument();
  });
});
