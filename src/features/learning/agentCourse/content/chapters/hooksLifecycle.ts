import type { CourseTheoryChapter } from '../../../course/content/theoryTypes';

export const HOOKS_LIFECYCLE_CHAPTER: CourseTheoryChapter = {
  question: 'How can lifecycle hooks observe and control agent actions without becoming an unreliable substitute for permissions?',
  estimatedMinutes: 55,
  prerequisites: [
    'Distinguish an agent decision from a tool execution and its returned result.',
    'Recognize read-only operations and externally visible mutations as different risk classes.',
    'Understand that the laptop-report task authorizes research and synthesis but not purchase or seller contact.',
  ],
  objectives: [
    'Place pre-tool, post-tool, error, completion, and session hooks at the correct event boundaries.',
    'Explain which evidence exists before and after a tool call and what each hook can still control.',
    'Choose deliberately among allow, deny, transform, audit, and recover effects.',
    'Design idempotent hook behavior for duplicate delivery, retries, and re-entrancy.',
    'Select fail-open or fail-closed timeout behavior from the protected risk rather than convenience.',
    'Specify observable hook records that support reconstruction without leaking secrets.',
    'Explain why hooks complement least privilege and sandboxing instead of replacing them.',
  ],
  sections: [
    {
      id: 'hooks-lifecycle-orientation',
      eyebrow: 'Orientation',
      heading: 'A hook runs at a named boundary in an observable lifecycle',
      diagramIds: ['hooks-lifecycle-map'],
      body: String.raw`Return to the shared task: the user wants a source-backed laptop comparison report. The parent agent delegates specification research, review collection, and an audit, but nobody is authorized to buy a laptop or contact a seller. Lifecycle hooks can help the system enforce and observe that workflow.

A **hook** is code registered to run when a defined event occurs. It is not another paragraph in the agent prompt and not an invisible intuition the model is expected to remember. A pre-tool hook can inspect an intended tool call before execution. A post-tool hook can inspect the result after execution. Error, completion, and session hooks respond to broader state changes. The host defines what fields each event carries, what modifications are permitted, and whether execution waits for the hook.

Timing determines both evidence and control. Before a retailer-page request, the system knows the tool name, proposed URL, agent identity, task contract, and arguments. It does not yet know the HTTP response or whether the page contains a current price. After the request, it can inspect status, resolved URL, content metadata, and latency, but it cannot make the network request unhappen. A post-hook can reject the result from downstream use; it cannot erase an external side effect that already occurred.

For the laptop task, a pre-tool policy can allow public manufacturer and review reads, deny cart or checkout actions, normalize an approved regional URL, and record the decision. A post-tool hook can label a source as manufacturer, retailer, or review; detect missing configuration details; redact accidental session data; and attach an access timestamp. A completion hook can verify that every finalist has required evidence before accepting the research packet.

The quality target is observable behavior. We should be able to answer: Which event fired? What evidence did the hook receive? Which policy version made the decision? Did it allow, deny, transform, audit, or recover? How long did it take? What happened next? If those questions cannot be reconstructed, the hook is an anecdote rather than a dependable control.`,
    },
    {
      id: 'hooks-evidence-and-timing',
      eyebrow: 'Event model',
      heading: 'Use only evidence available at the event’s actual time',
      body: String.raw`A lifecycle design should start with an event inventory. For each event, list the triggering condition, available evidence, permitted effect, waiting behavior, and next state. This prevents a pre-hook from pretending it knows a future result or a completion hook from attempting to block an action that already happened.

At **session start**, the system may know the authenticated user context, course task, workspace, enabled tools, and policy versions. It can initialize a correlation ID, declare a read-only research mode, and create an audit scope. It should not claim that sources were verified before any research occurred.

At **pre-tool**, it knows proposed intent as structured arguments. It can check whether a URL is allowed, whether a filesystem path falls inside a scratch directory, and whether the tool category is read-only. It may allow, deny, or safely transform the proposed call. Evidence remains prospective: an argument named “productPage” does not prove the resolved page is a product page.

At **post-tool**, it knows the tool’s declared result and execution metadata. It can test content type, response status, source identity, date, configuration, and result size. It can prevent untrusted or malformed content from entering the evidence ledger. It cannot safely assume the result is truthful merely because the tool succeeded.

At **tool error**, it knows an error category, message, attempt number, and perhaps whether the host can establish that no mutation occurred. A read-only timeout can support a narrow retry. An ambiguous mutation timeout must not be retried automatically because the action may have succeeded remotely. In this course scenario mutations remain prohibited, so the pre-hook should prevent reaching that ambiguity.

At **task completion**, the system has a proposed deliverable, recorded events, and terminal task status. It can check coverage and provenance before accepting the packet. At **session end**, it can close telemetry, summarize denied calls, and report incomplete tasks. Session end is too late to enforce a purchase prohibition; it is an audit boundary, not a time machine.

The laptop lab should show event payloads progressively. Learners predict what is knowable, trigger the event, then compare. This makes timing a practical evidence discipline rather than a list of callback names.`,
    },
    {
      id: 'hooks-pre-tool',
      eyebrow: 'Before execution',
      heading: 'Pre-tool hooks decide whether the proposed call may proceed',
      diagramIds: ['hooks-pretool-decisions'],
      body: String.raw`A pre-tool hook sits at the last controlled boundary before a tool begins. Its strongest advantage is prevention. In the laptop workflow, it can recognize a public read of an official specification page and allow it. It can recognize an attempted “add to cart,” payment, reservation, or seller-message operation and deny it before any request is sent.

An **allow** decision should mean that the structured call satisfies the relevant policy, not that the hook believes the eventual content. The resulting source still needs post-tool validation. The allow record should name the matched rule and policy version so later reviewers know why execution proceeded.

A **deny** decision should be explicit and actionable. “Denied: the user authorized research only; cart and checkout mutations are outside scope” helps the parent recover by continuing research. A generic error may encourage repeated attempts or prompt workarounds. Denial must terminate or redirect the proposed action without letting the original call race ahead.

A **transform** decision replaces arguments before execution. Safe examples include removing tracking parameters from an approved public URL, normalizing a locale, limiting a search result count, or redirecting writes into the assigned research folder. Transformation is powerful because the executed action is no longer exactly what the agent proposed. The hook must revalidate the complete transformed call, show the diff in its record, and avoid silently changing user intent. It must never transform “compare this product” into “buy this product.”

An **audit-only** pre-hook records the proposal and lets it continue. This is appropriate for low-risk telemetry or during policy evaluation, but it is not enforcement. A dashboard warning after allowing checkout is still a checkout attempt. Use audit mode only when another mechanism already enforces the hard boundary or when the event is genuinely low risk.

Pre-hooks should inspect structured fields rather than brittle natural-language guesses. Tool identity, operation type, URL host, HTTP method, filesystem path, recipient, and declared mutation flag are stronger inputs than scanning a free-form description for the word “buy.” Attackers and accidental variants can avoid keywords; typed capability boundaries are more dependable.

Finally, keep the decision fast and deterministic where possible. Every synchronous pre-hook adds latency to the call path. Network-dependent policy checks introduce new failures and need an explicit timeout strategy.`,
    },
    {
      id: 'hooks-post-tool',
      eyebrow: 'After execution',
      heading: 'Post-tool hooks validate evidence and control downstream use',
      body: String.raw`A successful tool invocation does not guarantee a useful or safe result. A page may redirect to another region, return an obsolete model, contain an embedded prompt injection, omit tax, or expose account information. Post-tool hooks inspect returned evidence before it is admitted to the research packet.

For an official specification lookup, the post-hook can record the final URL, access time, model configuration, document date, and source class. It can reject a page for the wrong screen size or mark a weight value unresolved when the configuration is ambiguous. For independent reviews, it can distinguish a measured battery test from a manufacturer claim repeated in prose. These labels make later synthesis more accurate.

A post-hook may **transform the result** by normalizing units, extracting structured fields, truncating oversized content, or redacting secrets. Preserve the raw reference or digest and record the transformation so evidence does not appear to have arrived in its final form. Unit conversion should retain the original value and unit. Redaction should remove session tokens and personal data without erasing source context needed for verification.

A post-hook may also **quarantine** a result: the request occurred, but downstream agents cannot treat its content as trusted evidence. Quarantine is appropriate when source identity is unknown, markup contains suspicious instructions, or required provenance is absent. The agent can receive a typed explanation and seek another source.

What a post-hook cannot do is undo the call. If a tool had purchased the laptop, a post-hook denial would be too late. It might initiate a separately authorized recovery procedure, such as cancellation, but recovery is another external action with its own checks and uncertain outcome. This is why prevention belongs in permissions and pre-execution controls.

The post-hook also should not convert absence into proof. A retailer page that omits Linux compatibility does not prove incompatibility. The evidence status is “not stated on this source.” Similarly, a timeout does not prove a product is unavailable. Observable status categories—verified, conflicting, missing, quarantined—are more useful than fabricated certainty.

In the lab, compare the raw tool result, hook record, and admitted evidence row. The learner should be able to explain every difference and identify which claims remain unsupported.`,
    },
    {
      id: 'hooks-session-completion-error',
      eyebrow: 'Broader lifecycle',
      heading: 'Session, completion, and error hooks coordinate work beyond one call',
      body: String.raw`Tool hooks see one operation. Session and task hooks see broader boundaries. At session start, the laptop workflow can initialize a unique run identifier, capture the user-authorized goal, load the read-only policy, and record the exact comparison date and region. This produces consistent context for every later event.

A task-completion hook checks the proposed terminal result against a contract. The official-spec agent should not become “completed” if two finalists lack source links. It may instead become “partial,” naming the missing fields. The review agent should separate measurements from impressions and disclose blocked sources. Completion validation improves truthfulness by making incompleteness representable.

The parent-completion hook can require a claim ledger, verified recommendation-changing constraints, dated prices, disclosed conflicts, and confirmation that no purchases or messages occurred. It should avoid rewriting the entire report inside the hook; large creative transformations are hard to observe and can conceal provenance. Return focused validation failures to the parent for correction.

Error hooks classify failures and choose a bounded recovery. A public read that returns a temporary server error may be retried with delay. A permanent not-found result should lead to an alternate official source. A parser failure can preserve the raw page and route it for manual extraction. A policy denial is not a transient tool error and should not be retried with synonyms or another connector.

Session-end hooks close spans, summarize event counts, identify unfinished tasks, and release local resources. They should tolerate partial state because sessions can end after cancellation or failure. Cleanup should itself be idempotent: repeated end delivery must not delete unrelated artifacts or send duplicate notifications.

Broader hooks can also create undesirable hidden coupling. If session start silently edits prompts, completion silently publishes reports, or error hooks launch unrestricted agents, it becomes difficult to understand who performed an action. Keep effects narrow, typed, and recorded. Lifecycle automation should make the workflow more inspectable, not create a second invisible agent behind the agent.`,
    },
    {
      id: 'hooks-effects-and-recovery',
      eyebrow: 'Control effects',
      heading: 'Allow, deny, transform, audit, and recover have different consequences',
      body: String.raw`Hook systems often expose several effect types. Treat them as different contracts rather than interchangeable callback returns.

**Allow** authorizes this proposed operation under a named policy. **Deny** prevents it and returns a reason. **Transform** substitutes a validated call or result. **Audit** records an observation without controlling execution. **Recover** responds to a failure with a retry, fallback, partial result, or compensating workflow. Each effect should be visible in the event record.

For laptop research, allow a read of the manufacturer specification page; deny adding the product to a cart; transform a public URL to remove a tracking query; audit request latency; recover from a read timeout by trying an approved mirror or returning a partial packet. These examples differ in authority and timing.

Recovery needs the narrowest possible scope. If one review page fails, retry that page or substitute another source; do not restart every subagent. If a parser fails, preserve the source and mark extraction incomplete. A fallback must meet the same evidence rules. Switching from an unavailable manufacturer document to an anonymous comparison blog may restore data flow but reduce evidence quality; the result contract must show the downgrade.

Never recover from a policy denial by searching for an unguarded tool. A denied purchase is a successful safety decision, not an obstacle to route around. Likewise, an agent should not reinterpret “deny” as a request for differently worded arguments.

Transformations and recovery can recursively trigger hooks. A hook that redirects a URL may cause another pre-tool event; a retry causes another attempt event. The host needs a depth or attempt limit, a parent event ID, and a way to distinguish original from derived calls. Otherwise a normalization hook can loop forever between two equivalent forms.

The lab should display the effect before showing the next state. Learners can then verify that deny has no tool-execution child, transform executes only the transformed arguments, audit leaves the call unchanged, and recovery creates an explicitly linked attempt. These are observable behavioral tests, not implementation promises.`,
    },
    {
      id: 'hooks-idempotence',
      eyebrow: 'Reliability',
      heading: 'Hooks must tolerate duplicate delivery and re-entry',
      body: String.raw`Distributed systems can deliver events more than once. A host may retry after losing an acknowledgement, a process may restart, or an error hook may replay a task. If hook effects are not idempotent, duplicate delivery can duplicate log rows, rewrite artifacts inconsistently, consume quota, or trigger repeated external actions.

An idempotent hook produces the same effective state when the same event is handled again. Give every event a stable ID and every derived operation a key based on that ID and effect type. Store whether the decision has already been committed. Replaying an audit event can return the recorded decision rather than append a second indistinguishable entry.

Pure checks are easiest: given the same policy version and normalized input, they return the same allow or deny decision. Time, remote lookups, and mutable configuration can break determinism. Record the policy snapshot and relevant evidence so a replay does not quietly apply a different rule while claiming to be the same decision.

Transform hooks need canonical output. A URL sanitizer should not add a slash on one pass and remove it on the next. Applying the transformation twice should stabilize. Result normalizers should not repeatedly convert units or truncate already truncated text.

Recovery hooks need attempt numbers and upper bounds. If an official page repeatedly times out, the hook might allow two read-only retries before returning partial status. A recovery-generated call should carry the original event ID so pre-hooks know the lineage and avoid an infinite loop.

In the laptop workflow, external mutations remain forbidden, but idempotence still matters. Duplicate completion events should not overwrite an accepted report with an earlier partial version. Duplicate session-end events should not remove the shared evidence directory twice. Duplicate audit records should be deduplicated without losing the fact that delivery was retried.

Test idempotence deliberately in the lab by replaying the same pre-tool, post-tool, and completion events. Compare event counts, artifact hashes, and terminal state. A system that succeeds only when every event is delivered exactly once is fragile even when its happy-path demo looks correct.`,
    },
    {
      id: 'hooks-timeouts-failure-policy',
      eyebrow: 'Failure policy',
      heading: 'Choose fail-open or fail-closed from the protected risk',
      diagramIds: ['hooks-timeout-policy'],
      body: String.raw`A synchronous hook can time out, crash, or lose access to its policy service. The host must decide whether the guarded operation continues. There is no universally correct default; the answer depends on what the hook protects.

**Fail-closed** means the operation does not proceed when the control cannot decide. Use it for high-impact actions, access to sensitive data, writes outside the assigned scope, and any operation resembling purchase, payment, reservation, or outbound messaging. In the laptop scenario, purchase is prohibited regardless, so a failed policy hook must never let it through.

**Fail-open** means the operation continues while the hook failure is recorded. This can be reasonable for optional telemetry around an already permitted public read, especially when a stronger permission layer independently ensures that the call cannot mutate external state. Losing a latency metric should not necessarily block source research.

Some events support a degraded mode. If a post-tool classifier times out, quarantine the result rather than admit it or halt the whole session. If completion validation is unavailable, mark the task pending review rather than claim success. These options are often safer and more usable than a binary global default.

Timeout values should include a latency budget and a clear terminal effect. A pre-hook that waits unpredictably can make every tool appear broken. A post-hook that times out after the raw result is available needs a state such as “executed, validation pending.” The parent should see the distinction.

Do not confuse availability with authority. Teams sometimes fail-open because blocking users is inconvenient, even when the hook is the only purchase guard. The correct response is to move the hard prohibition into a durable permission or sandbox boundary, then let noncritical hook layers degrade safely. Hooks should not be the single fragile lock on an irreversible action.

The lab can inject timeouts into an audit hook, source-validation hook, filesystem guard, and hypothetical checkout guard. Learners choose a policy, predict the next state, and justify the decision from impact and independent controls.`,
    },
    {
      id: 'hooks-observability',
      eyebrow: 'Evidence',
      heading: 'Observability should reconstruct the decision without exposing secrets',
      body: String.raw`A useful hook record links cause to effect. Include event ID, parent event ID, session and task IDs, agent identity, lifecycle phase, timestamp, tool and operation category, normalized resource, policy version, effect, reason code, duration, and next state. For transformations, record a safe diff. For retries, record attempt and lineage.

Laptop source events should also preserve evidence metadata: final host, access time, region, model configuration, source class, and admitted or quarantined status. This lets the parent explain why a specification entered the claim ledger and why another page was rejected.

Do not log raw credentials, cookies, authorization headers, payment details, full private prompts, or unnecessary personal information. Hashes, redacted fields, and typed categories can support correlation without copying secrets. Access to audit logs should itself be controlled because a complete action history can be sensitive.

Metrics reveal systemic behavior. Count allows, denies by reason, transformations, quarantines, retries, hook timeouts, and completion failures. Track latency percentiles for synchronous hooks and alert on unusual denial or bypass patterns. A sudden fall to zero deny events may indicate perfect behavior—or that the hook stopped firing. Pair metrics with heartbeat or coverage signals.

Logs should distinguish proposed, executed, and admitted actions. The pre-event records what the agent asked to do. The tool event records what actually ran after transformation. The post-event records whether the result entered downstream context. Without those stages, a reviewer may mistake a denied proposal for an executed call or an executed but quarantined page for trusted evidence.

Provenance labels remain essential. Lab events and laptop data can be exact educational fixtures, recorded local tool events, or live behavioral outputs. Do not invent a hook trace and attribute it to a production system. A screenshot of the dashboard supports what the dashboard displayed; it does not prove an external side effect did or did not occur without corresponding system evidence.`,
    },
    {
      id: 'hooks-defense-in-depth-summary',
      eyebrow: 'Synthesis',
      heading: 'Hooks complement permissions, sandboxing, and parent verification',
      diagramIds: ['hooks-defense-layers'],
      body: String.raw`Hooks are flexible because they can use task context and event details. That flexibility also makes them a poor sole security boundary. A hook can crash, time out, be misconfigured, miss an uninstrumented tool path, or interpret ambiguous arguments incorrectly. Static permissions and sandboxing should prevent entire classes of action even if no hook runs.

For the laptop report, the tool capability set should omit purchase and messaging operations. Filesystem permissions should restrict agents to assigned research paths. Network policy can limit destinations or methods where appropriate. Pre-hooks add task-aware checks, transformations, and explanations. Post-hooks validate evidence. Completion hooks enforce deliverable contracts. The parent verifies decisive claims and the absence of unauthorized effects.

These layers answer different questions:

- **Permission:** may this identity use this capability at all?
- **Sandbox:** what resources can the process technically reach or modify?
- **Pre-hook:** is this proposed use allowed for this task and argument set?
- **Post-hook:** is the returned result safe and fit for downstream use?
- **Completion hook:** does the artifact meet its contract?
- **Parent review:** does the evidence support the user-facing conclusion?

In the lab, trace one allowed specification read, one transformed tracking URL, one quarantined mismatched model page, one timed-out review fetch, and one denied cart operation. For every event, identify available evidence, effect, next state, and audit record. Replay an event to test idempotence and disable a noncritical audit hook to observe the declared failure mode.

The laptop report remains the terminal artifact. No hook, retry, recovery, or subagent may convert it into a purchase. If the user later explicitly requests a purchase, that is a new authority-sensitive workflow requiring exact item, configuration, price, seller, delivery details, confirmation, and durable transaction controls—not a transformed research call.

The durable lesson is that lifecycle hooks are timed interfaces. Their value comes from knowing precisely when they run, what they can observe, what they can still prevent, and how their effects are recorded. Put hard limits underneath them, use them for contextual policy and evidence handling, and keep the parent responsible for final verification.`,
    },
  ],
  diagrams: [
    {
      id: 'hooks-lifecycle-map',
      title: 'Evidence and control change across the hook lifecycle',
      caption: 'Pre-tool can prevent execution; post-tool can validate downstream use; completion and session hooks inspect broader terminal state.',
      alt: 'Sequence from session start through pre-tool, tool execution, post-tool, completion, and session end, with an error branch after execution.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  S[Session start] --> PRE[Pre-tool hook]
  PRE --> TOOL[Tool execution]
  TOOL --> POST[Post-tool hook]
  TOOL --> ERR[Error hook]
  POST --> DONE[Completion hook]
  ERR --> DONE
  DONE --> END[Session end]`,
    },
    {
      id: 'hooks-pretool-decisions',
      title: 'A pre-tool hook has explicit control effects',
      caption: 'Allow executes unchanged, transform executes revalidated arguments, deny stops, and audit records without controlling.',
      alt: 'Proposed laptop tool call branches through allow, deny, transform, and audit decisions, with only allowed or validated transformed calls reaching execution.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  C[Proposed tool call] --> H[Pre-tool policy]
  H -->|allow| E[Execute original call]
  H -->|transform| V[Revalidate transformed call]
  V --> E2[Execute transformed call]
  H -->|deny| D[Stop with reason]
  H -->|audit only| A[Record and continue]`,
    },
    {
      id: 'hooks-timeout-policy',
      title: 'Timeout policy follows impact and independent controls',
      caption: 'High-impact or uniquely guarded actions fail closed; optional telemetry around already safe reads may fail open; uncertain evidence can be quarantined.',
      alt: 'Hook timeout decision tree separates purchase or mutation, public read telemetry, and evidence validation into deny, continue with audit gap, or quarantine outcomes.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart TB
  T[Hook timeout] --> R{What is protected?}
  R -->|purchase mutation or secret| C[Fail closed]
  R -->|optional telemetry on permitted read| O[Fail open and record gap]
  R -->|result trust decision| Q[Quarantine pending validation]
  C --> D[Do not execute]
  O --> E[Execute under stronger permission layer]
  Q --> P[Do not admit result yet]`,
    },
    {
      id: 'hooks-defense-layers',
      title: 'Hooks are one layer in a defensible workflow',
      caption: 'Permissions and sandboxing constrain capability; hooks apply contextual control and evidence checks; the parent verifies the report.',
      alt: 'Layered flow from permissions and sandbox through pre-hook, tool, post-hook, completion validation, and parent verification to the laptop report.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  P[Least-privilege tools] --> S[Sandbox and resource scope]
  S --> PRE[Contextual pre-hook]
  PRE --> TOOL[Read-only research tool]
  TOOL --> POST[Evidence post-hook]
  POST --> C[Completion contract]
  C --> V[Parent verification]
  V --> R[Laptop report only]`,
    },
  ],
  misconceptions: [
    {
      claim: 'A post-tool hook can prevent an external action after seeing its result.',
      whyPlausible: 'The hook can reject the result and return an error to the agent.',
      correction: 'It can prevent downstream use, but execution already occurred. Prevention belongs before execution and in durable capability controls.',
      diagnostic: 'If a server accepted an order, does hiding its response cancel the order?',
    },
    {
      claim: 'Hooks replace permissions because their rules can be more contextual.',
      whyPlausible: 'A hook can inspect task, arguments, user, and policy at runtime.',
      correction: 'Hooks can fail, time out, or miss paths. Permissions and sandboxing constrain capability independently; hooks add contextual decisions and evidence handling.',
      diagnostic: 'What protects the system when the hook process is unavailable?',
    },
    {
      claim: 'Fail-open is acceptable whenever blocking would inconvenience the user.',
      whyPlausible: 'Availability is visible immediately, while safety failures may seem unlikely.',
      correction: 'Failure policy follows impact and independent controls. High-impact actions fail closed; only noncritical layers around already safe operations may fail open.',
      diagnostic: 'Should a failed purchase guard permit checkout merely to preserve uptime?',
    },
    {
      claim: 'A timeout proves the tool action failed.',
      whyPlausible: 'The caller received no successful response before its deadline.',
      correction: 'The remote system may have accepted the action. Timeouts bound waiting, not external reality, so ambiguous mutations must not be blindly retried.',
      diagnostic: 'Can a response be lost after the server commits an operation?',
    },
    {
      claim: 'Audit mode enforces policy because every call is logged.',
      whyPlausible: 'Violations become visible in a dashboard and can trigger alerts.',
      correction: 'Audit records but does not prevent. A separate deny decision, permission boundary, or sandbox must enforce prohibitions.',
      diagnostic: 'Does recording a cart request stop it from reaching the retailer?',
    },
    {
      claim: 'Hooks run exactly once in a reliable order, so idempotence is unnecessary.',
      whyPlausible: 'A local happy-path callback often appears exactly once.',
      correction: 'Retries, restarts, lost acknowledgements, and recovery calls can duplicate or re-enter events. Stable IDs and idempotent effects are required.',
      diagnostic: 'What happens if the completion acknowledgement is lost and the host replays the event?',
    },
  ],
  exercises: [
    {
      id: 'hooks-event-timing',
      kind: 'trace',
      prompt: 'For a manufacturer-page request, list two facts available to the pre-tool hook and two first available to the post-tool hook.',
      answer: 'Pre-tool can know the proposed URL, method, tool identity, task, and agent. Post-tool first knows the resolved URL, response status, returned content, content type, and latency. It would be invalid for the pre-hook to claim the page actually contains the intended model.',
    },
    {
      id: 'hooks-effect-choice',
      kind: 'transfer',
      prompt: 'Choose allow, deny, transform, or audit for: public specification read; add to cart; remove tracking parameters; latency metric.',
      answer: 'Allow the approved public read, deny add-to-cart because research does not authorize purchase, transform the URL by removing tracking parameters and revalidate it, and audit latency without changing execution.',
    },
    {
      id: 'hooks-post-limit',
      kind: 'debug',
      prompt: 'A design permits checkout and relies on a post-hook to reject unauthorized purchase results. Diagnose the failure.',
      answer: 'The external mutation occurs before the post-hook. Rejecting its result cannot undo it. Remove purchase capability, enforce least privilege and sandbox policy, and deny any mutation at pre-execution boundaries.',
    },
    {
      id: 'hooks-timeout-policy',
      kind: 'predict',
      prompt: 'Predict the safe outcome when an optional latency hook times out during a permitted public read, and when the only mutation guard times out.',
      answer: 'The optional metric may fail open if stronger controls already guarantee a safe read, while recording the observability gap. The unique mutation guard must fail closed. Better still, permissions should independently remove the mutation capability.',
    },
    {
      id: 'hooks-idempotence',
      kind: 'debug',
      prompt: 'Replaying one completion event creates two final report files and two notifications. What controls are missing?',
      answer: 'The event needs a stable ID, a recorded committed outcome, and idempotent file or notification keys. On replay, the hook should return the existing result rather than repeat effects. Notification is an external action and would require separate authorization.',
    },
    {
      id: 'hooks-result-quarantine',
      kind: 'transfer',
      prompt: 'A successful page fetch resolves to the wrong laptop configuration. What should the post-hook do and record?',
      answer: 'Quarantine or reject the result from the evidence ledger, record proposed and final URLs, expected and observed configuration, reason code, policy version, and next action. It should not report the expected configuration as verified.',
    },
    {
      id: 'hooks-observability',
      kind: 'trace',
      prompt: 'Name the event fields needed to reconstruct why a transformed call executed.',
      answer: 'Include event and parent IDs, session, task and agent IDs, timestamp, lifecycle phase, original normalized arguments, safe transformation diff, transformed arguments, policy version, effect and reason, duration, executed call ID, and next state. Redact secrets.',
    },
    {
      id: 'hooks-defense-depth',
      kind: 'transfer',
      prompt: 'Assign one responsibility each to permission, sandbox, pre-hook, post-hook, completion hook, and parent review in the laptop workflow.',
      answer: 'Permission omits purchase tools; sandbox restricts resources and writable paths; pre-hook checks task-specific proposed reads; post-hook validates and labels evidence; completion enforces packet coverage; parent verifies decisive claims and synthesizes the report.',
    },
  ],
  glossary: [
    { term: 'lifecycle hook', definition: 'Code registered to run at a defined event boundary in an agent or tool workflow.' },
    { term: 'pre-tool hook', definition: 'A hook that inspects and may control a proposed tool call before execution.' },
    { term: 'post-tool hook', definition: 'A hook that inspects a completed tool result and controls its downstream admission or representation.' },
    { term: 'session hook', definition: 'A hook at a broader session start or end boundary, often used for initialization, correlation, audit, and cleanup.' },
    { term: 'completion hook', definition: 'A hook that validates a proposed terminal task artifact and status against a result contract.' },
    { term: 'allow', definition: 'A control effect authorizing the proposed operation under a named policy.' },
    { term: 'deny', definition: 'A control effect preventing an operation and returning a structured reason.' },
    { term: 'transform', definition: 'A recorded substitution of validated call arguments or result content.' },
    { term: 'audit', definition: 'Recording an event or decision without preventing or changing execution.' },
    { term: 'recover', definition: 'A bounded response to failure such as narrow retry, fallback, partial result, or separately authorized compensation.' },
    { term: 'quarantine', definition: 'Keeping an executed result out of trusted downstream use until validation succeeds.' },
    { term: 'idempotence', definition: 'The property that repeated handling of the same event produces the same effective state without duplicated effects.' },
    { term: 'fail-open', definition: 'Continuing the guarded operation when a control cannot decide, appropriate only under an explicit low-risk policy and stronger controls.' },
    { term: 'fail-closed', definition: 'Preventing the operation when a control cannot decide, appropriate for high-impact or uniquely guarded actions.' },
    { term: 'correlation ID', definition: 'A stable identifier linking events, derived calls, retries, and results within one workflow.' },
    { term: 'policy version', definition: 'The exact rule-set revision used to produce a hook decision.' },
    { term: 'defense in depth', definition: 'Using independent layers such as permissions, sandboxing, hooks, and verification so one failure does not remove all protection.' },
  ],
};
