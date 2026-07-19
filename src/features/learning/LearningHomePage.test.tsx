import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { LearningHomePage } from './LearningHomePage';

describe('LearningHomePage', () => {
  test('focuses on the canonical course while preserving every interactive lab', () => {
    renderWithProviders(<LearningHomePage />);

    expect(screen.getByTestId('learning-home-title')).toHaveTextContent('Follow one token');
    expect(screen.getByTestId('learning-start-llm')).toHaveAttribute('href', '/learn/how-llm-works/course/prediction-goal');
    expect(screen.getByTestId('learning-start-agent')).toHaveAttribute('href', '/learn/how-ai-agent-works/course/agent-loop');
    expect(screen.getAllByTestId(/^learning-path-/)).toHaveLength(19);
    expect(screen.queryByTestId(/^learning-slides-/)).not.toBeInTheDocument();
    expect(screen.queryByTestId(/^learning-theory-/)).not.toBeInTheDocument();
    expect(screen.queryByTestId(/^learning-materials-/)).not.toBeInTheDocument();
    expect(screen.getByTestId('learning-track-language')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-semantic')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-neural')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-agency')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-context')).toBeInTheDocument();
    expect(screen.getByTestId('learning-track-safety')).toBeInTheDocument();
    expect(screen.getByTestId('learning-canonical-llm-course')).toHaveTextContent('One question at a time');
    expect(screen.getAllByTestId(/^course-path-/)).toHaveLength(10);
    expect(screen.getAllByTestId(/^agent-course-path-/)).toHaveLength(8);
    expect(screen.getByTestId('learning-library')).not.toHaveAttribute('open');
    expect(screen.getByTestId('learning-library-toggle')).toHaveTextContent('Open any interactive lab');
  });
});
