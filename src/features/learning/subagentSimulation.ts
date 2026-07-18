export type DelegationScenario = 'bounded' | 'overlap';

export type DelegatedTask = {
  id: string;
  label: string;
  minutes: number;
  tokens: number;
  writes: string[];
};

const boundedTasks: DelegatedTask[] = [
  { id: 'research', label: 'Research official docs', minutes: 9, tokens: 2800, writes: [] },
  { id: 'implement', label: 'Build the lab page', minutes: 11, tokens: 3900, writes: ['MemoryLabPage.tsx'] },
  { id: 'verify', label: 'Review tests and behavior', minutes: 7, tokens: 2400, writes: [] },
];

const overlapTasks: DelegatedTask[] = [
  { id: 'page-a', label: 'Add memory controls', minutes: 10, tokens: 3200, writes: ['MemoryLabPage.tsx'] },
  { id: 'page-b', label: 'Restyle memory workspace', minutes: 8, tokens: 3000, writes: ['MemoryLabPage.tsx'] },
  { id: 'tests', label: 'Add interaction tests', minutes: 6, tokens: 2200, writes: ['MemoryLabPage.test.tsx'] },
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
