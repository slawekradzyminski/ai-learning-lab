import type { CourseTheory } from '../../course/content/theoryTypes';
import type { AgentCourseLessonId } from '../agentCourseTypes';

const openAiLoop = {
  label: 'OpenAI — Unrolling the Codex agent loop',
  url: 'https://openai.com/index/unrolling-the-codex-agent-loop/',
  note: 'A concrete description of the model–tool–observation loop and its terminal condition.',
};

const practicalGuide = {
  label: 'OpenAI — A practical guide to building agents',
  url: 'https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/',
  note: 'Design guidance for tools, orchestration, guardrails, risk ratings, and human intervention.',
};

const mcpSpec = {
  label: 'Model Context Protocol specification',
  url: 'https://modelcontextprotocol.io/specification/2025-03-26/index',
  note: 'The protocol boundary for context, tools, user control, consent, and security responsibilities.',
};

const reactPaper = {
  label: 'Yao et al. — ReAct',
  url: 'https://arxiv.org/abs/2210.03629',
  note: 'The foundational pattern of interleaving model reasoning with actions and observations.',
};

const owaspAgency = {
  label: 'OWASP — Excessive Agency',
  url: 'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/',
  note: 'A threat model organized around excessive functionality, permissions, and autonomy.',
};

const evalPlaybook = {
  label: 'OpenAI — Foundations for trustworthy third-party evaluations',
  url: 'https://openai.com/index/trustworthy-third-party-evaluations-foundations/',
  note: 'Current guidance on agentic evaluation scope, harness reporting, budgets, and validity checks.',
};

