import type { CourseTheoryChapter } from '../../../course/content/theoryTypes';

export const SUBAGENTS_CHAPTER: CourseTheoryChapter = {
  question: 'How should a parent agent delegate work without losing control of scope, evidence, or consequences?',
  estimatedMinutes: 55,
  prerequisites: [
    'Recognize an agent task as a goal pursued through tools and intermediate observations.',
    'Distinguish a reversible read-only action from an external action with side effects.',
    'Understand that several agents may share files, credentials, rate limits, and external services.',
  ],
  objectives: [
    'Split a goal into bounded subagent deliverables while keeping final synthesis with the parent.',
    'Give each subagent the minimum sufficient context, tools, permissions, and writable scope.',
    'Choose sequential or parallel execution from actual task dependencies rather than agent availability.',
    'Explain the difference between file or worktree isolation and shared external state.',
    'Design timeouts, cancellation, retries, and result contracts that produce observable states.',
    'Detect conflicting outputs and verify claims before merging them into a final recommendation.',
    'Preserve the user’s authority boundary: researching laptops must never become purchasing one.',
  ],
  sections: [
    {
      id: 'subagents-parent-contract',
      eyebrow: 'Orientation',
      heading: 'Delegation expands execution, not authority',
      diagramIds: ['subagents-orchestration-tree'],
      body: String.raw`Imagine that a user asks for a laptop comparison report. The parent agent must identify suitable products, compare evidence, explain tradeoffs, and deliver a recommendation. It may delegate official-spec research, independent review research, and a skeptical audit to subagents. The parent still owns the user-facing synthesis.

The crucial boundary is that the user authorized **research and a report**, not a purchase. Delegation cannot enlarge that authority. No subagent may add a laptop to a cart, place an order, contact a seller, sign up for financing, or send a message “to check availability.” Those actions affect external state or other people. A parent prompt that merely says “find the best laptop” is therefore incomplete; it must state the prohibited actions explicitly when a toolset could perform them.

A subagent is useful when a task can be described as a bounded deliverable that another worker can complete with limited coordination. “Collect official specifications for these four models and return a source-backed comparison” is bounded. “Handle the laptop project” is not. The second instruction transfers ambiguity, encourages scope drift, and leaves no clear acceptance test.

The parent has four responsibilities that should never disappear behind parallel execution:

1. Define the decision and authority boundary.
2. Partition work according to dependencies and risk.
3. Inspect evidence and reconcile conflicts.
4. Produce the final answer at the user’s requested level.

Subagents provide observations and candidate artifacts. They do not vote the truth into existence. Three agents repeating the same unsupported specification do not create three independent sources, especially if all copied one retailer page. The parent must evaluate source independence and fitness for the claim.

The observable success condition is not “three agents ran.” It is a report whose important claims can be traced to evidence, whose criteria match the user’s needs, whose conflicts are surfaced, and whose production caused no unauthorized side effects.`,
    },
    {
      id: 'subagents-bounded-deliverables',
      eyebrow: 'Task design',
      heading: 'Delegate deliverables that can be accepted or rejected',
      body: String.raw`A good subtask describes an output rather than a vague activity. For the laptop report, useful deliverables could be:

- an official-specification table covering processor, memory options, display, ports, mass, warranty, and regional availability;
- a review evidence ledger covering measured battery life, sustained performance, fan noise, keyboard, repairability, and recurring complaints;
- a criteria audit that checks whether the draft recommendation actually satisfies budget, operating-system, portability, and workload constraints.

Each deliverable needs a completion rule. The specification agent might be required to cover all four candidates, leave unknown cells explicitly marked, attach one primary source per model, and avoid retailer marketing claims when a manufacturer source exists. The review agent might need two genuinely independent reviews per finalist and must separate instrumented measurements from reviewer impressions. The audit agent should receive the evidence after collection; launching it before a draft or evidence ledger exists creates an artificial dependency failure.

Boundaries also prevent duplicate work. If every agent independently chooses products, searches specifications, reads reviews, and writes a recommendation, parallelism produces three incompatible mini-reports. The parent then spends more time recovering provenance and merging formats than the delegation saved. Partition by evidence type, candidate subset, or verification role, and state which decisions remain centralized.

A bounded prompt names exclusions. “Do not broaden the list beyond these four models. Do not purchase, reserve, message, subscribe, or create accounts. Do not edit the final report. Return partial results rather than guessing.” Exclusions are especially important when a subagent has powerful browser or filesystem tools.

Acceptance tests should be visible before work begins. The parent can check completeness, source quality, dates, units, duplicate sources, and the absence of unauthorized actions. If there is no practical way to decide whether a result is acceptable, the subtask has not been decomposed far enough.`,
    },
    {
      id: 'subagents-minimal-context',
      eyebrow: 'Prompt contract',
      heading: 'Provide minimum sufficient context, not the entire conversation dump',
      body: String.raw`A subagent needs enough context to make local decisions consistently. For laptop research, minimum sufficient context includes the user’s workload, budget and currency, purchase region, portability limits, required software, candidate list, comparison date, source hierarchy, output format, and the prohibition on transactions. It also includes definitions that affect evidence: whether “battery life” means a review’s controlled browsing test or a manufacturer’s maximum claim, for example.

Too little context causes misalignment. An agent may recommend a model unavailable in the user’s region, compare pre-tax and post-tax prices, or optimize gaming performance for a software-development workload. Too much context creates a different problem: the decisive constraints disappear inside an unstructured transcript, private details are exposed unnecessarily, and the subagent may follow stale brainstorming rather than the final instruction.

A compact task packet should contain:

- task ID and one-sentence objective;
- exact input candidates or artifact locations;
- decision criteria relevant to this subtask;
- allowed and prohibited actions;
- allowed tools and writable paths;
- required source and freshness rules;
- result schema and deadline;
- known uncertainties and escalation conditions.

Do not assume that a subagent shares the parent’s unstated interpretation. “Find current price” needs a region, currency, tax convention, configuration, seller rule, and timestamp. “Check reviews” needs a definition of independent sources and which measurements matter. A task packet makes those assumptions inspectable.

Minimal context is also a privacy and security control. A specification lookup does not need the user’s home address, account session, email, or payment details. The parent should pass only what the deliverable requires. If an authenticated session is necessary for a read-only source, its use should be explicit and narrowly scoped; otherwise prefer public sources.

The test is counterfactual: could this subagent complete its result correctly if it saw nothing else? If not, add the missing decision input. Could sensitive or distracting content be removed without changing the result? If yes, remove it.`,
    },
    {
      id: 'subagents-tools-and-scope',
      eyebrow: 'Permissions',
      heading: 'Match tools and writable scope to the deliverable',
      diagramIds: ['subagents-isolation-boundaries'],
      body: String.raw`A research subagent usually needs search, page reading, and perhaps a dedicated scratch artifact. It does not need a purchasing connector, email sender, production deployment credential, or permission to edit the final report. Tool availability should follow least privilege: grant the capabilities required for the bounded output and omit the rest.

Filesystem scope deserves the same care. Assign each agent a separate result path, such as one research packet per task ID. If two agents write the same Markdown table, last-writer-wins behavior can silently erase evidence. A shared read-only input and exclusive writable outputs are easier to reason about. The parent merges accepted outputs later.

Git worktrees or separate branches can isolate tracked-file edits. They prevent two coding agents from modifying the same working file in one checkout and give each task a reviewable diff. They do **not** isolate every effect. Agents may still share network credentials, browser sessions, package registries, API quotas, cloud projects, caches, databases, queues, and other services. Two separate worktrees can still send duplicate emails or place duplicate orders through the same account.

External state must therefore be managed independently of file isolation. For the laptop scenario, all external interactions remain read-only. If a later authorized workflow genuinely requires an external mutation, the parent should define one owner, an idempotency key where supported, a confirmation gate, and a recorded result. Parallel agents should not race to perform the same side effect.

Tool results also need provenance. A copied product card should record its URL, access date, region, configuration, and whether the value came from manufacturer documentation, a retailer, or a review. Screenshots can support visual claims but should not replace machine-readable values when the page exposes them. Credentials and session tokens must never be copied into the research artifact.

Permission is not only a safety topic; it improves debugging. When a specification agent cannot edit synthesis files or purchase products, an unexpected report change or transaction has a smaller possible cause set. Clear capability boundaries make behavior attributable.`,
    },
    {
      id: 'subagents-sequential-parallel',
      eyebrow: 'Scheduling',
      heading: 'Parallel work reduces elapsed time only when dependencies permit it',
      diagramIds: ['subagents-dependency-graph'],
      body: String.raw`The number of available agents is not a reason to run every task at once. Start from dependencies. Official specifications and independent review collection can run in parallel after the parent freezes the candidate list and criteria. A conflict audit depends on those evidence packets. Final synthesis depends on the audit and verified evidence. Those dependent stages remain sequential.

Consider three independent research tasks estimated at 12, 15, and 10 minutes. Sequential execution takes about 37 minutes of elapsed time. If resources allow all three to run concurrently, the research wave may finish in roughly the longest task’s 15 minutes plus startup and coordination overhead. Total work has not fallen: the system still performs about 37 task-minutes, and it may perform more because packaging, merging, and duplicated source access add overhead.

Parallelism can therefore improve responsiveness while increasing compute, API calls, and cost. It can also trigger rate limits or make evidence noisier when several agents query the same service. Set a concurrency limit according to tool quotas, source politeness, and the parent’s ability to review incoming results—not merely the platform maximum.

Run tasks sequentially when one output defines another task’s input, when agents would contend for the same writable state, when a risky action needs one owner, or when an early result may make later work unnecessary. Run them in parallel when inputs are frozen, deliverables are independent, outputs have isolated destinations, and conflicts can be reconciled cheaply.

The parent should write a small dependency graph before spawning. Nodes are deliverables; arrows mean “must be accepted before this begins.” This exposes false parallelism. For example, asking an audit agent to verify the “recommended laptop” before the synthesis agent chooses one yields either idle waiting or invented assumptions.

Measure both elapsed time and total work in the lab. A faster wall clock can be a real user benefit, while a larger total workload can still be the wrong tradeoff for a small task. The objective is effective coordination, not maximum simultaneous activity.`,
    },
    {
      id: 'subagents-result-contract',
      eyebrow: 'Interface',
      heading: 'A result contract turns prose from another agent into inspectable evidence',
      body: String.raw`Every subagent should return a predictable envelope even if its substantive artifact is Markdown. A practical result contract contains:

- task ID and terminal status: completed, partial, blocked, cancelled, or failed;
- a concise deliverable summary;
- structured claims with source, access date, product configuration, and evidence type;
- unknowns, contradictions, and assumptions;
- files created or modified;
- tools used and any externally visible effects;
- checks performed;
- a statement that prohibited actions, including purchase, were not taken.

Status must describe evidence, not optimism. “Completed” means the acceptance conditions were met. “Partial” means usable evidence exists but named fields are missing. “Blocked” names the unmet dependency or inaccessible source. “Cancelled” says what work stopped and whether any prior effects remain. A result that says only “done” forces the parent to reconstruct all of this.

Claims should be atomic. “Laptop A is best and lasts 18 hours” mixes a judgment with a measurement. Instead record that the manufacturer lists one battery claim, a reviewer measured another result under a named test, and the recommendation criterion weights endurance in a particular way. Atomic claims are easier to compare and invalidate.

Provenance should distinguish primary specifications, measured review data, subjective reviewer impressions, retailer availability, and parent inference. A parent may infer that a 1.2-kilogram laptop better satisfies a stated portability cap than a 1.8-kilogram one, but it should not attribute that comparison to the source that merely supplied masses.

Contracts also make retries safer. A replacement agent can see which candidates are covered and which source failed, rather than repeating all work. The parent can reject one unsupported row without discarding the complete artifact. Structured evidence remains inspectable even when the prose summary is polished.

The contract is not bureaucracy for its own sake. It is the API between agents. Without a stable interface, coordination depends on each agent guessing what the next one needs.`,
    },
    {
      id: 'subagents-lifecycle',
      eyebrow: 'Operations',
      heading: 'Timeout, cancellation, and retry need observable terminal states',
      diagramIds: ['subagents-lifecycle'],
      body: String.raw`A parent should know whether every delegated task is queued, running, awaiting a tool, completed, partial, blocked, cancelled, or failed. Silent disappearance is not a workflow. Record task IDs, start times, deadlines, and result locations so the parent can reconcile late responses.

A timeout bounds waiting; it does not prove that remote work stopped. A browser request, API job, or external message may already have been accepted. Cancellation is a request to stop future work, not a time machine that reverses completed side effects. This is another reason the laptop tasks remain read-only. If cancellation occurs after sources were read and a scratch file was written, the result should report that state rather than pretend nothing happened.

Choose timeouts from the deliverable and source behavior. A short lookup can have a short deadline; a multi-source review packet needs longer. On timeout, the parent can request a partial result, retry a narrow missing portion, or continue without it. Repeatedly restarting the full task wastes work and may repeat external calls.

Retries should be selective and, for mutations, idempotent. A failed read-only page fetch is usually safe to repeat. A purchase is not—and remains unauthorized in this scenario. Even when an external action is authorized elsewhere, use a unique operation key and verify prior state before retrying. Never interpret a network timeout as proof that the action failed.

Cancellation should propagate down the task tree. If the user changes the budget and eliminates two laptop candidates, the parent can cancel research devoted only to those models while preserving relevant tasks. Agents should check for cancellation at tool boundaries and before expensive phases. The parent should still collect terminal acknowledgements or mark unresponsive tasks explicitly.

Good lifecycle handling is visible in the final evidence: which tasks finished, which were cancelled, what incomplete fields remain, and whether those gaps affect the recommendation. The user should not need to know every scheduling detail, but the parent must understand them before claiming comprehensive research.`,
    },
    {
      id: 'subagents-conflicts-and-merge',
      eyebrow: 'Integration',
      heading: 'Merge evidence deliberately; never resolve disagreement by overwriting it',
      body: String.raw`Conflicts occur at two levels. File conflicts happen when agents edit overlapping artifacts. Evidence conflicts happen when sources report different facts. Separate writable paths or worktrees reduce file collisions, but only an explicit reconciliation process resolves evidence disagreements.

Suppose the manufacturer lists “up to 18 hours,” while two reviewers measure 11 and 13 hours. These are not necessarily mutually exclusive: test conditions, brightness, workload, operating-system version, and unit configuration may differ. The parent should retain all three claims with their methods, then describe what each supports. Replacing the review values with the manufacturer figure because it appears in an “official” packet would lose relevant evidence.

For source conflicts, compare exact model configuration, publication and access dates, region, units, measurement method, firmware, and source independence. Prefer primary sources for declared specifications, but prefer transparent independent measurement for observed performance. Mark unresolved discrepancies rather than averaging incomparable values.

For file conflicts, inspect diffs and merge semantically. If two agents changed the same table schema, first decide the canonical schema, then migrate accepted rows. Do not use last-writer-wins or an automatic text merge as an editorial judgment. Preserve the original research packets as provenance even after creating a consolidated report.

The parent also removes duplicate citations. Two articles may repeat the same press release or benchmark database, making them one evidence lineage rather than independent confirmation. Source diversity is about independent observation, not domain count.

Integration ends with a claim ledger mapping every recommendation statement to accepted evidence or an explicitly labelled parent inference. A report can then distinguish “we measured,” “the manufacturer states,” “reviewers observed,” and “given your criteria, I infer.” This language is more useful than a falsely uniform voice because it reveals evidence strength.`,
    },
    {
      id: 'subagents-parent-verification',
      eyebrow: 'Quality gate',
      heading: 'The parent verifies the result, not merely the subagent’s confidence',
      body: String.raw`A confident subagent summary is not an acceptance test. The parent should sample source links, verify decisive numbers, check that configurations match, inspect calculations, and confirm that prohibited actions were not taken. High-impact claims—price, compatibility, warranty, availability, and recommendation-changing benchmarks—deserve direct verification.

Verification is risk-weighted. The parent need not reread every paragraph when a structured packet exposes evidence clearly, but it should verify enough to detect systematic errors. If one sampled manufacturer link refers to a different screen size, expand the audit because the task’s configuration discipline is in doubt. If arithmetic totals do not reproduce, recalculate the affected comparison.

The parent should also test completeness against the original decision. A beautiful benchmark table is insufficient if the user required Linux compatibility and no agent checked it. A popular recommendation is insufficient if current regional pricing exceeds budget. Verification includes constraints and omissions, not only factual correctness.

Before delivery, ask:

- Are candidate names and configurations exact?
- Are time-sensitive prices and availability dated?
- Are measured results separated from marketing claims?
- Are conflicts and missing evidence visible?
- Do scoring rules reflect the user’s criteria?
- Did all tasks remain read-only and avoid purchases or messages?
- Can every decisive sentence be traced to a source or labelled inference?

If a subagent result fails, the parent can narrow a correction request instead of accepting or discarding everything. “Recheck mass and battery for the 14-inch configuration using primary specifications; return only corrected ledger rows” is safer than “redo the report.”

The parent owns the synthesis because only the parent has the complete decision context and responsibility to the user. Delegation can widen evidence collection and add adversarial review. It does not transfer accountability.`,
    },
    {
      id: 'subagents-lab-summary',
      eyebrow: 'Synthesis',
      heading: 'Run the lab as a controlled orchestration experiment',
      body: String.raw`In the lab, begin with the laptop-report goal and create three task cards. One collects official specifications, one collects independent reviews, and one audits a draft after the first two finish. For each card, fill in deliverable, inputs, minimal context, allowed tools, writable path, timeout, result schema, and prohibited actions. The purchase prohibition belongs on every task that could reach an external shopping surface.

Before launching, draw dependencies and predict elapsed time, total work, and likely conflicts. Run the independent research tasks in parallel. Observe their states and artifacts. Do not start the audit until the prerequisite evidence exists. Inject one controlled failure, such as a timed-out review source or conflicting mass values, and practice requesting a partial result and a narrow retry.

Merge only through the parent workspace. Preserve raw packets, label provenance, and build a claim ledger. Then verify at least one decisive claim from each packet and all recommendation-changing constraints. The final report should state unresolved uncertainty rather than convert missing evidence into certainty.

The observable orchestration contract is:

1. Parent fixes scope and authority.
2. Independent agents produce bounded, isolated evidence packets.
3. Dependent review starts only after inputs are accepted.
4. Cancellation and timeout produce explicit terminal states.
5. Parent reconciles conflicts and verifies decisive claims.
6. Parent synthesizes a report; nobody purchases a laptop.

The last point is intentionally repetitive. A goal’s terminal verb controls authority. “Research,” “recommend,” and “draft” authorize informational artifacts. “Buy,” “send,” and “publish” authorize external changes only when explicitly requested and safely specified. Spawning another agent never changes the verb.

The next orchestration lesson can build on this contract by examining broader planning, tool selection, or recovery. The durable idea is that delegation is an interface-design problem: bounded inputs, bounded capabilities, observable states, structured outputs, and a responsible integrator. More agents help only when those interfaces make their work composable.`,
    },
  ],
  diagrams: [
    {
      id: 'subagents-orchestration-tree',
      title: 'The parent owns synthesis and the authority boundary',
      caption: 'Independent researchers return evidence to the parent; no branch is permitted to purchase or contact a seller.',
      alt: 'Parent laptop-report agent delegates official specifications, independent reviews, and later audit work, then performs verification and synthesis while a purchase path is blocked.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart TB
  P[Parent: laptop report] --> S[Official-spec research]
  P --> R[Independent-review research]
  S --> A[Criteria and conflict audit]
  R --> A
  A --> V[Parent verification]
  V --> F[Final report]
  P -. prohibited .-> X[Purchase or seller message]
  style X fill:#fee2e2,stroke:#dc2626,stroke-width:2px`,
    },
    {
      id: 'subagents-isolation-boundaries',
      title: 'File isolation does not isolate shared external state',
      caption: 'Separate worktrees and output paths reduce file conflicts, while credentials, APIs, quotas, and accounts still require their own coordination.',
      alt: 'Two agents have separate worktrees and result files but both connect to shared browser sessions, credentials, API quota, and external accounts.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart TB
  A1[Agent 1] --> W1[Worktree and result path 1]
  A2[Agent 2] --> W2[Worktree and result path 2]
  A1 --> E[Shared external state]
  A2 --> E
  E --> C[Credentials and browser sessions]
  E --> Q[API quotas and rate limits]
  E --> S[Accounts databases and queues]`,
    },
    {
      id: 'subagents-dependency-graph',
      title: 'Parallelize independent evidence, sequence dependent judgment',
      caption: 'Criteria must be fixed first; evidence collection can overlap; audit and synthesis depend on accepted inputs.',
      alt: 'Dependency graph from frozen criteria to two parallel research tasks, then to conflict audit, verification, and final synthesis.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  C[Freeze criteria and candidates] --> S[Specifications]
  C --> R[Reviews]
  S --> A[Conflict audit]
  R --> A
  A --> V[Parent verification]
  V --> F[Final synthesis]`,
    },
    {
      id: 'subagents-lifecycle',
      title: 'Every delegated task needs an observable terminal state',
      caption: 'Timeout and cancellation lead to explicit partial or cancelled results; they do not imply that prior effects vanished.',
      alt: 'Task lifecycle from queued to running and then completed, partial, blocked, failed, or cancelled, with timeout requesting a partial result or narrow retry.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: String.raw`stateDiagram-v2
  [*] --> Queued
  Queued --> Running
  Running --> Completed
  Running --> Partial: timeout or missing source
  Running --> Blocked: unmet dependency
  Running --> Failed: terminal error
  Running --> Cancelled: stop acknowledged
  Partial --> Running: narrow retry
  Completed --> [*]
  Blocked --> [*]
  Failed --> [*]
  Cancelled --> [*]`,
    },
  ],
  misconceptions: [
    {
      claim: 'A subagent inherits permission to do anything that might help the parent’s goal.',
      whyPlausible: 'Delegation sounds like transferring ownership of a problem.',
      correction: 'A subagent receives only the parent’s existing authority and the narrower task contract. Research does not authorize purchases or messages.',
      diagnostic: 'Which user instruction would authorize placing the laptop order?',
    },
    {
      claim: 'More parallel agents always finish a task faster and cheaper.',
      whyPlausible: 'Independent work can reduce wall-clock waiting.',
      correction: 'Parallelism may reduce elapsed time but preserves or increases total work, coordination, API calls, and conflict risk. Dependencies cannot be parallelized safely.',
      diagnostic: 'Can the audit verify a recommendation before evidence and a draft exist?',
    },
    {
      claim: 'Separate Git worktrees isolate all side effects.',
      whyPlausible: 'Each agent sees a separate branch and working directory.',
      correction: 'Worktrees isolate tracked file edits, not shared credentials, browser sessions, APIs, accounts, databases, or rate limits.',
      diagnostic: 'Could two worktree-isolated agents still send duplicate external requests through one account?',
    },
    {
      claim: 'Cancelling an agent reverses whatever it already did.',
      whyPlausible: 'Cancellation feels like undoing a running operation.',
      correction: 'Cancellation asks future work to stop. Completed writes or external actions need separate verification and compensating operations if recovery is possible.',
      diagnostic: 'Does closing a timed-out browser request prove that a server rejected the request?',
    },
    {
      claim: 'Three agents agreeing makes a claim verified.',
      whyPlausible: 'Agreement resembles independent replication.',
      correction: 'Agents may share one upstream source or repeat the same error. Verification requires source lineage, direct evidence, and claim-specific checks.',
      diagnostic: 'Are three retailer articles copying one manufacturer release independent measurements?',
    },
    {
      claim: 'The parent can paste subagent reports together and call that synthesis.',
      whyPlausible: 'Each report may already be polished and internally coherent.',
      correction: 'The parent must reconcile configurations, units, dates, source types, criteria, duplicates, and contradictions before making a recommendation.',
      diagnostic: 'Who decides whether manufacturer battery claims and review measurements answer the same question?',
    },
  ],
  exercises: [
    {
      id: 'subagents-decompose',
      kind: 'transfer',
      prompt: 'Turn “find me the best laptop” into three bounded subagent deliverables while preserving final synthesis with the parent.',
      answer: 'One agent can return an official-spec ledger for a frozen candidate list, one an independent-review measurement ledger, and one a later criteria/conflict audit over accepted packets. Each has a schema, source rules, timeout, and separate output. The parent verifies and writes the recommendation.',
    },
    {
      id: 'subagents-minimal-context',
      kind: 'debug',
      prompt: 'A price researcher receives only “check current prices for these laptops.” Identify at least four missing context fields.',
      answer: 'It needs region, currency, tax convention, exact configurations, approved seller types, freshness timestamp, and whether discounts requiring membership count. Any four expose why “current price” is under-specified.',
    },
    {
      id: 'subagents-parallel-time',
      kind: 'calculate',
      prompt: 'Independent tasks need 12, 15, and 10 minutes. Compare ideal sequential and parallel elapsed time, and state what does not decrease.',
      answer: 'Sequential elapsed time is about 37 minutes. Ideal parallel elapsed time is about 15 minutes plus orchestration overhead. Total task work remains about 37 task-minutes and may increase with packaging, duplicate access, and merging.',
    },
    {
      id: 'subagents-dependency-debug',
      kind: 'debug',
      prompt: 'The parent launches specification research, review research, and final recommendation writing simultaneously. What is wrong with the schedule?',
      answer: 'Recommendation writing depends on accepted evidence and conflict resolution. Only independent evidence collection should begin together. Synthesis must wait or it will guess criteria, duplicate research, or become stale when packets arrive.',
    },
    {
      id: 'subagents-worktree-risk',
      kind: 'predict',
      prompt: 'Two agents use separate worktrees but the same authenticated retailer account. What conflict remains possible?',
      answer: 'They can still mutate the same cart, send duplicate messages, consume shared quota, or trigger account protections. Worktree isolation protects file edits only. In this scenario all retailer actions must remain read-only and purchases are prohibited.',
    },
    {
      id: 'subagents-timeout',
      kind: 'trace',
      prompt: 'A review task times out after collecting two of three required sources. Describe the safe parent response.',
      answer: 'Request or preserve a partial result with covered sources and unknowns, mark the task partial, then retry only the missing source or continue with the stated limitation. Do not restart all research or infer that prior external requests never completed.',
    },
    {
      id: 'subagents-conflicting-battery',
      kind: 'transfer',
      prompt: 'A manufacturer claims 18 hours while reviews measure 11 and 13. How should the parent merge these values?',
      answer: 'Keep each atomic claim with configuration, method, and date. Label 18 hours as a manufacturer claim and 11 and 13 as measured review results. Investigate test differences and avoid averaging incomparable measurements or silently overwriting them.',
    },
    {
      id: 'subagents-verification',
      kind: 'trace',
      prompt: 'List the parent’s final checks before delivering the laptop report.',
      answer: 'Verify decisive specifications and prices, exact configurations, dates and regions, calculations, source independence, constraint coverage, unresolved conflicts, and recommendation logic. Confirm task artifacts report no purchases, reservations, messages, account creation, or other unauthorized effects.',
    },
  ],
  glossary: [
    { term: 'parent agent', definition: 'The coordinating agent that retains the complete user contract, verifies delegated work, and owns final synthesis.' },
    { term: 'subagent', definition: 'An agent assigned a bounded task with limited context, capabilities, and a defined result contract.' },
    { term: 'bounded deliverable', definition: 'An output with explicit inputs, exclusions, completion criteria, and an acceptance test.' },
    { term: 'minimum sufficient context', definition: 'The smallest task packet containing every fact needed for correct local decisions and omitting unrelated or sensitive material.' },
    { term: 'least privilege', definition: 'Granting only the tools, data, and writable scope required for the declared deliverable.' },
    { term: 'dependency', definition: 'A relationship in which one task needs another task’s accepted output before it can proceed correctly.' },
    { term: 'elapsed time', definition: 'Wall-clock duration from workflow start to finish, which parallelism may reduce.' },
    { term: 'total work', definition: 'The sum of effort across tasks, which parallelism does not inherently reduce.' },
    { term: 'worktree isolation', definition: 'Separation of tracked file changes into distinct Git working directories and branches.' },
    { term: 'external state', definition: 'Shared state outside isolated files, including accounts, APIs, browser sessions, databases, quotas, and other people.' },
    { term: 'result contract', definition: 'A stable schema reporting status, evidence, unknowns, files, checks, and effects from a delegated task.' },
    { term: 'claim ledger', definition: 'A mapping from atomic claims to sources, provenance type, dates, configurations, and verification state.' },
    { term: 'timeout', definition: 'A bound on waiting that does not itself prove remote work stopped or failed.' },
    { term: 'cancellation', definition: 'A request to stop future work, not an automatic reversal of completed effects.' },
    { term: 'idempotency key', definition: 'A unique operation identifier that helps an external service recognize retries as the same intended mutation.' },
  ],
};
