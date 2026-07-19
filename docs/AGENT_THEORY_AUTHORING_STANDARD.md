# AI agent course theory authoring standard

The canonical AI Agents course teaches one system story from user intent to a verified terminal outcome. A chapter is not a slide transcript and not a glossary with connective prose. It must help a learner predict observable behavior, inspect evidence, make an engineering decision, and diagnose a failure.

## Course contract

Every lesson reuses this task:

> Research three laptops under €900, verify current evidence, and write `laptop-comparison.md`. Do not purchase anything or contact a vendor.

The learner follows the same runtime questions throughout:

1. What state and evidence does the harness have now?
2. What did the model propose?
3. Which deterministic boundary accepts, rejects, or transforms the proposal?
4. What observable effect occurred?
5. What evidence justifies continuing or stopping?

The main path avoids equations. Agent design is taught through state transitions, contracts, traces, control boundaries, counterexamples, and evaluation evidence. Mathematical notation belongs only where it materially improves an optional evaluation discussion.

## Minimum chapter requirements

Each canonical chapter must include:

- at least 2,400 meaningful words across at least eight coherent sections;
- a 20-minute or longer study-time estimate;
- at least four measurable learning objectives;
- at least four Mermaid diagrams with explicit provenance labels;
- at least seven retrieval, trace, debugging, or transfer exercises with reasoned answers;
- at least six plausible misconceptions, with a diagnostic question for each;
- a working glossary of at least ten terms;
- at least three primary or official sources;
- the shared scenario in mechanisms, failures, and exercises—not only in the opening paragraph;
- an explicit bridge from the preceding lesson and toward the next lesson.

## Ownership language

Chapters must distinguish these actors precisely:

- **model:** proposes text or structured actions from serialized context;
- **harness:** selects context, validates proposals, invokes tools, records observations, and enforces lifecycle rules;
- **tool:** implements a declared operation against an external system;
- **environment:** contains state that actions read or change;
- **evaluator:** maps traces and terminal state to evidence-backed scores;
- **human:** supplies intent, authority, approval, correction, or review where the system contract requires it.

Never say that the model directly browses, writes, purchases, remembers, or grants itself permission when application code owns that transition.

## Diagram and evidence rules

Each diagram must answer a concrete reading question and be labeled as one of:

- `exact educational calculation` for a deterministic worked result;
- `illustrative schematic` for a conceptual system arrangement;
- `live behavioral output` for a trace produced by a running implementation.

Do not depict unobservable private chain-of-thought. Show inputs, structured proposals, policy decisions, tool calls, observations, artifacts, errors, retries, and stopping evidence.

## Source policy

Prefer specifications, official platform documentation, original research, and first-party engineering reports. Record what each source supports instead of presenting a link dump. Volatile product behavior must be verified when a chapter is revised.

## Quality gate

The automated chapter-quality test checks structural minimums. Human review additionally asks:

1. Can the learner predict a changed outcome before reading the answer?
2. Are model behavior and deterministic application behavior kept separate?
3. Does the explanation name relevant failure modes and evidence?
4. Does every consequential action have an identifiable policy owner?
5. Does the chapter teach a reusable decision, not only a product feature?
6. Can a reader explain why the next lesson is necessary?
