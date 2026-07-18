# AI Learning Lab content inventory

This document is the explicit extraction contract for the standalone application. The `/learn/` home page links to a complete materials index for each course, so labs, exercises, slides, and theory are directly discoverable.

## Inventory summary

| Material | LLM course | AI agents course | Total |
|---|---:|---:|---:|
| Interactive labs | 12 | 7 | 19 |
| Instructor slides | 53 | 33 | 86 |
| Slide-matched theory sections | 53 | 33 | 86 |
| Practical exercise slides | 12 | 7 | 19 |
| Learning feature test files |  |  | 42 |
| Pinned Bonsai tokenizer files |  |  | 4 |

The 42 standalone learning tests consist of all 40 tests from the source feature plus two tests for the new complete-materials index.

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
- `/learn/how-llm-works/slides?slide=1`
- `/learn/how-llm-works/guide?slide=1`
- `/learn/how-ai-agent-works/materials`
- `/learn/how-ai-agent-works/slides?slide=1`
- `/learn/how-ai-agent-works/guide?slide=1`

Each materials page links every chapter to its interactive lab, question, mechanism, exercise, debrief, and matching theory section.

## Extraction audit

Run the automated comparison against the sibling source repository:

```bash
npm run audit:extraction
```

Set `AI_LAB_SOURCE_ROOT` when the original frontend repository is not located at `../vite-react-frontend`. The audit fails when a source learning file, support component, tokenizer asset, or source test is missing or unexpectedly changed.

## Host bindings intentionally replaced

The original `/learn` feature was embedded in a larger commerce application. These host bindings are not course content and were replaced with standalone equivalents:

| Original host concern | Standalone equivalent |
|---|---|
| Protected `/learn` block inside the commerce `AppRoutes.tsx` | Public, focused routes in `src/AppRoutes.tsx` |
| Commerce navigation link and its navigation test | Dedicated AI Learning Lab header plus home and E2E coverage |
| Full auth, cart, product, email, and Ollama API client | Narrow three-method learning runtime adapter in `src/lib/api.ts` |
| React Query and commerce toast test wrapper | Minimal router-based learning test wrapper |
| Commerce application shell | Dedicated course shell and complete-material indexes |

These replacements remove unrelated dependencies without removing any lab, slide, theory section, exercise, or learning test. Live learning calls retain the same backend endpoint contract for next-token probabilities, token counts, and embeddings.
