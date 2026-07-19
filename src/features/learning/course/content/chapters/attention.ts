import type { CourseTheoryChapter } from '../theoryTypes';

export const ATTENTION_CHAPTER: CourseTheoryChapter = {
  question: 'How can one token position gather the information it needs from earlier positions?',
  estimatedMinutes: 65,
  prerequisites: [
    'Read a matrix shape such as n by d and interpret a row as one token position.',
    'Compute a dot product and recognize that it produces one scalar.',
    'Understand that a token state is a vector carried through the transformer.',
    'Distinguish learned parameters from runtime activations.',
  ],
  objectives: [
    'Trace one token row through query, key, value, score, mask, softmax, and weighted-sum operations.',
    'Write the row-vector and full-matrix shapes for single-head self-attention.',
    'Calculate one attention output from small, exact educational vectors.',
    'Explain why scaled scores, causal masking, and numerically stable softmax are necessary.',
    'Explain how multiple heads, the output projection, and the residual connection hand attention results to the rest of the block.',
    'State what an attention visualization does and does not establish about a production language model.',
  ],
  sections: [
    {
      id: 'attention-place-in-story',
      eyebrow: 'Orientation',
      heading: 'The problem attention is solving',
      diagramIds: ['attention-course-location'],
      body: String.raw`Our shared prompt is **“The animal did not cross the street because it was too …”**. By the time the model reaches the position after “too,” every visible token already has a vector. Those vectors are not merely dictionary definitions. Earlier transformer operations have written contextual information into them. The immediate problem is that the row at “too” cannot make a useful prediction from local spelling alone. It may need evidence about the animal, the street, the negation, and the relation introduced by “because.” Which earlier positions matter, and what information should be copied from them?

Self-attention is a learned routing operation for that problem. For each destination position, it computes a new vector by mixing value vectors from allowed source positions. The mixture is different for every destination and every input. “Animal” may be useful to one destination while “street” is useful to another. This input-dependent routing is the central capability to keep in mind; the familiar colored attention matrix is only an intermediate record of the routing weights.

The word **self** means that queries, keys, and values are all produced from the same sequence of token states. It does not mean that a token attends only to itself. A row can route information from itself and from other allowed rows. In a causal language model, “allowed” means the current position and positions to its left. The future must remain unavailable, because generation will not have future tokens when it runs.

Attention does not directly choose the missing word. Its output has the same model-width shape as the token state that entered the attention sublayer. That output is added to the residual stream, after which more blocks can transform it. Only later does the language-model head turn a final state into vocabulary logits. A large attention weight therefore is not a predicted probability for a word, and a single head is not a complete explanation of why the model eventually chooses one continuation.

The recurring contract for this chapter is:

1. **Input:** contextual token states, one row per sequence position.
2. **Learned operation:** project each row into query, key, and value spaces.
3. **Input-dependent calculation:** compare queries with keys, apply the causal rule, and normalize each row.
4. **Output:** a weighted sum of values for every destination position.
5. **Handoff:** combine heads, project back to model width, and add the update to the residual stream.

The diagram locates this operation between contextual token states and later prediction. Keep that whole route visible while we inspect the mechanism.`,
    },
    {
      id: 'qkv-roles',
      eyebrow: 'Mechanism',
      heading: 'Queries ask, keys advertise, and values carry',
      diagramIds: ['attention-qkv-routing'],
      body: String.raw`Start with the token-state matrix $X$. If the sequence has $n$ positions and the model width is $d_{model}$, then $X$ has shape $n \times d_{model}$. One attention head owns three learned projection matrices:

$$
W_Q \in \mathbb{R}^{d_{model} \times d_k}, \qquad
W_K \in \mathbb{R}^{d_{model} \times d_k}, \qquad
W_V \in \mathbb{R}^{d_{model} \times d_v}.
$$

Multiplying every row of $X$ by these matrices produces

$$
Q = XW_Q, \qquad K = XW_K, \qquad V = XW_V.
$$

The three projections come from the same input row but serve different jobs. A **query** represents what a destination position is prepared to retrieve. A **key** represents how a source position can be matched. A **value** represents the information that can actually be routed if the match receives weight. The query and key must have the same width $d_k$ so their dot product is defined. The value can have a different width $d_v$, because values are combined rather than compared with queries.

For one destination position $i$, use row vectors $q_i$, $k_j$, and $v_j$. Comparing $q_i$ with a source key $k_j$ gives the scalar $q_i k_j^\top$. Repeating the comparison for all source positions gives one row of raw scores. After masking and normalization, the destination output is

$$
o_i = \sum_{j=1}^{n} a_{ij} v_j.
$$

This separation matters. The value is not multiplied by its own key, and an attention weight is not itself the transported content. Suppose two source positions receive the same weight but contain different values. They make different contributions to the output. Conversely, two positions can have different keys but similar values; their matching behavior differs even if the information they would contribute is similar.

The “asks, advertises, carries” wording is a memory aid, not a claim that a head composes a human-language question. The vectors are learned coordinates, distributed across dimensions, and their useful features are discovered during training. We can describe the operational role exactly without pretending to translate every dimension into a concept.

There is also no permanent key or query attached to the word “animal.” Because $X$ is contextual, the row entering this layer already depends on the sentence and on previous layers. The projections are reused parameters, but the resulting $q$, $k$, and $v$ vectors are runtime activations. Change the prompt, and those activations generally change even for a repeated token.`,
    },
    {
      id: 'shape-ledger',
      eyebrow: 'Shapes',
      heading: 'A dimension ledger prevents most attention mistakes',
      diagramIds: ['attention-shape-ledger'],
      body: String.raw`Attention notation becomes much easier when every operation is checked by shape. Use a row-vector convention: tokens occupy rows and features occupy columns. For a single head, the full ledger is:

| Quantity | Shape | Meaning |
| --- | --- | --- |
| $X$ | $n \times d_{model}$ | one input state per token position |
| $W_Q$, $W_K$ | $d_{model} \times d_k$ | learned query and key projections |
| $W_V$ | $d_{model} \times d_v$ | learned value projection |
| $Q$, $K$ | $n \times d_k$ | runtime queries and keys |
| $V$ | $n \times d_v$ | runtime values |
| $QK^\top$ | $n \times n$ | one destination-by-source score matrix |
| $M$ | $n \times n$ | causal mask broadcast-compatible with scores |
| $A$ | $n \times n$ | row-normalized attention weights |
| $O=AV$ | $n \times d_v$ | one routed update per destination |

The score shape follows from matrix multiplication:

$$
(n \times d_k)(d_k \times n) = n \times n.
$$

The inner dimensions $d_k$ cancel. The two remaining sequence dimensions have distinct roles: a score row selects one destination query, while a score column selects one source key. This convention tells us which direction softmax must operate. Each destination requires a distribution over sources, so softmax runs across the columns of each row. Normalizing down columns would answer a different question and would not make each destination’s source weights sum to one.

The weighted sum has shape

$$
(n \times n)(n \times d_v) = n \times d_v.
$$

Here the source-position dimension cancels. This is exactly what the operation should do: collapse many source rows into one value mixture for each destination, while retaining the destination axis and value features. If an implementation instead produces $d_v \times n$, a transpose convention has changed or a multiplication is backwards.

For one destination row, the same ledger shrinks to

$$
q_i: 1 \times d_k, \quad K^\top: d_k \times n, \quad
s_i: 1 \times n, \quad a_i: 1 \times n, \quad
V: n \times d_v, \quad o_i: 1 \times d_v.
$$

This row view is especially useful for the shared prompt. The destination “too” supplies one query. All currently visible positions supply candidate keys and values. The resulting score row has one entry for every visible source. Its normalized weights multiply the value rows, producing one update for “too.” The full matrix formulation simply performs that same process for all destinations in parallel during prompt processing.

Shape correctness does not prove semantic correctness, but it is a powerful first invariant. It catches transposed score matrices, softmax on the wrong axis, mismatched key widths, and accidental mixing across a batch. Whenever attention feels “cosmic,” write the ledger before interpreting the colors.`,
    },
    {
      id: 'scores-and-scaling',
      eyebrow: 'Matching',
      heading: 'Dot-product scores need scaling before normalization',
      body: String.raw`The raw compatibility score from destination $i$ to source $j$ is a dot product:

$$
r_{ij}=q_i k_j^\top.
$$

A dot product becomes large when coordinates align with similar signs and magnitudes. It is therefore a learned compatibility calculation, not a geometric distance and not necessarily a general-purpose semantic similarity score. The projections can make a particular relationship easy to match in one head even when ordinary embedding similarity would not reveal it.

Transformers normally scale the raw score by the square root of the key dimension:

$$
s_{ij}=\frac{q_i k_j^\top}{\sqrt{d_k}}.
$$

Why? Consider an initialization-level intuition. If corresponding query and key coordinates contribute roughly independent terms with comparable variance, their dot product adds $d_k$ terms. The variance of that sum grows roughly in proportion to $d_k$, so its typical magnitude grows like $\sqrt{d_k}$. Dividing by $\sqrt{d_k}$ keeps score scales more comparable as the head width changes.

Without scaling, wide heads can produce very large positive and negative scores before softmax. Softmax then becomes extremely peaked: one entry approaches one and most approach zero. A peaked distribution is not inherently bad—trained attention may need decisive routing—but premature saturation can make optimization brittle because small logit changes have little effect on probabilities that are already nearly zero or one. Scaling gives training a more manageable numerical regime. It does not guarantee uniform weights and does not constrain the model to mild attention after learning.

The full score matrix is

$$
S=\frac{QK^\top}{\sqrt{d_k}}.
$$

Each row is independent for the next two operations. Causal masking modifies which columns are eligible for that destination, and row-wise softmax turns the remaining finite scores into non-negative weights that sum to one.

It is tempting to read the largest score as “the model thinks these words mean the same thing.” That interpretation is too broad. The score belongs to one layer, one head, one destination, and one input. It can support positional routing, punctuation behavior, syntactic relations, copying, delimiter recognition, or other learned computations. Its meaning also depends on the value projection: a strong match is useful only through the value information it routes and the later computations that consume the result.`,
    },
    {
      id: 'mask-and-softmax',
      eyebrow: 'Constraints',
      heading: 'Causal masking changes the calculation, then stable softmax normalizes it',
      diagramIds: ['attention-causal-mask'],
      body: String.raw`During autoregressive generation, the model must predict a token without seeing that token or anything after it. Training usually processes many positions in parallel, so the architecture must enforce the same information boundary. A causal mask does that by making forbidden destination–source pairs receive zero probability.

Let row $i$ represent destination position $i$ and column $j$ source position $j$. With positions numbered from left to right, source $j$ is forbidden when $j>i$. A convenient additive mask is

$$
M_{ij}=
\begin{cases}
0 & \text{if } j \le i,\\
-\infty & \text{if } j>i.
\end{cases}
$$

Then

$$
A=\operatorname{softmax}_{row}(S+M).
$$

Because $e^{-\infty}=0$, a forbidden position receives exactly zero weight in the mathematical idealization. Implementations use a suitable very negative value or a masked softmax operation. The mask is applied **before** normalization. Setting forbidden probabilities to zero after an ordinary softmax would leave the allowed entries summing to less than one unless they were normalized again.

Softmax itself should be evaluated in a numerically stable form. For one permitted score row $z$, first find its maximum $m=\max_j z_j$, then compute

$$
a_j=\frac{\exp(z_j-m)}{\sum_t \exp(z_t-m)}.
$$

Subtracting the same constant from every entry does not change the mathematical distribution: the common factor cancels between numerator and denominator. It does prevent exponentiating a very large positive number, which could overflow finite floating-point storage. After subtraction, the largest exponent is $e^0=1$, and all others are at most one.

Three row invariants make useful debugging checks. Every allowed $a_j$ is non-negative. Every forbidden $a_j$ is zero. The complete row sums to one, apart from small floating-point rounding error. Those facts mean the output $o_i=\sum_j a_{ij}v_j$ is a convex combination of the allowed value rows for a standard softmax attention head. Each output coordinate lies between the minimum and maximum of that coordinate among the allowed values. Later output projections and residual additions can move beyond those ranges, but the immediate weighted sum cannot.

For the destination “too” in the shared prompt, every token through “too” is visible, while the missing continuation is not an input position yet. Once a continuation token is selected and appended, it becomes visible on the next generation step. Causality is therefore a precise data-access rule, not a vague claim that the model “looks backward.”`,
    },
    {
      id: 'glass-box-example',
      eyebrow: 'Worked example',
      heading: 'Glass-box calculation: one exact two-dimensional attention row',
      body: String.raw`This is an **exact educational glass-box calculation**. The vectors are deliberately chosen miniature values; they are not measured from Bonsai or any other production model. We inspect one destination row for “too” and three allowed source summaries labelled “animal,” “street,” and “too.” A real prompt contains more positions, and a production head typically uses wider vectors.

Let $d_k=d_v=2$. The destination query and source matrices are

$$
q_{too}=\begin{bmatrix}1&1\end{bmatrix},\qquad
K=\begin{bmatrix}
1&0\\
0&1\\
1&1
\end{bmatrix},\qquad
V=\begin{bmatrix}
2&0\\
0&2\\
1&1
\end{bmatrix}.
$$

The dimension ledger is

$$
(1\times2)(2\times3)=1\times3
$$

for scores, followed by

$$
(1\times3)(3\times2)=1\times2
$$

for the output. First calculate the dot products:

$$
q_{too}K^\top=\begin{bmatrix}1&1&2\end{bmatrix}.
$$

Because $d_k=2$, divide by $\sqrt{2}$:

$$
z=\begin{bmatrix}0.7071&0.7071&1.4142\end{bmatrix}.
$$

All three sources are allowed for this row. Stable softmax subtracts the row maximum $1.4142$:

$$
z-m=\begin{bmatrix}-0.7071&-0.7071&0\end{bmatrix}.
$$

Exponentiation gives approximately

$$
\begin{bmatrix}0.4931&0.4931&1.0000\end{bmatrix}.
$$

Their sum is $1.9862$, so the normalized row is approximately

$$
a=\begin{bmatrix}0.2483&0.2483&0.5035\end{bmatrix}.
$$

The small mismatch in the displayed last decimal comes from rounding. The invariant is

$$
0.2483+0.2483+0.5035\approx1.0001\approx1.
$$

Using unrounded values, the row sums to exactly one. Now weight the values:

$$
o_{too}=aV.
$$

Coordinate by coordinate,

$$
o_{too,1}\approx(0.2483)(2)+(0.2483)(0)+(0.5035)(1)\approx1.0001,
$$

$$
o_{too,2}\approx(0.2483)(0)+(0.2483)(2)+(0.5035)(1)\approx1.0001.
$$

With exact unrounded symmetry, the result is $\begin{bmatrix}1&1\end{bmatrix}$. Notice what happened: weights described routing strength, while values supplied the routed coordinates. The output is not one selected source; it is their weighted mixture.

Now make a counterfactual change while keeping keys and values fixed. Replace the query with

$$
q'_{too}=\begin{bmatrix}2&0\end{bmatrix}.
$$

The scaled scores become $\begin{bmatrix}1.4142&0&1.4142\end{bmatrix}$. Stable softmax gives approximately $\begin{bmatrix}0.4458&0.1084&0.4458\end{bmatrix}$, which again sums to one. The new output is

$$
o'_{too}\approx\begin{bmatrix}1.3374&0.6626\end{bmatrix}.
$$

Only the query changed, yet the route and output changed. This demonstrates input-dependent retrieval. It does **not** demonstrate what any real head represents. The labels help us track source positions; they do not assign human-readable meanings to the two coordinates.`,
    },
    {
      id: 'multi-head-residual',
      eyebrow: 'Composition',
      heading: 'Multiple heads route in parallel, then one projection writes the update',
      diagramIds: ['attention-multi-head-handoff'],
      body: String.raw`A single attention head produces one kind of routing using one set of $W_Q$, $W_K$, and $W_V$ parameters. A multi-head attention sublayer repeats the mechanism in parallel with separately learned projections. Head $r$ computes

$$
O^{(r)}=\operatorname{softmax}\left(\frac{Q^{(r)}K^{(r)\top}}{\sqrt{d_k}}+M\right)V^{(r)}.
$$

If there are $h$ heads and each output has shape $n\times d_v$, concatenating them across features gives $n\times(hd_v)$. A learned output projection maps the concatenation back to model width:

$$
U=\operatorname{Concat}\left(O^{(1)},\ldots,O^{(h)}\right)W_O,
$$

where $W_O$ has shape $(hd_v)\times d_{model}$ in this convention. Many architectures choose $hd_v=d_{model}$, but the equation only requires compatible dimensions.

Different heads can learn different matching and value transformations. That creates capacity for several routing patterns at the same layer. It does not guarantee one tidy linguistic function per head. Behaviors may be distributed across heads, and one head may participate in multiple input-dependent computations. Head labels such as “syntax head” can be useful hypotheses, but they require experiments rather than interpretation from one attractive heatmap.

The output projection is not an optional formatting step. Concatenation places head features side by side; $W_O$ learns how to mix them into an update expressed in the residual-stream coordinate system. Without this projection, later layers would receive isolated head chunks rather than one integrated model-width update.

In a common pre-normalized transformer, the attention handoff can be summarized as

$$
X_{attn}=X+\operatorname{MHA}(\operatorname{Norm}(X)).
$$

The normalized states generate queries, keys, and values. Multi-head attention produces an update. The update is added to the original residual stream $X$. Attention therefore writes a proposed change; it does not replace the entire token state. An MLP sublayer usually follows with another normalized transformation and another residual addition.

This residual view corrects a common narrative error. Information is not passed through a chain in which each component discards the previous state. The residual stream carries an accumulating state, while attention and MLP sublayers contribute updates. For “too,” an attention update might route relevant information from earlier positions into the destination row. Later layers can preserve, transform, combine, or counteract that update. The final language-model head reads the accumulated result, not a raw attention row.

Architecture details vary. Some models normalize in different locations, use grouped-query or multi-query attention, apply rotary positional transformations to queries and keys, or use alternative score mechanisms. The stable conceptual contract remains: construct match vectors, respect an access rule, normalize routing weights, combine carried values, and write the result into the wider computation.`,
    },
    {
      id: 'limits-and-interpretation',
      eyebrow: 'Evidence',
      heading: 'Attention weights are useful measurements, not complete explanations',
      body: String.raw`An attention matrix is observable evidence about one intermediate operation when it is captured from an inspectable model. It tells us which source value rows received weight for each destination in a particular head and layer. That is useful: we can verify masking, compare prompts, detect positional patterns, and test whether an intervention changes routing. But the matrix does not contain all of the information needed to explain a prediction.

First, a weight omits the value vector. A large coefficient multiplying an unhelpful or nearly zero value may contribute less than a smaller coefficient multiplying a strong value. Second, the output projection mixes heads. Third, residual additions preserve earlier state and add MLP updates. Fourth, many subsequent layers can modify the representation. Fifth, the final vocabulary probability depends on the language-model head and decoding procedure. A heatmap from one head is consequently one measurement in a causal pipeline, not a transcript of reasoning.

Attention is also not automatically long-term memory. It can route among positions present in the model’s current context and represented in its key/value states. Information outside the context window is unavailable unless an application retrieves and inserts it or the model’s parameters encode a relevant pattern. Even within the window, a position being available does not guarantee that training produced a route that uses it effectively.

Standard dense attention constructs an $n\times n$ score matrix. Its score and weight storage therefore grows quadratically with sequence length, while cached key and value states used in autoregressive decoding grow linearly with the number of cached tokens per layer. Production systems use optimized kernels and sometimes alternative attention patterns, but the shape ledger explains why long contexts create major compute and memory demands.

When the lab displays hand-authored glass-box numbers, the proper claim is “these values demonstrate the mechanism.” When it displays output text from Bonsai through a public API, the proper claim is “this is observable model behavior.” Unless the system actually exposes internal activations, it must not invent an attention matrix and label it as Bonsai’s internal state. A plausible-looking diagram is still illustrative, not measured evidence.

A productive interpretation habit is to ask four questions: Which model and checkpoint produced this? Which layer and head? Which exact tokenization and input? What intervention or comparison supports the proposed interpretation? Those questions turn visual inspection into a testable investigation. They also protect us from anthropomorphism: the model does not literally “look at the animal” in the human visual sense. A learned numerical route moved value information between token positions.`,
    },
    {
      id: 'experiment-and-debug',
      eyebrow: 'Practice',
      heading: 'Use the lab as a predict–manipulate–observe experiment',
      body: String.raw`A useful attention lab should make a learner commit to a prediction before showing a result. Begin with the glass-box row from this chapter. Predict what happens when one query coordinate increases, when one key is made orthogonal to the query, when a value changes but its key does not, and when a high-scoring source is masked. Then manipulate exactly one quantity and observe scores, weights, the row-sum invariant, and the final value mixture.

These interventions separate concepts that prose can accidentally blur. Changing a key while preserving its value changes how easily the source is selected, but not what it carries. Changing a value while preserving its key leaves attention weights unchanged but changes the output. Changing a query affects one destination’s comparisons. Changing the causal mask changes eligibility regardless of score. Increasing all scores by the same constant leaves softmax unchanged, while multiplying score differences can sharpen or flatten the distribution.

Use invariants to debug unexpected output. Confirm that the last dimension of $Q$ matches the last dimension of $K$. Confirm that the score matrix is destination-by-source. Confirm that softmax runs across sources for each destination. Confirm that forbidden positions have zero weight and each row sums approximately to one. Finally, recompute one output coordinate as a manual weighted sum. If the weights are correct but the output is wrong, inspect values and matrix orientation rather than adjusting softmax.

The shared prompt provides meaningful counterfactuals. Replace “animal” with “truck,” remove “not,” or change “street” to “river.” Before running anything, state which destination routes you expect to change and why. In a true model-internals lab, compare captured layers and heads without claiming that any single difference proves a semantic story. In a behavior-only lab, compare continuation distributions or generated tokens and describe only that observable change. Do not reverse-engineer unsupported internal weights from output text.

The learning target is not to memorize one heatmap. It is to be able to reconstruct the mechanism from the contract: project $X$ into $Q$, $K$, and $V$; compute scaled query–key scores; mask forbidden sources; apply stable row softmax; mix values; combine heads; project; and add the update to the residual stream. If an interface hides an intermediate value, the learner should still know what type and shape must cross that boundary.

After the experiment, write one evidence statement and one limitation statement. For example: “In the educational calculation, rotating the query toward the first key increased the first source’s weight and shifted the output toward its value.” Then: “These chosen vectors demonstrate causal dependence within the formula, not a discovered feature in a production checkpoint.” That pairing is a compact discipline for honest AI education.`,
    },
    {
      id: 'attention-summary-bridge',
      eyebrow: 'Synthesis',
      heading: 'From static token rows to routed contextual updates',
      body: String.raw`Before attention, the input to this sublayer is a matrix of token states. Each row contains what earlier computation has already written at one position. Attention creates a destination-specific update by comparing a learned query with allowed learned keys and mixing the corresponding learned values. The before-and-after contract is therefore

$$
X\;(n\times d_{model})
\longrightarrow
Q,K,V
\longrightarrow
S\;(n\times n)
\longrightarrow
A\;(n\times n)
\longrightarrow
O\;(n\times d_v)
\longrightarrow
U\;(n\times d_{model}).
$$

Six ideas should now be retrievable without the diagram. Queries and keys determine matching. Values determine transported content. Scaling controls score magnitude before softmax. Causal masking enforces the autoregressive information boundary. Row softmax creates a source distribution for each destination. Multi-head outputs are concatenated, projected, and added as a residual update rather than replacing the stream.

Return to “The animal did not cross the street because it was too …”. Attention gives the row at “too” a mechanism for receiving input-dependent information from allowed earlier positions. It does not by itself decide whether the continuation should be “wide,” “tired,” “dangerous,” or something else. The usefulness of the update depends on learned projections, the values that are routed, the other heads, the MLPs, and the layers that follow. The final distribution appears only after the accumulated state reaches the language-model head.

The next conceptual step is the residual stream. Attention’s result must coexist with information already present at the destination and with updates made by other sublayers. Thinking in residual updates answers a crucial question: if a head routes one feature into “too,” where does that feature go, and how can later computations build on it without erasing the prior state? The equation $X_{attn}=X+\operatorname{MHA}(\operatorname{Norm}(X))$ is the bridge. Attention supplies the right-hand update; the residual stream carries the evolving representation forward.

When reviewing this chapter, do not begin by memorizing $Q$, $K$, and $V$. Begin with the learner’s goal: one destination needs selected information from allowed sources. Then recover the machinery that makes this possible. That ordering gives every symbol a job and turns an apparently mysterious matrix into a sequence of checkable operations.`,
    },
  ],
  diagrams: [
    {
      id: 'attention-course-location',
      title: 'Attention inside the prediction pipeline',
      caption: 'Attention routes information between token rows; later blocks and the language-model head turn the accumulated state into a prediction.',
      alt: 'Pipeline from prompt text through tokenization, embeddings, attention inside transformer blocks, residual states, vocabulary logits, and a next token.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  A[Prompt text] --> B[Token IDs]
  B --> C[Initial token states]
  C --> D[Attention routing]
  D --> E[Residual stream and later blocks]
  E --> F[Vocabulary logits]
  F --> G[Next token]
  style D fill:#dbeafe,stroke:#2563eb,stroke-width:2px`,
    },
    {
      id: 'attention-qkv-routing',
      title: 'One destination gathers values through query–key matching',
      caption: 'Queries and keys produce routing weights; those weights multiply values, which carry the actual update.',
      alt: 'Input token states are separately projected into queries, keys, and values; query-key scores are masked and normalized before weighting the values.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  X[Token-state matrix X] --> Q[Query projection Q]
  X --> K[Key projection K]
  X --> V[Value projection V]
  Q --> S[Scaled QK scores]
  K --> S
  S --> M[Causal mask]
  M --> A[Row softmax weights A]
  A --> O[Weighted value sum O]
  V --> O`,
    },
    {
      id: 'attention-shape-ledger',
      title: 'Single-head attention shape ledger',
      caption: 'The sequence-by-sequence score matrix collapses against the sequence axis of V, leaving one value-width output per destination.',
      alt: 'Shape flow showing X n by model width, Q and K n by key width, V n by value width, attention weights n by n, and output n by value width.',
      kind: 'shape',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  X["X: n x model width"] --> Q["Q: n x key width"]
  X --> K["K: n x key width"]
  X --> V["V: n x value width"]
  Q --> S["Q times K transpose: n x n"]
  K --> S
  S --> A["A: n x n"]
  A --> O["A times V: n x value width"]
  V --> O`,
    },
    {
      id: 'attention-causal-mask',
      title: 'Causal access grows one position at a time',
      caption: 'Each destination can use itself and earlier sources, but never a source to its right.',
      alt: 'Four destination rows showing progressively more allowed source positions and all later source positions blocked.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart TB
  R1["Destination 1: source 1 allowed; 2 3 4 blocked"]
  R2["Destination 2: sources 1 2 allowed; 3 4 blocked"]
  R3["Destination 3: sources 1 2 3 allowed; 4 blocked"]
  R4["Destination 4: sources 1 2 3 4 allowed"]
  R1 --> R2 --> R3 --> R4`,
    },
    {
      id: 'attention-multi-head-handoff',
      title: 'Parallel heads become one residual update',
      caption: 'Each head routes independently; concatenation and the output projection integrate their features before the residual addition.',
      alt: 'Normalized token states feed three parallel attention heads, whose outputs are concatenated, projected, and added to the original residual stream.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  X[Residual stream X] --> N[Normalize]
  N --> H1[Head 1]
  N --> H2[Head 2]
  N --> H3[Head 3]
  H1 --> C[Concatenate]
  H2 --> C
  H3 --> C
  C --> P[Output projection]
  P --> ADD[Residual addition]
  X --> ADD
  ADD --> Y[Updated stream]`,
    },
  ],
  misconceptions: [
    {
      claim: 'Attention weights are probabilities that the source token is the next token.',
      whyPlausible: 'They come from softmax and each row sums to one, just like a vocabulary probability distribution.',
      correction: 'They are routing coefficients over source value rows for one destination, head, and layer. Next-token probabilities are produced later over the vocabulary.',
      diagnostic: 'What objects index the columns of an attention row: source positions or vocabulary items?',
    },
    {
      claim: 'The value with the largest attention weight is copied unchanged.',
      whyPlausible: 'Heatmaps visually emphasize the largest cell, and “attend to” sounds like choosing one item.',
      correction: 'The output is a weighted sum of all allowed value vectors. Even the largest value contribution is transformed and mixed, then combined with other heads.',
      diagnostic: 'If weights are 0.6 and 0.4, can both value rows affect the output?',
    },
    {
      claim: 'Queries, keys, and values are fixed embeddings stored for each word.',
      whyPlausible: 'The same token can be associated with a familiar embedding, and cache discussions refer to stored keys and values.',
      correction: 'They are runtime projections of contextual states. Parameters are reused, but the resulting vectors depend on prompt, position, layer, and prior computation.',
      diagnostic: 'If the same token occurs twice in different contexts, must its layer-ten key vectors be equal?',
    },
    {
      claim: 'Causal masking is optional during training because the correct targets are already known.',
      whyPlausible: 'Training possesses the complete sequence and processes all positions simultaneously.',
      correction: 'The mask prevents a position from reading future tokens that will be unavailable at inference time. Without it, training can leak the answer.',
      diagnostic: 'Could the row predicting position six read the token already stored at position six without creating leakage?',
    },
    {
      claim: 'A high attention weight proves the model used that token as its reason.',
      whyPlausible: 'The weight is a visible connection between positions and often forms an intuitive pattern.',
      correction: 'Prediction effects also depend on values, output projection, residual state, other heads, MLPs, later layers, and the model head. Causal attribution needs interventions.',
      diagnostic: 'Could a high weight multiplying a near-zero value make a small contribution?',
    },
    {
      claim: 'Multi-head attention guarantees that every head learns one named linguistic task.',
      whyPlausible: 'Separate learned projections provide separate capacity, and some heads show recognizable patterns.',
      correction: 'Heads can specialize, overlap, combine, or participate in distributed behavior. Human-readable labels are hypotheses, not architectural guarantees.',
      diagnostic: 'What experiment would distinguish a useful causal role from an attractive heatmap?',
    },
  ],
  exercises: [
    {
      id: 'attention-shape-trace',
      kind: 'trace',
      prompt: 'A head receives 12 token rows with model width 768 and uses key and value widths 64. Give the shapes of Q, K, V, the score matrix, the weight matrix, and the head output.',
      answer: 'Q, K, and V are each 12 by 64. Q times K transpose is 12 by 12, as is the masked row-softmax weight matrix. Multiplying weights 12 by 12 with V 12 by 64 gives a 12 by 64 head output. The two remaining axes correspond to destination positions and value features.',
    },
    {
      id: 'attention-mask-debug',
      kind: 'debug',
      prompt: 'At destination position three, a five-token causal attention row has nonzero weights at source positions one, two, three, and five. Identify the error and explain when it must occur in the calculation.',
      answer: 'Source position five is in the future relative to destination three and must have zero weight. The causal restriction must be applied to scores before row softmax, using a masked-softmax operation or an additive negative-infinity mask. Masking only the displayed heatmap would leave the actual weighted sum contaminated.',
    },
    {
      id: 'attention-value-counterfactual',
      kind: 'predict',
      prompt: 'Keys and query stay fixed, but the first source value changes from [2, 0] to [20, 0]. What happens to attention weights and to the output in the glass-box example?',
      answer: 'The weights do not change because they depend on query–key scores, not values. The first output coordinate increases by the first weight times 18, approximately 0.2483 times 18 or 4.4694. This separates selection behavior from transported content.',
    },
    {
      id: 'attention-softmax-shift',
      kind: 'calculate',
      prompt: 'A permitted score row is [2, 1, -1]. Compute stable-softmax exponents after subtracting the maximum, and explain why adding 100 to every original score leaves the weights unchanged.',
      answer: 'Subtracting 2 gives [0, -1, -3], so the exponents are approximately [1, 0.3679, 0.0498]. Adding 100 changes the maximum to 102, and subtracting it produces the same [0, -1, -3]. More generally, a common exponential factor cancels between every numerator and the denominator.',
    },
    {
      id: 'attention-axis-debug',
      kind: 'debug',
      prompt: 'An implementation normalizes each score-matrix column so that every source distributes one unit of weight across destinations. Why is this the wrong axis for ordinary causal self-attention?',
      answer: 'Each destination needs its own distribution over eligible sources. Therefore each destination row must sum to one across source columns. Column normalization instead asks how a source distributes weight across destinations and does not produce the coefficients required for each destination’s weighted value sum.',
    },
    {
      id: 'attention-convex-check',
      kind: 'calculate',
      prompt: 'Allowed scalar values are 2, 5, and 9, and attention weights are non-negative and sum to one. Can the immediate weighted sum be 12? Explain.',
      answer: 'No. A non-negative weighted average whose weights sum to one must lie between the smallest and largest values, here 2 and 9. A later output projection or residual addition could produce 12, but the immediate softmax-weighted scalar mixture cannot.',
    },
    {
      id: 'attention-evidence-transfer',
      kind: 'transfer',
      prompt: 'A behavior-only API changes its completion after “animal” is replaced by “truck.” May you conclude that one attention head shifted weight from “animal” to “street”? State the strongest justified claim.',
      answer: 'No internal routing claim is justified without exposed or independently measured activations. The strongest claim is that the observable completion behavior changed under that input intervention. Many internal mechanisms could produce the difference, including tokenization, attention, MLP updates, and later decoding effects.',
    },
    {
      id: 'attention-residual-handoff',
      kind: 'trace',
      prompt: 'Explain why the attention output usually needs an output projection before residual addition, and state the required final shape.',
      answer: 'Concatenated heads occupy separate feature blocks and have total width h times d_v. The learned output projection mixes those features and maps them into the residual-stream coordinate system. Its result must have shape n by d_model so it can be added elementwise to X.',
    },
  ],
  glossary: [
    { term: 'attention head', definition: 'One set of learned query, key, value, and routing calculations inside a multi-head attention sublayer.' },
    { term: 'query', definition: 'A destination-side vector used to score which source keys match for one attention head.' },
    { term: 'key', definition: 'A source-side vector compared with queries to produce attention scores.' },
    { term: 'value', definition: 'A source-side vector carrying the information combined by normalized attention weights.' },
    { term: 'scaled dot product', definition: 'A query–key dot product divided by the square root of key width before softmax.' },
    { term: 'causal mask', definition: 'An access rule that prevents a destination position from assigning attention weight to future source positions.' },
    { term: 'stable softmax', definition: 'Softmax evaluated after subtracting a row maximum, preserving probabilities while avoiding numerical overflow.' },
    { term: 'attention matrix', definition: 'The destination-by-source matrix of normalized routing weights for one layer and head.' },
    { term: 'multi-head attention', definition: 'Parallel attention heads whose outputs are concatenated and mapped through an output projection.' },
    { term: 'output projection', definition: 'The learned matrix that mixes concatenated head features into a model-width residual update.' },
    { term: 'residual stream', definition: 'The evolving model-width token-state matrix to which attention and MLP sublayers add updates.' },
    { term: 'glass-box calculation', definition: 'A fully inspectable educational computation with declared values, assumptions, and provenance.' },
  ],
};
