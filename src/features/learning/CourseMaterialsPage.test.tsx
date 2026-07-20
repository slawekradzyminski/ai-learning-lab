import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { CourseMaterialsPage } from './CourseMaterialsPage';

describe('CourseMaterialsPage', () => {
  test('indexes every LLM lab and canonical lesson path', () => {
    renderWithProviders(<CourseMaterialsPage curriculum="llm" />);

    expect(screen.getAllByTestId(/^materials-lab-/)).toHaveLength(12);
    expect(screen.getByTestId('course-materials-llm')).toHaveTextContent('10long-form chapters');
    expect(screen.getByTestId('materials-lab-tokenization')).toHaveTextContent('Interactive lab');
    expect(screen.getByTestId('materials-lab-tokenization')).toHaveTextContent('Integrated lesson');
    expect(screen.queryByRole('link', { name: 'Present the course' })).not.toBeInTheDocument();
  });

  test('indexes every agent lab and canonical lesson path', () => {
    renderWithProviders(<CourseMaterialsPage curriculum="agent" />);

    expect(screen.getAllByTestId(/^materials-lab-/)).toHaveLength(7);
    expect(screen.getByTestId('course-materials-agent')).toHaveTextContent('8long-form chapters');
    expect(screen.getByTestId('materials-lab-agent-loop')).toHaveTextContent('Integrated lesson');
    expect(screen.getByTestId('materials-lab-agent-evals')).toHaveTextContent('Evaluate outcomes and reliability');
    expect(screen.getAllByTestId(/^materials-course-lesson-/)).toHaveLength(8);
    expect(screen.getByTestId('materials-course-lesson-capstone')).toHaveAttribute('href', '/learn/how-ai-agent-works/course/capstone');
  });
});
