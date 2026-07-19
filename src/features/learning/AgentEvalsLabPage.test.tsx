import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { AgentEvalsLabPage } from './AgentEvalsLabPage';

describe('AgentEvalsLabPage', () => {
  test('compares quality with repeatable reliability across 20 trials', () => {
    renderWithProviders(<AgentEvalsLabPage />);

    expect(screen.getByTestId('eval-trial-grid').children).toHaveLength(20);
    expect(screen.getByTestId('eval-metric-pass-1')).toHaveTextContent('85%');
    expect(screen.getByTestId('eval-metric-mean-quality')).toHaveTextContent('71.1/100');

    fireEvent.click(screen.getByTestId('eval-prompt-critique-loop'));
    expect(screen.getByTestId('eval-metric-pass-1')).toHaveTextContent('80%');
    expect(screen.getByTestId('eval-metric-mean-quality')).toHaveTextContent('82.8/100');
    expect(screen.getByTestId('eval-metric-pass-')).toHaveTextContent('51%');
  });

  test('opens the trace and independent grader evidence for a failed trial', () => {
    renderWithProviders(<AgentEvalsLabPage />);

    fireEvent.click(screen.getByTestId('eval-trial-13'));
    expect(screen.getByTestId('eval-selected-trial')).toHaveTextContent('Trial 13 · failed');
    expect(screen.getByTestId('eval-grade-outcome')).toHaveTextContent('report file did not change');
    expect(screen.getByTestId('eval-grade-policy')).toHaveTextContent('100');
  });

  test('reruns a seeded batch with different trial outcomes', () => {
    renderWithProviders(<AgentEvalsLabPage />);

    expect(screen.getByLabelText('Trial 6: failed')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('eval-run'));
    expect(screen.getByLabelText('Trial 6: passed')).toBeInTheDocument();
  });
});
