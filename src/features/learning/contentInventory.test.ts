import { describe, expect, test } from 'vitest';
import { LEARNING_LABS } from './learningCatalog';
import { buildTrainingGuide } from './trainingGuides/buildTrainingGuide';
import { TRAINING_SLIDES } from './trainingSlideCatalog';
import { AGENT_TRAINING_SLIDES } from './trainingSlides/agentCatalog';

describe('standalone content inventory', () => {
  test('keeps every lab connected to four teaching slides and matching theory', () => {
    const allSlides = [...TRAINING_SLIDES, ...AGENT_TRAINING_SLIDES];
    const allGuideSections = [
      ...buildTrainingGuide(TRAINING_SLIDES, 'llm'),
      ...buildTrainingGuide(AGENT_TRAINING_SLIDES, 'agent'),
    ];

    expect(LEARNING_LABS).toHaveLength(19);
    expect(allSlides).toHaveLength(86);
    expect(allGuideSections).toHaveLength(86);
    expect(allSlides.filter(({ kind }) => kind === 'exercise')).toHaveLength(19);

    for (const lab of LEARNING_LABS) {
      const chapter = allSlides.filter(({ labId }) => labId === lab.id);
      expect(chapter.map(({ kind }) => kind), lab.id).toEqual(['hook', 'mechanism', 'exercise', 'debrief']);
      expect(allGuideSections.filter(({ id }) => id.startsWith(`${lab.id}-`)), lab.id).toHaveLength(4);
    }
  });

  test('keeps lab routes unique and under the public learning prefix', () => {
    const routes = LEARNING_LABS.map(({ route }) => route);
    expect(new Set(routes).size).toBe(routes.length);
    expect(routes.every((route) => route.startsWith('/learn/'))).toBe(true);
  });
});
