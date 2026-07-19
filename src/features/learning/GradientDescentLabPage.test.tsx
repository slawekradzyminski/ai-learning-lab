import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { GradientDescentLabPage } from './GradientDescentLabPage';

describe('GradientDescentLabPage', () => {
  test('shows exact analytic and numerical gradients and takes a useful step', () => {
    renderWithProviders(<GradientDescentLabPage />);

    expect(screen.getByTestId('gradient-loss')).toHaveTextContent('17.167');
    expect(screen.getByTestId('gradient-analytic')).toHaveTextContent('dw -4.667, db 6.000');
    expect(screen.getByTestId('gradient-numerical')).toHaveTextContent('dw -4.667, db 6.000');
    const initialLoss = Number(screen.getByTestId('gradient-loss').textContent);
    fireEvent.click(screen.getByTestId('gradient-step'));
    expect(Number(screen.getByTestId('gradient-loss').textContent)).toBeLessThan(initialLoss);
    expect(screen.getByTestId('gradient-parameters')).not.toHaveTextContent('w -1.500 · b 2.000');
  });

  test('runs multiple steps and demonstrates an unstable learning rate', () => {
    renderWithProviders(<GradientDescentLabPage />);

    fireEvent.click(screen.getByTestId('gradient-run-ten'));
    expect(screen.getByText('Step 10')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('gradient-rate-1.1'));
    fireEvent.click(screen.getByTestId('gradient-run-ten'));
    expect(screen.getByText('Loss above start')).toBeInTheDocument();
  });

  test('includes the prediction checkpoint and next practical handoff', () => {
    renderWithProviders(<GradientDescentLabPage />);

    fireEvent.click(screen.getByTestId('gradient-direction-choice-up'));
    fireEvent.click(screen.getByTestId('gradient-direction-check'));
    expect(screen.getByTestId('gradient-direction-feedback')).toHaveTextContent('Correct');
    expect(screen.queryByTestId('gradient-slides-link')).not.toBeInTheDocument();
    expect(screen.getByTestId('gradient-backprop-link')).toHaveAttribute('href', '/learn/backpropagation');
  });
});
