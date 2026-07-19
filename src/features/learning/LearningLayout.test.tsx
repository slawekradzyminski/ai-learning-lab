import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { LearningLayout } from './LearningLayout';

describe('LearningLayout', () => {
  test('marks the active lab and renders nested content', () => {
    render(
      <MemoryRouter initialEntries={['/learn/convolution']}>
        <Routes>
          <Route path="/learn" element={<LearningLayout />}>
            <Route path="convolution" element={<p>Nested lab</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('learning-nav-convolution')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Nested lab')).toBeInTheDocument();
    expect(screen.getByText(/11 of 12/)).toBeInTheDocument();
    expect(screen.getByTestId('back-to-awesome-localstack')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('back-to-awesome-localstack')).toHaveAttribute('data-navigation', 'document');
  });

  test('keeps agent labs in their own seven-item navigation', () => {
    render(
      <MemoryRouter initialEntries={['/learn/agent-loop']}>
        <Routes>
          <Route path="/learn" element={<LearningLayout />}>
            <Route path="agent-loop" element={<p>Agent lab</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('How AI Agent works?')).toBeInTheDocument();
    expect(screen.getByText(/1 of 7/)).toBeInTheDocument();
    expect(screen.getByTestId('learning-nav-agent-loop')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByTestId('learning-nav-tokenization')).not.toBeInTheDocument();
  });

  test('gives the canonical course its own focused shell', () => {
    render(
      <MemoryRouter initialEntries={['/learn/how-llm-works/course/tokenization']}>
        <Routes>
          <Route path="/learn" element={<LearningLayout />}>
            <Route path="how-llm-works/course/:lessonId" element={<p>Course lesson</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('learning-course-layout')).toHaveTextContent('Course lesson');
    expect(screen.queryByTestId('learning-subnav')).not.toBeInTheDocument();
  });

  test('uses the same focused shell for the canonical agent course', () => {
    render(
      <MemoryRouter initialEntries={['/learn/how-ai-agent-works/course/agent-loop']}>
        <Routes>
          <Route path="/learn" element={<LearningLayout />}>
            <Route path="how-ai-agent-works/course/:lessonId" element={<p>Agent course</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('learning-course-layout')).toHaveTextContent('Agent course');
    expect(screen.queryByTestId('learning-subnav')).not.toBeInTheDocument();
  });
});
