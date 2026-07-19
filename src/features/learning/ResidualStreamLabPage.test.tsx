import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { gpt2 } from '../../lib/api';
import { makeGpt2Trace } from '../../test/gpt2TraceFixture';
import { renderWithProviders } from '../../test/test-utils';
import { ResidualStreamLabPage } from './ResidualStreamLabPage';

describe('ResidualStreamLabPage', () => {
  afterEach(() => vi.restoreAllMocks());

  test('scrubs through an explicitly guided residual-stream trace', () => {
    renderWithProviders(<ResidualStreamLabPage />);

    expect(screen.getByTestId('residual-provenance')).toHaveTextContent('not captured Bonsai activations');
    expect(screen.getByTestId('residual-stage')).toHaveTextContent('Token embedding');
    expect(screen.getByTestId('residual-candidates')).toHaveTextContent('much');

    fireEvent.click(screen.getByTestId('residual-layer-6'));
    expect(screen.getByTestId('residual-stage')).toHaveTextContent('Final norm');
    expect(screen.getByTestId('residual-candidates')).toHaveTextContent('tired');
    expect(screen.getByTestId('residual-interpretation')).toHaveTextContent('final row');
  });

  test('explains the residual connection with a checkpoint', () => {
    renderWithProviders(<ResidualStreamLabPage />);
    fireEvent.click(screen.getByTestId('residual-update-choice-stream'));
    fireEvent.click(screen.getByTestId('residual-update-check'));
    expect(screen.getByTestId('residual-update-feedback')).toHaveTextContent('Correct');
  });

  test('offers real GPT-2 activations only when the full-local inspector is available', async () => {
    vi.spyOn(gpt2, 'getStatus').mockResolvedValue({ available: true, mode: 'full-local', message: 'ready' });
    vi.spyOn(gpt2, 'getTrace').mockResolvedValue(makeGpt2Trace());
    renderWithProviders(<ResidualStreamLabPage />);

    fireEvent.click(await screen.findByTestId('gpt2-live-residual-source'));
    expect(await screen.findByTestId('gpt2-residual-provenance')).toHaveTextContent('real local GPT-2 forward pass');
    expect(screen.queryByTestId('residual-provenance')).not.toBeInTheDocument();
  });
});
