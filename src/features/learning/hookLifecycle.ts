export type HookEvent = 'session-start' | 'user-prompt' | 'pre-tool' | 'post-tool' | 'post-compact' | 'stop';

export type HookScenario = {
  id: string;
  title: string;
  proposal: string;
  expectedEvent: HookEvent;
  effect: string;
};

export const HOOK_EVENTS: Array<{ id: HookEvent; label: string; phase: string }> = [
  { id: 'session-start', label: 'SessionStart', phase: 'Initialize' },
  { id: 'user-prompt', label: 'UserPromptSubmit', phase: 'Inspect input' },
  { id: 'pre-tool', label: 'PreToolUse', phase: 'Gate proposal' },
  { id: 'post-tool', label: 'PostToolUse', phase: 'React to result' },
  { id: 'post-compact', label: 'PostCompact', phase: 'Restore context' },
  { id: 'stop', label: 'Stop', phase: 'Validate completion' },
];

export const HOOK_SCENARIOS: HookScenario[] = [
  { id: 'protect', title: 'Deny an external commitment', proposal: 'Block purchase_product before it can reserve or buy a laptop.', expectedEvent: 'pre-tool', effect: 'The tool call is rejected before a side effect occurs.' },
  { id: 'format', title: 'Normalize retrieved evidence', proposal: 'Add source and retrieval-time metadata after a successful product lookup.', expectedEvent: 'post-tool', effect: 'The hook sees the actual result and can report the normalized evidence record.' },
  { id: 'rehydrate', title: 'Restore comparison criteria', proposal: 'Reload the report criteria and forbidden effects after context compaction.', expectedEvent: 'post-compact', effect: 'Required external guidance is reinjected after the summary is created.' },
  { id: 'validate', title: 'Require a verified report', proposal: 'Prevent completion when laptop-comparison.md is missing evidence or products.', expectedEvent: 'stop', effect: 'The stop attempt returns actionable feedback and the loop can continue.' },
];

export function evaluateHookSelection(scenario: HookScenario, event: HookEvent) {
  const correct = scenario.expectedEvent === event;
  const expected = HOOK_EVENTS.find(({ id }) => id === scenario.expectedEvent)?.label;
  return {
    correct,
    message: correct ? scenario.effect : `${expected} is the earliest event with the evidence and control needed for this rule.`,
  };
}
