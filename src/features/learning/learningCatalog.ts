export type LearningSectionId = 'llm' | 'agent';

export type LearningLabId =
  | 'tokenization'
  | 'attention'
  | 'residual-stream'
  | 'next-token'
  | 'kv-cache'
  | 'embeddings'
  | 'perceptron'
  | 'gradient-descent'
  | 'backpropagation'
  | 'depth'
  | 'convolution'
  | 'digits'
  | 'agent-loop'
  | 'subagents'
  | 'context-harness'
  | 'memory-instructions'
  | 'hooks-lifecycle'
  | 'tool-boundaries'
  | 'agent-evals';

export type LearningTrackId =
  | 'language'
  | 'semantic'
  | 'neural'
  | 'agency'
  | 'context'
  | 'safety';

export type LearningLab = {
  id: LearningLabId;
  order: number;
  section: LearningSectionId;
  track: LearningTrackId;
  trackOrder: number;
  title: string;
  shortTitle: string;
  route: string;
  eyebrow: string;
  description: string;
  takeaway: string;
};

export const LEARNING_SECTIONS = [
  {
    id: 'llm',
    label: 'Part I',
    title: 'How LLM works?',
    description: 'Follow one unfinished sentence through a complete transformer pass, then branch into retrieval, learning foundations, and vision.',
    materialsRoute: '/learn/how-llm-works/materials',
  },
  {
    id: 'agent',
    label: 'Part II',
    title: 'How AI Agent works?',
    description: 'Step outside the model and inspect the harness that supplies context, executes tools, enforces boundaries, and repeats.',
    materialsRoute: '/learn/how-ai-agent-works/materials',
  },
] as const satisfies ReadonlyArray<{
  id: LearningSectionId;
  label: string;
  title: string;
  description: string;
  materialsRoute: string;
}>;

