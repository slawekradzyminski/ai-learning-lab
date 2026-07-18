# AI Learning Lab - Phase 5 attention implementation plan

## Goal

Repair the conceptual gap between tokenization, next-token prediction, and KV caching by adding a mathematically exact, interactive attention lesson. At the same time, stop presenting semantic sentence embeddings as though they were an internal stage of Bonsai generation.

The revised curriculum is:

```text
Language model inference
Tokenization -> Attention -> Next token -> KV cache

Semantic systems
Semantic embeddings -> Similarity -> Retrieval (future)

Learning and vision
Perceptron -> Convolution -> Digit CNN
```

The Attention Lab includes token and positional representations inside its worked example. The existing Embeddings Lab remains a semantic-embedding lesson and is explicitly placed on a separate track.

## Book-derived teaching principles

The implementation draws on the explanatory sequence in *The Welch Labs Illustrated Guide to AI*, especially:

- Chapter 2: connect next-token probability to cross-entropy and a training signal;
- Chapters 3-4: expose intermediate activations and composed transformations instead of treating a network as one opaque function;
- Chapter 7: distinguish parameters, activations, the residual stream, and output probabilities;
- Chapter 8: compute queries, keys, values, scaled dot-product scores, a causal mask, softmax weights, and the value-weighted output in that order;
- the chapter exercises: ask students to predict relationships and consequences before revealing an explanation.

No book artwork or substantial book text is reproduced. The lab applies the concepts through original examples, copy, calculations, and interface design.

## Visual and interaction direction

### Visual thesis

A calm language microscope: one sentence anchors a dark technical workspace while sky-blue signal paths reveal how a selected token gathers information.

### Content plan

1. Header: objective, scope, and explicit guided-model provenance.
2. Attention workspace: sentence, selected output token, six-stage calculation navigator, dominant matrix or vector view, and a concise inspector.
3. Practice: predict an attention relationship, commit an answer, and reveal the explanation.
4. Theory bridge: attention versus a fully connected layer, causality, multiple heads, and the residual stream.
5. Next step: explain exactly why KV caching stores keys and values but not prior queries.

### Interaction thesis

- Selecting a token moves the focus through the attention heatmap and calculation trace.
- Stage changes reveal one transformation at a time with restrained opacity and position transitions.
- Preset interventions change one representation or mask condition so students see cause and effect, not merely a finished pattern.

All motion respects reduced-motion preferences and does not hide information behind timing.

## Mathematical model

Use a deliberately small, deterministic, single-head causal attention example:

```text
X = token representation + positional representation
Q = XWq
K = XWk
V = XWv
S = QK^T / sqrt(dk)
A = softmax(causalMask(S))
O = AV
```

Requirements:

- 4-6 tokens and 2-dimensional vectors so every number fits on screen;
- fixed original matrices with enough structure to produce interpretable patterns;
- stable calculations implemented as pure TypeScript;
- rectangular-matrix, dimension, finite-number, row-softmax, and selection validation;
- masked future positions are represented explicitly, never as ordinary zero scores;
- softmax rows sum to one within a documented tolerance;
- calculations retain unrounded values; formatting rounds only at display time.

## Attention Lab route and interactions

Add:

```text
/learn/attention
```

The lab must provide:

- a clear label that this is a guided, inspectable attention head, not captured Bonsai internals;
- selectable output tokens;
- six stages: representations, Q/K/V, scores, causal mask, softmax, and output;
- a full causal attention heatmap whose selected row remains synchronized with the token selection;
- exact vector and scalar calculation traces;
- an intervention preset that changes the representations while keeping provenance explicit;
- an optional unmasked comparison that is visibly labelled as invalid for causal generation;
- a practice checkpoint that requires an answer before revealing feedback;
- a direct conceptual handoff to Next Token and KV Cache.

## Existing-lab improvements

### Embeddings

