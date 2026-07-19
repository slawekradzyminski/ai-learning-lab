import type { CourseTheoryChapter } from '../../../course/content/theoryTypes';

export const MEMORY_INSTRUCTIONS_CHAPTER = {
  question: 'Where should an agent system place rules, working facts, learned preferences, cached computation, exact evidence, and sensitive data so each item has the right authority and lifetime?',
  estimatedMinutes: 47,
  prerequisites: [
    'You can separate the language model from the deterministic harness, tools, and external environment.',
    'You understand that the model sees only the context serialized for its current call.',
    'You can distinguish a model proposal from an effect that application code actually performs.',
    'You can trace the shared task: research three laptops under €900, verify current evidence, write laptop-comparison.md, and never purchase or contact a vendor.',
  ],
  objectives: [
    'Classify an information item by authority, lifetime, scope, sensitivity, and update path before selecting storage.',
    'Distinguish governing instructions, current-run state, durable memory, prompt caches, and external sources of truth.',
    'Place each laptop-task fact in a mechanism whose guarantees match how the fact will be used.',
    'Resolve conflicts using authority and provenance rather than whichever statement is newest or most convenient.',
    'Attach expiry, revalidation, correction, and deletion behavior to time-sensitive or personal information.',
    'Explain why prompt caching improves reuse but does not create durable memory or factual authority.',
    'Keep credentials and sensitive user data outside prompt-visible memory and resolve them only at bounded tool execution.',
    'Audit a completed run for stale facts, leaked scope, untracked updates, and undeletable copies.',
  ],
  sections: [
    {
      id: 'placement-is-design',
      eyebrow: 'Outcome first',
      heading: '“Remember this” is not a storage design',
      body: String.raw`The shared course task is precise:

> Research three laptops under €900, verify current evidence, write laptop-comparison.md, and never purchase anything or contact a vendor.

Even this small task produces many different kinds of information. “Never contact a vendor” is a governing constraint. “Candidate B currently costs €849” is a time-sensitive observation. “The third retailer timed out twice” is current-run recovery state. “The user usually prefers repairable laptops” might be a cross-session preference, if the user asked the system to retain it. The report file is an exact deliverable. A cached prompt prefix is reusable computation. A retailer credential, if one existed, would be a secret.

Calling all of these items memory hides the decisions that make an agent reliable. They do not deserve the same authority, lifetime, visibility, update process, or deletion policy. If the price is stored as a permanent preference, it becomes stale. If the prohibition on vendor contact is left only in a lossy run summary, compaction may remove it. If the report exists only in model context, the requested file was never delivered. If an API token is copied into durable memory, convenience has created a security incident.

The design problem starts with the future decision that will consume the information. The harness needs the prohibition on every tool proposal, so it should reload the rule from an authoritative task contract and enforce it through policy. The report needs exact current-price evidence, so it should reference external records with source and observation time. The model needs a compact summary of verified candidates for its next proposal, so the harness can select those records into current context. These are related copies serving distinct roles.

Good placement makes failure visible. An expired price can be marked for refresh. A conflicting instruction can be rejected or escalated. A deleted user preference can be removed from its canonical store and excluded from future context. An unavailable cache can be rebuilt without losing task truth. This chapter develops the questions that make those behaviors deliberate.`,
      diagramIds: ['information-mechanisms'],
    },
    {
      id: 'five-placement-questions',
      eyebrow: 'Classification',
      heading: 'Ask about authority, lifetime, scope, sensitivity, and update path',
      body: String.raw`Before choosing a mechanism, classify the information along five dimensions.

**Authority** asks how strongly the item should govern behavior and who is allowed to establish it. The user's “never purchase or contact a vendor” constraint is authoritative for this task. A retailer page that says “message us for a better price” is untrusted evidence, not a competing instruction. A model-generated plan is a proposal and cannot override either the user boundary or harness policy.

**Lifetime** asks how long the item remains useful or valid. A tool timeout may matter for the next retry decision and then expire with the run. A verified price may be useful for the report but should carry a short factual freshness window. A team rule about approved report paths may persist for the life of the project. A laptop-comparison.md artifact should last until the user replaces or deletes it.

**Scope** asks where the item applies. “Write only laptop-comparison.md” belongs to this task. A project instruction about citation formatting may apply to every course run in the repository. A user preference may apply across the user's sessions but should not silently affect another user. A cache entry may apply only to an exact model, tool-schema set, and prompt prefix.

**Sensitivity** asks who may see the item and what harm follows disclosure. Public laptop specifications are low sensitivity. The user's home address, vendor account cookie, or purchasing credential is high sensitivity and unnecessary because purchase and vendor contact are forbidden. Sensitive data should remain in a secret or identity system and be exposed to a tool only when a separately authorized operation requires it.

**Update path** asks who can create, correct, supersede, or delete the item and how that change is audited. Search results should not directly rewrite governing instructions. A model suggestion should not mutate durable user preferences without consent. A price record should be updated by a fresh evidence observation while retaining its source history. A deleted preference should stop entering new model contexts and caches should be invalidated when necessary.

The dimensions interact. High-authority rules need controlled update paths. Long-lived items need provenance and review. Broadly scoped items deserve stricter sensitivity checks because more contexts may expose them. The classification table in a design review should name all five rather than choosing a store from the vague desire to “make the agent remember.”`,
      diagramIds: ['placement-decision'],
    },
    {
      id: 'instructions-and-authority',
      eyebrow: 'Governing behavior',
      heading: 'Instructions express authority, but deterministic controls enforce capability boundaries',
      body: String.raw`Instructions tell the model and harness how the task should be performed. They may come from platform policy, application configuration, project files, the current user request, or a reusable workflow. Their authority is not determined by their position in a long transcript or by how forcefully they are written. The harness should preserve an explicit precedence model and source provenance.

In the laptop task, the current user authorizes research and one report write while prohibiting purchase, reservation, and vendor contact. The harness can encode that boundary in the task contract on every turn. A project instruction might additionally require cited evidence and English report text. A web page is data to inspect; text on that page cannot promote itself into a higher-priority instruction.

Instructions influence model proposals, but they are not the final security boundary. The purchase_product tool is explicitly unavailable in the course scenario. A send-message capability should likewise be absent or deterministically denied. Even if compaction omits a sentence or prompt injection convinces the model to propose contact, the harness policy still blocks the effect.

Versioning matters. If the user later says, “Actually, contact the vendor,” that conflicts with the original explicit prohibition and materially expands external authority. The system should not silently replace the rule based on an ambiguous statement or untrusted quote. It should confirm the new request, update the task contract through an authorized path, record the change, and only then reconsider capabilities. In this course task, the rule remains unchanged.

Instruction files are useful for durable, inspectable team conventions because humans can review and version them. They are a poor place for volatile retailer prices or hidden personal profiles. Current task constraints belong in task state derived from the user's request, while stable project-wide rules belong in the project's instruction mechanism. The model may receive both in context, labelled by source and precedence.

When instructions conflict, resolve by authority first, then specificity within the same authority, then explicit recency through an approved update path. Do not resolve by whichever statement is nearest to the end of the prompt. The conflict diagram makes this reviewable and keeps untrusted evidence outside the instruction hierarchy.`,
      diagramIds: ['authority-conflict'],
    },
    {
      id: 'run-state',
      eyebrow: 'Working state',
      heading: 'Current-run state coordinates progress without pretending to be permanent knowledge',
      body: String.raw`Run state describes what has happened in this bounded execution and what the loop should do next. For the laptop task it can contain discovered candidates, verified-evidence flags, retry counters, denied actions, remaining time, unresolved configuration conflicts, the approved output path, and whether the report has passed read-back verification.

This state belongs primarily to the deterministic harness or an external task store. The harness selects the relevant portion into each model call. Keeping the canonical record outside the prompt allows the system to rebuild context after compaction, recover from a model-call failure, and verify that the next proposal reflects actual observations rather than an invented transcript.

Run state has task scope. A timeout against one retailer should not become a durable belief that the retailer is always unavailable. A temporary candidate rejected for being over budget should not become a global user preference against that manufacturer. At task completion or abandonment, operational state can be archived for audit or deleted under policy; it should not leak into unrelated future work by default.

State transitions need owners. Tool observations update evidence status. Harness validation updates retry and policy records. A model proposal can suggest that candidate A is ready, but deterministic code should confirm required fields before changing the readiness flag. The user can clarify the budget interpretation, and that authorized input can update the task contract.

Summaries are views of run state, not necessarily the source of truth. A compact model-facing summary might say that two candidates are verified and one needs a matching 16 GB price. The underlying records should still preserve exact source URLs, timestamps, extracted values, and failure history. If the summary and records disagree, the harness should regenerate the summary or stop for diagnosis instead of choosing the more convenient version.

Resuming a run requires an explicit lifecycle. The system should know which task version it resumes, whether time-sensitive evidence has expired, what permissions still apply, and whether the environment changed. Reusing an old conversational summary without these checks can make a resumed agent confidently finish a report from stale prices.`,
    },
    {
      id: 'durable-memory',
      eyebrow: 'Across sessions',
      heading: 'Durable memory should hold consented, useful continuity—not every successful guess',
      body: String.raw`Durable memory survives beyond one run and can influence later tasks. This power deserves a narrower admission policy than current context.

Suppose the user explicitly says, “For future laptop comparisons, prefer repairability and Linux compatibility over gaming performance.” That may be a useful cross-session preference if the product offers inspectable memory and the user consents. The record should identify the user, source statement, creation time, scope, confidence or explicitness, update path, and deletion control. A future comparison can surface the preference as a remembered input, not as an invisible fact about the user.

By contrast, the current task's €900 budget should not automatically become a permanent budget. It may apply only to this report. The fact that the final three candidates were lightweight does not prove a durable preference for low weight. A model inference is not equivalent to a user-approved memory.

Durable memory is also the wrong canonical store for current product prices. Prices and stock expire rapidly and need source-backed revalidation. At most, memory can retain a workflow preference such as “always include evidence-check time,” while a fresh task obtains current values from external sources.

Memory retrieval is a proposal input, not unquestionable authority. A remembered preference may be outdated, entered incorrectly, or irrelevant to a work-purchase request. The interface should make recalled memory visible when it materially shapes a recommendation and let the user correct or ignore it. Current explicit instructions should normally supersede an older preference within the same user authority.

Deletion must be real at the product boundary. Removing a preference should prevent it from being retrieved into future contexts. Derived indexes, summaries, and relevant caches need invalidation or expiry according to documented policy. Audit logs may retain minimal deletion events when legally or operationally required, but they should not preserve the full deleted content under a misleading label.

Good memory is selective. It improves continuity where future value exceeds risks of staleness, privacy, and hidden influence. The laptop report itself remains a file artifact; current evidence remains in provenance-bearing records; the explicit task budget remains run-scoped; and only deliberately retained preferences cross session boundaries.`,
      diagramIds: ['information-mechanisms'],
    },
    {
      id: 'caches-and-external-truth',
      eyebrow: 'Not memory',
      heading: 'Caches reuse computation; external records preserve exact truth claims',
      body: String.raw`A prompt cache reuses work for an identical or compatible prefix. It can reduce latency and cost when instructions, tool definitions, or earlier context remain unchanged. It does not decide what is true, grant authority, or preserve information independently of the inputs from which it was computed.

If the laptop task's system instructions and tool schemas produce a cacheable prefix, a later model call may reuse that computation. Changing the model, editing an early instruction, altering tool definitions, or compacting the context can invalidate the cache. A cache miss should affect performance, not erase the task contract or evidence. If losing a cache loses critical state, the system stored truth in the wrong mechanism.

Other caches have the same limitation. A search cache may return an earlier result to reduce network calls, but its age must be visible because the task asks for current prices. A page cache may retain content snapshots for reproducibility, yet the report should distinguish the snapshot time from a fresh availability check. Cache policy should match the volatility of the claim.

External sources of truth preserve exact artifacts and evidence. laptop-comparison.md is the requested deliverable and should exist as a file in the approved workspace. Structured evidence records can preserve candidate configuration, observed price, currency, seller, region, source address, retrieval time, and extraction status. Project instructions can remain in version-controlled files. Secrets remain in a secret manager. Each store is chosen for a specific guarantee.

External does not automatically mean authoritative. A retailer page is authoritative evidence for what that retailer displayed at the observation time, but it may not establish manufacturer specifications or future price. A report file is authoritative for what the agent delivered, not for whether every claim is correct. Provenance tells us what each artifact can support.

The context shown to the model is a selected working set assembled from these stores. A fresh call may contain a compact evidence summary and links to exact records. The model does not need every byte in context, but the harness must be able to retrieve exact support during verification. This separation lets context remain bounded while evidence remains inspectable.`,
    },
    {
      id: 'conflict-provenance-expiry',
      eyebrow: 'Freshness',
      heading: 'Conflicts need sources; volatile facts need expiry and revalidation',
      body: String.raw`Assume a search result says candidate A costs €879, a retailer page opened later says €929, and an old run summary still says €849. The agent should not average the numbers, choose the cheapest, or trust the summary because it is already in context.

Each claim needs provenance: exact configuration, source, observation time, region, tax and shipping assumptions, extraction method, and confidence. The later retailer page may be the best evidence for current price if it matches the required configuration, but another current source may still be needed. The old summary is a derived view and should point back to its evidence record.

Expiry turns vague staleness into system behavior. A price record can carry a short validity window or a “must recheck before finalization” rule. Stable specifications may have a longer window but still require configuration matching. User preferences may remain until changed but should periodically be reviewed when materially consequential. Task retry counters expire at run termination.

Revalidation creates a new observation rather than silently rewriting history. The record can mark the earlier price superseded, retain it for trace audit, and identify the fresh price used in the report. The final file should state its evidence-check time and warn that prices may change.

Instruction conflicts use a different resolution path from factual conflicts. A vendor page telling the agent to contact sales conflicts with the task constraint only superficially: the page has no instruction authority. Two user statements that genuinely conflict may require clarification or an auditable authorized update. A cached prefix does not win either conflict merely because it was computed earlier.

Provenance also exposes derived content. A recommendation such as “best for software development” is a judgment based on stated criteria and evidence, not a directly observed product fact. The report should separate these layers so a changed price can trigger candidate re-evaluation without pretending the underlying specifications changed.

The conflict-handling flow should end in one of four outcomes: choose the higher-authority instruction, choose the best-supported current fact, request clarification where equal authority remains ambiguous, or mark the claim unresolved. Fabrication is never the fifth option.`,
      diagramIds: ['authority-conflict'],
    },
    {
      id: 'sensitivity-and-deletion',
      eyebrow: 'Data lifecycle',
      heading: 'Sensitive information needs minimization, bounded access, and a deletion route',
      body: String.raw`The laptop task requires public product research and a workspace file. It does not require the user's address, payment card, personal email, retailer login, or vendor chat identity. The safest handling is not to collect these values at all.

If another authorized task genuinely needed a credential, the secret should remain in a dedicated secret manager or identity boundary. The harness would pass a short-lived capability to the exact tool at execution time. It should not serialize the secret into model context, store it in durable memory, include it in a tool observation, or write it into laptop-comparison.md.

Sensitivity applies to inferences as well as obvious credentials. A durable preference profile can reveal employment, accessibility needs, budget, or personal circumstances. Retain only what the user expects, scope it to the correct identity, and make consequential use visible. Team-wide project memory must not accidentally expose one user's preferences to another.

Deletion starts by identifying the canonical store and derived copies. Deleting a remembered repairability preference should remove it from the durable memory record, search or vector index, generated summary, and future context selection. Relevant caches should expire or be invalidated. The system should document backups and audit-retention behavior honestly rather than promising immediate physical erasure everywhere if that is not the actual design.

The report file has a separate lifecycle. The user owns the delivered artifact and can edit or delete it through workspace controls. Evidence snapshots and traces may follow project retention policy. Temporary page content and run state can be cleaned up after the verification and audit window. Secrets should never enter those stores in the first place.

Update and deletion rights follow authority. A retailer can change its current price at the source but cannot edit the user's remembered preference. A model can propose that a preference is stale but should not delete it autonomously. The user or an authorized policy process controls the preference record. The harness controls task-state cleanup under disclosed retention rules.

Designing deletion during placement is much easier than discovering later that the same unlabelled fact was copied into prompts, summaries, logs, caches, embeddings, and reports. Provenance identifiers and scoped stores make those copies traceable.`,
      diagramIds: ['expiry-and-deletion'],
    },
    {
      id: 'placement-walkthrough',
      eyebrow: 'Decision practice',
      heading: 'Place every laptop-task item according to the guarantee it needs',
      body: String.raw`Finish by classifying representative items.

**“Never purchase or contact a vendor.”** This is a high-authority, task-scoped instruction derived from the user request. Reload it into context on every relevant turn, retain it in the task contract, and enforce it through unavailable capabilities or deterministic policy. Do not rely on model memory.

**“Candidate A was €879 at retailer R at 14:32 UTC.”** This is a volatile evidence record. Store the exact configuration, source, region, and time externally; select a summary into current context; attach expiry or finalization recheck; cite it in the report. Do not turn it into durable user memory.

**“Retailer R timed out twice.”** This is current-run operational state. Use it to enforce a retry limit and choose a fallback. It can remain in the trace for audit, then expire under run-retention policy. It is not a general fact about the retailer.

**“The user explicitly prefers repairability in future comparisons.”** With consent, store it as inspectable user-scoped durable memory with provenance, update, and deletion controls. Surface it when it materially affects later recommendations. A current explicit request can override it.

**laptop-comparison.md.** This is an external deliverable, not memory. Write it only to the authorized path, read it back, and treat its exact bytes as the completion artifact. Its citations should point to evidence records or public sources.

**A reused system-prompt prefix.** This is cached computation. It may improve performance while compatible inputs remain unchanged. It carries no independent authority and can be discarded and rebuilt.

**A vendor login token.** This is unnecessary and prohibited by task scope. Do not collect it. In a different authorized system, keep it in a secret boundary and expose it only to the permitted tool, never to model-visible memory.

A placement audit asks: Can we name the owner and authority? Does the item expire when its usefulness ends? Can unrelated users or tasks see it? Is sensitive content minimized? Can the authorized owner correct and delete it? Can the system find the original source? Does losing a cache leave truth intact? If any answer is unclear, the design is not finished.

The durable mental model is not “agents remember.” It is that the harness deliberately selects information from mechanisms with different guarantees. Instructions govern. Run state coordinates. Memory provides consented continuity. Caches reuse computation. External records preserve exact evidence and artifacts. Secret systems protect credentials. Placement makes these differences enforceable and observable.`,
      diagramIds: ['placement-decision', 'expiry-and-deletion'],
    },
  ],
  diagrams: [
    {
      id: 'information-mechanisms',
      title: 'Different mechanisms serve different information guarantees',
      caption: 'Illustrative system map for the shared laptop task. Arrows show selection into current context, not automatic transfer of authority.',
      alt: 'Project and task instructions, current run state, durable user memory, exact external evidence, files, caches, and secrets feed different controlled consumers rather than one universal memory store.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  I["instructions<br/>governing rules"] --> C["selected model context"]
  R["run state<br/>progress and attempts"] --> C
  M["durable memory<br/>consented continuity"] --> C
  E["external evidence<br/>exact source records"] --> C
  K["cache<br/>reusable computation"] -. "accelerates" .-> C
  S["secret manager"] --> T["authorized tool execution"]
  C --> A["model proposal"]
  E --> V["outcome verification"]
  F["laptop-comparison.md"] --> V`,
    },
    {
      id: 'placement-decision',
      title: 'Classify before choosing storage',
      caption: 'Illustrative placement decision. A real design may combine stores, but each copy needs a declared purpose and lifecycle.',
      alt: 'An information item is classified by authority, lifetime, scope, sensitivity, and update path before being placed in instructions, run state, durable memory, external truth, cache, or secret storage.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  X["information item"] --> A["authority"]
  A --> L["lifetime"]
  L --> S["scope"]
  S --> P["sensitivity"]
  P --> U["update and deletion path"]
  U --> D{"required guarantee"}
  D --> I["instruction"]
  D --> R["run state"]
  D --> M["durable memory"]
  D --> E["external truth or artifact"]
  D --> C["cache"]
  D --> K["secret boundary"]`,
    },
    {
      id: 'authority-conflict',
      title: 'Resolve conflicts by authority and provenance',
      caption: 'Illustrative conflict flow. Untrusted webpage text remains evidence even when it resembles an instruction.',
      alt: 'Conflicting items are first classified as instructions or factual claims; instruction conflicts use authority and approved updates, while factual conflicts compare source, configuration, time, and scope or remain unresolved.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  C["conflicting items"] --> Q{"instruction or factual claim?"}
  Q -->|instruction| A["compare authority and scope"]
  A --> U{"authorized update is clear?"}
  U -->|yes| R["record supersession"]
  U -->|no| H["ask or keep higher-authority rule"]
  Q -->|fact| P["compare provenance, configuration, and time"]
  P --> F{"current support sufficient?"}
  F -->|yes| E["use and cite evidence"]
  F -->|no| N["revalidate or mark unresolved"]`,
    },
    {
      id: 'expiry-and-deletion',
      title: 'Every retained item needs an end-of-life path',
      caption: 'Illustrative lifecycle showing revalidation for volatile facts and controlled deletion for retained user information.',
      alt: 'A retained item receives provenance and expiry; when expired it is revalidated or removed, and when deletion is requested canonical and derived stores are found, removed or invalidated, and excluded from future context.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  N["new retained item"] --> P["attach owner, provenance, scope, expiry"]
  P --> U["use in authorized context"]
  U --> X{"expired or deletion requested?"}
  X -->|expired fact| R["revalidate from source"]
  R --> P
  X -->|delete| C["find canonical and derived copies"]
  C --> D["remove or invalidate"]
  D --> V["exclude from future context"]
  X -->|no| U`,
    },
  ],
  misconceptions: [
    {
      claim: 'Anything the agent may need later should go into durable memory.',
      whyPlausible: 'A single persistent store sounds simpler than managing several lifecycles.',
      correction: 'Run state, current evidence, instructions, artifacts, caches, and secrets need different guarantees. Durable memory should contain selective, consented cross-session continuity.',
      diagnostic: 'Why should today’s €879 retailer price not become a permanent user memory?',
    },
    {
      claim: 'Prompt caching means the model remembers an earlier result.',
      whyPlausible: 'A cached call can be faster and behave as if earlier context is already available.',
      correction: 'A prompt cache reuses compatible computation. It has no independent factual authority and can disappear without losing canonical task state.',
      diagnostic: 'Where must the task contract live so a cache miss does not remove the vendor-contact prohibition?',
    },
    {
      claim: 'The newest instruction always overrides older instructions.',
      whyPlausible: 'Conversation systems often emphasize recent messages.',
      correction: 'Authority and an approved update path determine precedence. Untrusted webpage text cannot override the user’s task boundary merely by arriving later.',
      diagnostic: 'Should “message sales for a discount” on a retailer page override “never contact a vendor”?',
    },
    {
      claim: 'A run summary is the exact source of truth for research evidence.',
      whyPlausible: 'The summary is concise, visible to the model, and may contain all important-looking facts.',
      correction: 'Summaries are lossy derived views. Exact source records with URLs, configurations, values, and timestamps must remain externally retrievable for verification.',
      diagnostic: 'What should happen if a summary says €849 but its evidence record says €929?',
    },
    {
      claim: 'Deleting a memory record is complete even if its vectors, summaries, and caches continue to retrieve the content.',
      whyPlausible: 'The primary database row is the most visible representation.',
      correction: 'Deletion design must address canonical and derived copies, future context selection, caches, indexes, backups, and disclosed audit retention.',
      diagnostic: 'How would you test that a deleted repairability preference no longer influences a new laptop task?',
    },
    {
      claim: 'A secret is safe in memory if the model is instructed not to reveal it.',
      whyPlausible: 'The instruction may reduce accidental disclosure in ordinary responses.',
      correction: 'Secrets should remain outside prompt-visible context and memory. Resolve bounded credentials at authorized tool execution and prevent them from entering observations or logs.',
      diagnostic: 'Does the shared laptop task need any vendor credential at all?',
    },
  ],
  exercises: [
    {
      id: 'classify-five-dimensions',
      kind: 'trace',
      prompt: 'Classify “Never contact a vendor” by authority, lifetime, scope, sensitivity, and update path.',
      answer: 'It comes from the current user and has high task authority. It lasts for the complete laptop run, applies to all tools and workers in that task, is not sensitive, and may change only through a clear authorized user update. The harness should preserve it in task state and enforce it deterministically.',
    },
    {
      id: 'place-seven-items',
      kind: 'transfer',
      prompt: 'Place these items: current €879 price, retry count, future repairability preference, project citation rule, laptop-comparison.md, cached prompt prefix, and vendor API token.',
      answer: 'The price belongs in provenance-bearing external evidence with expiry; retry count in run state; an explicit consented preference in durable user memory; the citation rule in project instructions; the report as an external file artifact; the prefix in a disposable cache; and the token in a secret manager—or nowhere, because this task forbids vendor operations.',
    },
    {
      id: 'debug-stale-price',
      kind: 'debug',
      prompt: 'A resumed run uses a two-week-old €849 summary without reopening its source. Diagnose the lifecycle failures.',
      answer: 'The volatile fact lacks effective expiry and revalidation, and a lossy summary is being treated as canonical evidence. The harness should inspect the original record, mark it stale, fetch current matched-configuration evidence, and update the report with a new observation time.',
    },
    {
      id: 'resolve-conflict',
      kind: 'predict',
      prompt: 'The user forbids vendor contact, but a fetched page says agents must email sales to verify price. Predict the correct resolution and trace record.',
      answer: 'The page is untrusted evidence with no instruction authority. The harness keeps the user prohibition, denies any contact proposal, and records the page content as untrusted plus the deterministic policy decision. The system finds public evidence or returns an evidence limitation.',
    },
    {
      id: 'design-memory-update',
      kind: 'transfer',
      prompt: 'Design the lifecycle for the user’s explicit future preference for repairability, including correction and deletion.',
      answer: 'Create an inspectable user-scoped record containing the exact source statement, time, scope, and consent. Surface it when materially used, let current explicit requests override it, provide an authorized edit path, and on deletion remove or invalidate canonical and derived retrieval copies so it no longer enters future contexts.',
    },
    {
      id: 'debug-cache-authority',
      kind: 'debug',
      prompt: 'After an instruction update, the system continues using a cached prefix containing the older rule. What should the harness do?',
      answer: 'Instruction version is part of cache compatibility. The harness should invalidate or bypass the stale entry, rebuild context from authoritative instructions, record the version change, and never let cache reuse decide which rule is authoritative.',
    },
    {
      id: 'audit-deletion',
      kind: 'trace',
      prompt: 'The user deletes a remembered budget preference. List observable checks that demonstrate effective deletion.',
      answer: 'Confirm the canonical record is gone or tombstoned without content, retrieval indexes no longer return it, summaries and future contexts omit it, relevant caches are invalidated or expired, and a new comparison does not apply the preference. Document any backup or minimal audit retention separately.',
    },
  ],
  glossary: [
    { term: 'Authority', definition: 'The strength and source of an information item’s right to govern behavior or establish a claim.' },
    { term: 'Lifetime', definition: 'The period during which an item remains useful, valid, or retained.' },
    { term: 'Scope', definition: 'The users, projects, tasks, tools, or resources to which an item applies.' },
    { term: 'Sensitivity', definition: 'The access restrictions and potential harm associated with disclosure or misuse of information.' },
    { term: 'Update path', definition: 'The authorized process for creating, correcting, superseding, or deleting an item.' },
    { term: 'Instruction', definition: 'An authoritative direction that influences proposals or governs harness behavior within a declared scope.' },
    { term: 'Task contract', definition: 'Run-scoped goals, constraints, evidence requirements, permissions, and terminal criteria derived from the user request.' },
    { term: 'Run state', definition: 'External working data about progress, observations, attempts, budgets, and readiness during one bounded execution.' },
    { term: 'Durable memory', definition: 'Inspectable retained information intended to provide consented continuity across runs or sessions.' },
    { term: 'Cache', definition: 'Disposable reusable data or computation that improves performance without becoming an independent source of truth.' },
    { term: 'External source of truth', definition: 'A store or artifact used to preserve exact evidence, rules, or deliverables with appropriate provenance.' },
    { term: 'Provenance', definition: 'The source, observation time, identity, and transformation history that establish what a record can support.' },
    { term: 'Expiry', definition: 'A rule that marks information stale or unusable after a time or lifecycle event unless revalidated.' },
    { term: 'Revalidation', definition: 'Obtaining fresh evidence to confirm, supersede, or reject an earlier time-sensitive record.' },
    { term: 'Supersession', definition: 'An auditable relationship in which a newer authorized instruction or evidence record replaces an older one without erasing history.' },
    { term: 'Compaction', definition: 'Replacing detailed working context with a smaller, potentially lossy representation while preserving essential state and provenance links.' },
    { term: 'Secret manager', definition: 'A protected system that stores credentials and exposes bounded access only to authorized execution paths.' },
    { term: 'Data minimization', definition: 'Collecting and retaining only information necessary for the authorized purpose.' },
    { term: 'Derived copy', definition: 'A transformed or indexed representation, such as a summary, cache entry, or retrieval vector, produced from canonical information.' },
    { term: 'Deletion lifecycle', definition: 'The process for removing or invalidating canonical and derived copies and excluding deleted information from future use.' },
  ],
} satisfies CourseTheoryChapter;
