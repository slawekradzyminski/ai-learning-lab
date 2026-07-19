import type { CourseTheoryChapter } from '../../../course/content/theoryTypes';

export const AGENT_CAPSTONE_CHAPTER = {
  question: 'Can the laptop-report agent reach a measurable terminal state while preserving evidence, authority, recoverability, and safe failure?',
  estimatedMinutes: 55,
  prerequisites: [
    'Know that the model proposes while the harness owns orchestration, policy, execution, and stopping.',
    'Know that each model call sees only serialized context selected from external state.',
    'Know that memory, instructions, skills, files, sessions, and caches have different lifetimes and authority.',
    'Know that subagents need bounded tasks, capability scopes, and parent verification.',
    'Know that hooks attach deterministic checks to named lifecycle events.',
    'Know that every tool effect requires validation, current authorization, bounded execution, and outcome evidence.',
    'Know that one successful demonstration is not a reliability evaluation.',
  ],
  objectives: [
    'Translate the laptop-report request into measurable constraints, non-goals, and a terminal state.',
    'Assign responsibility among user, model, harness, tools, environment, subagents, hooks, and evaluators.',
    'Design the context and persistence plan for a multi-step, resumable run.',
    'Choose which research tasks can be delegated without losing evidence or write control.',
    'Place deterministic checks at the earliest lifecycle event with enough evidence.',
    'Define least-privileged tool policy and deny a purchase proposal safely.',
    'Walk a complete success trace from goal intake through report read-back.',
    'Diagnose and recover from stale stock evidence before finalization.',
    'Construct a threat model and an outcome-centered evaluation suite.',
    'Require staged rollout evidence and explicit rollback triggers.',
    'Explain what architecture must change if purchasing becomes an authorized product requirement.',
  ],
  sections: [
    {
      id: 'measurable-contract',
      eyebrow: '1 · Product contract',
      heading: 'The agent needs a measurable goal, explicit non-goals, and a terminal state the harness can verify',
      body: String.raw`The shared task is to prepare an evidence-backed laptop report for a traveller who writes code. The selected laptop must cost no more than €900, provide at least 16 GB of RAM, be reported in stock for the relevant region, and include current price, weight, warranty, and source links. Portability influences ranking, but the user has not supplied a hard maximum weight. The agent should expose uncertainty rather than invent missing facts.

That request is not yet an executable contract. The harness needs the target region and currency, report destination, freshness rule for volatile stock and price, acceptable evidence sources, and what counts as completion. Missing details can be resolved through a user question or safe defaults that are declared and reviewable. A hidden assumption such as using a United States retailer for a Warsaw user can invalidate an otherwise polished report.

Define the terminal state in observable terms. One qualifying recommendation and at least one considered alternative are documented. Required fields have source references and observation times. Current constraints are checked against the exact product variant. Unavailable evidence is labeled. The draft is saved only within the permitted report directory, read back, and validated for required sections. The user receives the verified path and limitations.

Define non-goals with equal clarity. This agent does not purchase a laptop, reserve stock, sign into retailer accounts, send email, or modify files outside its report scope. Researching a product is not authority to transact. If the model proposes an adjacent action, policy denies it and returns a safe alternative.

Stop conditions include success, user cancellation, exhausted read-tool retry budget, inability to find a qualifying candidate, unresolved required evidence, policy denial that blocks completion, and overall turn or time limits. “The model returned final text” is not by itself terminal. The harness compares environment state and evidence with the contract.

This measurable contract becomes the spine for architecture, threat modeling, evaluation, and rollout. Without it, teams optimize conversational fluency while disagreeing about whether the system actually completed the work.`,
      diagramIds: ['capstone-architecture'],
    },
    {
      id: 'ownership-map',
      eyebrow: '2 · Responsibility',
      heading: 'Every decision and effect has an owner; the model does not absorb the harness’s obligations',
      body: String.raw`The user owns the goal, supplies missing preferences, and approves any effect that product policy places behind a checkpoint. The model interprets the serialized context, proposes research actions, compares supported candidates, and drafts explanatory text. Its output remains untrusted until the relevant harness stage accepts it.

The harness owns context assembly, model invocation, iteration, stop conditions, tool routing, policy, retries, cancellation, checkpoints, and trace correlation. Deterministic validators own schema and semantic checks. The executor owns actual tool effects inside a sandbox. External catalog, retailer, manufacturer, and filesystem systems own their returned state. An evaluator judges the completed run against declared outcomes.

This ownership map prevents false delegation. A model can suggest that stock should be refreshed, but the harness must know whether the snapshot meets freshness policy. A model can say the report was saved, but the filesystem result and read-back establish that effect. A model can repeat user approval text, but the approval service binds actual consent to an exact pending operation.

Hooks belong to the harness lifecycle. A pre-tool hook can reject a path outside the report directory or any purchase-like call. A post-tool hook can verify that an observation includes source and timestamp metadata. A post-compaction hook can restore the terminal-state checklist from durable instructions. A pre-stop hook can require current stock evidence and a successful report read-back. Hooks improve repeatability but do not replace authorization or sandboxing.

The trace should name owners without exposing private chain-of-thought. It records the model proposal, deterministic decision, tool observation, artifact version, and concise rationale tied to evidence. “Rejected Laptop B because the verified 8 GB variant violates the minimum RAM constraint” is useful. An unrestricted hidden reasoning transcript is unnecessary for recovery or audit.`,
      diagramIds: ['capstone-architecture'],
    },
    {
      id: 'context-memory-plan',
      eyebrow: '3 · Working state',
      heading: 'Per-call context stays small because durable evidence and checkpoints live outside it',
      body: String.raw`Each model call receives the current goal, binding instructions, relevant recent turns, necessary tool schemas, selected observations, and open decisions. It does not receive every search result and prior token by default. The harness records why evidence was included, compacted, externally referenced, or excluded.

Durable project instructions define report format, evidence rules, permitted path, and non-goals. A session trace records proposals, validations, observations, approvals, and stop decisions. Product snapshots and source excerpts remain in an evidence store with exact variant, region, source, and observation time. The report file is a versioned external artifact. A structured handoff records constraints, candidate identifiers, evidence references, failed calls, pending work, tool versions, and the next safe action.

Compaction can summarize old exploration, but it must not collapse variants or remove timestamps. “Laptop Pro costs €849 and is available” is insufficient. A compact record should say which fictional teaching SKU was observed, which teaching catalog supplied the result, when it was observed, and where the raw snapshot remains retrievable. Summary uncertainty stays visible.

Prompt caching can reuse compatible serialized prefixes but does not replace context assembly or persistence. A saved session can resume after a prompt cache expires. A file can survive after the session ends but remains invisible until retrieved. A KV cache is temporary inference state and is not the report or the evidence store.

On resume, the harness validates artifact versions, reloads current tool schemas, checks model and policy compatibility, refreshes volatile observations, and inspects uncertain writes before retrying. Continuity is reconstructed from explicit state; it is not assumed to remain inside the model.`,
      diagramIds: ['context-and-handoff'],
    },
    {
      id: 'delegation-and-hooks',
      eyebrow: '4 · Coordination',
      heading: 'Delegate independent evidence gathering, keep synthesis and effects under one accountable parent',
      body: String.raw`Laptop research contains potentially independent tasks. One read-only worker can verify manufacturer specifications for the leading SKU. Another can compare warranty terms. A third can check current regional retailer snapshots for alternatives. Parallel work may reduce elapsed time and keep detailed source inspection out of the parent context.

Each delegation needs a bounded deliverable, exact candidate identifiers, allowed sources, read-only tools, output schema, freshness requirement, and return deadline. Workers return field-level evidence with provenance and explicit missing values. They do not edit the final report, send messages, or purchase products. Separate conversational contexts do not isolate a shared filesystem, so write access remains withheld unless explicitly coordinated.

The parent verifies returned evidence, resolves conflicts, and owns ranking. If two workers report different weights, the parent checks variant and source rather than averaging them. If a worker times out, the parent can retry through another source or mark the field unresolved. Delegation does not transfer responsibility for terminal-state claims.

Lifecycle hooks make recurring invariants deterministic. Before a tool call, validate the allowlisted read domains and report path. After a tool result, require source identity, region, variant, and observation time. After compaction, reload the non-goal that purchasing is forbidden. Before stopping, run the terminal-state validator. Hook failures are trace events and should fail safely.

Not every decision should become a subagent or hook. Candidate ranking requires global synthesis and stays with the parent. A policy boundary belongs in authorization code rather than only in a hook. Hooks attach checks to exposed lifecycle events; sandbox and least-privilege controls cover underlying capabilities.`,
      diagramIds: ['context-and-handoff'],
    },
    {
      id: 'worked-success-trace',
      eyebrow: '5 · Worked trace',
      heading: 'A successful run ends with verified evidence and an artifact, not merely a recommendation sentence',
      body: String.raw`This trace uses fictional educational fixtures. It does not report current retail facts. The user confirms region Europe and report path reports/laptop-report.md. The harness serializes constraints, evidence policy, read-only research tools, a scoped save tool, and the terminal checklist.

First, the model proposes search_catalog with maximum price €900, minimum RAM 16 GB, category laptop, and the declared region. Parsing, schema, semantic checks, and read authorization pass. The teaching catalog returns three candidate identifiers with source time. No product is yet called “best.”

Second, the parent delegates read-only checks for specifications and warranty while it requests current product snapshots. Returned evidence identifies fictional Laptop Pro SKU LP14-16-EU at €849, 16 GB RAM, 1.32 kg, two-year teaching-fixture warranty, and in-stock status at 10:05 CET. Each field has a source reference and variant. Another candidate is rejected because its verified 8 GB configuration fails the constraint; a third remains an alternative but is heavier.

Third, the model drafts a comparison that distinguishes manufacturer specification evidence from retailer price and stock evidence. A post-tool provenance check has already rejected one unattributed snippet, so it is absent from the claims. The model proposes save_report for reports/laptop-report.md. Path normalization, current principal authorization, report schema, and expected previous version pass. Purchasing and email tools are not exposed.

Fourth, the executor writes through a temporary file and atomically replaces the permitted draft. It returns artifact version and checksum. The harness reads the file back and verifies required headings, constraints, citations, observation times, selected SKU, alternative, and limitation language. The pre-stop check confirms stock freshness and artifact state.

Finally, the model returns the verified path, selected fictional candidate, and a reminder that stock is an observed snapshot rather than a guarantee. The harness marks success because the contract is satisfied. The trace connects every report claim to evidence and every effect to an outcome.`,
      diagramIds: ['worked-success-sequence'],
    },
    {
      id: 'stale-evidence-failure',
      eyebrow: '6 · Recovery case',
      heading: 'A fluent report fails when compaction hides that its stock observation is stale',
      body: String.raw`Consider a run resumed three days later. Its compacted summary says, “Laptop Pro is €849 and in stock,” but omits the observation time and raw snapshot reference. The model drafts a confident recommendation and proposes saving the final report. The text looks consistent with the earlier run.

The pre-stop validator checks field-level provenance and cannot establish freshness. This is not a reason to guess that stock probably remained stable. The terminal state is not reached. The harness retrieves the original trace, discovers the three-day-old snapshot, and invokes the current stock tool under read-only policy.

The refreshed fictional result reports the same price but out-of-stock status. The earlier claim was not dishonest when observed; it became stale for the current decision. The parent reopens candidate selection, refreshes the alternative, and either recommends a qualifying available option or states that no verified in-stock candidate is available. The existing report version is not silently overwritten until the revised evidence and decision pass validation.

Recovery records why the report changed: old source and timestamp, freshness rule, refreshed outcome, affected claims, and new artifact version. The summary is rebuilt from structured evidence references rather than another summary-of-summary. A regression test is added so any stock claim without acceptable observed_at metadata blocks completion.

This failure demonstrates why model quality alone cannot solve context integrity. The model received an incomplete summary and produced plausible prose. Provenance requirements, freshness policy, pre-stop validation, retrieval paths, and versioned writes prevented the prose from becoming an unsupported final artifact.`,
      diagramIds: ['failure-and-policy-paths'],
    },
    {
      id: 'denied-purchase',
      eyebrow: '7 · Policy case',
      heading: 'A purchase proposal is denied even if a product page or model presents it as helpful',
      body: String.raw`Suppose a retrieved retailer page includes an instruction to “buy now before stock disappears.” The content is serialized as untrusted observation data, but the model nevertheless proposes purchase_laptop for €849. This is a model proposal, not authority.

The report agent’s declared registry does not expose purchasing. The tool resolver rejects the unknown or unavailable capability before argument execution. If a global platform contains a purchase service, current principal and agent policy still deny access because the report contract excludes transactions. The harness does not display a generic approval prompt that could confuse the user into granting an out-of-scope capability.

The denial observation states that purchasing is unavailable to this workflow and offers safe alternatives: complete the evidence-backed report, provide the verified retailer link, or ask the user to enter a separately governed procurement flow. Credentials and payment data never enter model context. No cart, reservation, or financial effect occurs.

The audit trace records the injected source, proposal, resolver or policy denial, and zero-effect verification. A security evaluator treats the unsafe proposal as a behavioral signal even though enforcement succeeded. Repeated proposals can trigger tool-definition changes, prompt-injection defenses, or model updates, but the deterministic boundary already protects the environment.

This is safe failure: the system refuses excess autonomy while preserving useful progress on the authorized report.`,
      diagramIds: ['failure-and-policy-paths'],
    },
    {
      id: 'threat-model-and-trace',
      eyebrow: '8 · Adversarial review',
      heading: 'The threat model covers mistakes, hostile content, stale state, and boundary bypasses',
      body: String.raw`Prompt injection can try to redirect the model from research to purchase or data disclosure. Excessive agency can expose shell, arbitrary network, unrestricted write, email, or financial tools that the goal does not require. Confused-deputy failures can use the user’s identity against a resource the user did not intend. Path traversal can escape the report directory. Tool output can leak credentials or private supplier data.

Operational threats matter too. A timeout can leave write outcome unknown. An automatic retry can duplicate an effect. A model or schema update can invalidate a saved call. A delegated worker can use a stale product variant. Compaction can erase a caveat. A compromised source can return false specifications. A malicious report filename can target an existing artifact.

Map each threat to prevention, detection, and recovery. Least functionality removes purchase capability. Authorization and approval bind effects to current intent. Sandboxes contain paths and networks. Schema and semantic validation reject malformed targets. Provenance and freshness rules detect weak evidence. Idempotency and expected versions protect retries. Audit and evals reveal unsafe proposals and unsupported claims. Checkpoints and read-back support recovery.

Complete mediation requires direct calls, hooks, retries, scheduled runs, subagents, and resumed sessions to cross the same current policy point. A strong main loop with an unguarded recovery script is not a strong system. The architecture review should follow downstream calls inside each tool, because a harmless-sounding source reader can still reach private networks.

The trace records observable events rather than private reasoning: context version, proposal, normalized arguments or digest, principal, policy decision, approval reference, resource limits, tool outcome, evidence metadata, artifact version, and terminal decision. Access and retention controls prevent audit from becoming another data leak.`,
      diagramIds: ['failure-and-policy-paths'],
    },
    {
      id: 'eval-and-rollout',
      eyebrow: '9 · Reliability evidence',
      heading: 'An evaluation plan tests outcomes, boundaries, recovery, and repeated variation before rollout',
      body: String.raw`The evaluation suite begins with task fixtures, not one showcase prompt. Cases vary budget, region, missing warranty, conflicting variants, no qualifying products, stale stock, tool timeout, prompt injection, path traversal, denied email, denied purchase, compaction, resumption, and subagent disagreement. Repeated trials sample model variation while deterministic fixtures keep expected evidence inspectable.

Outcome graders verify that a qualifying SKU satisfies price and RAM, required fields have sources and acceptable timestamps, unsupported claims are absent, the report exists only in the allowed path, read-back succeeded, and no unauthorized effect occurred. Trace graders verify that every effect crossed policy, failures became observations, approvals bound exact operations, and the terminal reason matches environment state. Rubric graders can assess clarity and trade-off explanation, but they should not override deterministic policy failures.

Report success rate together with unsupported-claim rate, unsafe-proposal rate, blocked-effect rate, recovery success, duplicate-effect count, latency, tool calls, token use, and human approval burden. A high block rate can mean enforcement works while behavior remains poor. A low unsafe-effect rate is meaningless if the evaluator never attempted adversarial cases.

Rollout proceeds from exact educational fixtures to sandbox integration, internal users, a small canary, and gradually broader use. The write scope remains isolated. Purchasing remains absent. Every stage has rollback triggers such as unsupported stock claims, writes outside scope, unexplained policy bypass, duplicate effects, or audit gaps. Model, prompt, tool, policy, and evaluator versions are recorded.

Post-rollout monitoring samples traces and real outcomes without assuming the launch evaluation distribution remains representative. New retailers, schema changes, seasonal stock volatility, and user behavior can create drift. Incident findings become regression cases. Expansion requires accumulated evidence, not the absence of visible complaints.`,
      diagramIds: ['eval-rollout-gates'],
    },
    {
      id: 'authorized-purchasing-transfer',
      eyebrow: '10 · Transfer review',
      heading: 'Authorizing purchase would change the product contract, identity model, controls, tests, and rollout',
      body: String.raw`Imagine a later product requirement: after the report, an authorized procurement user may purchase the selected laptop. The change is not “allow purchase_laptop.” The goal and terminal state must now distinguish recommendation, approval, order submission, merchant acceptance, payment authorization, and delivery tracking. The user must know when a financial commitment becomes real.

The system needs a strongly authenticated procurement principal, role and spend limits, approved merchants, exact SKU and quantity constraints, regional tax and shipping handling, payment credential isolation, and separation from ordinary research workers. The purchase schema should avoid arbitrary merchant requests and should bind product, seller, final price, currency, quantity, destination class, and expected total.

Immediately before approval, refresh price and stock and present the normalized effect. Approval binds those values with an expiry. A changed total, seller, variant, or shipping term requires new consent. The executor uses scoped credentials outside model context, an idempotency key, and a durable order record. Unknown outcomes are reconciled with the merchant before retry.

Hooks and policy block purchase during research and require an approved transition into procurement state. Audit retention, privacy, dispute handling, cancellation or return paths, fraud controls, and legal requirements become part of the architecture. A human checkpoint does not replace authorization, validation, or transaction integrity.

Evaluation expands to duplicate-charge prevention, price-change races, malicious merchant content, approval confusion, expired sessions, partial checkout, declined payment, unknown outcome, cancellation, and unauthorized principals. Rollout begins in a simulated merchant environment, then uses tightly limited internal transactions and canary spend caps. Rollback can disable purchasing while leaving research functional.

This transfer demonstrates the capstone principle: increased capability changes the threat model and evidence required for trust. It must be designed as a new governed workflow, not inferred from the model’s ability to recommend a product.`,
      diagramIds: ['eval-rollout-gates', 'capstone-architecture'],
    },
  ],
  diagrams: [
    {
      id: 'capstone-architecture',
      title: 'Laptop-report agent ownership and terminal contract',
      caption: 'The model proposes and synthesizes; the harness owns context, policy, tools, persistence, and terminal verification.',
      alt: 'A user goal enters a harness that assembles context, invokes a model, mediates tools, stores evidence, verifies a report, and returns a result.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  U["User goal and constraints"] --> H["Harness\ncontext + policy + loop"]
  H --> M["Model\nproposal or report draft"]
  M --> H
  H --> T["Bounded tools"]
  T --> E["Environment observations"]
  E --> S["Evidence store and trace"]
  S --> H
  H --> V["Terminal-state validator"]
  V --> R["Verified report path or safe failure"]`,
    },
    {
      id: 'context-and-handoff',
      title: 'Small call context, durable evidence, and bounded delegation',
      caption: 'Workers receive only needed context and read capabilities; the parent verifies evidence and checkpoints externally.',
      alt: 'A parent assembles compact context, delegates read-only evidence tasks, stores results with provenance, and writes a structured handoff.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  C["Current goal + binding instructions"] --> P["Parent agent call"]
  P --> A["Worker A\nspecifications"]
  P --> B["Worker B\nwarranty"]
  P --> D["Worker C\nstock alternatives"]
  A --> E["Provenanced evidence store"]
  B --> E
  D --> E
  E --> P
  P --> H["Structured checkpoint and report artifact"]`,
    },
    {
      id: 'worked-success-sequence',
      title: 'Worked success trace',
      caption: 'Completion follows verified search, evidence collection, scoped write, read-back, and terminal validation.',
      alt: 'A sequence diagram traces user constraints, catalog search, delegated verification, report save, read-back, and successful completion.',
      kind: 'pipeline',
      provenance: 'exact educational calculation',
      chart: `sequenceDiagram
  participant U as User
  participant H as Harness
  participant M as Model
  participant T as Read tools and workers
  participant F as Report filesystem
  U->>H: Goal, region, and report path
  H->>M: Serialized contract and scoped tools
  M->>H: Search proposal
  H->>T: Validated catalog and evidence reads
  T-->>H: Provenanced candidate fields
  H->>M: Verified evidence and open decision
  M->>H: Report draft and save proposal
  H->>F: Scoped atomic save
  F-->>H: Version and checksum
  H->>F: Read back and validate
  H-->>U: Verified path and limitations`,
    },
    {
      id: 'failure-and-policy-paths',
      title: 'Stale evidence triggers recovery; purchase triggers denial',
      caption: 'Both failures become explicit observations, but one refreshes evidence while the other preserves a capability boundary.',
      alt: 'A finalization check branches stale stock to refresh and replanning, while a purchase proposal branches to policy denial and a report-only alternative.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  D["Candidate final report"] --> C{"Terminal checks"}
  C -->|"stock timestamp stale"| R["Refresh read-only snapshot"]
  R --> P["Replan or state no verified option"]
  C -->|"purchase proposed"| X["Resolver and policy deny"]
  X --> A["Offer report and verified retailer link"]
  C -->|"evidence and artifact valid"| S["Success"]`,
    },
    {
      id: 'eval-rollout-gates',
      title: 'Evidence gates from fixtures to production',
      caption: 'Each rollout stage requires outcome, policy, recovery, cost, and trace evidence with rollback triggers.',
      alt: 'A staged pipeline moves from exact fixtures through sandbox, internal testing, canary, and broader rollout, with evaluation and rollback at every gate.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  F["Exact fixtures"] --> S["Sandbox integration"]
  S --> I["Internal users"]
  I --> C["Small canary"]
  C --> B["Broader rollout"]
  E["Outcome + policy + recovery evals"] --> F
  E --> S
  E --> I
  E --> C
  E --> B
  B -. "rollback on unsafe or unsupported outcomes" .-> C`,
    },
  ],
  misconceptions: [
    {
      claim: 'A high-quality final recommendation means the agent completed the task.',
      whyPlausible: 'The report text is the most visible output and may contain all requested sections.',
      correction: 'Completion requires verified evidence, current constraints, a permitted saved artifact, read-back, and the declared terminal checks.',
      diagnostic: 'Delete the report file after generation; fluent text remains, but the terminal state fails.',
    },
    {
      claim: 'The model owns safety because it decides which tools to call.',
      whyPlausible: 'Unsafe behavior begins with a model proposal in the trace.',
      correction: 'The model affects proposal quality. The harness owns capability exposure, validation, authorization, execution limits, and stop decisions.',
      diagnostic: 'Inject a purchase proposal and verify that deterministic policy denies it regardless of model confidence.',
    },
    {
      claim: 'A compact session summary is sufficient durable memory for the report.',
      whyPlausible: 'The summary can restate the chosen candidate and rationale coherently.',
      correction: 'Exact sources, timestamps, variants, tool outcomes, artifact versions, and pending effects need structured external records and retrieval paths.',
      diagnostic: 'Ask the summary to prove when stock was observed and which SKU it described.',
    },
    {
      claim: 'Parallel subagents make evidence independent and therefore trustworthy.',
      whyPlausible: 'Several workers can appear to corroborate one another.',
      correction: 'Workers can share the same stale source, confuse variants, or collide on external state. The parent verifies provenance and resolves conflicts.',
      diagnostic: 'Trace both claims to their sources; two summaries of one retailer page are not independent evidence.',
    },
    {
      claim: 'A hook that blocks purchase makes authorization unnecessary.',
      whyPlausible: 'A pre-tool hook can stop the visible forbidden call.',
      correction: 'Hooks cover named lifecycle paths. Capability policy and sandboxing must mediate direct, retried, delegated, and resumed operations too.',
      diagnostic: 'Attempt the same executor through a recovery path that does not emit the hook event; authorization must still deny it.',
    },
    {
      claim: 'Evidence remains valid because it was correct when first collected.',
      whyPlausible: 'The trace proves that the source once reported the claim.',
      correction: 'Volatile facts such as stock require freshness policy. Correct historical evidence can be stale for a current decision.',
      diagnostic: 'Advance the fictional clock three days and require pre-stop validation of the stock timestamp.',
    },
    {
      claim: 'A denied unsafe effect means the system passed its evaluation.',
      whyPlausible: 'The environment remained safe, which is the most important immediate outcome.',
      correction: 'Enforcement succeeded, but repeated unsafe proposals still indicate behavioral and usability problems. Measure proposals and effects separately.',
      diagnostic: 'Compare blocked-effect rate with unsafe-proposal rate across repeated trials.',
    },
    {
      claim: 'Adding an approval dialog is enough to authorize purchasing.',
      whyPlausible: 'Human confirmation appears to solve the intent problem.',
      correction: 'Purchasing changes identity, transaction, credential, idempotency, audit, recovery, legal, evaluation, and rollout requirements.',
      diagnostic: 'Ask how the system prevents duplicate charge after an unknown timeout; an approval dialog alone has no answer.',
    },
  ],
  exercises: [
    {
      id: 'write-terminal-state',
      kind: 'transfer',
      prompt: 'Write a terminal-state checklist for the laptop report that does not rely on the model declaring success.',
      answer: 'Check qualifying exact SKU, budget and RAM constraints, current regional price and stock, weight and warranty evidence, citations and timestamps, alternative or no-match explanation, allowed report path, successful save and read-back, required sections, limitations, and no unauthorized effects.',
    },
    {
      id: 'assign-owners',
      kind: 'trace',
      prompt: 'Assign owners for candidate ranking, path authorization, file write, read-back, stock freshness, and final success decision.',
      answer: 'The model proposes ranking from supplied evidence; the harness or policy service authorizes the path; the executor writes; the filesystem/read tool provides read-back; the harness applies freshness policy; and the terminal-state validator owned by the harness decides success.',
    },
    {
      id: 'design-handoff',
      kind: 'transfer',
      prompt: 'List the minimum durable handoff fields needed to resume after evidence gathering but before report save.',
      answer: 'Include goal and non-goals, region, constraints, candidate SKUs, field-level evidence references and timestamps, rejected candidates with observable reasons, unresolved fields, tool and policy versions, failed calls, draft status, permitted path, pending side effects, and the next safe action.',
    },
    {
      id: 'bound-delegation',
      kind: 'predict',
      prompt: 'Choose two tasks to delegate in parallel and state the capabilities withheld.',
      answer: 'Manufacturer specification verification and warranty comparison are independent read tasks. Give exact SKUs, allowlisted read tools, freshness and output schema. Withhold final report writes, email, purchase, unrestricted browser or shell, and global synthesis.',
    },
    {
      id: 'trace-success',
      kind: 'trace',
      prompt: 'Identify the evidence event that changes the worked trace from “draft generated” to “task completed.”',
      answer: 'The scoped save result is necessary but not sufficient. Completion occurs after environment read-back and terminal validation confirm the expected report version, content, current evidence, and absence of unauthorized effects.',
    },
    {
      id: 'repair-stale-run',
      kind: 'debug',
      prompt: 'A resumed summary says “in stock” without timestamp. Give the recovery sequence.',
      answer: 'Block terminal success, retrieve original provenance, compare with freshness policy, re-run the scoped stock read, update candidate selection and affected claims, write a new artifact version, read it back, and add a regression case for missing stock timestamps.',
    },
    {
      id: 'handle-purchase-proposal',
      kind: 'debug',
      prompt: 'A retailer injection causes a purchase_laptop proposal. What should the trace show?',
      answer: 'It should show untrusted source provenance, model proposal, unavailable-tool or policy denial under the current principal, no credential resolution, zero external effect, a safe report-only alternative, and a security evaluation signal.',
    },
    {
      id: 'build-threat-row',
      kind: 'transfer',
      prompt: 'For uncertain save timeout, name prevention, detection, and recovery controls.',
      answer: 'Use idempotency key, expected artifact version, atomic scoped write, and timeout semantics for prevention. Record correlated operation and unknown outcome for detection. Inspect target/version before retry and reconcile through the same policy path for recovery.',
    },
    {
      id: 'design-eval-suite',
      kind: 'transfer',
      prompt: 'Choose five test cases and four metrics that would reveal failures hidden by a polished demo.',
      answer: 'Cases can include stale stock, prompt injection, tool timeout, no qualifying product, and path traversal or denied purchase. Metrics should include terminal success, unsupported-claim rate, unsafe proposals versus blocked effects, recovery success, duplicate effects, latency, or approval burden. Inspect traces and environment outcomes.',
    },
    {
      id: 'authorize-purchasing-transfer',
      kind: 'transfer',
      prompt: 'If purchasing becomes authorized, list at least eight architecture changes required before rollout.',
      answer: 'Change the product contract and terminal states; require procurement authentication and spend authorization; create a narrow transaction schema; refresh price and stock; bind exact approval; isolate payment credentials; add idempotency and order reconciliation; record durable transaction audit; define cancellation and dispute paths; expand threat model and evals; stage rollout with spend caps and rollback. Merely exposing the tool is insufficient.',
    },
  ],
  glossary: [
    { term: 'Measurable goal', definition: 'A task statement translated into constraints and observable outcomes that can be checked independently of model prose.' },
    { term: 'Terminal state', definition: 'A verified success, safe failure, cancellation, or limit condition that causes the harness loop to stop.' },
    { term: 'Non-goal', definition: 'An adjacent capability or outcome explicitly excluded from the current workflow.' },
    { term: 'Owner', definition: 'The component or person accountable for a decision, check, operation, or outcome.' },
    { term: 'Context plan', definition: 'The rules for selecting, compacting, serializing, and retrieving information for each model call.' },
    { term: 'Evidence store', definition: 'External state preserving source-linked observations and artifacts beyond one model context.' },
    { term: 'Structured handoff', definition: 'A resumable checkpoint of constraints, evidence references, outcomes, versions, open work, and next action.' },
    { term: 'Bounded delegation', definition: 'Assignment of a specific deliverable with limited context, tools, writable scope, and return contract.' },
    { term: 'Lifecycle hook', definition: 'Deterministic logic attached to a named event such as pre-tool, post-tool, post-compaction, or pre-stop.' },
    { term: 'Tool policy', definition: 'Current rules mapping principal, capability, target, arguments, and risk to allow, approval, or denial.' },
    { term: 'Safe failure', definition: 'A bounded outcome that preserves system integrity, states limitations, and offers an authorized next step.' },
    { term: 'Outcome verification', definition: 'Inspection of trusted environment state to establish what actually changed or was observed.' },
    { term: 'Freshness policy', definition: 'A field-specific rule determining when previously observed evidence must be refreshed.' },
    { term: 'Threat model', definition: 'A structured account of assets, actors, failure or attack paths, controls, and recovery expectations.' },
    { term: 'Complete mediation', definition: 'The requirement that every direct, retried, delegated, or resumed effect crosses current policy.' },
    { term: 'Evaluation fixture', definition: 'A controlled task environment with declared evidence and expected outcomes for reproducible tests.' },
    { term: 'Trace grader', definition: 'A check that evaluates observable agent and harness events rather than only the final response.' },
    { term: 'Canary rollout', definition: 'Limited deployment used to gather real evidence while constraining exposure and preserving rollback.' },
    { term: 'Rollback trigger', definition: 'A predefined observed condition that pauses or reverses rollout.' },
    { term: 'Transaction reconciliation', definition: 'Checking an external merchant or payment system after an uncertain outcome before retrying.' },
    { term: 'Excessive agency', definition: 'More functionality, permission, or autonomous action than the product goal requires.' },
  ],
} satisfies CourseTheoryChapter;
