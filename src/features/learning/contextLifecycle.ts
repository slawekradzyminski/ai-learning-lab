export type ContextLifecycleAction =
  | 'next-turn'
  | 'edit-instructions'
  | 'connect-mcp'
  | 'switch-model'
  | 'compact'
  | 'resume';

export type ContextLifecycleOutcome = {
  action: ContextLifecycleAction;
  label: string;
  cache: 'warm' | 'partial' | 'cold' | 'rebuilt';
  cacheCopy: string;
  contextCopy: string;
  persistenceCopy: string;
  inputTokens: number;
  cachedTokens: number;
  summaryTokens: number;
};

export const CONTEXT_LIFECYCLE_OUTCOMES: ContextLifecycleOutcome[] = [
  {
    action: 'next-turn',
    label: 'Continue the conversation',
    cache: 'warm',
    cacheCopy: 'The stable prefix matches; only the appended turn needs fresh processing.',
    contextCopy: 'The earlier conversation is still supplied together with the new message.',
    persistenceCopy: 'Nothing became long-term memory merely because another turn was sent.',
    inputTokens: 260,
    cachedTokens: 190,
    summaryTokens: 0,
  },
  {
    action: 'edit-instructions',
    label: 'Edit project instructions',
    cache: 'partial',
    cacheCopy: 'Changing an early instruction breaks the matching prefix from that point onward.',
    contextCopy: 'The next call receives the new instruction text, not both versions.',
    persistenceCopy: 'The repository file remains durable and can be reloaded in later sessions.',
    inputTokens: 255,
    cachedTokens: 72,
    summaryTokens: 0,
  },
  {
    action: 'connect-mcp',
    label: 'Connect an MCP server',
    cache: 'partial',
    cacheCopy: 'The available tool set changed, so the tool-definition part of the prefix must be rebuilt.',
    contextCopy: 'New tool descriptions consume context before any tool is called.',
    persistenceCopy: 'The connection is harness configuration, not model memory.',
    inputTokens: 302,
    cachedTokens: 58,
    summaryTokens: 0,
  },
  {
    action: 'switch-model',
    label: 'Switch model',
    cache: 'cold',
    cacheCopy: 'Prompt caches are model-specific, so the first call on the new model starts cold.',
    contextCopy: 'The harness can still serialize the same visible conversation for the new model.',
    persistenceCopy: 'Files and saved sessions survive even though inference computation does not.',
    inputTokens: 260,
    cachedTokens: 0,
    summaryTokens: 0,
  },
  {
    action: 'compact',
    label: 'Compact the conversation',
    cache: 'rebuilt',
    cacheCopy: 'The next request has a shorter, different prefix and builds a new cache.',
    contextCopy: 'Raw older turns are replaced by a lossy summary; exact wording may disappear.',
    persistenceCopy: 'The original trace may remain outside the model context for later inspection.',
    inputTokens: 156,
    cachedTokens: 0,
    summaryTokens: 38,
  },
  {
    action: 'resume',
    label: 'Resume a saved session',
    cache: 'cold',
    cacheCopy: 'Saved conversation state can be restored even after the short-lived inference cache is gone.',
    contextCopy: 'The harness reloads messages or a summary into a fresh model request.',
    persistenceCopy: 'Session persistence and prompt caching have different lifetimes and owners.',
    inputTokens: 214,
    cachedTokens: 0,
    summaryTokens: 32,
  },
];

export function getContextLifecycleOutcome(action: ContextLifecycleAction): ContextLifecycleOutcome {
  return CONTEXT_LIFECYCLE_OUTCOMES.find((outcome) => outcome.action === action) ?? CONTEXT_LIFECYCLE_OUTCOMES[0];
}
