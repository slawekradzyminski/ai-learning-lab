import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { HooksLifecycleLabPage } from './HooksLifecycleLabPage';
import { MemoryInstructionsLabPage } from './MemoryInstructionsLabPage';
import { SubagentsLabPage } from './SubagentsLabPage';

describe('agent system lab pages', () => {
  test('classifies durable instructions and secrets', () => {
    renderWithProviders(<MemoryInstructionsLabPage />);
    fireEvent.click(screen.getByTestId('memory-destination-instructions'));
    expect(screen.getByTestId('memory-result')).toHaveTextContent('Good placement');
    fireEvent.click(screen.getByTestId('memory-scenario-token'));
    fireEvent.click(screen.getByTestId('memory-destination-memory'));
    expect(screen.getByTestId('memory-result')).toHaveTextContent(/secret manager/i);
  });

  test('runs a hook only at the useful lifecycle event', () => {
    renderWithProviders(<HooksLifecycleLabPage />);
    expect(screen.getByTestId('hook-run')).toBeEnabled();
    fireEvent.click(screen.getByTestId('hook-run'));
    expect(screen.getByTestId('hook-execution')).toHaveTextContent('rejected before a side effect');
    fireEvent.click(screen.getByTestId('hook-event-post-tool'));
    expect(screen.getByTestId('hook-run')).toBeDisabled();
  });

  test('exposes conflicts and worktree isolation', () => {
    renderWithProviders(<SubagentsLabPage />);
    fireEvent.click(screen.getByTestId('subagent-scenario-overlap'));
    expect(screen.getByTestId('subagent-conflict')).toHaveTextContent('Write collision');
    fireEvent.click(screen.getByTestId('subagent-isolated'));
    expect(screen.getByTestId('subagent-conflict')).toHaveTextContent('intentional merge');
  });
});