export const AGENT_LESSON_THEORY: Record<AgentCourseLessonId, CourseTheory> = {
  'agent-loop': {
    heading: 'An agent is a controlled loop, not a more intelligent chat response.',
    takeaway: 'The model proposes the next move; the harness owns state, executes permitted actions, records observations, and decides whether another turn is possible.',
    explanation: 'A useful agent alternates between a probabilistic policy and a deterministic runtime. The runtime packages the goal and current evidence, asks the model for a response, validates any requested tool call, executes only allowed effects, and appends the result to the next turn. The loop stops on a satisfactory final answer, an explicit failure, a budget boundary, or a human decision.',
    whyItMatters: 'If the loop is invisible, retries look like intelligence, failures look mysterious, and unsafe proposals can be confused with authorized effects. A trace makes each transition inspectable.',
    misconception: { claim: 'An agent is just an LLM with a long system prompt.', correction: 'Prompts influence proposals. The application loop supplies tools, state, budgets, permissions, observations, and stopping rules.' },
    tryThis: 'Trace the laptop-research task turn by turn. Mark what the model proposed, what the harness allowed, what the environment returned, and why the loop continued.',
    diagram: { chart: 'flowchart LR\n  G[Goal] --> M[Model proposal]\n  M --> H{Harness boundary}\n  H --> T[Tool effect]\n  T --> O[Observation]\n  O --> M\n  M --> F[Final response]', alt: 'The harness mediates every transition between a model proposal and an external effect.' },
    sources: [openAiLoop, reactPaper, practicalGuide],
  },
  subagents: {
    heading: 'Delegation is a graph of contracts, evidence, and ownership.',
    takeaway: 'A subagent should receive a bounded question and return an inspectable artifact; the parent remains responsible for integration and the final claim.',
    explanation: 'Parallel workers are useful when work can be partitioned without hiding critical dependencies. Each delegation needs an explicit objective, context packet, allowed tools, output schema, budget, and completion condition. The parent compares and reconciles results rather than trusting an appealing summary.',
    whyItMatters: 'Delegation can reduce latency and context pressure, but it also creates coordination cost, duplicated work, conflicting evidence, and unclear accountability.',
    misconception: { claim: 'More subagents always make the result faster and better.', correction: 'Parallelism helps only when tasks are sufficiently independent and the cost of coordination, verification, and shared-resource contention is lower than the saved time.' },
    tryThis: 'Split the laptop task by evidence source, by candidate product, and by verification role. Compare which decomposition gives the parent the easiest integration job.',
    sources: [
      { label: 'OpenAI — The next evolution of the Agents SDK', url: 'https://openai.com/index/the-next-evolution-of-the-agents-sdk/', note: 'A current view of agent workspaces, tools, orchestration, and controlled execution.' },
      reactPaper,
      { label: 'Anthropic — Effective harnesses for long-running agents', url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents', note: 'Practical patterns for persistent state, incremental progress, and reliable handoffs.' },
    ],
  },
  'context-harness': {
    heading: 'Context is a constructed working set, not everything the system knows.',
    takeaway: 'The harness decides what evidence enters each model call, in what order, under which authority, and within which budget.',
    explanation: 'At every turn, the runtime assembles instructions, user intent, relevant history, tool descriptions, retrieved evidence, and current state. Selection and compression are engineering decisions. Omitting a decisive fact can make the model fail; including untrusted or stale material without provenance can make it fail confidently.',
    whyItMatters: 'Most agent reliability problems are partly context problems: missing state, polluted authority, stale evidence, ambiguous tool results, or a context window filled with low-value history.',
    misconception: { claim: 'A larger context window removes the need for context engineering.', correction: 'Capacity does not decide relevance, authority, freshness, ordering, or provenance. The harness must still construct a useful working set.' },
    tryThis: 'Build three context packets for the laptop task: minimal, exhaustive, and evidence-ranked. Predict which failure each packet makes more likely.',
    sources: [openAiLoop, mcpSpec, { label: 'Anthropic — Effective harnesses for long-running agents', url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents', note: 'Patterns for progress files, session boundaries, and recoverable context.' }],
  },
  'memory-instructions': {
    heading: 'Instructions, working state, durable memory, and external truth have different jobs.',
    takeaway: 'Place information according to authority, lifetime, sensitivity, and update path—not according to whichever storage mechanism is convenient.',
    explanation: 'Instructions define intended behavior. Turn state records the current run. Durable memory stores reusable learned facts with provenance and expiry. External systems remain authoritative for changing facts such as current prices. Treating these stores as interchangeable produces stale decisions and hidden policy.',
    whyItMatters: 'An agent becomes governable only when a reviewer can answer where a fact came from, who may change it, how long it should persist, and which source wins after conflict.',
    misconception: { claim: 'If a fact may help later, it belongs in long-term memory.', correction: 'Sensitive, volatile, task-local, and externally authoritative facts often should not be copied into durable memory at all.' },
    tryThis: 'Classify the laptop budget, product prices, report format, user preferences, and search trace by lifetime and authority. Decide what should expire.',
    sources: [mcpSpec, practicalGuide, { label: 'Anthropic — Claude Code memory', url: 'https://code.claude.com/docs/en/memory', note: 'A concrete hierarchy separating project instructions and automatically learned project memory.' }],
  },
  'hooks-lifecycle': {
    heading: 'Hooks add deterministic behavior at named lifecycle boundaries.',
    takeaway: 'Attach a check at the earliest event that has enough evidence to decide and still has enough control to prevent or transform the effect.',
    explanation: 'Pre-action hooks can validate, redact, deny, or require approval before execution. Post-action hooks can verify outcomes and record audit evidence. Session and completion hooks can enforce cleanup or acceptance checks. Hooks complement—not replace—permissions, sandboxing, schemas, and application authorization.',
    whyItMatters: 'Natural-language instructions are probabilistic. Rules that must always hold need a deterministic path with observable inputs, outputs, and failure behavior.',
    misconception: { claim: 'A post-tool hook can prevent the side effect it inspects.', correction: 'After execution, prevention is too late. Use a pre-execution boundary for blocking and a post-execution boundary for verification or recovery.' },
    tryThis: 'Place budget validation, output sanitization, report existence checks, and audit logging on an agent lifecycle. Explain why each event is early enough and informed enough.',
    sources: [practicalGuide, mcpSpec, { label: 'Anthropic — Claude Code hooks', url: 'https://code.claude.com/docs/en/hooks', note: 'A concrete lifecycle-hook taxonomy with command, prompt, agent, and HTTP handlers.' }],
  },
  'tool-boundaries': {
    heading: 'A tool call is untrusted structured data until the application accepts it.',
    takeaway: 'The model may propose an action; schemas, authentication, authorization, risk policy, approvals, and the executor decide whether an effect occurs.',
    explanation: 'Safe tool use is complete mediation. Parse the proposed call, validate its schema and semantic constraints, bind it to the current principal, check the least-privilege policy, require meaningful confirmation for consequential effects, execute within bounded resources, and return a sanitized observation.',
    whyItMatters: 'Tool access turns text-generation errors into filesystem, network, financial, or communication effects. The permission boundary is the difference between a bad suggestion and a real incident.',
    misconception: { claim: 'A well-written system prompt is an authorization layer.', correction: 'A prompt can steer behavior but cannot prove identity, enforce permissions, constrain the operating system, or guarantee that an unsafe call never executes.' },
    tryThis: 'Risk-rate search_catalog, write_report, and purchase_product. Specify schemas, scopes, approval rules, timeouts, and audit fields for each.',
    sources: [mcpSpec, owaspAgency, practicalGuide],
  },
  'agent-evals': {
    heading: 'Evaluate the trajectory, the outcome, and the harness—not only the final prose.',
    takeaway: 'A credible agent evaluation freezes the task and environment, records the full trace, checks effects with deterministic graders where possible, and reports reliability with cost and risk.',
    explanation: 'Outcome quality can hide unsafe or wasteful trajectories. Agent evals therefore inspect success criteria, forbidden effects, evidence quality, tool selection, recovery behavior, turn count, tokens, retries, latency, and cost. Repeated trials reveal variance that a single polished demo conceals.',
    whyItMatters: 'Without a representative suite and a reproducible harness, teams optimize for anecdotes and cannot tell whether a model, prompt, tool, or policy change improved the system.',
    misconception: { claim: 'If the final answer is correct, the agent passed.', correction: 'An agent can reach a correct answer using fabricated evidence, prohibited actions, excessive cost, or a trajectory too brittle to deploy.' },
    tryThis: 'Write an evaluator for the laptop task that checks the report, cited evidence, budget constraint, forbidden purchase call, number of retries, and repeat-run success rate.',
    sources: [{ label: 'Anthropic — Demystifying evals for AI agents', url: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents', note: 'A practical framework for tasks, trials, graders, transcripts, outcomes, and evaluation design.' }, evalPlaybook, { label: 'OpenAI — Evals API', url: 'https://platform.openai.com/docs/api-reference/evals', note: 'The official API surface for evaluation definitions, data schemas, and graders.' }],
  },
  capstone: {
    heading: 'Design the whole agent as an evidence-producing control system.',
    takeaway: 'A deployable design makes goals, state, proposals, policy decisions, effects, observations, stopping rules, and evaluation evidence explicit.',
    explanation: 'The capstone combines the course into one architecture review. You will specify the laptop-research agent without granting purchase authority, trace a representative run, identify failure modes, choose deterministic boundaries, and define the evidence required before calling the task complete.',
    whyItMatters: 'Agent quality is an end-to-end property. A strong model cannot compensate for an ambiguous goal, stale context, excessive permissions, invisible side effects, or an eval that rewards the wrong outcome.',
    misconception: { claim: 'Once every component is individually sensible, the complete agent is safe and reliable.', correction: 'Failures often emerge at interfaces: context-to-model, proposal-to-policy, tool-to-observation, handoff-to-parent, and trace-to-grader.' },
    tryThis: 'Change the task from research-only to an approved purchase. List every contract and boundary that must change; do not merely add “you may buy” to the prompt.',
    sources: [openAiLoop, practicalGuide, owaspAgency, evalPlaybook],
  },
};
