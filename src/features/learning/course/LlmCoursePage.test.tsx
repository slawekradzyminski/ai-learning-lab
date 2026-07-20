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

  test('orders mechanism, experiment, checkpoint, and optional theory', () => {
    renderCourse();

    expect(screen.getByTestId('course-lesson-title')).toHaveTextContent('What should follow');
    expect(screen.getByRole('link', { name: 'Experiment' })).toHaveAttribute('href', '#lesson-experiment');
    expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('href', '#lesson-intro');
    expect(screen.getByRole('link', { name: 'Question' })).toHaveAttribute('href', '#lesson-question');
    expect(screen.getByRole('link', { name: 'Deep dive' })).toHaveAttribute('href', '#lesson-theory');
    expect(screen.queryByTestId('course-pipeline')).not.toBeInTheDocument();
    expect(screen.getByTestId('course-lesson-menu')).toHaveTextContent('Text becomes tokens');
    expect(screen.queryByTestId('course-representation-contract')).not.toBeInTheDocument();
    expect(screen.queryByTestId('llm-trace-ledger')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lesson-prediction')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lesson-debrief')).not.toBeInTheDocument();
    expect(screen.getAllByText(/The animal did not cross/).length).toBeGreaterThan(1);

    const ordered = [
      screen.getByTestId('lesson-mechanism'),
      screen.getByTestId('lesson-experiment-heading'),
      screen.getByTestId('course-prediction-activity'),
      screen.getByTestId('course-prediction-goal-checkpoint'),
      screen.getByTestId('course-lesson-notes'),
    ];
    ordered.slice(0, -1).forEach((element, index) => expect(element.compareDocumentPosition(ordered[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy());
    expect(screen.queryByTestId('course-theory-chapter')).not.toBeInTheDocument();
    expect(screen.getByTestId('mandatory-lesson-spine').textContent!.trim().split(/\s+/).length).toBeLessThan(1500);

    fireEvent.click(screen.getByRole('button', { name: 'tired' }));
    fireEvent.click(screen.getByTestId('course-prediction-reveal'));
    expect(screen.getByTestId('course-prediction-distribution')).toHaveTextContent('48%');

    fireEvent.click(screen.getByTestId('course-prediction-goal-choice-distribution'));
    fireEvent.click(screen.getByTestId('course-prediction-goal-check'));
    expect(screen.getByTestId('course-progress')).toHaveTextContent('1/10');
    expect(screen.getByTestId('course-next')).toHaveAttribute('href', '/learn/how-llm-works/course/tokenization');
  });

  test('keeps the target hidden before the language-model-head lesson', () => {
    renderCourse('/learn/how-llm-works/course/attention?view=present&moment=attention/mechanism');

    expect(screen.getByTestId('llm-course-page')).toBeInTheDocument();
    expect(screen.getByTestId('course-lesson-title')).toHaveTextContent('Which earlier positions');
    expect(screen.getByTestId('course-scenario')).toHaveTextContent('Unfinished prompt');
    expect(screen.getByTestId('course-scenario')).not.toHaveTextContent('Training target revealed');
    expect(screen.queryByTestId('lesson-presentation')).not.toBeInTheDocument();
  });

  test('loads the complete chapter only on demand', async () => {
    renderCourse();

    expect(screen.queryByTestId('course-theory-chapter')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Deep dive / reference chapter'));
    expect(await screen.findByTestId('course-theory-heading')).toHaveTextContent('One small prediction');
    expect(screen.getByTestId('course-lesson-notes')).toHaveAttribute('open');
    const notes = screen.getByTestId('course-lesson-notes');
    const checkpoint = screen.getByTestId('course-prediction-goal-checkpoint');
    expect(checkpoint.compareDocumentPosition(notes) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
    expect(await screen.findByTestId('word-embedding-explorer', {}, { timeout: 15_000 })).toHaveTextContent('181 words');
    expect(screen.getAllByTestId(/^word-embedding-point-/)).toHaveLength(11);
    expect(screen.getByTestId('embedding-vector-heatmap')).toHaveTextContent('Vector fingerprint');
    expect(screen.getByTestId('word-embedding-explorer')).toHaveTextContent('Only the relevant neighborhood is drawn');
    expect(screen.getByTestId('word-embedding-explorer')).toHaveTextContent('focused 3D PCA view');
    fireEvent.click(screen.getByTestId('toggle-glove-embedding-space'));
    expect(screen.getAllByTestId(/^word-embedding-point-/)).toHaveLength(181);
  }, 15_000);

  test('labels the revealed continuation as a training target', () => {
    renderCourse('/learn/how-llm-works/course/language-model-head');
    expect(screen.getByTestId('course-scenario')).toHaveTextContent('Training target revealed');
    expect(screen.getByTestId('course-scenario')).toHaveTextContent('tired');
  });
});
