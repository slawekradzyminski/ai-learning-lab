import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { gpt2 } from '../../../lib/api';
import { makeGpt2EmbeddingForest, makeGpt2EmbeddingSpace } from '../../../test/gpt2TraceFixture';
import { Gpt2EmbeddingExplorer } from './Gpt2EmbeddingExplorer';

describe('Gpt2EmbeddingExplorer', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(), fillRect: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), stroke: vi.fn(),
      fillStyle: '', strokeStyle: '', lineWidth: 1,
    } as unknown as CanvasRenderingContext2D);
  });
  afterEach(() => vi.restoreAllMocks());

  test('searches the complete table while drawing only a readable neighborhood', async () => {
    const getEmbeddingSpace = vi.spyOn(gpt2, 'getEmbeddingSpace').mockResolvedValue(makeGpt2EmbeddingSpace());
    render(<Gpt2EmbeddingExplorer />);

    expect(await screen.findByTestId('gpt2-embedding-explorer')).toHaveTextContent('50,257 rows');
    expect(screen.getAllByTestId(/^gpt2-embedding-point-/)).toHaveLength(15);

    fireEvent.change(screen.getByTestId('gpt2-embedding-search'), { target: { value: 'queen' } });
    fireEvent.submit(screen.getByTestId('gpt2-embedding-search').closest('form')!);
    await waitFor(() => expect(getEmbeddingSpace).toHaveBeenLastCalledWith({ query: 'queen', neighborCount: 14 }));

    fireEvent.click(screen.getByTestId('gpt2-embedding-point-3291'));
    await waitFor(() => expect(getEmbeddingSpace).toHaveBeenLastCalledWith({ tokenId: 3291, neighborCount: 14 }));
  });

  test('loads the complete dot forest only when requested and can return to the focused view', async () => {
    vi.spyOn(gpt2, 'getEmbeddingSpace').mockResolvedValue(makeGpt2EmbeddingSpace());
    const getEmbeddingForest = vi.spyOn(gpt2, 'getEmbeddingForest').mockResolvedValue(makeGpt2EmbeddingForest());
    render(<Gpt2EmbeddingExplorer />);

    const toggle = await screen.findByTestId('toggle-embedding-forest');
    expect(getEmbeddingForest).not.toHaveBeenCalled();
    fireEvent.click(toggle);

    expect(await screen.findByRole('img', { name: 'Complete GPT-2 embedding forest containing 50 projected token vectors' })).toBeInTheDocument();
    expect(screen.getByTestId('gpt2-embedding-forest')).toBeInTheDocument();
    expect(getEmbeddingForest).toHaveBeenCalledTimes(1);
    expect(toggle).toHaveTextContent('Show focused 15');

    fireEvent.click(toggle);
    expect(screen.queryByTestId('gpt2-embedding-forest')).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/^gpt2-embedding-point-/)).toHaveLength(15);
  });
});
