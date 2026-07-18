import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { ToolBoundariesLabPage } from './ToolBoundariesLabPage';

describe('ToolBoundariesLabPage', () => {
  test('allows reads while gating writes under strict policy', () => {
    renderWithProviders(<ToolBoundariesLabPage />);
    expect(screen.getByTestId('tool-decision')).toHaveTextContent('Execution allowed');
    fireEvent.click(screen.getByTestId('tool-call-1'));
    expect(screen.getByTestId('tool-decision')).toHaveTextContent('Human approval required');
    expect(screen.getByTestId('tool-execution')).toHaveTextContent('No side effect');
    fireEvent.click(screen.getByTestId('tool-approve'));
    expect(screen.getByTestId('tool-execution')).toHaveTextContent('Application code executes');
  });

  test('rejects malformed calls before permissions', () => {
    renderWithProviders(<ToolBoundariesLabPage />);
    fireEvent.click(screen.getByTestId('tool-call-3'));
    expect(screen.getByTestId('tool-decision')).toHaveTextContent('Invalid tool arguments');
    expect(screen.getByTestId('tool-decision')).toHaveTextContent('missing to');
  });
});
