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
    expect(screen.getByTestId('embeddings-metadata')).toHaveTextContent('Inspectable 8D vectors');
    expect(screen.getByTestId('embedding-similarity-matrix')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^embedding-point-/)).toHaveLength(8);
    expect(screen.getByTestId('embedding-space-3d-closed')).toBeInTheDocument();
    expect(screen.queryByTestId('embedding-space-3d')).not.toBeInTheDocument();
  });

  test('hides the unsupported live source in guided-only builds', () => {
    renderWithProviders(<EmbeddingsLabPage liveRuntimeEnabled={false} />);

    expect(screen.getByTestId('embeddings-mode-guided')).toBeInTheDocument();
    expect(screen.queryByTestId('embeddings-mode-live')).not.toBeInTheDocument();
  });

  test('loads the interactive 3D projection only after the learner opens it', async () => {
    renderWithProviders(<EmbeddingsLabPage />);

    fireEvent.click(screen.getByTestId('open-embedding-space-3d'));

    expect(await screen.findByTestId('embedding-space-3d')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^embedding-3d-point-/)).toHaveLength(8);
    expect(screen.getByTestId('embedding-vector-heatmap')).toHaveTextContent('Vector fingerprint');
    expect(screen.getByRole('img', { name: /three-dimensional projection/i })).toBeInTheDocument();
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
