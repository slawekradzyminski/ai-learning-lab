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
    fact: 'Never purchase a laptop or contact a vendor during this research task.',
    context: 'A required task rule that must be visible throughout the run.',
    destination: 'instructions',
    explanation: 'Put durable required guidance in AGENTS.md or CLAUDE.md. Add a hook or CI check if it must be enforced.',
  },
  {
    id: 'preference',
    fact: 'The user usually prioritizes battery life over gaming performance.',
    context: 'A potentially reusable preference learned over repeated, consented conversations.',
    destination: 'memory',
    explanation: 'Personal memory fits a durable preference, but the user should be able to inspect and remove it.',
  },
  {
    id: 'release',
    fact: 'Research products using the verified comparison workflow.',
    context: 'A repeatable workflow with source retrieval, freshness checks, comparison, and report verification.',
    destination: 'skill',
    explanation: 'A skill can load the workflow only when relevant and can bundle scripts and references.',
  },
  {
    id: 'failure',
    fact: 'The latest product lookup failed because the catalog timed out.',
    context: 'Fresh evidence needed to recover the task currently in progress.',
    destination: 'turn',
    explanation: 'Keep current diagnostic evidence in the active conversation or trace; promote it only if it becomes durable knowledge.',
  },
  {
    id: 'audit',
    fact: 'The exact product snapshots and retrieval times must remain auditable.',
    context: 'Evidence that must preserve exact values, sources, freshness, and provenance.',
    destination: 'external',
    explanation: 'Store exact evidence in a file, database, or trace store and retrieve the relevant slice when needed.',
  },
  {
    id: 'token',
    fact: 'The private catalog API token is sk-live-…',
    context: 'A credential required by a product-retrieval tool.',
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
