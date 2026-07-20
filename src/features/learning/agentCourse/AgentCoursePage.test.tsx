import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import { AgentCoursePage } from './AgentCoursePage';

function renderCourse(path = '/learn/how-ai-agent-works/course/agent-loop') {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/learn/how-ai-agent-works/course/:lessonId" element={<AgentCoursePage />} /></Routes></MemoryRouter>);
}

describe('AgentCoursePage', () => {
  beforeEach(() => localStorage.clear());

  test('keeps the scenario, lab, theory, checkpoint, and continuation in one lesson', async () => {
    renderCourse();

    expect(screen.getByTestId('agent-course-lesson-title')).toHaveTextContent('LLM response become an agent run');
    expect(screen.getByTestId('agent-course-lesson-menu')).toHaveTextContent('The controlled loop');
    expect(screen.getByTestId('agent-course-progress')).toHaveTextContent('0/8 complete');
    expect(screen.getByRole('link', { name: 'Experiment' })).toHaveAttribute('href', '#agent-lesson-experiment');
    expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('href', '#agent-lesson-intro');
    expect(screen.getByRole('link', { name: 'Question' })).toHaveAttribute('href', '#agent-lesson-question');
    expect(screen.getByRole('link', { name: 'Deep dive' })).toHaveAttribute('href', '#agent-lesson-theory');
    expect(screen.queryByTestId('agent-course-representation-contract')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lesson-prediction')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lesson-debrief')).not.toBeInTheDocument();
    expect(await screen.findByTestId('agent-loop-lab-page')).toBeInTheDocument();
    expect(screen.getAllByText(/Research three laptops under €900/).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByTestId('course-theory-chapter')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Deep dive / reference chapter'));
    expect(await screen.findByTestId('course-theory-chapter')).toHaveTextContent('Question this chapter answers');

    fireEvent.click(screen.getByTestId('agent-course-agent-loop-choice-harness'));
    fireEvent.click(screen.getByTestId('agent-course-agent-loop-check'));
    expect(screen.getByTestId('agent-course-progress')).toHaveTextContent('1/8');
    expect(screen.getByTestId('agent-course-next')).toHaveAttribute('href', '/learn/how-ai-agent-works/course/subagents');
  });

  test('ignores retired presentation query parameters and renders the lesson', async () => {
    renderCourse('/learn/how-ai-agent-works/course/agent-loop?view=present&moment=agent-loop/mechanism');

    expect(screen.getByTestId('agent-course-page')).toBeInTheDocument();
    expect(await screen.findByTestId('agent-loop-lab-page')).toBeInTheDocument();
    expect(screen.queryByTestId('lesson-presentation')).not.toBeInTheDocument();
  });

  test('redirects an unknown lesson to the canonical starting point', () => {
    renderCourse('/learn/how-ai-agent-works/course/not-a-lesson');
    expect(screen.getByTestId('agent-course-lesson-title')).toHaveTextContent('LLM response become an agent run');
  });

  test('finishes with an inspectable complete-system architecture review', () => {
    renderCourse('/learn/how-ai-agent-works/course/capstone');

    expect(screen.getByTestId('agent-course-capstone-activity')).toHaveTextContent('Architecture review');
    fireEvent.click(screen.getByTestId('agent-capstone-reveal'));
    expect(screen.getByTestId('agent-capstone-review')).toHaveTextContent('Tool contract');
    expect(screen.getByTestId('agent-course-finish')).toHaveAttribute('href', '/learn#how-ai-agent-works');
  });
});
