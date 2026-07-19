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
    expect(screen.getByTestId('lesson-teaching-sequence')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-agent-loop/hook')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-agent-loop/mechanism')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-agent-loop/practice')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-agent-loop/debrief')).toBeInTheDocument();
    expect(screen.getByTestId('agent-loop-lab-page')).toBeInTheDocument();
    expect(screen.getAllByText(/Research three laptops under €900/).length).toBeGreaterThanOrEqual(2);
    expect(await screen.findByTestId('course-theory-chapter')).toHaveTextContent('Question this chapter answers');

    fireEvent.click(screen.getByTestId('agent-course-agent-loop-choice-harness'));
    fireEvent.click(screen.getByTestId('agent-course-agent-loop-check'));
    expect(screen.getByTestId('agent-course-progress')).toHaveTextContent('1/8');
    expect(screen.getByTestId('agent-course-next')).toHaveAttribute('href', '/learn/how-ai-agent-works/course/subagents');
  });

  test('presents lesson-owned moments without leaving the course route', () => {
    renderCourse('/learn/how-ai-agent-works/course/agent-loop?view=present&moment=agent-loop/mechanism');

    expect(screen.getByTestId('lesson-presentation')).toBeInTheDocument();
    expect(screen.getByTestId('teaching-moment-agent-loop/mechanism')).toHaveTextContent('harness owns continuation');
    expect(screen.getByTestId('presentation-exit')).toHaveAttribute('href', '/learn/how-ai-agent-works/course/agent-loop#lesson-moment-agent-loop/mechanism');
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
