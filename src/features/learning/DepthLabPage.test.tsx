import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { DepthLabPage } from './DepthLabPage';

describe('DepthLabPage', () => {
  test('compares a shallow boundary with a separable hidden representation', () => {
    renderWithProviders(<DepthLabPage />);

    expect(screen.getByTestId('depth-hidden-space')).toBeInTheDocument();
    expect(screen.getByText('Two-layer solution · 4/4 correct')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('depth-mode-shallow'));
    expect(screen.getByText('Single boundary · at most 3/4')).toBeInTheDocument();
    expect(screen.getByText('Not linearly separable')).toBeInTheDocument();
  });

  test('traces every hidden feature for selectable XOR inputs', () => {
    renderWithProviders(<DepthLabPage />);

    fireEvent.click(screen.getByTestId('depth-input-3'));
    expect(screen.getByTestId('depth-selected-result')).toHaveTextContent('prediction 0 · target 0');
    expect(screen.getByTestId('depth-calculation')).toHaveTextContent('hOR = 1');
    expect(screen.getByTestId('depth-calculation')).toHaveTextContent('hAND = 1');
    expect(screen.getByTestId('depth-calculation')).toHaveTextContent('XOR = 0');
    expect(screen.getByTestId('depth-truth-table')).toHaveTextContent('output');
  });

  test('includes a prediction checkpoint and next practical handoff', () => {
    renderWithProviders(<DepthLabPage />);

    fireEvent.click(screen.getByTestId('depth-xor-choice-110'));
    fireEvent.click(screen.getByTestId('depth-xor-check'));
    expect(screen.getByTestId('depth-xor-feedback')).toHaveTextContent('Correct');
    expect(screen.queryByTestId('depth-slides-link')).not.toBeInTheDocument();
    expect(screen.getByTestId('depth-convolution-link')).toHaveAttribute('href', '/learn/convolution');
  });
});
