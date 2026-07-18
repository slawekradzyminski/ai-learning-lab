import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { ContextHarnessLabPage } from './ContextHarnessLabPage';

describe('ContextHarnessLabPage', () => {
  test('shows the harness selecting and excluding context', () => {
    renderWithProviders(<ContextHarnessLabPage />);
    expect(screen.getByTestId('context-included')).toHaveTextContent('System instructions');
    expect(screen.getByTestId('context-excluded')).toHaveTextContent('Older raw history');
  });

  test('compaction changes the effective budget', () => {
    renderWithProviders(<ContextHarnessLabPage />);
    const raw = screen.getByTestId('context-budget-used').textContent;
    fireEvent.click(screen.getByTestId('context-compact'));
    expect(screen.getByTestId('context-budget-used').textContent).not.toBe(raw);
    expect(screen.getByTestId('context-included')).toHaveTextContent('Tool results');
  });

  test('separates model-specific caches from restored context', () => {
    renderWithProviders(<ContextHarnessLabPage />);
    fireEvent.click(screen.getByTestId('context-action-switch-model'));
    expect(screen.getByTestId('context-cache-state')).toHaveTextContent('cold cache');
    expect(screen.getByTestId('context-lifecycle-outcome')).toHaveTextContent('model-specific');
  });
});
