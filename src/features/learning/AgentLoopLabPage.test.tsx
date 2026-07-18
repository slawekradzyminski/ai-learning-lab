import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { AgentLoopLabPage } from './AgentLoopLabPage';

describe('AgentLoopLabPage', () => {
  test('advances through model, harness, and tool boundaries', () => {
    renderWithProviders(<AgentLoopLabPage />);
    expect(screen.getByTestId('agent-loop-current-label')).toHaveTextContent('Goal enters');
    fireEvent.click(screen.getByTestId('agent-loop-next'));
    expect(screen.getByTestId('agent-loop-current-label')).toHaveTextContent('Context is assembled');
    fireEvent.click(screen.getByTestId('agent-loop-run'));
    expect(screen.getByTestId('agent-loop-current-label')).toHaveTextContent('final answer');
    expect(screen.getByTestId('agent-loop-live-link')).toHaveAttribute('href', '/llm/tools');
  });

  test('turns a tool failure into a visible recovery observation', () => {
    renderWithProviders(<AgentLoopLabPage />);
    fireEvent.click(screen.getByTestId('agent-loop-failure-toggle'));
    fireEvent.click(screen.getByTestId('agent-loop-run'));
    expect(screen.getByTestId('agent-loop-trace')).toHaveTextContent('Tool execution fails');
    expect(screen.getByTestId('agent-loop-trace')).toHaveTextContent('Model adapts its plan');
  });
});