- Rename overview language from generic embeddings to semantic embeddings.
- State on the overview that EmbeddingGemma vectors support similarity and retrieval; they are not passed into Bonsai.
- Place the lab in a separate semantic-systems track.

### Next token

- Add a short learning bridge explaining that transformer layers create the final representation before vocabulary logits and softmax.
- Add a practice checkpoint about how lower correct-token probability affects cross-entropy.

### KV cache

- Add a prerequisite bridge to the Attention Lab.
- Explain why previous keys and values are reused while only the newest query is needed.
- Add a practice checkpoint contrasting compute reuse and memory cost.

## Navigation

- Extend the catalog and sub-navigation to eight labs across three honest tracks.
- Language-model inference order: Tokenization, Attention, Next Token, KV Cache.
- Semantic systems: Semantic Embeddings.
- Learning and vision: Perceptron, Convolution, Digit CNN.
- Keep the horizontal sub-navigation usable at 390 px.

## Testing and verification

1. Unit-test matrix multiplication, transpose, vector addition, scaled scores, masking, stable softmax, row sums, weighted values, and invalid dimensions.
2. Unit-test the complete guided examples and intervention presets with fixed expected values.
3. Component-test stage navigation, token selection, masking comparison, intervention, checkpoint feedback, and cross-lab links.
4. Update catalog, overview, layout, and routing tests for eight labs and three tracks.
5. Run the complete frontend test suite, ESLint, TypeScript/Vite production build, and `git diff --check`.
6. Run authenticated desktop and 390 px browser checks for overflow, interaction state, keyboard reachability, and console health.

## Out of scope

- Claiming to retrieve Bonsai attention weights through Ollama;
- adding a backend endpoint for invented or unavailable internals;
- copying book figures, exercises, or prose;
- production deployment, container builds, registry pushes, or infrastructure changes;
- gradient descent and backpropagation labs, which remain the recommended next curriculum phase after this one.

## Completion evidence - 2026-07-17

### Delivered

- Added `/learn/attention` as an original, deterministic six-stage lesson: representations, Q/K/V projections, scaled dot-product scores, causal masking, softmax, and value aggregation.
- Every displayed result is produced by pure TypeScript from visible 2D token, position, and projection matrices; formatting does not feed rounded values back into calculations.
- Added synchronized token selection, a full causal attention heatmap, an unmasked counterfactual, and a position intervention that visibly changes the dominant source token.
- Added a predict-before-reveal checkpoint and original theory sections covering multi-head specialization, attention versus MLP behavior, residual updates, and interpretability limits.
- Added direct handoffs from Attention to Next Token and KV Cache.
- Added prerequisite bridges and practice checkpoints to Next Token and KV Cache.
- Reorganized the overview into three tracks. Semantic Embeddings now sits in a dedicated semantic-systems track and explicitly states that EmbeddingGemma vectors are not passed into Bonsai.
- Extended the overview, sub-navigation, catalog, and protected routing from seven to eight labs.

### Automated verification

- Focused attention, checkpoint, catalog, overview, and related-page tests passed.
- Complete frontend suite: 81 files, 503 tests passed.
- ESLint: passed with no warnings.
- TypeScript and Vite production build: passed.
- `git diff --check`: passed in the frontend and orchestration repositories.

### Browser verification

- Authenticated desktop rendering at 1440x1000 showed the intended single-workspace hierarchy and inspectable calculations.
- Authenticated mobile rendering at 390x844 had document and body scroll widths equal to the 390 px viewport.
- The intentionally wide stage navigator, matrices, and heatmap remain locally scrollable without creating document overflow.
- Stage changes, token selection, mask comparison, position intervention, both cross-lab links, and the attention checkpoint were exercised successfully.
- The overview rendered three tracks and eight labs; semantic-track copy and Next Token/KV Cache practice feedback were verified in-browser.
- Browser console and page-error checks reported zero errors and zero warnings.

The frontend remains available locally on `http://127.0.0.1:8083`. No backend or infrastructure changes were required, and no deployment or container image operation was performed.
