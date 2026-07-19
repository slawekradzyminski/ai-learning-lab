import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CourseChapterReader } from './CourseChapterReader';
import { TOKEN_EMBEDDINGS_CHAPTER } from './content/chapters/tokenEmbeddings';
import { FOUNDATION_THEORY } from './content/theoryFoundations';

vi.mock('../trainingGuides/MermaidDiagram', () => ({
  MermaidDiagram: ({ testId }: { testId: string }) => <div data-testid={testId}>diagram</div>,
}));

describe('CourseChapterReader', () => {
  test('renders a navigable long-form chapter and keeps answers behind a reveal', () => {
    render(<CourseChapterReader content={{ ...FOUNDATION_THEORY['token-embeddings'], chapter: TOKEN_EMBEDDINGS_CHAPTER }} />);

    expect(screen.getByTestId('course-theory-chapter')).toHaveTextContent('The complete explanation');
    expect(screen.getByRole('navigation', { name: 'Chapter contents' })).toHaveTextContent('Embedding lookup');
    expect(screen.getAllByTestId(/^course-chapter-diagram-/).length).toBeGreaterThanOrEqual(3);
    expect(screen.getByTestId('course-chapter-misconceptions')).toHaveTextContent('Explanations that sound right');
    expect(screen.getByTestId('course-chapter-glossary')).toHaveTextContent('Contextual token state');

    const firstExercise = screen.getAllByTestId(/^course-chapter-exercise-/)[0];
    expect(firstExercise).not.toHaveAttribute('open');
    fireEvent.click(firstExercise.querySelector('summary')!);
    expect(firstExercise).toHaveAttribute('open');
    expect(firstExercise).toHaveTextContent('Reasoned answer');
  });
});