export const LEARNING_LABS: LearningLab[] = [
  {
    id: 'tokenization', order: 1, section: 'llm', track: 'language', trackOrder: 1,
    title: 'Reveal the model’s tokens', shortTitle: 'Tokenization', route: '/learn/tokenization', eyebrow: 'Language systems',
    description: 'Split editable text with transparent rules or Bonsai’s exact base tokenizer, then inspect IDs and bytes.',
    takeaway: 'Models receive token IDs—not words—and every token consumes context.',
  },
  {
    id: 'attention', order: 2, section: 'llm', track: 'language', trackOrder: 2,
    title: 'Watch tokens gather context', shortTitle: 'Attention', route: '/learn/attention', eyebrow: 'Language systems',
    description: 'Follow one exact attention head through Q/K/V projections, masking, softmax, and its output.',
    takeaway: 'Attention moves information between token positions before the next-token decision.',
  },
  {
    id: 'residual-stream', order: 3, section: 'llm', track: 'language', trackOrder: 3,
    title: 'Watch the prediction form', shortTitle: 'Residual stream', route: '/learn/residual-stream', eyebrow: 'Language systems',
    description: 'Scrub through transformer layers and use a teaching logit lens to inspect how the last-token representation changes.',
    takeaway: 'Attention and MLP blocks repeatedly add updates to a shared residual stream.',
  },
  {
    id: 'next-token', order: 4, section: 'llm', track: 'language', trackOrder: 4,
    title: 'Choose the next token', shortTitle: 'Next token', route: '/learn/next-token', eyebrow: 'Language systems',
    description: 'Transform probabilities with temperature, decode a token, and inspect cross-entropy.',
    takeaway: 'Generation is a sequence of probability-driven choices.',
  },
  {
    id: 'kv-cache', order: 5, section: 'llm', track: 'language', trackOrder: 5,
    title: 'Measure the cost of context', shortTitle: 'KV cache', route: '/learn/kv-cache', eyebrow: 'Language systems',
    description: 'Compare MHA, MQA, and GQA memory as context and architecture change.',
    takeaway: 'Long context consumes memory linearly for every layer and KV head.',
  },
  {
    id: 'embeddings', order: 6, section: 'llm', track: 'semantic', trackOrder: 1,
    title: 'Map semantic similarity', shortTitle: 'Semantic embeddings', route: '/learn/embeddings', eyebrow: 'Semantic systems',
    description: 'Compare inspectable teaching vectors with live local embeddings and a semantic similarity map.',
    takeaway: 'EmbeddingGemma supports similarity and retrieval; its vectors are not passed into Bonsai.',
  },
  {
    id: 'perceptron', order: 7, section: 'llm', track: 'neural', trackOrder: 1,
    title: 'Teach one artificial neuron', shortTitle: 'Perceptron', route: '/learn/perceptron', eyebrow: 'Learning foundations',
    description: 'Move through OR and XOR one example at a time, with every weight update exposed.',
    takeaway: 'See where linear decision boundaries work—and where they cannot.',
  },
  {
    id: 'gradient-descent', order: 8, section: 'llm', track: 'neural', trackOrder: 2,
    title: 'Walk downhill on a loss surface', shortTitle: 'Gradient descent', route: '/learn/gradient-descent', eyebrow: 'Learning foundations',
    description: 'Fit a real two-parameter regression model with exact analytic and numerical gradients.',
    takeaway: 'Loss supplies an objective; its gradient supplies a local update direction.',
  },
  {
    id: 'backpropagation', order: 9, section: 'llm', track: 'neural', trackOrder: 3,
    title: 'Send credit backward', shortTitle: 'Backpropagation', route: '/learn/backpropagation', eyebrow: 'Learning foundations',
    description: 'Trace one hidden ReLU neuron forward and apply the chain rule back to every parameter.',
    takeaway: 'Local derivatives compose into parameter gradients across an entire network.',
  },
  {
    id: 'depth', order: 10, section: 'llm', track: 'neural', trackOrder: 4,
    title: 'Change the representation', shortTitle: 'Depth', route: '/learn/depth', eyebrow: 'Learning foundations',
    description: 'Create OR and AND hidden features that turn XOR into a linearly separable problem.',
    takeaway: 'Depth composes features so later decisions can become geometrically simpler.',
  },
  {
    id: 'convolution', order: 11, section: 'llm', track: 'neural', trackOrder: 5,
    title: 'Slide a visual filter', shortTitle: 'Convolution', route: '/learn/convolution', eyebrow: 'Computer vision',
    description: 'Connect an input patch to a kernel, nine products, and one activation.',
    takeaway: 'A convolution detects the same local pattern everywhere.',
  },
  {
    id: 'digits', order: 12, section: 'llm', track: 'neural', trackOrder: 6,
    title: 'Recognize a handwritten digit', shortTitle: 'Digit CNN', route: '/learn/digits', eyebrow: 'Neural networks',
    description: 'Run a trained 9K-parameter CNN locally and inspect its intermediate activation maps.',
    takeaway: 'Learned filters compose local evidence into a ten-class prediction.',
  },
  {
    id: 'agent-loop', order: 13, section: 'agent', track: 'agency', trackOrder: 1,
    title: 'Step through the agent loop', shortTitle: 'Agent loop', route: '/learn/agent-loop', eyebrow: 'Agent runtime',
    description: 'Advance through model decisions, tool calls, results, recovery, and the final answer one turn at a time.',
    takeaway: 'An agent is a model inside a loop, connected to an environment through tools.',
  },
  {
    id: 'subagents', order: 14, section: 'agent', track: 'agency', trackOrder: 2,
    title: 'Delegate without losing control', shortTitle: 'Subagents', route: '/learn/subagents', eyebrow: 'Agent runtime',
    description: 'Compare bounded delegation, parallel execution, context isolation, and shared-write conflicts.',
    takeaway: 'Parallel agents reduce elapsed time only when their tasks and writable state are coordinated.',
  },
  {
    id: 'context-harness', order: 15, section: 'agent', track: 'context', trackOrder: 1,
    title: 'Trace the context lifecycle', shortTitle: 'Context lifecycle', route: '/learn/context-harness', eyebrow: 'Agent harness',
    description: 'Fit the next call, then compare prompt caching, compaction, model switches, and resumed sessions.',
    takeaway: 'Context, cached computation, summaries, files, and saved sessions have different lifetimes.',
  },
  {
    id: 'memory-instructions', order: 16, section: 'agent', track: 'context', trackOrder: 2,
    title: 'Place durable information deliberately', shortTitle: 'Memory', route: '/learn/memory-instructions', eyebrow: 'Agent context',
    description: 'Place rules, preferences, workflows, evidence, and secrets in the system that matches their lifetime.',
    takeaway: 'Required instructions, learned memory, reusable skills, and exact external state are not interchangeable.',
  },
  {
    id: 'hooks-lifecycle', order: 17, section: 'agent', track: 'safety', trackOrder: 1,
    title: 'Attach logic to lifecycle events', shortTitle: 'Hooks', route: '/learn/hooks-lifecycle', eyebrow: 'Agent safety',
    description: 'Place guards, formatters, validators, and context restoration at the earliest useful lifecycle event.',
    takeaway: 'Hooks add deterministic behavior around the probabilistic loop.',
  },
  {
    id: 'tool-boundaries', order: 18, section: 'agent', track: 'safety', trackOrder: 2,
    title: 'Validate tools and permissions', shortTitle: 'Tool boundaries', route: '/learn/tool-boundaries', eyebrow: 'Agent safety',
    description: 'Pass proposed tool calls through schema validation, policy, approval, execution, and observation.',
    takeaway: 'The model proposes actions; deterministic code decides whether and how they happen.',
  },
  {
    id: 'agent-evals', order: 19, section: 'agent', track: 'safety', trackOrder: 3,
    title: 'Evaluate outcomes and reliability', shortTitle: 'Agent evals', route: '/learn/agent-evals', eyebrow: 'Agent evaluation',
    description: 'Run 20 seeded trials, inspect traces and outcomes, combine grader types, and compare pass@k with pass^k.',
    takeaway: 'One convincing run is an anecdote; repeated outcome checks turn agent behavior into engineering evidence.',
  },
];

