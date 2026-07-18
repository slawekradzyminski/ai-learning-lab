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
  });

  test('gives the instructor deck a distraction-free layout', () => {
    render(
      <MemoryRouter initialEntries={['/learn/training-slides']}>
        <Routes>
          <Route path="/learn" element={<LearningLayout />}>
            <Route path="training-slides" element={<p>Deck canvas</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('learning-slides-layout')).toHaveTextContent('Deck canvas');
    expect(screen.queryByTestId('learning-subnav')).not.toBeInTheDocument();
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
});
