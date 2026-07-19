import { describe, expect, test } from 'vitest';
import { AGENT_COURSE_LESSONS } from './agentCourseCatalog';
import { AGENT_CHAPTER_LOADERS } from './content/chapterLoaders';

function countWords(value: string) {
  return value.replace(/```[\s\S]*?```/g, ' ').replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/[^\p{L}\p{N}'’-]+/gu, ' ').trim().split(/\s+/).filter(Boolean).length;
}

function expectUnique(values: string[], label: string) {
  expect(new Set(values).size, label).toBe(values.length);
}

describe('canonical AI Agents chapter quality', () => {
  test('every lesson provides a substantive, scenario-grounded study chapter', async () => {
    for (const lesson of AGENT_COURSE_LESSONS) {
      const chapter = await AGENT_CHAPTER_LOADERS[lesson.id]();
      const body = chapter.sections.map(({ body: sectionBody }) => sectionBody).join('\n');
      expect(countWords(body), `${lesson.id} prose words`).toBeGreaterThanOrEqual(2_400);
      expect(chapter.estimatedMinutes, `${lesson.id} study time`).toBeGreaterThanOrEqual(20);
      expect(chapter.prerequisites.length, `${lesson.id} prerequisites`).toBeGreaterThanOrEqual(2);
      expect(chapter.objectives.length, `${lesson.id} objectives`).toBeGreaterThanOrEqual(4);
      expect(chapter.sections.length, `${lesson.id} sections`).toBeGreaterThanOrEqual(8);
      expect(chapter.diagrams.length, `${lesson.id} diagrams`).toBeGreaterThanOrEqual(4);
      expect(chapter.misconceptions.length, `${lesson.id} misconceptions`).toBeGreaterThanOrEqual(6);
      expect(chapter.exercises.length, `${lesson.id} exercises`).toBeGreaterThanOrEqual(7);
      expect(chapter.glossary.length, `${lesson.id} glossary`).toBeGreaterThanOrEqual(10);
      expect(lesson.educational.sources.length, `${lesson.id} sources`).toBeGreaterThanOrEqual(3);
      expect(body, `${lesson.id} shared scenario`).toMatch(/laptop|€900|comparison\.md/i);
      expect(body, `${lesson.id} equation-free main path`).not.toMatch(/\$\$|\\\[|\\\(/);

      const sectionIds = chapter.sections.map(({ id }) => id);
      const diagramIds = chapter.diagrams.map(({ id }) => id);
      const exerciseIds = chapter.exercises.map(({ id }) => id);
      expectUnique(sectionIds, `${lesson.id} section IDs`);
      expectUnique(diagramIds, `${lesson.id} diagram IDs`);
      expectUnique(exerciseIds, `${lesson.id} exercise IDs`);

      const referenced = chapter.sections.flatMap(({ diagramIds: ids = [] }) => ids);
      for (const id of referenced) expect(diagramIds, `${lesson.id} references ${id}`).toContain(id);
      for (const id of diagramIds) expect(referenced, `${lesson.id} renders ${id}`).toContain(id);
      for (const diagram of chapter.diagrams) {
        expect(diagram.chart, `${lesson.id}/${diagram.id} chart`).toMatch(/(flowchart|graph|sequenceDiagram|stateDiagram|timeline|block-beta)/);
        expect(diagram.caption).toBeTruthy();
        expect(diagram.alt).toBeTruthy();
      }
      for (const exercise of chapter.exercises) expect(countWords(exercise.answer), `${lesson.id}/${exercise.id} answer`).toBeGreaterThanOrEqual(12);
    }
  });
});
