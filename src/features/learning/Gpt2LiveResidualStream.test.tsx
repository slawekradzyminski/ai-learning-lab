import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { gpt2 } from '../../lib/api';
import { makeGpt2Trace } from '../../test/gpt2TraceFixture';
import { Gpt2LiveResidualStream } from './Gpt2LiveResidualStream';

describe('Gpt2LiveResidualStream', () => {
  afterEach(() => vi.restoreAllMocks());

  test('shows captured residual additions and stage-specific logit-lens results', async () => {
    const getTrace = vi.spyOn(gpt2, 'getTrace').mockResolvedValue(makeGpt2Trace());
    render(<Gpt2LiveResidualStream />);

    expect(await screen.findByTestId('gpt2-residual-provenance')).toHaveTextContent('real local GPT-2 forward pass');
    expect(screen.getByTestId('gpt2-residual-equation')).toHaveTextContent('Attention update');
    expect(screen.getByTestId('gpt2-residual-candidates')).toHaveTextContent('frightened');

    fireEvent.click(screen.getByTestId('gpt2-residual-stage-mlp'));
    expect(screen.getByTestId('gpt2-residual-equation')).toHaveTextContent('MLP update');
    expect(screen.getByTestId('gpt2-residual-candidates')).toHaveTextContent('tired');

    fireEvent.click(screen.getByTestId('gpt2-residual-block-1'));
    await waitFor(() => expect(getTrace).toHaveBeenLastCalledWith(expect.objectContaining({ layer: 1, head: 0 })));
  });
});
