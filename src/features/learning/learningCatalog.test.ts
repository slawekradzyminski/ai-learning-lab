import { describe, expect, test } from 'vitest';
import { LEARNING_LABS, LEARNING_TRACKS, getLearningLab } from './learningCatalog';

describe('learning catalog', () => {
  test('keeps model internals and agent harnesses in separate honest tracks', () => {
    expect(LEARNING_TRACKS.map((track) => track.id)).toEqual(['language', 'semantic', 'neural', 'agency', 'context', 'safety']);
    expect(LEARNING_LABS.filter((lab) => lab.track === 'language').map((lab) => lab.id)).toEqual([
      'tokenization',
      'attention',
      'residual-stream',
      'next-token',
      'kv-cache',
    ]);
    expect(LEARNING_LABS.find((lab) => lab.id === 'embeddings')).toMatchObject({
      track: 'semantic',
      shortTitle: 'Semantic embeddings',
    });
    expect(LEARNING_LABS.filter((lab) => lab.track === 'neural').map((lab) => lab.id)).toEqual([
      'perceptron',
      'gradient-descent',
      'backpropagation',
      'depth',
      'convolution',
      'digits',
    ]);
    expect(LEARNING_LABS.filter((lab) => lab.section === 'agent').map((lab) => lab.id)).toEqual([
      'agent-loop', 'subagents', 'context-harness', 'memory-instructions', 'hooks-lifecycle', 'tool-boundaries', 'agent-evals',
    ]);
    expect(LEARNING_LABS.map((lab) => lab.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });

  test('resolves the new attention route', () => {
    expect(getLearningLab('/learn/attention')).toMatchObject({ id: 'attention', order: 2 });
  });
});
