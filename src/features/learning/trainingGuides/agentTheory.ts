import type { LabTheory, TrackTheory } from './types';

export const agentLabTheory: LabTheory[] = [
  {
    labId: 'agent-loop',
    premise: 'An agent is a system pattern, not a distinct kind of neuron. A language model proposes the next text or structured action from the supplied context. A deterministic harness validates the proposal, invokes tools, records observations, assembles the next context, and enforces stop conditions. Agency appears in the closed loop between model, harness, and environment.',
    mathematics: String.raw`A bounded run can be written as a state transition

$$a_t\sim\pi_\theta(\cdot\mid c_t),\quad o_t=E(a_t),\quad s_{t+1}=H(s_t,a_t,o_t),$$

repeated while $\neg done(s_t)$ and $t<T_{max}$. The model distribution $\pi_\theta$ proposes; environment function $E$ causes the effect; harness transition $H$ owns orchestration.`,
    mechanism: 'The loop has two kinds of uncertainty: probabilistic proposals and external outcomes. Tool errors should return observations that can support retry, replanning, or stopping. Turn limits, timeouts, cancellation, idempotency, and explicit terminal states prevent an apparently sensible loop from running forever or repeating side effects.',
    exercise: 'Classify every trace event by owner: model, harness, tool, environment, or user. Inject one recoverable tool failure and one terminal policy failure. Verify which becomes a new observation and which ends the run. A good trace records proposals and outcomes without exposing private chain-of-thought.',
    debrief: 'A fluent final message is not evidence that an action succeeded. Outcome verification must inspect the environment or a trusted tool response. ReAct demonstrates the value of interleaving reasoning and action, but production systems still need deterministic execution boundaries and explicit observability.',
    diagram: `flowchart LR
  C["Assemble context"] --> M["Model proposal"]
  M --> V["Validate / authorize"]
  V --> T["Execute tool"]
  T --> O["Record observation"]
  O --> D{"Done?"}
  D -->|"no"| C
  D -->|"yes"| R["Final result"]`,
    sources: [
      { label: 'Yao et al. — ReAct: Synergizing Reasoning and Acting (2022)', url: 'https://arxiv.org/abs/2210.03629' },
      { label: 'Schick et al. — Toolformer (2023)', url: 'https://arxiv.org/abs/2302.04761' },
    ],
  },
  {
    labId: 'subagents',
    premise: 'A subagent is a separately prompted worker with its own working context, tool access, and termination boundary. The parent delegates a bounded task and receives a result or summary rather than every intermediate token. This can keep noisy investigation out of the main thread and reduce elapsed time when tasks are independent, but it does not automatically isolate files or other shared external state.',
    mathematics: String.raw`For task durations $T_1,\ldots,T_n$, ideal sequential and parallel elapsed time are

$$T_{seq}=\sum_{i=1}^{n}T_i,\qquad T_{par}\ge\max_i T_i+T_{coord}.$$

Total inference work does not disappear: $C_{total}=\sum_i C_i+C_{parent}$. If two workers write resource $r$, safe integration also requires an ordering or merge relation rather than assuming $W_i(r)\parallel W_j(r)$ commutes.`,
    mechanism: 'Good delegation begins with a deliverable, required inputs, allowed tools, writable scope, and return format. A child should receive the smallest sufficient context. Parallel execution helps only when dependencies are weak. Worktrees or separate workspaces isolate filesystem writes, while services, credentials, and databases may still be shared. The parent remains accountable for synthesis, verification, and the final stop condition.',
    exercise: 'Compare three bounded tasks with two overlapping edits. Run each set sequentially and in parallel, then enable isolated worktrees. Record elapsed time, total child tokens, parent-context size, conflicts, and merge work. Explain why a worktree converts an immediate write collision into a later integration decision rather than eliminating coordination.',
    debrief: 'Subagents are a context and orchestration primitive, not a guarantee of better reasoning. Use them for independent research, review, or implementation slices with observable outputs. Keep globally coupled decisions and final integration with one accountable parent.',
    diagram: `flowchart TD
  P["Parent: decompose goal"] --> A["Child A: research"]
  P --> B["Child B: implement"]
  P --> C["Child C: verify"]
  A --> S["Parent: synthesize evidence"]
  B --> S
  C --> S
  S --> V["Verify shared environment"]`,
    sources: [
      { label: 'Codex — Subagents', url: 'https://learn.chatgpt.com/docs/agent-configuration/subagents' },
      { label: 'Claude Code — Create custom subagents', url: 'https://code.claude.com/docs/en/sub-agents' },
      { label: 'Claude Code — Worktrees', url: 'https://code.claude.com/docs/en/worktrees' },
    ],
  },
  {
    labId: 'context-harness',
    premise: 'The model sees only the serialized context of the current inference call. Repositories, browser state, databases, tool registries, and earlier sessions remain external until the harness selects and encodes them. Context engineering is therefore a constrained information-selection problem: preserve instructions and evidence that affect the next decision while avoiding noise and exceeding the token budget.',
    mathematics: String.raw`Let segment $i$ have token cost $c_i$ and estimated utility $u_i$. A simplified selection problem is

$$\max_{x_i\in\{0,1\}}\sum_i u_ix_i\quad\text{subject to}\quad\sum_i c_ix_i\le B.$$

Real harnesses add precedence constraints: required instructions must be included, tool results may depend on earlier calls, and summaries have lossy fidelity $f_i<1$.`,
    mechanism: 'Collection finds candidate context; prioritization applies instruction hierarchy and task relevance; compaction replaces detail with a lossy summary; serialization fixes roles and order. Prompt caching reuses computation for an identical prefix but does not persist knowledge. Editing early instructions, changing model or tool definitions, and compaction can force cache rebuilding. Saved sessions and external files can outlive that short inference cache.',
    exercise: 'Assign a token cost and reason for inclusion to every segment. Reduce the budget and defend what survives. Then compare a continued turn, edited instructions, a new MCP server, a model switch, compaction, and session resume. For each operation identify the visible context, cached prefix, summary, and external state.',
    debrief: 'More context is not monotonically better, and a cache hit says nothing about semantic relevance. A robust harness records provenance, makes compaction visible, retrieves original evidence on demand, and treats context, caching, sessions, memory, and storage as distinct lifecycles.',
    diagram: `flowchart LR
  S["Instructions"] --> C["Candidate context"]
  H["History / state"] --> C
  T["Tool schemas / results"] --> C
  C --> P["Prioritize"] --> K["Compact"] --> M["Serialize model call"]`,
    sources: [
      { label: 'Model Context Protocol — specification overview', url: 'https://modelcontextprotocol.io/specification/2025-03-26/index' },
      { label: 'OpenAI — Unrolling the Codex agent loop', url: 'https://openai.com/index/unrolling-the-codex-agent-loop/' },
      { label: 'Claude Code — Prompt caching', url: 'https://code.claude.com/docs/en/prompt-caching' },
    ],
  },
  {
    labId: 'memory-instructions',
    premise: 'Agent “memory” is not one mechanism. Active messages provide temporary working context; project instruction files provide explicit versionable policy; auto memory stores learned cross-session context; skills package reusable workflows; external stores retain exact evidence; secret managers protect credentials. Correct placement depends on lifetime, authority, fidelity, provenance, and sensitivity.',
    mathematics: String.raw`Represent an information item by requirements

$$q=(L,A,F,P,S),$$

for lifetime, authority, fidelity, provenance, and sensitivity. A storage mechanism $m$ is suitable only when its guarantees $g(m)$ satisfy the required dimensions: $g(m)\succeq q$. A lossy summary with fidelity $f<1$ cannot be the sole source for evidence requiring $F=1$.`,
    mechanism: 'Codex loads repository guidance from AGENTS.md and can use local generated memories and skills. Claude Code loads hierarchical CLAUDE.md instructions and maintains project-local auto memory. Both patterns separate explicit instructions from learned context. Mandatory behavior should be stated in inspectable instructions and enforced through code when necessary. Secrets should be resolved at tool-execution time and never promoted into prompt-visible memory.',
    exercise: 'Place a current failure, a team testing rule, a user preference, a release procedure, an exact audit log, and an API token. For each choice, name its owner, lifetime, edit path, loading time, and failure mode. Add a deterministic enforcement mechanism for the testing rule without moving the rule into an opaque store.',
    debrief: 'Memory improves continuity but can become stale or wrong. Instructions are clearer but still influence rather than enforce. Skills reduce context by loading workflows on demand. External state preserves exact sources. The best architecture deliberately combines these mechanisms rather than asking one memory feature to serve every role.',
    diagram: `flowchart LR
  F["Information item"] --> Q{"What guarantee is required?"}
  Q -->|"temporary"| C["Current context"]
  Q -->|"required rule"| I["Project instructions"]
  Q -->|"learned preference"| M["Inspectable memory"]
  Q -->|"workflow"| S["Skill"]
  Q -->|"exact evidence"| E["External state"]
  Q -->|"credential"| K["Secret manager"]`,
    sources: [
      { label: 'Codex — Customization overview', url: 'https://learn.chatgpt.com/docs/customization/overview' },
      { label: 'Codex — Memories', url: 'https://learn.chatgpt.com/docs/customization/memories' },
      { label: 'Claude Code — How Claude remembers your project', url: 'https://code.claude.com/docs/en/memory' },
    ],
  },
  {
    labId: 'hooks-lifecycle',
    premise: 'A hook is deterministic automation attached to a named agent lifecycle event. It can inspect structured event data and log, block, transform, validate, or inject information. Timing is central: a pre-tool hook can prevent an effect, while a post-tool hook can only respond after execution. Hooks complement but do not replace authorization or operating-system isolation.',
    mathematics: String.raw`Let event $e_t$ expose payload $p_t$. A hook is a transition

$$h_e:p_t\mapsto(d_t,\Delta_t),$$

where decision $d_t\in\{allow,deny,feedback\}$ controls continuation and $\Delta_t$ records or modifies harness state. Prevention requires the hook to run before the protected transition: $time(h_e)<time(effect)$.`,
    mechanism: 'Choose the earliest event that has all required evidence. Prompt-submission hooks can scan user input; pre-tool hooks can inspect and block a proposed call; post-tool hooks can format or audit actual outputs; post-compaction hooks can restore external guidance; stop hooks can require verification. Hook results and failures should be observable, bounded by timeouts, and designed to fail safely.',
    exercise: 'Place four rules on a lifecycle timeline: protect an environment file, format a changed source file, restore a checklist after compaction, and prevent stopping when tests fail. For each rule identify the event payload, decision, possible side effect, timeout behavior, and independent permission or sandbox boundary.',
    debrief: 'Hooks make selected behavior repeatable and inspectable, but coverage is defined by the harness. A command executed outside the covered event path, a misconfigured matcher, or a failing hook can bypass the intended control. Defense in depth combines instructions, hooks, permissions, sandboxes, and outcome verification.',
    diagram: `flowchart LR
  U["UserPromptSubmit"] --> M["Model proposal"]
  M --> P["PreToolUse"] --> T["Tool effect"] --> O["PostToolUse"]
  O --> C["Pre / PostCompact"] --> S["Stop"]`,
    sources: [
      { label: 'Codex — Hooks', url: 'https://learn.chatgpt.com/docs/hooks' },
      { label: 'Claude Code — Hooks reference', url: 'https://code.claude.com/docs/en/hooks' },
      { label: 'Claude Code — Automate workflows with hooks', url: 'https://code.claude.com/docs/en/hooks-guide' },
    ],
  },
  {
    labId: 'tool-boundaries',
    premise: 'A tool call is untrusted structured model output until deterministic code accepts it. Schema validation establishes shape, authentication establishes identity, authorization establishes permitted scope, approval establishes user intent for sensitive operations, and sandboxing limits blast radius. These controls belong outside the prompt because prompts influence behavior but do not enforce capability boundaries.',
    mathematics: String.raw`Treat execution as a conjunction of predicates:

$$execute(call)\iff valid(call)\land authenticated(u)\land authorized(u,call)\land approved(call)\land withinLimits(call).$$

If any predicate is false, fail closed before the side effect. For risk $R=P(incident)\times impact$, higher-impact actions should require stronger isolation, narrower scopes, and more explicit approval.`,
    mechanism: 'Validation should happen before execution and error messages should be safe to return as observations. Least privilege constrains which resources and actions are available. Timeouts, rate limits, output sanitization, audit logs, and postcondition checks cover failure modes that schemas alone cannot. Destructive operations should be reversible or staged whenever practical.',
    exercise: 'Gate a read, a normal write, and a destructive proposal. Include malformed arguments so participants see schema rejection before policy. For an approved simulated write, verify the postcondition in the environment. The model saying “done” is not the check; the observed state transition is.',
    debrief: 'No single guardrail is sufficient. OWASP calls out excessive agency when excessive functionality, permissions, or autonomy turns unexpected model output into harm. Reliable systems combine deterministic authorization, isolation, approval, observability, and interruption rather than asking a system prompt to carry all responsibility.',
    diagram: `flowchart LR
  P["Model proposal"] --> S{"Schema valid?"}
  S -->|"no"| R["Reject"]
  S -->|"yes"| A{"Authorized?"}
  A -->|"no"| R
  A -->|"sensitive"| H["Human approval"]
  A -->|"yes"| E["Bounded execution"]
  H --> E
  E --> O["Audit + outcome check"]`,
    sources: [
      { label: 'MCP — Tools security considerations', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/tools' },
      { label: 'OWASP — LLM06:2025 Excessive Agency', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM06_ExcessiveAgency.html' },
    ],
  },
  {
    labId: 'agent-evals',
    premise: 'An agent evaluation is a reproducible experiment over tasks, trials, traces, outcomes, and graders. A task specifies the initial state and success criteria; a trial is one nondeterministic attempt; a trace records observable interactions; the outcome is the terminal environment state; graders map evidence to scores. Keeping these objects separate prevents a fluent transcript or one lucky run from being mistaken for reliability.',
    mathematics: String.raw`Let a task have per-trial success probability $p$. For $k$ independent attempts,

$$pass@k = 1-(1-p)^k$$

is the probability that at least one attempt succeeds, while

$$pass^k=p^k$$

is the probability that every attempt succeeds. At $p=0.75$ and $k=3$, these are approximately $0.984$ and $0.422$. The first measures the chance of finding a solution; the second exposes repeatability. Real estimates also need uncertainty intervals and sufficiently representative tasks.`,
    mechanism: 'Start with unambiguous tasks and trusted terminal predicates. Run multiple trials because agent decisions and external observations vary. Use deterministic graders for exact state and policy checks, model graders for scalable subjective rubrics, and sampled human review to calibrate the rubric and discover invalid tasks. Record cost, latency, tool calls, and trace structure alongside outcome quality. Capability suites should expose unsolved behavior; regression suites should protect behavior that already works nearly all the time.',
    exercise: 'Run the same 20 seeded tasks with a focused prompt and a critique-loop prompt. Compare mean response quality, pass@1, pass@3, pass^3, p95 latency, and cost. Then degrade the tool descriptions and open one failed trial. Decide whether the failure belongs to the task specification, model proposal, tool interface, environment, or grader. A metric change is not an improvement until the affected product requirement is named.',
    debrief: 'Evaluation is itself a software system and can fail through ambiguous tasks, broken fixtures, biased graders, hidden harness constraints, or an unrepresentative dataset. Read traces and verify reference solutions before trusting aggregate numbers. Production confidence combines pre-deployment evals with monitoring, user feedback, A/B tests, incident review, and continuing human calibration.',
    diagram: `flowchart LR
  T["Task + initial state"] --> R["Repeated trials"]
  R --> X["Observable traces"]
  R --> O["Terminal outcomes"]
  X --> G["Code / model / human graders"]
  O --> G
  G --> M["Metrics + failure taxonomy"]
  M --> D["Inspect and improve"]`,
    sources: [
      { label: 'Anthropic — Demystifying evals for AI agents', url: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents' },
      { label: 'OpenAI — Evaluating model performance', url: 'https://platform.openai.com/docs/guides/evals' },
      { label: 'OpenAI — Evals API reference', url: 'https://platform.openai.com/docs/api-reference/evals' },
    ],
  },
];

export const agentTrackTheory: TrackTheory[] = [
  {
    trackId: 'agency',
    premise: 'Agency comes from iteration over observations. The model supplies a policy over proposals; the harness turns selected proposals into bounded state transitions. Keeping those responsibilities separate makes failures diagnosable and effects governable.',
    mathematics: String.raw`At turn $t$, sample $a_t\sim\pi_\theta(\cdot\mid c_t)$, observe $o_t=E(a_t)$, then build $c_{t+1}=H(c_t,a_t,o_t)$ until an explicit terminal condition.`,
    diagram: `flowchart LR
  M["Model"] --> H["Harness"] --> E["Environment"] --> O["Observation"] --> M`,
    sources: [{ label: 'Yao et al. — ReAct', url: 'https://arxiv.org/abs/2210.03629' }],
  },
  {
    trackId: 'context',
    premise: 'Context is a finite, per-call working set assembled from external state. The harness owns selection, ordering, role labels, compaction, and retrieval. These choices determine the evidence available to the model and therefore shape every subsequent proposal.',
    mathematics: String.raw`Selection is budgeted: choose segments with total token cost $\sum_i c_ix_i\le B$, while treating required instructions and current task evidence as constraints rather than optional relevance scores.`,
    diagram: `flowchart LR
  E["External state"] --> S["Select"] --> C["Compact"] --> P["Prompt context"] --> M["Model"]`,
    sources: [{ label: 'Model Context Protocol — specification', url: 'https://modelcontextprotocol.io/specification/2025-03-26/index' }],
  },
  {
    trackId: 'safety',
    premise: 'Agent safety is capability engineering plus evidence. Prompts can reduce bad proposals, but schemas, identity, authorization, approval, and isolation determine whether proposals can become real effects. Repeated outcome evaluation then tests whether the bounded system is actually reliable.',
    mathematics: String.raw`Capability should be the intersection $C=F\cap P\cap A\cap S$: exposed functionality, granted permission, user approval, and sandbox limits. Reliability is estimated over repeated bounded trials, with $pass^k=p^k$ exposing the probability that all $k$ attempts succeed.`,
    diagram: `flowchart LR
  P["Proposal"] --> V["Validate"] --> A["Authorize"] --> X["Execute"] --> O["Verify outcome"] --> E["Repeat + evaluate"]`,
    sources: [{ label: 'MCP — Tools security considerations', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/tools' }, { label: 'OWASP — Excessive Agency', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM06_ExcessiveAgency.html' }, { label: 'Anthropic — Demystifying evals for AI agents', url: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents' }],
  },
];
