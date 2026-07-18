import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { TrainingSlidesPage } from './TrainingSlidesPage';

const exerciseSlides = [
  { id: 'tokenization', slide: 5, route: '/learn/tokenization' },
  { id: 'attention', slide: 9, route: '/learn/attention' },
  { id: 'residual-stream', slide: 13, route: '/learn/residual-stream' },
  { id: 'next-token', slide: 17, route: '/learn/next-token' },
  { id: 'kv-cache', slide: 21, route: '/learn/kv-cache' },
  { id: 'embeddings', slide: 26, route: '/learn/embeddings' },
  { id: 'perceptron', slide: 31, route: '/learn/perceptron' },
  { id: 'gradient-descent', slide: 35, route: '/learn/gradient-descent' },
  { id: 'backpropagation', slide: 39, route: '/learn/backpropagation' },
  { id: 'depth', slide: 43, route: '/learn/depth' },
  { id: 'convolution', slide: 47, route: '/learn/convolution' },
  { id: 'digits', slide: 51, route: '/learn/digits' },
];

describe('TrainingSlidesPage', () => {
  test('navigates with controls and keyboard while encoding slide state in the URL', () => {
    window.history.pushState({}, '', '/learn/training-slides?slide=1');
    renderWithProviders(<TrainingSlidesPage />);

    expect(screen.getByTestId('slides-title')).toHaveTextContent('Find the bottom');
    expect(screen.getByTestId('training-slide-frame')).toHaveClass('mx-auto', 'w-full', 'max-w-6xl');
    fireEvent.click(screen.getByTestId('slides-next'));
    expect(screen.getByTestId('slides-title')).toHaveTextContent('From text to generated token');
    expect(window.location.search).toBe('?slide=2');

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByTestId('slides-title')).toHaveTextContent('model never sees');
    expect(window.location.search).toBe('?slide=3');
    fireEvent.keyDown(window, { key: 'Home' });
    expect(window.location.search).toBe('?slide=1');
    fireEvent.keyDown(window, { key: 'End' });
    expect(window.location.search).toBe('?slide=53');
  });

  test('toggles instructor notes and groups the overview by all three tracks', () => {
    window.history.pushState({}, '', '/learn/training-slides?slide=1');
    renderWithProviders(<TrainingSlidesPage />);

    fireEvent.click(screen.getByTestId('slides-notes-toggle'));
    expect(screen.getByTestId('slides-notes')).toHaveTextContent('workshop contract');
    fireEvent.click(screen.getByTestId('slides-overview-toggle'));
    expect(screen.getByTestId('slides-overview-track-language')).toBeInTheDocument();
    expect(screen.getByTestId('slides-overview-track-semantic')).toBeInTheDocument();
    expect(screen.getByTestId('slides-overview-track-neural')).toBeInTheDocument();
    expect(screen.getByTestId('slides-overview-lab-digits')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('slides-jump-9'));
    expect(screen.getByTestId('slides-title')).toHaveTextContent('Exercise 2');
    expect(window.location.search).toBe('?slide=9');
  });

  test('opens the researched theory for the current slide in a new tab', () => {
    window.history.pushState({}, '', '/learn/how-llm-works/slides?slide=9');
    renderWithProviders(<TrainingSlidesPage />);

    expect(screen.getByTestId('slides-theory-guide')).toHaveAttribute('href', '/learn/how-llm-works/guide?slide=9');
    expect(screen.getByTestId('slides-theory-guide')).toHaveAttribute('target', '_blank');
  });

  test('provides a new-tab handoff for every AI Lab exercise', () => {
    window.history.pushState({}, '', '/learn/training-slides?slide=1');
    renderWithProviders(<TrainingSlidesPage />);

    for (const exercise of exerciseSlides) {
      fireEvent.click(screen.getByTestId('slides-overview-toggle'));
      fireEvent.click(screen.getByTestId(`slides-jump-${exercise.slide}`));
      const link = screen.getByTestId(`slides-exercise-${exercise.id}`);
      expect(link).toHaveAttribute('href', exercise.route);
      expect(link).toHaveAttribute('target', '_blank');
      expect(window.location.search).toBe(`?slide=${exercise.slide}`);
    }
  });

  test('uses question, mechanism, exercise, and debrief beats for the depth chapter', () => {
    window.history.pushState({}, '', '/learn/training-slides?slide=41');
    renderWithProviders(<TrainingSlidesPage />);

    expect(screen.getByTestId('slides-title')).toHaveTextContent('XOR defeats one line');
    fireEvent.click(screen.getByTestId('slides-next'));
    expect(screen.getByTestId('slides-title')).toHaveTextContent('first layer changes');
    fireEvent.click(screen.getByTestId('slides-next'));
    expect(screen.getByTestId('slides-title')).toHaveTextContent('Exercise 10');
    fireEvent.click(screen.getByTestId('slides-next'));
    expect(screen.getByTestId('slides-title')).toHaveTextContent('What changed');
  });

  test('renders the independent agent-harness deck', () => {
    window.history.pushState({}, '', '/learn/how-ai-agent-works/slides?slide=1');
    renderWithProviders(<TrainingSlidesPage curriculum="agent" />);
    expect(screen.getByTestId('slides-title')).toHaveTextContent('model is only one part');
    fireEvent.keyDown(window, { key: 'End' });
    expect(window.location.search).toBe('?slide=33');
    expect(screen.getByTestId('slides-title')).toHaveTextContent('legible, bounded harness');
  });
});
