import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import { LlmCoursePage } from './LlmCoursePage';

function renderCourse(path = '/learn/how-llm-works/course/prediction-goal') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/learn/how-llm-works/course/:lessonId" element={<LlmCoursePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LlmCoursePage', () => {
  beforeEach(() => localStorage.clear());

  test('keeps one sentence, pipeline, exercise, checkpoint, and continuation together', () => {
    renderCourse();

    expect(screen.getByTestId('course-lesson-title')).toHaveTextContent('What should follow');
    expect(screen.getByTestId('lesson-teaching-sequence')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-prediction-goal/hook')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-prediction-goal/mechanism')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-prediction-goal/practice')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-prediction-goal/debrief')).toBeInTheDocument();
    expect(screen.getByTestId('present-lesson')).toHaveAttribute('href', '/learn/how-llm-works/course/prediction-goal?view=present&moment=prediction-goal/hook');
    expect(screen.getByTestId('course-pipeline')).toHaveTextContent('Text becomes tokens');
    expect(screen.getAllByText(/The animal did not cross/).length).toBeGreaterThan(1);

    fireEvent.click(screen.getByRole('button', { name: 'tired' }));
    fireEvent.click(screen.getByTestId('course-prediction-reveal'));
    expect(screen.getByTestId('course-prediction-distribution')).toHaveTextContent('48%');

    fireEvent.click(screen.getByTestId('course-prediction-goal-choice-distribution'));
    fireEvent.click(screen.getByTestId('course-prediction-goal-check'));
    expect(screen.getByTestId('course-progress')).toHaveTextContent('1/10');
    expect(screen.getByTestId('course-next')).toHaveAttribute('href', '/learn/how-llm-works/course/tokenization');
  });

  test('renders the same lesson moment in full-screen presentation mode', () => {
    renderCourse('/learn/how-llm-works/course/attention?view=present&moment=attention/mechanism');

    expect(screen.getByTestId('lesson-presentation')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-attention/mechanism')).toHaveTextContent('Query, key, value');
    expect(screen.getByTestId('presentation-exit')).toHaveAttribute('href', '/learn/how-llm-works/course/attention#lesson-moment-attention/mechanism');
    fireEvent.click(screen.getByTestId('presentation-notes-toggle'));
    expect(screen.getByTestId('presentation-notes')).toHaveTextContent('Presenter cue');
  });

  test('shows the essential explanation before the checkpoint and keeps sources optional', async () => {
    renderCourse();

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(await screen.findByTestId('course-theory-heading')).toHaveTextContent('One small prediction');
    expect(screen.getByTestId('course-lesson-notes')).toHaveTextContent('Why this matters');
    const notes = screen.getByTestId('course-lesson-notes');
    const checkpoint = screen.getByTestId('course-prediction-goal-checkpoint');
    expect(notes.compareDocumentPosition(checkpoint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText('Teaching this lesson')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Sources and further reading', { exact: false }));
    expect(screen.getByText('Jay Alammar — The Illustrated GPT-2').closest('a')).toHaveAttribute('href', 'https://jalammar.github.io/illustrated-gpt2/');
    expect(screen.getByTestId('course-forward-bridge')).toHaveTextContent('Next:');
  });

  test('closes the lesson menu after choosing a lesson', () => {
    renderCourse();

    const menu = screen.getByTestId('course-lesson-menu');
    menu.setAttribute('open', '');
    fireEvent.click(screen.getByTestId('pipeline-tokens'));

    expect(menu).not.toHaveAttribute('open');
    expect(screen.getByTestId('course-lesson-title')).toHaveTextContent('What exact sequence reaches the neural network');
  });

  test('renders token lookup plus a lazy real word-embedding observatory', async () => {
    renderCourse('/learn/how-llm-works/course/token-embeddings');

    expect(screen.getByTestId('course-lesson-title')).toHaveTextContent('categorical ID');
    expect(screen.getByTestId('token-embedding-activity')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('embedding-row-0'));
    expect(screen.getByTestId('embedding-token-vector')).toHaveTextContent('[0.72, -0.18]');
    expect(screen.getByTestId('embedding-initial-state')).toHaveTextContent('[0.72, -0.18]');
    expect(screen.getByTestId('word-embedding-explorer-closed')).toHaveTextContent('real 50D vectors');
    fireEvent.click(screen.getByTestId('open-word-embedding-explorer'));
    expect(await screen.findByTestId('word-embedding-explorer', {}, { timeout: 5_000 })).toHaveTextContent('181 words');
    expect(screen.getAllByTestId(/^word-embedding-point-/)).toHaveLength(11);
    expect(screen.queryByTestId('embedding-vector-heatmap')).not.toBeInTheDocument();
    expect(screen.getByTestId('word-embedding-explorer')).toHaveTextContent('Only the relevant neighborhood is drawn');
    expect(screen.getByTestId('word-embedding-explorer')).toHaveTextContent('focused 3D PCA view');
  });
});
