# AI Learning Lab content inventory

This document is the explicit extraction contract for the standalone application. The `/learn/` home page links to a complete materials index for each course, while each canonical lesson itself owns its teaching moments, activity, long-form theory, and assessment. Presentation is a rendering mode of that lesson content, not a separate course hidden behind the materials index.

Every canonical lesson owns four teaching moments exposed through an optional visual introduction:

1. **Hook** — establishes the question and makes the learner predict an outcome.
2. **Mechanism** — introduces the smallest model needed to perform the activity.
3. **Practice brief** — frames the activity, its controls, and what evidence to collect.
4. **Debrief** — interprets the observed result, corrects likely misconceptions, and connects forward.

The same stable `lesson/moment` identifiers drive the in-lesson modal and full-screen presentation mode. Presenter notes, discussion prompts, and timing cues remain contextual metadata on those moments. They do not create a second content sequence or depend on numeric deck positions.

## Canonical LLM learner path

`/learn/how-llm-works/course/prediction-goal` starts a ten-lesson journey that follows one sentence through transformer inference:

1. Prediction goal
2. Tokenization
3. Token and position embeddings
4. Transformer block
5. Attention
6. Residual stream
7. Language-model head
8. Generation and KV cache
9. Learning
10. Capstone reconstruction

Each lesson is one learner flow: question, representation change, optional visual introduction, experiment, plain-language explanation, misconception correction, checkpoint, and forward bridge. The modal introduction pages through the hook, mechanism, practice brief, and debrief without inserting them into the reading document. Optional notation and annotated sources stay behind quiet disclosures. Full-screen presentation mode renders the same lesson-owned moments and reveals contextual presenter notes where appropriate. Browser-local completion state records progress. The deterministic glass-box lane and live Bonsai evidence remain explicitly distinguished inside the relevant explanations.

The existing 19 labs remain directly addressable as the deeper exercise library. Semantic retrieval and neural-learning/vision remain optional branches rather than interruptions in the core transformer story.

## Canonical AI Agents learner path

`/learn/how-ai-agent-works/course/agent-loop` starts an eight-lesson journey that follows one bounded research task through an agent runtime:

1. Controlled agent loop
2. Subagent delegation contracts
3. Context harness
4. Memory and instruction placement
5. Lifecycle hooks
6. Tool and permission boundaries
7. Agent evaluations
8. Complete-system capstone

Every lesson reuses the goal to research three laptops under €900 and write `laptop-comparison.md` without purchasing or contacting a vendor. The recurring scenario makes ownership visible: the model proposes, the harness selects context and mediates effects, tools interact with the environment, and evaluators inspect both the trace and terminal state. Each lesson combines its existing browser lab, an optional four-moment visual introduction, a long-form chapter, diagrams, misconception clinic, exercises, glossary, checkpoint, contextual presenter notes, and explicit forward bridge. Full-screen presentation uses those same moments and stable identifiers. Browser-local progress is independent from the LLM course.

## Inventory summary

| Material | LLM course | AI agents course | Total |
|---|---:|---:|---:|
| Interactive labs | 12 | 7 | 19 |
| Canonical teaching moments | 40 | 32 | 72 |
| Contextual presenter cues | 40 | 32 | 72 |
| Canonical practice moments | 10 | 8 | 18 |
| Learning feature test files |  |  | 51 |
| Pinned Bonsai tokenizer files |  |  | 4 |

The earlier extracted curriculum contained 86 detached presentation frames and 86 independently generated guide sections. Their useful claims, prompts, mechanisms, and debriefs have been absorbed into the 72 canonical lesson moments; the parallel deck and guide implementations were then retired. The current suite contains 158 unit and component tests across 52 test files, including 51 learning-feature test files and structural quality gates for every canonical long-form chapter and teaching sequence.

## LLM course

### Language model inference

1. Tokenization — guided rules, exact pinned Bonsai tokenizer, IDs, bytes, and live token count.
2. Attention — Q/K/V projection, masking, softmax, and one complete attention head.
3. Residual stream — layer-by-layer updates and a teaching logit lens.
4. Next token — probabilities, temperature, greedy or seeded sampling, and cross-entropy.
5. KV cache — MHA, MQA, and GQA memory across context lengths.

### Semantic systems

6. Embeddings — guided vectors, live local embeddings, cosine similarity, and semantic maps.

### Neural learning and vision

7. Perceptron — OR, XOR, exposed weights, and linear limits.
8. Gradient descent — analytic and numerical gradients on a two-parameter loss surface.
9. Backpropagation — a complete ReLU forward and backward pass.
10. Depth — hidden features that make XOR separable.
11. Convolution — input patch, kernel products, and activation.
12. Digit CNN — local drawing, trained weights, probabilities, and intermediate activation maps.

## AI agents course

### Runtime and delegation

13. Agent loop — context, proposal, validation, execution, observation, recovery, and stopping.
14. Subagents — task boundaries, parallelism, context isolation, shared writes, and synthesis.

### Context and persistence

15. Context lifecycle — budgets, caching, compaction, model switches, and resumed sessions.
16. Memory and instructions — explicit policy, learned memory, skills, evidence, and secret handling.

### Boundaries and evaluation

17. Hooks — lifecycle placement, pre-effect prevention, post-effect handling, and auditability.
18. Tool boundaries — schemas, authorization, approval, execution, and outcome verification.
19. Agent evaluations — repeated trials, graders, traces, terminal state, pass-at-k, and consistency.

## Direct material routes

- `/learn/how-llm-works/materials`
- `/learn/how-llm-works/course/prediction-goal`
- `/learn/how-ai-agent-works/materials`
- `/learn/how-ai-agent-works/course/agent-loop`

These canonical course and materials routes are the only entry points. Full-screen presentation is entered from the relevant lesson and returns to that same lesson and moment.

Each materials page links every chapter to its interactive lab and canonical lesson package. Optional standalone labs remain discoverable there as secondary resources without interrupting the canonical learner path.

## Extraction audit

Run the automated comparison against the immutable initial extraction commit:

```bash
npm run audit:extraction
```

Commit `a8bd642` is the immutable extraction baseline that was verified against the original frontend before its learning implementation was removed. The audit fails when baseline learning content, support components, tokenizer assets, or source tests are unexpectedly lost or changed. It explicitly records the retired parallel slide/guide implementation and the lesson-owned replacements, so the extraction remains reproducible without preserving obsolete duplicate surfaces or routes.

## Host bindings intentionally replaced

The original `/learn` feature was embedded in a larger commerce application. These host bindings are not course content and were replaced with standalone equivalents:

| Original host concern | Standalone equivalent |
|---|---|
| Protected `/learn` block inside the commerce `AppRoutes.tsx` | Focused routes plus a narrow auth boundary that validates the existing platform session |
| Commerce navigation link and its navigation test | Dedicated AI Learning Lab header plus home and E2E coverage |
| Full auth, cart, product, email, and Ollama API client | Narrow three-method learning runtime adapter in `src/lib/api.ts` |
| React Query and commerce toast test wrapper | Minimal router-based learning test wrapper |
| Commerce application shell | Dedicated course shell and complete-material indexes |

These replacements preserve every lab, theory chapter, exercise, and teaching claim. Detached slide and guide implementations were removed only after their useful material had been migrated into canonical lesson moments. Live learning calls retain the same backend endpoint contract for next-token probabilities, token counts, and embeddings.
