import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { gpt2 } from '../../../lib/api';
import { makeGpt2EmbeddingSpace } from '../../../test/gpt2TraceFixture';
import { WordEmbeddingExplorer } from './WordEmbeddingExplorer';

describe('WordEmbeddingExplorer', () => {
  afterEach(() => vi.restoreAllMocks());

  test('renders a searchable real GloVe vocabulary and semantic neighbors', () => {
    render(<WordEmbeddingExplorer />);
    expect(screen.getByTestId('word-embedding-explorer')).toHaveTextContent('Focused GloVe · 181 words');
    expect(screen.getByTestId('word-embedding-canvas').querySelectorAll('[data-testid^="word-embedding-point-"]')).toHaveLength(11);
    expect(screen.getByTestId('embedding-vector-heatmap')).toHaveTextContent('Vector fingerprint');
    expect(screen.getByTestId('word-embedding-canvas')).toHaveTextContent('Reset view');
    expect(screen.getByTestId('word-experiment-explore')).toHaveTextContent('cat');

    fireEvent.change(screen.getByTestId('word-embedding-search'), { target: { value: 'queen' } });
    fireEvent.submit(screen.getByTestId('word-embedding-search').closest('form')!);
    expect(screen.getByTestId('word-experiment-explore')).toHaveTextContent('queen');

    fireEvent.click(screen.getByTestId('toggle-glove-embedding-space'));
    expect(screen.getByTestId('word-embedding-canvas').querySelectorAll('[data-testid^="word-embedding-point-"]')).toHaveLength(181);
    expect(screen.getByTestId('word-embedding-explorer')).toHaveTextContent('complete 3D PCA view');
  });

  test('turns the same space into analogy, odd-one-out, and semantic-axis experiments', () => {
    render(<WordEmbeddingExplorer />);
    fireEvent.click(screen.getByTestId('word-mode-analogy'));
    expect(screen.getByTestId('word-experiment-analogy')).toHaveTextContent('queen');

    fireEvent.click(screen.getByTestId('word-mode-odd'));
    expect(screen.getByTestId('word-experiment-odd-one-out')).toHaveTextContent('cereal');

    fireEvent.click(screen.getByTestId('word-mode-axis'));
    expect(screen.getByTestId('word-experiment-axis')).toHaveTextContent('man');
    expect(screen.getByTestId('word-experiment-axis')).toHaveTextContent('woman');
  });

  test('reveals the complete GPT-2 embedding table only in full-local mode', async () => {
    vi.spyOn(gpt2, 'getStatus').mockResolvedValue({ available: true, mode: 'full-local', message: 'ready' });
    vi.spyOn(gpt2, 'getEmbeddingSpace').mockResolvedValue(makeGpt2EmbeddingSpace());
    render(<WordEmbeddingExplorer />);

    fireEvent.click(await screen.findByTestId('gpt2-embedding-source'));
    expect(await screen.findByTestId('gpt2-embedding-explorer')).toHaveTextContent('50,257 rows');
    expect(screen.getAllByTestId(/^gpt2-embedding-point-/)).toHaveLength(15);
  });
});
