import { describe, expect, test } from 'vitest';
import { TRAINING_SLIDES } from '../trainingSlideCatalog';
import { AGENT_TRAINING_SLIDES } from '../trainingSlides/agentCatalog';
import { buildTrainingGuide } from './buildTrainingGuide';

describe('buildTrainingGuide', () => {
  test('provides researched theory and mathematics for every LLM slide', () => {
    const guide = buildTrainingGuide(TRAINING_SLIDES, 'llm');

    expect(guide).toHaveLength(53);
    for (const section of guide) {
      expect(section.markdown, section.id).toContain('###');
      expect(section.markdown, section.id).toMatch(/\$|equation|representation/i);
      expect(section.markdown, section.id).toMatch(/Sources|Welch|reading/i);
    }
  });

  test('provides a separate practical-first 33-slide agent guide', () => {
    const guide = buildTrainingGuide(AGENT_TRAINING_SLIDES, 'agent');

    expect(guide).toHaveLength(33);
    expect(guide[0].markdown).toContain('user-facing software system');
    expect(guide[guide.length - 1].markdown).toContain('proposal, context assembly');
    expect(guide.find(({ id }) => id === 'agent-evals-mechanism')?.markdown).toContain('Practical design decision');
    expect(guide.map(({ markdown }) => markdown).join('\n')).not.toContain('$$');
  });

  test('adds Mermaid source to mechanism and track explanations', () => {
    const guide = buildTrainingGuide(TRAINING_SLIDES, 'llm');

    expect(guide.find(({ id }) => id === 'attention-mechanism')?.markdown).toContain('```mermaid');
    expect(guide.find(({ id }) => id === 'track-neural')?.markdown).toContain('```mermaid');
    expect(guide.find(({ id }) => id === 'attention-hook')?.markdown).toContain('https://www.welchlabs.com/');
  });
});
