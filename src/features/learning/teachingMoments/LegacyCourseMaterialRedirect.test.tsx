import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { LegacyCourseMaterialRedirect } from './LegacyCourseMaterialRedirect';

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location-probe">{location.pathname}{location.search}</p>;
}

describe('LegacyCourseMaterialRedirect', () => {
  test('maps an old LLM slide number to a semantic lesson moment', () => {
    render(
      <MemoryRouter initialEntries={['/learn/how-llm-works/slides?slide=7']}>
        <Routes>
          <Route path="/learn/how-llm-works/slides" element={<LegacyCourseMaterialRedirect curriculum="llm" />} />
          <Route path="/learn/how-llm-works/course/:lessonId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/learn/how-llm-works/course/attention?view=present&moment=attention/hook');
  });

  test('opens migrated agent guide links with contextual notes', () => {
    render(
      <MemoryRouter initialEntries={['/learn/how-ai-agent-works/guide?slide=26']}>
        <Routes>
          <Route path="/learn/how-ai-agent-works/guide" element={<LegacyCourseMaterialRedirect curriculum="agent" notes />} />
          <Route path="/learn/how-ai-agent-works/course/:lessonId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/learn/how-ai-agent-works/course/tool-boundaries?view=present&moment=tool-boundaries/mechanism&notes=1');
  });
});
