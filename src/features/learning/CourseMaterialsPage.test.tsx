import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { CourseMaterialsPage } from './CourseMaterialsPage';

describe('CourseMaterialsPage', () => {
  test('indexes every LLM lab, slide chapter, exercise, and theory handoff', () => {
    renderWithProviders(<CourseMaterialsPage curriculum="llm" />);

    expect(screen.getAllByTestId(/^materials-lab-/)).toHaveLength(12);
    expect(screen.getByTestId('course-materials-llm')).toHaveTextContent('53instructor slides');
    expect(screen.getByTestId('materials-lab-tokenization')).toHaveTextContent('Interactive lab');
    expect(screen.getByTestId('materials-lab-tokenization')).toHaveTextContent('Exercise');
    expect(screen.getByTestId('materials-lab-tokenization')).toHaveTextContent('Theory');
    expect(screen.getByTestId('materials-lab-tokenization').querySelector('a[href="/learn/how-llm-works/slides?slide=5"]')).toBeInTheDocument();
  });

  test('indexes every agent lab and its practical-first teaching sequence', () => {
    renderWithProviders(<CourseMaterialsPage curriculum="agent" />);

    expect(screen.getAllByTestId(/^materials-lab-/)).toHaveLength(7);
    expect(screen.getByTestId('course-materials-agent')).toHaveTextContent('33instructor slides');
    expect(screen.getByTestId('materials-lab-agent-loop').querySelector('a[href="/learn/how-ai-agent-works/slides?slide=5"]')).toBeInTheDocument();
    expect(screen.getByTestId('materials-lab-agent-evals')).toHaveTextContent('Evaluate outcomes and reliability');
    expect(screen.getAllByTestId(/^materials-course-lesson-/)).toHaveLength(8);
    expect(screen.getByTestId('materials-course-lesson-capstone')).toHaveAttribute('href', '/learn/how-ai-agent-works/course/capstone');
  });
});
