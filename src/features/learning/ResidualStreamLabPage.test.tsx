import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { ResidualStreamLabPage } from './ResidualStreamLabPage';

describe('ResidualStreamLabPage', () => {
  test('scrubs through an explicitly guided residual-stream trace', () => {
    renderWithProviders(<ResidualStreamLabPage />);

    expect(screen.getByTestId('residual-provenance')).toHaveTextContent('not captured Bonsai activations');
    expect(screen.getByTestId('residual-stage')).toHaveTextContent('Token embedding');
    expect(screen.getByTestId('residual-candidates')).toHaveTextContent('very');

    fireEvent.click(screen.getByTestId('residual-layer-6'));
    expect(screen.getByTestId('residual-stage')).toHaveTextContent('Final norm');
    expect(screen.getByTestId('residual-candidates')).toHaveTextContent('important');
    expect(screen.getByTestId('residual-interpretation')).toHaveTextContent('final row');
  });

  test('explains the residual connection with a checkpoint', () => {
    renderWithProviders(<ResidualStreamLabPage />);
    fireEvent.click(screen.getByTestId('residual-update-choice-stream'));
    fireEvent.click(screen.getByTestId('residual-update-check'));
    expect(screen.getByTestId('residual-update-feedback')).toHaveTextContent('Correct');
  });
});
