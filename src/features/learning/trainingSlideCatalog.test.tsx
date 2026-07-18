import { describe, expect, test } from 'vitest';
import { LEARNING_LABS } from './learningCatalog';
import { EXERCISE_SLIDE_BY_LAB, TRAINING_SLIDES } from './trainingSlideCatalog';

describe('trainingSlideCatalog', () => {
  test('covers the complete LLM curriculum in 53 slides', () => {
    expect(TRAINING_SLIDES).toHaveLength(53);
    expect(TRAINING_SLIDES[0]).toMatchObject({ kind: 'opening' });
    expect(TRAINING_SLIDES[TRAINING_SLIDES.length - 1]).toMatchObject({ kind: 'recap' });
  });

  test('gives every lab one contiguous book-like narrative chapter', () => {
    for (const lab of LEARNING_LABS.filter(({ section }) => section === 'llm')) {
      const chapter = TRAINING_SLIDES.filter((slide) => slide.labId === lab.id);
      expect(chapter.map((slide) => slide.kind), lab.id).toEqual(['hook', 'mechanism', 'exercise', 'debrief']);
      expect(chapter.every((slide) => slide.trackId === lab.track), lab.id).toBe(true);
    }
  });

  test('keeps stable one-based slide numbers for all exercise handoffs', () => {
    expect(EXERCISE_SLIDE_BY_LAB).toEqual({
      tokenization: 5,
      attention: 9,
      'residual-stream': 13,
      'next-token': 17,
      'kv-cache': 21,
      embeddings: 26,
      perceptron: 31,
      'gradient-descent': 35,
      backpropagation: 39,
      depth: 43,
      convolution: 47,
      digits: 51,
    });
  });
});
