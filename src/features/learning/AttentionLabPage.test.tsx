import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { AttentionLabPage } from './AttentionLabPage';

describe('AttentionLabPage', () => {
  test('walks through an exact guided attention calculation', () => {
    renderWithProviders(<AttentionLabPage />);

    expect(screen.getByTestId('attention-provenance')).toHaveTextContent('not captured Bonsai internals');
    expect(screen.getByTestId('attention-stage-representations')).toHaveTextContent('representation X');
    expect(screen.getByTestId('attention-dominant-token')).toHaveTextContent('animal');

    fireEvent.click(screen.getByTestId('attention-stage-button-projections'));
    expect(screen.getByTestId('attention-stage-projections')).toHaveTextContent('what am I looking for');

    fireEvent.click(screen.getByTestId('attention-stage-button-softmax'));
    expect(screen.getByTestId('attention-stage-softmax')).toHaveTextContent('row sum = 1.000000');

    fireEvent.click(screen.getByTestId('attention-stage-button-output'));
    expect(screen.getByTestId('attention-stage-output')).toHaveTextContent('New attention output for “too”');
  });

  test('keeps token selection, heatmap rows, and causal comparison synchronized', () => {
    renderWithProviders(<AttentionLabPage />);

    fireEvent.click(screen.getByTestId('attention-token-0'));
    expect(screen.getByTestId('attention-token-0')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('attention-cell-0-1')).toHaveTextContent('—');

    fireEvent.click(screen.getByTestId('attention-causal-toggle'));
    expect(screen.getByTestId('attention-unmasked-warning')).toHaveTextContent('invalid for autoregressive generation');
    expect(screen.getByTestId('attention-cell-0-1')).not.toHaveTextContent('—');
  });

  test('makes the position intervention change the final dominant source', () => {
    renderWithProviders(<AttentionLabPage />);

    fireEvent.click(screen.getByTestId('attention-example-position'));
    expect(screen.getByTestId('attention-example-description')).toHaveTextContent('redirects');
    expect(screen.getByTestId('attention-dominant-token')).toHaveTextContent('was');
  });

  test('requires an answer before revealing practice feedback and links onward', () => {
    renderWithProviders(<AttentionLabPage />);

    expect(screen.getByTestId('attention-subject-check')).toBeDisabled();
    fireEvent.click(screen.getByTestId('attention-subject-choice-animal'));
    fireEvent.click(screen.getByTestId('attention-subject-check'));
    expect(screen.getByTestId('attention-subject-feedback')).toHaveTextContent('Correct');
    expect(screen.getByTestId('attention-residual-link')).toHaveAttribute('href', '/learn/residual-stream');
    expect(screen.getByTestId('attention-kv-cache-link')).toHaveAttribute('href', '/learn/kv-cache');
  });
});
