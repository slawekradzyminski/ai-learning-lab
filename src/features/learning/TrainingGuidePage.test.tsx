import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { TrainingGuidePage } from './TrainingGuidePage';
import { AGENT_TRAINING_SLIDES } from './trainingSlides/agentCatalog';
import { buildTrainingGuide } from './trainingGuides/buildTrainingGuide';

describe('TrainingGuidePage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  test('opens the theory matching the requested slide and navigates the guide', () => {
    window.history.pushState({}, '', '/learn/how-llm-works/guide?slide=3');
    renderWithProviders(<TrainingGuidePage />);

    expect(screen.getByTestId('guide-section-3')).toHaveTextContent('model never sees the sentence');
    expect(screen.getByTestId('guide-back-to-slide')).toHaveAttribute('href', '/learn/how-llm-works/slides?slide=3');

    fireEvent.click(screen.getByTestId('guide-next'));
    expect(window.location.search).toBe('?slide=4');
    expect(screen.getByTestId('guide-section-4')).toHaveTextContent('important boundary is text');
  });

  test('renders the independent agent guide', () => {
    window.history.pushState({}, '', '/learn/how-ai-agent-works/guide?slide=1');
    renderWithProviders(<TrainingGuidePage curriculum="agent" />);

    expect(screen.getByText('How AI Agents Work')).toBeInTheDocument();
    expect(screen.getByTestId('guide-back-to-slide')).toHaveAttribute('href', '/learn/how-ai-agent-works/slides?slide=1');
    expect(screen.getAllByTestId(/^guide-jump-/)).toHaveLength(33);
    expect(screen.getByTestId('guide-section-1')).toHaveTextContent('Practical lens');
    expect(screen.getByTestId('guide-section-1')).not.toHaveTextContent('Mathematical lens');
  });

  test('keeps equations out of the primary agent guide', () => {
    const markdown = buildTrainingGuide(AGENT_TRAINING_SLIDES, 'agent').map(({ markdown }) => markdown).join('\n');

    expect(markdown).not.toContain('$$');
    expect(markdown).not.toContain('Mathematical lens');
    expect(markdown).not.toContain('Mathematical spine');
    expect(markdown).toContain('Why this matters to users');
    expect(markdown).toContain('Take this back to work');
  });
});
