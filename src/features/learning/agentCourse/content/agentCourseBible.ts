export const AGENT_COURSE_SCENARIO = {
  userGoal: 'Research three laptops under €900, verify current evidence, and write laptop-comparison.md. Do not purchase anything or contact a vendor.',
  deliverable: 'laptop-comparison.md',
  completionCriteria: [
    'Three qualifying products are compared against the same criteria.',
    'Every current price and material specification has a traceable source.',
    'The report is written to the approved workspace path.',
    'No purchase, reservation, message, or other external commitment occurs.',
  ],
  tools: [
    { name: 'search_catalog', effect: 'read', purpose: 'Find candidate product records.' },
    { name: 'fetch_product', effect: 'read', purpose: 'Retrieve current price, specifications, and source metadata.' },
    { name: 'write_report', effect: 'workspace-write', purpose: 'Write the approved comparison deliverable.' },
    { name: 'purchase_product', effect: 'external-commitment', purpose: 'Explicitly unavailable for this task.' },
  ],
} as const;
export const AGENT_COURSE_BIBLE = {
  audience: 'A technically curious learner who understands ordinary software systems but may not have built an agent harness.',
  centralQuestion: 'How does a model proposal become a controlled, observable, and evaluated effect in an external environment?',
  scenario: AGENT_COURSE_SCENARIO,
  runtimeQuestions: [
    'What state and evidence does the harness have now?',
    'What did the model propose?',
    'Which deterministic boundary accepts, rejects, or transforms the proposal?',
    'What observable effect occurred?',
    'What evidence justifies continuing or stopping?',
  ],
  pipeline: [
    'user goal and constraints',
    'selected and serialized context',
    'model proposal',
    'schema and policy decision',
    'bounded tool execution',
    'observation and trace update',
    'continue, recover, delegate, or stop',
    'verified terminal outcome',
    'repeated evaluation across trials',
  ],
  ownership: {
    model: 'Proposes text or structured actions from the current serialized context.',
    harness: 'Selects context, validates proposals, invokes tools, records observations, and enforces lifecycle rules.',
    tool: 'Implements a declared operation against an external system.',
    environment: 'Contains the state that actions read or change.',
    evaluator: 'Maps traces and terminal state to evidence-backed scores.',
  },
  boundaries: [
    'A fluent final message is not proof that an external effect succeeded.',
    'Prompts influence proposals; deterministic controls enforce capabilities.',
    'A trace may record actions and observations without exposing private chain-of-thought.',
    'Context, prompt caching, memory, instructions, skills, files, and secrets have different lifecycles.',
    'Parallel workers do not automatically isolate files, services, credentials, or databases.',
  ],
} as const;
