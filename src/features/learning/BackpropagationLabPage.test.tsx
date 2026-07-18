import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { BackpropagationLabPage } from './BackpropagationLabPage';

describe('BackpropagationLabPage', () => {
  test('moves through forward, loss, and backward stages with matching gradients', () => {
    renderWithProviders(<BackpropagationLabPage />);

    expect(screen.getByTestId('backprop-forward-panel')).toHaveTextContent('p = 0.7027');
    expect(screen.getByTestId('backprop-gradient-table')).toHaveTextContent('w₁');
    fireEvent.click(screen.getByTestId('backprop-stage-loss'));
    expect(screen.getByTestId('backprop-loss-panel')).toHaveTextContent('L = 0.3529');
    fireEvent.click(screen.getByTestId('backprop-stage-backward'));
    expect(screen.getByTestId('backprop-backward-panel')).toHaveTextContent('Local derivatives distribute credit');
  });

  test('shows the inactive ReLU stopping first-layer gradient flow', () => {
    renderWithProviders(<BackpropagationLabPage />);

    fireEvent.click(screen.getByTestId('backprop-preset-inactive'));
    expect(screen.getByTestId('backprop-zero-gradient')).toHaveTextContent('blocks the first-layer gradient');
    expect(screen.getByTestId('backprop-gradient-table')).toHaveTextContent('0.0000');
    fireEvent.click(screen.getByTestId('backprop-node-hidden'));
    expect(screen.getByTestId('backprop-node-inspector')).toHaveTextContent('ReLU′(z₁) = 0');
  });

  test('applies an update that lowers loss and supports the practice handoff', () => {
    renderWithProviders(<BackpropagationLabPage />);

    fireEvent.click(screen.getByTestId('backprop-update'));
    expect(screen.getByTestId('backprop-update-panel')).toHaveTextContent('Loss before');
    expect(Number(screen.getByTestId('backprop-loss-after').textContent)).toBeLessThan(0.3529);

    fireEvent.click(screen.getByTestId('backprop-relu-choice-first'));
    fireEvent.click(screen.getByTestId('backprop-relu-check'));
    expect(screen.getByTestId('backprop-relu-feedback')).toHaveTextContent('Correct');
    expect(screen.getByTestId('backprop-slides-link')).toHaveAttribute('href', '/learn/how-llm-works/slides?slide=39');
    expect(screen.getByTestId('backprop-depth-link')).toHaveAttribute('href', '/learn/depth');
  });
});
