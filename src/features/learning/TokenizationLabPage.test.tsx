import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ollama } from '../../lib/api';
import { renderWithProviders } from '../../test/test-utils';
import { TokenizationLabPage } from './TokenizationLabPage';

vi.mock('../../lib/api', () => ({
  ollama: { getLearningTokenCount: vi.fn() },
}));

vi.mock('./bonsaiTokenizer', () => ({
  tokenizeWithBonsai: vi.fn(async (text: string) => ({
    source: 'bonsai-tokenizer',
    sourceLabel: 'Bonsai base tokenizer',
    modelLabel: 'Qwen/Qwen3.6-27B · 6a9e13bd',
    manifest: { modelId: 'Qwen/Qwen3.6-27B', revision: '6a9e13bd', relationship: 'base', files: {} },
    pieces: [
      { id: 9707, rawToken: 'hello', text, display: text, characterCount: text.length, byteCount: text.length },
    ],
  })),
}));

describe('TokenizationLabPage', () => {
  beforeEach(() => vi.clearAllMocks());

  test('starts with an explicitly illustrative, inspectable tokenizer', () => {
    renderWithProviders(<TokenizationLabPage />);

    expect(screen.getByTestId('tokenization-source')).toHaveTextContent('Guided teaching tokenizer');
    expect(screen.getByText('Illustrative subword rules—not Bonsai output')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^token-piece-/).length).toBeGreaterThan(3);

    fireEvent.click(screen.getByTestId('token-piece-1'));
    expect(screen.getByTestId('token-detail')).toHaveTextContent('Token ID');
  });

  test('loads exact tokenizer pieces and verifies the count through Ollama', async () => {
    vi.mocked(ollama.getLearningTokenCount).mockResolvedValue({
      source: 'ollama-live',
      modelLabel: 'bonsai',
      prompt: 'Tokenization turns text into pieces.',
      promptTokenCount: 1,
      generatedToken: ' Next',
    });
    renderWithProviders(<TokenizationLabPage />);

    fireEvent.click(screen.getByTestId('tokenization-mode-bonsai'));
    await waitFor(() => expect(screen.getByTestId('tokenization-source')).toHaveTextContent('Bonsai base tokenizer'));
    fireEvent.click(screen.getByTestId('tokenization-verify'));

    await waitFor(() => expect(screen.getByTestId('tokenization-runtime-count')).toHaveTextContent('1'));
    expect(ollama.getLearningTokenCount).toHaveBeenCalledWith({
      model: 'hf.co/prism-ml/Bonsai-27B-gguf:Q1_0',
      prompt: 'Tokenization turns text into pieces.',
    });
    expect(screen.getByText('Counts match')).toBeInTheDocument();
  });
});
