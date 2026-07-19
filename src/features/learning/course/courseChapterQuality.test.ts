import { LLM_COURSE_LESSONS } from './llmCourseCatalog';
import { COURSE_CHAPTER_LOADERS } from './content/chapterLoaders';

function countWords(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/[^\p{L}\p{N}'’-]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function expectUnique(values: string[], label: string) {
  expect(new Set(values).size, label).toBe(values.length);
}

describe('canonical LLM course chapter quality', () => {
  test('every lesson is a substantive, inspectable chapter rather than a summary paragraph', async () => {
    for (const lesson of LLM_COURSE_LESSONS) {
      const chapter = await COURSE_CHAPTER_LOADERS[lesson.id]();
      expect(chapter, `${lesson.id} chapter`).toBeDefined();

      const proseWords = countWords(chapter.sections.map(({ body }) => body).join('\n'));
      expect(proseWords, `${lesson.id} prose words`).toBeGreaterThanOrEqual(1_800);
      expect(chapter.estimatedMinutes, `${lesson.id} study time`).toBeGreaterThanOrEqual(20);
      expect(chapter.prerequisites.length, `${lesson.id} prerequisites`).toBeGreaterThanOrEqual(2);
      expect(chapter.objectives.length, `${lesson.id} objectives`).toBeGreaterThanOrEqual(4);
      expect(chapter.sections.length, `${lesson.id} sections`).toBeGreaterThanOrEqual(6);
      expect(chapter.diagrams.length, `${lesson.id} diagrams`).toBeGreaterThanOrEqual(3);
      expect(chapter.misconceptions.length, `${lesson.id} misconceptions`).toBeGreaterThanOrEqual(4);
      expect(chapter.exercises.length, `${lesson.id} exercises`).toBeGreaterThanOrEqual(6);
      expect(chapter.glossary.length, `${lesson.id} glossary`).toBeGreaterThanOrEqual(5);
      expect(lesson.educational.sources.length, `${lesson.id} sources`).toBeGreaterThanOrEqual(3);

      const sectionIds = chapter.sections.map(({ id }) => id);
      const diagramIds = chapter.diagrams.map(({ id }) => id);
      const exerciseIds = chapter.exercises.map(({ id }) => id);
      expectUnique(sectionIds, `${lesson.id} section IDs`);
      expectUnique(diagramIds, `${lesson.id} diagram IDs`);
      expectUnique(exerciseIds, `${lesson.id} exercise IDs`);

      const referencedDiagrams = chapter.sections.flatMap(({ diagramIds: refs = [] }) => refs);
      for (const diagramId of referencedDiagrams) {
        expect(diagramIds, `${lesson.id} references known diagram ${diagramId}`).toContain(diagramId);
      }
      for (const diagramId of diagramIds) {
        expect(referencedDiagrams, `${lesson.id} renders diagram ${diagramId}`).toContain(diagramId);
      }

      for (const diagram of chapter.diagrams) {
        expect(diagram.title, `${lesson.id}/${diagram.id} title`).toBeTruthy();
        expect(diagram.caption, `${lesson.id}/${diagram.id} caption`).toBeTruthy();
        expect(diagram.alt, `${lesson.id}/${diagram.id} alt`).toBeTruthy();
        expect(diagram.chart, `${lesson.id}/${diagram.id} chart`).toMatch(/(flowchart|graph|sequenceDiagram|timeline|block-beta)/);
      }

      for (const exercise of chapter.exercises) {
        expect(exercise.prompt, `${lesson.id}/${exercise.id} prompt`).toBeTruthy();
        expect(countWords(exercise.answer), `${lesson.id}/${exercise.id} reasoned answer`).toBeGreaterThanOrEqual(12);
      }
    }
  });
});
