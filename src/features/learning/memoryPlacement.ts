export type MemoryDestination = 'turn' | 'instructions' | 'memory' | 'skill' | 'external' | 'secret';

export type MemoryScenario = {
  id: string;
  fact: string;
  context: string;
  destination: MemoryDestination;
  explanation: string;
};

export const MEMORY_DESTINATIONS: Array<{ id: MemoryDestination; label: string; lifetime: string }> = [
  { id: 'turn', label: 'Current turn', lifetime: 'Temporary working context' },
  { id: 'instructions', label: 'Project instructions', lifetime: 'Durable repository rule' },
  { id: 'memory', label: 'Personal memory', lifetime: 'Cross-session preference' },
  { id: 'skill', label: 'Reusable skill', lifetime: 'On-demand workflow' },
  { id: 'external', label: 'External state', lifetime: 'Exact retrievable evidence' },
  { id: 'secret', label: 'Secret manager', lifetime: 'Protected credential storage' },
];

export const MEMORY_SCENARIOS: MemoryScenario[] = [
  {
    id: 'tests',
    fact: 'Always run pnpm test before finishing work in this repository.',
    context: 'A required team rule that must be visible to every coding session.',
    destination: 'instructions',
    explanation: 'Put durable required guidance in AGENTS.md or CLAUDE.md. Add a hook or CI check if it must be enforced.',
  },
  {
    id: 'preference',
    fact: 'Slawek prefers concise status updates.',
    context: 'A useful personal preference learned over repeated conversations.',
    destination: 'memory',
    explanation: 'Personal memory fits a durable preference, but the user should be able to inspect and remove it.',
  },
  {
    id: 'release',
    fact: 'Release the application using the twelve-step production checklist.',
    context: 'A repeatable workflow with commands, validation, and supporting references.',
    destination: 'skill',
    explanation: 'A skill can load the workflow only when relevant and can bundle scripts and references.',
  },
  {
    id: 'failure',
    fact: 'The most recent deployment failed because the health check timed out.',
    context: 'Fresh evidence needed to diagnose the task currently in progress.',
    destination: 'turn',
    explanation: 'Keep current diagnostic evidence in the active conversation or trace; promote it only if it becomes durable knowledge.',
  },
  {
    id: 'audit',
    fact: 'The exact production deployment log must remain auditable.',
    context: 'A source of truth that must preserve exact wording and provenance.',
    destination: 'external',
    explanation: 'Store exact evidence in a file, database, or trace store and retrieve the relevant slice when needed.',
  },
  {
    id: 'token',
    fact: 'The production API token is sk-live-…',
    context: 'A credential required by a deployment tool.',
    destination: 'secret',
    explanation: 'Never place credentials in prompt context, project instructions, or agent memory. Resolve them at execution time.',
  },
];

export function evaluateMemoryPlacement(scenario: MemoryScenario, destination: MemoryDestination) {
  return {
    correct: scenario.destination === destination,
    explanation: scenario.destination === destination
      ? scenario.explanation
      : `This information belongs in ${MEMORY_DESTINATIONS.find(({ id }) => id === scenario.destination)?.label.toLowerCase()}. ${scenario.explanation}`,
  };
}
