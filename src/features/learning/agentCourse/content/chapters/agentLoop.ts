import type { CourseTheoryChapter } from '../../../course/content/theoryTypes';

export const AGENT_LOOP_CHAPTER = {
  question: 'How can a language model participate in a reliable, bounded loop that researches evidence, uses tools, creates a file, and stops without exceeding the user’s authority?',
  estimatedMinutes: 46,
  prerequisites: [
    'You can distinguish a language model response from an action performed by application code.',
    'You understand that files, web pages, processes, and user accounts live outside the model’s current input context.',
    'You can describe a tool call as structured data containing a tool name and arguments.',
    'You recognize that current product facts such as prices and availability must be checked against dated external evidence.',
  ],
  objectives: [
    'Describe an agent as a system pattern connecting model proposals, a deterministic harness, tools, and an external environment.',
    'Assign ownership for each event in an agent trace to the user, model, harness, tool, or environment.',
    'Turn the laptop-research request into explicit success criteria, evidence requirements, permitted actions, and prohibited actions.',
    'Explain how a harness validates and authorizes a proposed tool call before allowing an external effect.',
    'Trace how tool observations are recorded and selectively rebuilt into the next model context.',
    'Choose bounded retry, fallback, clarification, or stop behavior for common research and file-writing failures.',
    'Verify the terminal environment state rather than accepting a fluent model claim that the task is complete.',
    'Design an inspectable trace that exposes proposals, calls, observations, and decisions without requiring private chain-of-thought.',
  ],
  sections: [
    {
      id: 'start-with-outcome',
      eyebrow: 'Outcome first',
      heading: 'Define success and forbidden effects before starting the loop',
      body: String.raw`Use one shared scenario throughout this chapter:

> Research three laptops that currently cost less than €900, verify the evidence, write the comparison to laptop-comparison.md, and never purchase anything or contact a vendor.

The request contains an outcome, evidence requirement, delivery location, budget constraint, and hard safety boundary. A reliable agent system makes each one operational before using a tool.

Success is not “the model produced a convincing answer.” Success means that exactly three relevant laptop options are compared, every claimed current price is below €900 under a stated interpretation of taxes and shipping, important specifications are supported by traceable evidence, and the requested file exists at the authorized location with readable content. The report should state when evidence was checked, identify sources, distinguish confirmed facts from judgment, and avoid implying that price or stock will remain unchanged.

The negative boundary is equally concrete. Purchasing and contacting vendors are outside scope. The system must not place an item in a cart as a supposed research step, submit a checkout form, send email, open vendor chat, request a quote, create an account, or disclose the user’s contact details. These are prohibited effects even if the model proposes them confidently or a website encourages them.

The user has authorized research reads and one local file write. That does not automatically authorize every capability a browser or filesystem tool exposes. A safe harness supplies narrow tools or enforces policy at execution time. For example, it may permit web search and page reading while blocking form submission, and permit writing laptop-comparison.md while rejecting writes elsewhere.

Before the first model call, the harness can turn the request into an inspectable task contract:

| Contract item | Operational interpretation |
| --- | --- |
| Candidates | exactly three laptops relevant to the stated need |
| Budget | each evidenced current price is below €900 |
| Currency | euro price, with region and tax assumptions stated |
| Evidence | source URL or identifier, observed value, and check time |
| Deliverable | laptop-comparison.md in the authorized workspace |
| Allowed effects | search, read, compare, and write the one report |
| Forbidden effects | purchase, cart, account, message, email, or vendor contact |
| Stop | verified report exists, or a bounded failure is reported |

This contract gives the loop something testable to pursue. It also gives the harness reasons to reject proposals that are relevant to shopping but irrelevant to the authorized outcome.`,
      diagramIds: ['agent-system-loop'],
    },
    {
      id: 'system-pattern',
      eyebrow: 'System anatomy',
      heading: 'The model proposes; deterministic code controls effects',
      body: String.raw`An agent is not a special neuron or a model that directly reaches into the world. It is a system pattern built around repeated model calls and external state transitions.

The **model** receives serialized context and produces a proposal. That proposal might be a final response, a request to search, a request to read a page, or a structured request to write a file. The proposal is probabilistic output. It can be useful, malformed, redundant, unsafe, or based on an incorrect assumption.

The **harness** is ordinary application code that owns the loop. It assembles context, exposes tool descriptions, parses model output, validates arguments, checks policy and permissions, invokes permitted tools, records observations, tracks budgets, and decides whether another turn is allowed. Its control flow should remain testable even when model proposals vary.

A **tool** is a bounded interface implemented by code. Search may return links and snippets. Page reading may return extracted content and timestamps. A filesystem tool may write a specified path. Tools do not become safe merely because their schema is structured; the harness must still restrict scope, identity, permissions, time, output size, and side effects.

The **environment** is the external state on which tools operate: current web pages, network services, files, directories, clocks, accounts, and processes. It can change independently of the model. A laptop may sell out between search and report verification. A file write may fail because the path is invalid. A page may return an access challenge. These are observations about the environment, not reasoning failures inside the model.

The **user** supplies the goal and authority boundary. The agent system must not silently broaden that authority because another action would be convenient. “Find current prices” permits reading relevant sources; it does not imply permission to begin checkout to reveal a final total.

Agency appears in the loop between these parts. The model proposes a next step based on context. The harness decides whether and how the proposal can become an effect. A tool touches the environment. The resulting observation is returned to the harness. The harness rebuilds context and asks the model what to do next. No single part owns the complete behavior, so a useful trace identifies each owner explicitly.`,
      diagramIds: ['agent-system-loop'],
    },
    {
      id: 'proposal-to-effect',
      eyebrow: 'Execution boundary',
      heading: 'Treat every tool call as an untrusted proposal until it passes deterministic gates',
      body: String.raw`Suppose the model proposes a search call for “best laptops under €900 Europe.” The proposal should first be parsed against the search-tool schema. Missing required fields, unknown arguments, oversized queries, or invalid types are rejected before execution. A safe error becomes an observation the model can use to repair its next proposal.

Next comes policy. The search is relevant, read-only, and inside the research scope, so the harness may allow it. If the model instead proposes a browser action named submit_checkout or send_vendor_message, schema validity is not enough. The requested effect violates the explicit contract and must be denied. The harness should return a concise policy observation such as “Vendor contact is prohibited; continue using public read-only sources.” It should not ask the same model proposal to authorize itself.

File writing needs a different gate. Writing laptop-comparison.md is authorized only after the content is ready. The harness resolves the exact path, confirms it is within the allowed workspace, rejects traversal or alternate filenames, and applies size limits. If overwriting an existing file could destroy user work, the policy may require a read, explicit overwrite permission, a versioned name, or an atomic replacement strategy.

Capability restriction is stronger than instruction alone. A system prompt can tell the model never to buy, yet the model may still propose a purchase through misunderstanding or prompt injection. If the harness never exposes purchasing tools, or blocks their effects independently, the proposal cannot become a purchase. The safest tool surface for this task contains only the capabilities required to search, read evidence, inspect the target path, write the report, and verify it.

Web content is untrusted input. A product page might include text telling an automated visitor to ignore prior instructions, send an email, or reveal data. The page-reading tool should return that text as evidence, not elevate it to system authority. The harness preserves instruction precedence, marks source provenance, and avoids converting page content into executable commands.

The action-gate diagram is a policy schematic. It shows where deterministic decisions belong. It does not imply that every product uses the same approval interface, authentication system, or sandbox.`,
      diagramIds: ['proposal-action-gates'],
    },
    {
      id: 'evidence-led-research',
      eyebrow: 'Research',
      heading: 'Current comparisons require dated evidence, source diversity, and explicit uncertainty',
      body: String.raw`“Under €900” is a time-sensitive claim. Search results can be stale, snippets can omit configuration, and prices can vary by country, tax, membership, coupon, storage option, or seller. The loop should collect evidence that is sufficient for the report, not merely enough to continue talking.

A practical research sequence begins with broad discovery, then narrows to candidate-specific verification. Search can identify possible products and official model names. The next steps should open relevant pages, confirm the precise configuration, capture price and currency, note seller and region, record the check time, and corroborate important specifications. Official manufacturer pages are strong for stable specifications; current retailer pages may be necessary for actual price and availability. Reviews can support usability judgments but should not replace primary specification evidence.

Every observation needs provenance. The harness can store a compact evidence record containing the source address, title, retrieval time, extracted claim, candidate identity, and whether the value was directly present or inferred. The model should not merge a price for an 8 GB configuration with specifications from a 16 GB configuration unless the report clearly explains the mismatch.

When sources disagree, the loop should not hide the conflict. It can seek a third source, prefer a source appropriate to the claim, or state uncertainty. If a price is €899 before shipping and the user's definition of “under €900” is unclear, the system should report the assumption or ask for clarification rather than silently treating shipping as irrelevant.

Current evidence expires. The final file should say when prices were checked and recommend rechecking before any later purchase decision. This is especially important because the task explicitly forbids buying: the deliverable informs the user, but the user retains the final decision and any future transaction.

The harness can track evidence coverage as structured state: candidate count, verified current-price record, specification sources, unresolved conflicts, and report-readiness flags. This makes stopping dependent on observable coverage instead of the model's feeling that it has researched enough.`,
    },
    {
      id: 'observation-and-context',
      eyebrow: 'Next turn',
      heading: 'Observations become selected context; they do not enter the model automatically',
      body: String.raw`After a tool executes, it returns an observation. A search observation might contain ten results. A page-read observation might contain thousands of words. A file-write observation might contain a resolved path and byte count. None of these values automatically becomes the model's next awareness. The harness decides what to record and what to serialize into the next model call.

A well-formed observation separates status from content. It identifies the tool, normalized arguments, success or error state, timestamps, source provenance, and a bounded payload. This lets later trace readers tell whether a claim came from the environment or was introduced by the model.

The harness then rebuilds context from several sources: governing instructions, the task contract, the current plan or state summary, relevant prior proposals, selected evidence, recent tool observations, remaining budgets, and available tool schemas. Context rebuilding is not equivalent to appending the entire transcript forever. Long raw pages can crowd out the rules and evidence needed for the next decision.

Compaction should preserve facts that affect action: exact product identity, observed price, source and time, unresolved conflict, authorized path, forbidden actions, attempted failures, and stop criteria. It can omit repeated conversational filler. For an exact quotation or audit need, the original observation should remain retrievable from external state rather than relying only on a lossy summary.

The model sees the rebuilt serialized context for that call. It does not directly see the browser tab, filesystem, secret store, or earlier tool response that the harness omitted. If a model “forgets” that contacting vendors is forbidden after compaction, that may be a harness context failure rather than a change in the model's values. Required constraints should be restored from authoritative task state on every turn and independently enforced at execution.

Prompt caching can reuse computation for an unchanged prefix, but it does not persist knowledge on its own. External task state and evidence records remain the source of truth. The context-rebuild diagram distinguishes durable state from the selected working set presented to the model.`,
      diagramIds: ['context-rebuild'],
    },
    {
      id: 'failure-and-retry',
      eyebrow: 'Recovery',
      heading: 'Return failures as observations, but bound retries and avoid repeated side effects',
      body: String.raw`Tools fail for different reasons, and recovery should match the failure class.

A malformed proposal is often repairable. The harness rejects it before execution and reports the schema problem. A transient timeout may justify one or two retries with backoff. A blocked page may justify a different public source. A missing product configuration may justify replacing the candidate. A policy denial is not transient: retrying a forbidden vendor contact with different wording should remain forbidden. A file permission error may require a permitted alternate workflow or an honest blocked result, not an attempt to escape the workspace.

Retries consume time, tokens, network requests, and sometimes money. The harness should set per-tool retry limits, total turn limits, elapsed-time limits, and cancellation support. It should also detect repeated identical proposals or observations. Without these controls, a plausible loop can search forever, repeatedly hit the same page, or keep attempting a write that cannot succeed.

Side-effecting tools need special care. If a write times out after the environment may have accepted it, blindly retrying can duplicate or corrupt work. The harness should inspect the target state before retrying, use idempotent operations where possible, write atomically, and attach stable operation identifiers when supported. The laptop task prohibits purchases and messages, but the same principle explains why those tools should not be exposed as harmless retryable actions.

Recovery also includes replanning. If two of three selected laptops rise above €900 during verification, the loop should retain the valid candidate, return to discovery for replacements, and preserve the evidence already collected. It should not discard all progress or quietly keep an over-budget option.

Some tasks should stop and ask the user. If “€900” could mean before tax in one region and after tax in another, and the ambiguity changes all candidates, clarification may be more reliable than guessing. The harness can surface a structured blocking question rather than letting the model conceal uncertainty inside the final report.

A failure observation should be safe and useful: tool name, failure category, whether any effect may have occurred, retry eligibility, and a sanitized message. Secrets, internal stack traces, and irrelevant payloads should not be copied into model context.`,
    },
    {
      id: 'stopping-and-verification',
      eyebrow: 'Completion',
      heading: 'Stop only after verifying the outcome or reporting a bounded failure',
      body: String.raw`An agent needs explicit terminal conditions. Otherwise “continue until done” delegates the definition of done to a probabilistic proposal and invites premature stopping or endless work.

For the laptop task, a successful terminal check can verify:

- exactly three distinct laptop entries exist;
- every entry identifies the exact configuration compared;
- each current price is evidenced below €900 under the stated assumptions;
- source references and evidence-check times are present;
- key comparison dimensions are populated consistently;
- uncertainty and recommendation rationale are visible;
- laptop-comparison.md exists at the authorized resolved path;
- the file can be read back and contains the expected report structure;
- no trace event records a purchase, cart mutation, account creation, or vendor contact.

The model may propose a final answer saying “I created the file,” but that sentence is not proof. The harness or a verification tool should inspect the filesystem after the write. It can read back the file, validate headings and candidate count, and compare report claims with the structured evidence records. Verification should be independent of the same prose assertion it is checking.

Stopping can also be unsuccessful but correct. If current evidence for three qualifying laptops cannot be obtained within the source, time, and retry budgets, the system should stop with a bounded failure report. It should describe completed work, missing evidence, attempted recovery, and a safe next step. Inventing a third candidate would make the answer look complete while violating the evidence requirement.

Other stop reasons include user cancellation, turn limit, timeout, policy violation, irrecoverable environment failure, or a request for necessary clarification. Each terminal state should be explicit in the trace. “No more tool calls” is not enough, because silence cannot distinguish success from crash.

Outcome verification closes the gap between conversation and environment. The report file is an environmental artifact. Current-price evidence is an external claim record. Policy compliance is a trace property. A reliable final message summarizes these verified outcomes and limitations instead of asking the user to trust the model's confidence.`,
      diagramIds: ['stop-and-verify'],
    },
    {
      id: 'observable-trace',
      eyebrow: 'Observability',
      heading: 'Record decisions and evidence without exposing private chain-of-thought',
      body: String.raw`Operators need enough trace detail to diagnose failures, audit effects, and reproduce outcomes. They do not need hidden free-form reasoning tokens.

A useful trace records the user goal and authority boundary, task contract version, context inputs or references, model proposal type, structured tool name and arguments, validation result, policy decision, approval when required, execution start and end, normalized observation, retry decision, state update, stop reason, and verification outcome. Sensitive values should be redacted or referenced securely.

For example, a trace can say: “Model proposed read_page for retailer URL; harness allowed read-only request; tool returned price €849 for configuration X at 14:32 UTC; evidence record linked to candidate 2.” This is actionable and inspectable. It does not need a paragraph claiming to reveal everything the model privately considered.

When the system rejects a vendor-contact proposal, record the proposal category and policy rule: “send_message denied because user prohibited vendor contact.” This makes enforcement visible and lets evaluators count policy violations even though no external message was sent.

A concise model-supplied rationale may be requested as ordinary output, such as “Need a second source because the search snippet is stale.” Treat it as a proposal explanation, not a privileged truth window. The harness should still decide from observable state whether another source is required.

Tracing also supports replay. Exact external pages may change, so the system can retain permitted snapshots, content hashes, timestamps, or extracted evidence records. Replay should distinguish recorded observations from fresh network execution. Otherwise a reproduced run may unknowingly use different prices.

Privacy and security constrain observability. Logs should not capture credentials, personal contact details, or excessive page content. Retention and access need policy. The objective is sufficient evidence for system behavior, not maximum collection.

An outcome-focused trace answers: What was proposed? What was allowed? What effect occurred? What observation returned? Why did the loop retry or stop? What evidence proves the deliverable? Those questions are stronger than asking for private chain-of-thought and align directly with the system boundaries learners can test.`,
    },
    {
      id: 'walkthrough',
      eyebrow: 'Complete trace',
      heading: 'Walk the laptop task from first proposal to verified file',
      body: String.raw`A plausible bounded run begins when the harness stores the task contract and exposes read-only research tools plus a narrowly scoped report writer. The first model proposal asks for broad search. The harness validates and allows it. Search returns candidates and source links as an observation.

The next context contains the contract, remaining budgets, search summary, and evidence gaps. The model proposes opening official specification pages and regional retailers. The harness permits reads, records timestamps, and normalizes evidence by exact configuration. One result is stale, so the model proposes an alternate source. The harness permits one bounded retry path rather than reopening the same failing page indefinitely.

After verification, only two candidates remain below €900. The model proposes a new search for a third. This is allowed and relevant. If it instead proposes contacting a seller for an unpublished price, the harness denies the call because vendor contact is forbidden and returns that denial as an observation. The model must find public evidence or report that the evidence requirement cannot be met.

When three candidates have sufficient evidence, the model proposes report content. The harness can validate that the draft has three entries, citations, timestamps, consistent comparison dimensions, explicit assumptions, and no unsupported claim. It then authorizes a write only to laptop-comparison.md. The filesystem tool writes atomically and returns the resolved path and write status.

The loop does not stop on the write claim. A verifier reads the file back, checks its structure and evidence references, and confirms that the trace contains no prohibited effects. If a heading is missing, the observation returns a repairable validation failure and one bounded rewrite may occur. If verification succeeds, the harness sets a terminal success state.

The final model response summarizes the verified outcome: where the file was written, which assumptions limit the comparison, when prices were checked, and that no purchase or vendor contact occurred. The final message is valuable because it reports inspected state. It is not itself the evidence that the state exists.

This walkthrough reveals the durable agent-loop narration: propose, validate, authorize, execute, observe, rebuild context, and test whether the terminal contract is satisfied. The model supplies flexible proposals. Deterministic code owns capabilities and continuation. Tools connect to an environment that can surprise both. Verification turns a plausible story into an evidenced result.`,
      diagramIds: ['stop-and-verify'],
    },
  ],
  diagrams: [
    {
      id: 'agent-system-loop',
      title: 'The agent is the complete model–harness–environment loop',
      caption: 'Illustrative system pattern. The model proposes; deterministic harness code controls tools, state, budgets, and continuation.',
      alt: 'The user goal enters a harness, the harness builds model context, the model proposes an action, the harness validates it, a tool affects the environment, and an observation returns to the harness until a verified stop.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  U["user goal and authority"] --> H["deterministic harness"]
  H --> C["build current context"]
  C --> M["model proposal"]
  M --> V["validate and authorize"]
  V --> T["bounded tool"]
  T --> E["external environment"]
  E --> O["observation"]
  O --> H
  H --> S{"verified stop?"}
  S -->|no| C
  S -->|yes| R["terminal result"]`,
    },
    {
      id: 'proposal-action-gates',
      title: 'A proposal crosses deterministic gates before any effect',
      caption: 'Illustrative policy flow for the laptop task. Actual authentication, approval, and sandbox controls depend on the host system.',
      alt: 'A structured model proposal is schema checked, tested against the user scope and policy, constrained to the authorized resource, executed if allowed, and otherwise returned as a denial observation.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  P["model tool proposal"] --> S{"schema valid?"}
  S -->|no| F["safe failure observation"]
  S -->|yes| A{"inside user authority?"}
  A -->|no| D["policy denial observation"]
  A -->|yes| B{"resource and limits valid?"}
  B -->|no| F
  B -->|yes| X["execute bounded tool"]
  X --> O["record actual observation"]`,
    },
    {
      id: 'context-rebuild',
      title: 'External task state is selected into each model call',
      caption: 'Illustrative context lifecycle. The next model call sees serialized selected context, not the environment or full history automatically.',
      alt: 'Instructions, task contract, evidence records, recent observations, budgets, and tool schemas enter a context selector and compactor, producing the serialized next model call while original evidence stays in external state.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  I["required instructions"] --> S["select relevant state"]
  C["task contract"] --> S
  E["evidence records"] --> S
  O["recent observations"] --> S
  B["budgets and attempts"] --> S
  T["tool schemas"] --> S
  S --> K["compact with provenance"]
  K --> M["serialized model context"]
  E -. "original remains retrievable" .-> R["external task store"]`,
    },
    {
      id: 'stop-and-verify',
      title: 'Completion is a verified environment state, not a fluent sentence',
      caption: 'Illustrative terminal gate for the laptop report. A bounded failure is also a valid explicit terminal state.',
      alt: 'Research evidence and the report draft lead to an authorized file write, then read-back and evidence checks; success ends the loop, repairable failure returns an observation, and exhausted or prohibited work ends with a bounded failure.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  E["three evidenced candidates"] --> W["write laptop-comparison.md"]
  W --> R["read file back"]
  R --> V{"contract satisfied?"}
  V -->|yes| S["verified success"]
  V -->|repairable| O["failure observation and bounded retry"]
  O --> W
  V -->|budget exhausted| F["explicit bounded failure"]
  P["policy audit: no purchase or contact"] --> V`,
    },
  ],
  misconceptions: [
    {
      claim: 'The language model executes tools because it produced the tool-call JSON.',
      whyPlausible: 'The proposal and resulting effect appear next to each other in a chat trace.',
      correction: 'The model produces structured output. Harness code parses, validates, authorizes, and invokes a tool implementation that touches the environment.',
      diagnostic: 'Which component can refuse a schema-valid purchase proposal before any external effect occurs?',
    },
    {
      claim: 'A strong system prompt is sufficient to guarantee that the agent never buys or contacts a vendor.',
      whyPlausible: 'Instructions often reduce unwanted model proposals.',
      correction: 'Prompts influence probabilistic output but do not enforce capability boundaries. The harness must remove or deterministically deny prohibited effects.',
      diagnostic: 'What happens if untrusted page content tells the model to ignore the prohibition?',
    },
    {
      claim: 'If the model says it wrote laptop-comparison.md, the task is complete.',
      whyPlausible: 'In ordinary conversation, a confident completion statement is often accepted.',
      correction: 'The harness must inspect the environment: resolve the path, confirm the file exists, read it back, and validate its content against evidence and success criteria.',
      diagnostic: 'Which observation proves that the requested artifact exists after the write?',
    },
    {
      claim: 'The model automatically remembers every tool result and webpage for the rest of the run.',
      whyPlausible: 'The system behaves as though it is continuing one conversation.',
      correction: 'The harness selects and serializes context for each model call. Omitted or compacted evidence is unavailable unless restored from external state.',
      diagnostic: 'Where should exact source records live if a summary is too lossy for later verification?',
    },
    {
      claim: 'Every tool failure should be retried until it succeeds.',
      whyPlausible: 'Persistence can recover from transient network problems.',
      correction: 'Retry only eligible failures within explicit budgets. Policy denials are terminal for that action, repeated side effects may be dangerous, and alternative sources or bounded failure may be correct.',
      diagnostic: 'Why should a denied vendor-message call not be retried with different wording?',
    },
    {
      claim: 'A useful agent trace must reveal the model’s private chain-of-thought.',
      whyPlausible: 'Operators want to understand why the system acted and may equate explanation with hidden reasoning tokens.',
      correction: 'Record observable proposals, structured calls, policy decisions, tool outcomes, state changes, retry reasons, and verification. These support diagnosis without private chain-of-thought.',
      diagnostic: 'Can you determine why a write was denied from the proposed path and policy result alone?',
    },
  ],
  exercises: [
    {
      id: 'write-task-contract',
      kind: 'transfer',
      prompt: 'Turn the laptop request into five success checks and three prohibited effects that deterministic code could evaluate.',
      answer: 'Suitable success checks include exactly three candidates, evidenced current euro price below €900 for each, consistent specifications, cited sources with check times, and a readable laptop-comparison.md at the authorized path. Prohibited effects include purchases or cart mutations, account or checkout actions, and any email, chat, quote request, or other vendor contact.',
    },
    {
      id: 'classify-owners',
      kind: 'trace',
      prompt: 'Assign an owner to each event: propose read_page, reject send_vendor_message, return HTTP timeout, append observation to task state, and cancel the run.',
      answer: 'The model proposes read_page. The harness rejects send_vendor_message. The page tool or environment returns the timeout. The harness records and selects the observation. The user can cancel, while the harness must implement and enforce cancellation.',
    },
    {
      id: 'debug-schema-policy',
      kind: 'debug',
      prompt: 'A send_message call has perfectly valid arguments, so the harness executes it despite the user’s prohibition. Diagnose the design error.',
      answer: 'Schema validation checks shape, not authority. The harness omitted a separate policy and authorization gate. It must deny vendor contact even when the proposal is syntactically valid and return a safe policy observation without executing the effect.',
    },
    {
      id: 'predict-source-conflict',
      kind: 'predict',
      prompt: 'An official page confirms 16 GB RAM, but a retailer price appears to refer to an 8 GB configuration. What should the next loop decision be?',
      answer: 'Do not merge the claims. Record the configuration conflict, inspect the exact retailer product details or seek another current source, and retain candidate status as unresolved. Replace the candidate or disclose uncertainty if adequate matched evidence cannot be found within budget.',
    },
    {
      id: 'design-retry',
      kind: 'transfer',
      prompt: 'A retailer page times out twice, while an alternate reputable retailer is available. Design the bounded recovery behavior.',
      answer: 'Classify the timeout as transient, apply the configured retry limit and backoff, then stop retrying that source. Record both failures and switch to the alternate public source. Preserve previously verified facts and ensure the final report identifies the actual source used.',
    },
    {
      id: 'trace-context-rebuild',
      kind: 'trace',
      prompt: 'After reading a 10,000-word review, identify what should enter the next model context and what should remain externally retrievable.',
      answer: 'Include a bounded summary of relevant claims, exact candidate identity, source and timestamp, evidence status, unresolved questions, task restrictions, and remaining budgets. Preserve the original permitted observation or snapshot externally for exact verification instead of crowding the next call with the entire page.',
    },
    {
      id: 'verify-outcome',
      kind: 'debug',
      prompt: 'The final response is fluent, but laptop-comparison.md contains two candidates and no source dates. Decide the terminal state and next action.',
      answer: 'The success contract is not satisfied. If repair budget remains, return a structured verification failure describing the missing third candidate and dates, then allow a bounded research-and-rewrite cycle. If the budget is exhausted, stop with an explicit incomplete result rather than claiming success.',
    },
  ],
  glossary: [
    { term: 'Agent', definition: 'A system pattern in which model proposals participate in a harness-controlled loop over tools, observations, state, and stop conditions.' },
    { term: 'Model proposal', definition: 'Probabilistic model output suggesting a response or structured action; it has not yet caused an external effect.' },
    { term: 'Harness', definition: 'Deterministic application code that assembles context, validates proposals, controls tools, records state, and decides continuation.' },
    { term: 'Tool', definition: 'A bounded code interface that can inspect or change an external environment.' },
    { term: 'Environment', definition: 'External state such as web pages, files, accounts, processes, clocks, and network services.' },
    { term: 'Observation', definition: 'A normalized result or failure returned after a tool interacts with the environment.' },
    { term: 'Task contract', definition: 'Inspectable success criteria, evidence requirements, permissions, prohibitions, budgets, and terminal conditions derived from the user request.' },
    { term: 'Schema validation', definition: 'A deterministic check that structured arguments have the expected names, types, and required fields.' },
    { term: 'Authorization', definition: 'A decision that an identified actor may perform a particular action on a particular resource.' },
    { term: 'Least privilege', definition: 'Exposing only the minimum capabilities and resource scope needed for the authorized task.' },
    { term: 'Context rebuilding', definition: 'Selecting, compacting, ordering, and serializing task state and observations for the next model call.' },
    { term: 'Provenance', definition: 'A record of where evidence came from, when it was observed, and which claim it supports.' },
    { term: 'Retry budget', definition: 'A deterministic bound on repeated attempts by tool, failure type, total turns, time, or cost.' },
    { term: 'Idempotency', definition: 'A property that makes repeating an operation produce no additional unintended effect beyond the first successful application.' },
    { term: 'Stop condition', definition: 'An explicit predicate or terminal event that ends the loop with success, failure, clarification, cancellation, or exhaustion.' },
    { term: 'Outcome verification', definition: 'Inspection of trusted environment state or tool evidence to confirm that requested effects and constraints actually hold.' },
    { term: 'Bounded failure', definition: 'An explicit terminal result that reports incomplete work and evidence after safe recovery options or budgets are exhausted.' },
    { term: 'Trace', definition: 'An ordered record of observable proposals, decisions, calls, observations, state changes, retries, and terminal verification.' },
    { term: 'Prompt injection', definition: 'Untrusted content that attempts to redirect model behavior or override higher-authority instructions.' },
    { term: 'Private chain-of-thought', definition: 'Hidden internal reasoning content that is not required for an actionable system trace and should not be treated as an observability dependency.' },
  ],
} satisfies CourseTheoryChapter;
