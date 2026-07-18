import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { LearningHomePage } from './LearningHomePage';

describe('LearningHomePage', () => {
  test('presents separate LLM and agent curricula with their own decks', () => {
    renderWithProviders(<LearningHomePage />);

    expect(screen.getByTestId('learning-home-title')).toHaveTextContent('Open the black box');
    expect(screen.getByTestId('learning-start-llm')).toHaveAttribute('href', '/learn/tokenization');
    expect(screen.getByTestId('learning-start-agent')).toHaveAttribute('href', '/learn/agent-loop');
    expect(screen.getAllByTestId(/^learning-path-/)).toHaveLength(19);
    expect(screen.getByTestId('learning-slides-llm')).toHaveAttribute('href', '/learn/how-llm-works/slides?slide=1');
    expect(screen.getByTestId('learning-slides-agent')).toHaveAttribute('href', '/learn/how-ai-agent-works/slides?slide=1');
    expect(screen.getByTestId('learning-theory-llm')).toHaveAttribute('href', '/learn/how-llm-works/guide?slide=1');
    expect(screen.getByTestId('learning-theory-agent')).toHaveAttribute('href', '/learn/how-ai-agent-works/guide?slide=1');
    expect(screen.getByTestId('learning-materials-llm')).toHaveAttribute('href', '/learn/how-llm-works/materials');
    expect(screen.getByTestId('learning-materials-agent')).toHaveAttribute('href', '/learn/how-ai-agent-works/materials');
    expect(screen.getByTestId('learning-track-language')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-semantic')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-neural')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-agency')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-context')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-safety')).toBeInTheDocument();
    expect(screen.getByText('Reveal the model’s tokens')).toBeInTheDocument();
    expect(screen.getByText('Watch tokens gather context')).toBeInTheDocument();
    expect(screen.getByText('Map semantic similarity')).toBeInTheDocument();
    expect(screen.getByText('Teach one artificial neuron')).toBeInTheDocument();
    expect(screen.getByText('Walk downhill on a loss surface')).toBeInTheDocument();
    expect(screen.getByText('Send credit backward')).toBeInTheDocument();
    expect(screen.getByText('Change the representation')).toBeInTheDocument();
    expect(screen.getByText('Measure the cost of context')).toBeInTheDocument();
    expect(screen.getByText('Recognize a handwritten digit')).toBeInTheDocument();
    expect(screen.getByText('Watch the prediction form')).toBeInTheDocument();
    expect(screen.getByText('Step through the agent loop')).toBeInTheDocument();
    expect(screen.getByText('Delegate without losing control')).toBeInTheDocument();
    expect(screen.getByText('Trace the context lifecycle')).toBeInTheDocument();
    expect(screen.getByText('Place durable information deliberately')).toBeInTheDocument();
    expect(screen.getByText('Attach logic to lifecycle events')).toBeInTheDocument();
    expect(screen.getByText('Validate tools and permissions')).toBeInTheDocument();
    expect(screen.getByText('Evaluate outcomes and reliability')).toBeInTheDocument();
  });
});
