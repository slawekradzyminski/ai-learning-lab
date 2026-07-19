export type DelegationScenario = 'bounded' | 'overlap';

export type DelegatedTask = {
  id: string;
  label: string;
  minutes: number;
  tokens: number;
  writes: string[];
};

const boundedTasks: DelegatedTask[] = [
  { id: 'candidates', label: 'Find three candidate laptops', minutes: 9, tokens: 2800, writes: [] },
  { id: 'evidence', label: 'Verify prices and specifications', minutes: 11, tokens: 3900, writes: [] },
  { id: 'review', label: 'Challenge missing or stale evidence', minutes: 7, tokens: 2400, writes: [] },
];

const overlapTasks: DelegatedTask[] = [
  { id: 'report-a', label: 'Write comparison from catalog A', minutes: 10, tokens: 3200, writes: ['laptop-comparison.md'] },
  { id: 'report-b', label: 'Write comparison from catalog B', minutes: 8, tokens: 3000, writes: ['laptop-comparison.md'] },
  { id: 'citations', label: 'Create a separate source audit', minutes: 6, tokens: 2200, writes: ['laptop-sources.md'] },
];

export function simulateDelegation(scenario: DelegationScenario, parallel: boolean, isolated: boolean) {
  const tasks = scenario === 'bounded' ? boundedTasks : overlapTasks;
  const elapsedMinutes = parallel ? Math.max(...tasks.map(({ minutes }) => minutes)) : tasks.reduce((sum, task) => sum + task.minutes, 0);
  const totalTokens = tasks.reduce((sum, task) => sum + task.tokens, 0);
  const paths = tasks.flatMap(({ writes }) => writes);
  const sharedWrites = paths.filter((path, index) => paths.indexOf(path) !== index);
  const conflict = parallel && !isolated && sharedWrites.length > 0;

  return {
    tasks,
    elapsedMinutes,
    totalTokens,
    parentContextTokens: parallel ? 1250 : 3100,
    conflict,
    conflictPath: sharedWrites[0],
    mergeRequired: parallel && isolated && sharedWrites.length > 0,
  };
}