export const LEARNING_TRACKS: Array<{
  id: LearningTrackId;
  section: LearningSectionId;
  label: string;
  title: string;
  description: string;
}> = [
  { id: 'language', section: 'llm', label: 'Core lab library · Transformer inference', title: 'Inspect the mechanisms independently', description: 'Deep-linkable labs behind the canonical one-token course: tokenizer, attention, residual stream, output head, and inference cache.' },
  { id: 'semantic', section: 'llm', label: 'Optional path · Semantic search and RAG', title: 'From text to searchable meaning', description: 'Sentence-level vectors for similarity and retrieval are useful, but they are not token embeddings inside the generator.' },
  { id: 'neural', section: 'llm', label: 'Optional path · Neural networks and vision', title: 'From one neuron to a classifier', description: 'Follow loss, gradients, feature composition, spatial filters, and a complete digit network as a separate mental model.' },
  { id: 'agency', section: 'agent', label: 'Track A · Runtime and delegation', title: 'From goal to coordinated action', description: 'See how a model alternates with tools, then delegates bounded work without losing synthesis or write control.' },
  { id: 'context', section: 'agent', label: 'Track B · Context and persistence', title: 'From environment to durable working state', description: 'Inspect selection, caching, compaction, instructions, memory, skills, and external persistence.' },
  { id: 'safety', section: 'agent', label: 'Track C · Boundaries and evaluation', title: 'From proposal to controlled, measured effect', description: 'Attach deterministic hooks, enforce capabilities, then evaluate repeated traces and observable outcomes.' },
];

export function getLearningLab(pathname: string): LearningLab | undefined {
  return LEARNING_LABS.find((lab) => pathname === lab.route);
}

export function getSectionLabs(section: LearningSectionId): LearningLab[] {
  return LEARNING_LABS.filter((lab) => lab.section === section);
}

export function getSectionTracks(section: LearningSectionId) {
  return LEARNING_TRACKS.filter((track) => track.section === section);
}
