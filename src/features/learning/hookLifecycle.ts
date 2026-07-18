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
  { id: 'protect', title: 'Protect environment files', proposal: 'Block a write to .env before it reaches the filesystem.', expectedEvent: 'pre-tool', effect: 'The tool call is rejected before a side effect occurs.' },
  { id: 'format', title: 'Format edited code', proposal: 'Run the formatter after a successful source-file edit.', expectedEvent: 'post-tool', effect: 'The formatter sees the actual edited path and can report its result.' },
  { id: 'rehydrate', title: 'Restore critical context', proposal: 'Reload the deployment checklist after conversation compaction.', expectedEvent: 'post-compact', effect: 'Required external guidance is reinjected after the summary is created.' },
  { id: 'validate', title: 'Require passing tests', proposal: 'Prevent completion when the verification suite is failing.', expectedEvent: 'stop', effect: 'The stop attempt returns actionable feedback and the loop can continue.' },
];

export function evaluateHookSelection(scenario: HookScenario, event: HookEvent) {
  const correct = scenario.expectedEvent === event;
  const expected = HOOK_EVENTS.find(({ id }) => id === scenario.expectedEvent)?.label;
  return {
    correct,
    message: correct ? scenario.effect : `${expected} is the earliest event with the evidence and control needed for this rule.`,
  };
}
