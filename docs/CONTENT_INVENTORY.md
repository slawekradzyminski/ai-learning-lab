# AI Learning Lab content inventory

This document is the explicit extraction contract for the standalone application. The `/learn/` home page links to a complete materials index for each course, while each canonical lesson owns its experiment, long-form theory, practice, assessment, and forward bridge. Slides, visual-introduction moments, presenter notes, and presentation routes are intentionally not part of the product.

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

Each lesson is one learner flow: question, representation change, experiment, plain-language explanation, misconception correction, checkpoint, and forward bridge. Optional notation and annotated sources stay behind quiet disclosures. Browser-local completion state records progress. The deterministic glass-box lane and live Bonsai evidence remain explicitly distinguished inside the relevant explanations.

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

Every lesson reuses the goal to research three laptops under €900 and write `laptop-comparison.md` without purchasing or contacting a vendor. The recurring scenario makes ownership visible: the model proposes, the harness selects context and mediates effects, tools interact with the environment, and evaluators inspect both the trace and terminal state. Each lesson combines its existing browser lab, a long-form chapter, diagrams, misconception clinic, exercises, glossary, checkpoint, and explicit forward bridge. Browser-local progress is independent from the LLM course.

## Inventory summary

| Material | LLM course | AI agents course | Total |
|---|---:|---:|---:|
| Interactive labs | 12 | 7 | 19 |
| Canonical long-form chapters | 10 | 8 | 18 |
| Canonical guided experiments | 10 | 8 | 18 |
| Learning feature test files |  |  | 51 |
| Pinned Bonsai tokenizer files |  |  | 4 |

The earlier extracted curriculum contained detached presentation frames and independently generated guide sections. Those parallel surfaces, their later lesson-owned visual introductions, presenter metadata, and all presentation routes have been retired. The maintained learner contract is the lesson itself: experiment, theory, practice, checkpoint, and continuation. Structural quality gates cover every canonical long-form chapter.

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

These canonical course and materials routes are the only maintained course entry points. Previously published slide and guide URLs are retired and fall back to `/learn`.

Each materials page links every chapter to its interactive lab and canonical lesson package. Optional standalone labs remain discoverable there as secondary resources without interrupting the canonical learner path.

## Extraction audit

Run the automated comparison against the immutable initial extraction commit:

```bash
npm run audit:extraction
```

Commit `a8bd642` is the immutable extraction baseline that was verified against the original frontend before its learning implementation was removed. The audit fails when maintained labs, theory, support components, tokenizer assets, or source tests are unexpectedly lost or changed. It explicitly records the retired parallel slide/guide implementation, so the extraction remains reproducible without preserving obsolete duplicate surfaces or routes.

## Host bindings intentionally replaced

The original `/learn` feature was embedded in a larger commerce application. These host bindings are not course content and were replaced with standalone equivalents:

| Original host concern | Standalone equivalent |
|---|---|
| Protected `/learn` block inside the commerce `AppRoutes.tsx` | Focused routes plus a narrow auth boundary that validates the existing platform session |
| Commerce navigation link and its navigation test | Dedicated AI Learning Lab header plus home and E2E coverage |
| Full auth, cart, product, email, and Ollama API client | Narrow three-method learning runtime adapter in `src/lib/api.ts` |
| React Query and commerce toast test wrapper | Minimal router-based learning test wrapper |
| Commerce application shell | Dedicated course shell and complete-material indexes |

These replacements preserve every maintained lab, theory chapter, and exercise. Slide, guide, visual-introduction, and presenter implementations are intentionally excluded. Live learning calls retain the same backend endpoint contract for next-token probabilities, token counts, and embeddings.
