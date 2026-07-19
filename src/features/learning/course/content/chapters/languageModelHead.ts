import type { CourseTheoryChapter } from '../theoryTypes';

export const LANGUAGE_MODEL_HEAD_CHAPTER: CourseTheoryChapter = {
  question: 'How does the final token state become a distribution and then one chosen token?',
  estimatedMinutes: 55,
  prerequisites: [
    'Interpret a token state as one row with model width d_model.',
    'Read a matrix multiplication shape and compute a dot product.',
    'Recognize logits as unrestricted numerical scores rather than probabilities.',
    'Use natural logarithms and exponentials with a calculator.',
  ],
  objectives: [
    'Trace the final position state through normalization, unembedding, logits, stable softmax, and decoding.',
    'Write the shapes of the last-position state, unembedding matrix, bias, logit row, and vocabulary distribution.',
    'Calculate a transparent six-token softmax and a next-token negative log-likelihood.',
    'Explain why positive temperature changes probability concentration but cannot change logit ranking.',
    'Compare greedy, categorical, top-k, and top-p decoding as application-level policies over network scores.',
    'Distinguish model probability from truth, correctness, and calibrated real-world confidence.',
  ],
  sections: [
    {
      id: 'head-place-in-story',
      eyebrow: 'Orientation',
      heading: 'The model has a state, but the application needs a token',
      diagramIds: ['lm-head-course-location'],
      body: String.raw`Our shared prompt is **“The animal did not cross the street because it was too …”**. After tokenization, embeddings, attention, MLP transformations, and residual additions, the final transformer block leaves one contextual state at every visible position. The last visible position—here associated with “too”—summarizes information the network has made available for predicting what comes next. It is still a vector in the model’s internal feature space. It is not a word, a probability table, or a chosen continuation.

The language-model head bridges that representation boundary. A common decoder-only model first applies a final normalization, then maps the last-position vector to one scalar score for every vocabulary item. Those scores are **logits**. Softmax converts the logit row into a normalized distribution. An application-level decoding policy then decides whether to take the highest-probability token or sample from a filtered distribution.

That sequence contains two different systems that interfaces often blur together:

1. The neural network computes states and vocabulary scores from learned parameters.
2. The surrounding application applies temperature, filtering, random sampling, stopping rules, and other generation policy.

The division matters because identical network logits can produce different output tokens under different decoders or random seeds. Conversely, changing model parameters or prompt context changes logits even if decoding settings stay fixed. Calling everything “the model choosing” hides a useful engineering boundary.

The input–operation–output contract is:

1. **Input:** the final state $h_{last}$ with shape $1\times d_{model}$.
2. **Optional architectural step:** final normalization, depending on the model design.
3. **Learned operation:** unembedding into one logit per vocabulary item.
4. **Normalization:** numerically stable softmax produces non-negative values summing to one.
5. **Application policy:** temperature and an optional filter define a decoding distribution; greedy selection or random sampling emits one token ID.
6. **Loop:** the token is decoded to text, appended, and becomes input for the next generation step.

This chapter follows that boundary all the way through. By the end, “tired” receiving probability $0.48$ will be a checkable numerical result rather than a mysterious confidence label.`,
    },
    {
      id: 'unembedding-shapes',
      eyebrow: 'Projection',
      heading: 'Unembedding asks every vocabulary item for one score',
      diagramIds: ['lm-head-shape-ledger'],
      body: String.raw`Let the vocabulary contain $|V|$ token IDs. The last-position state is a row vector

$$
h_{last}\in\mathbb{R}^{1\times d_{model}}.
$$

If the architecture uses final normalization, write $\tilde h_{last}=\operatorname{Norm}(h_{last})$. The normalization can rescale and recenter features according to the model’s learned normalization parameters, but it does not change the row’s width. The unembedding then computes

$$
z=\tilde h_{last}W_U+b_U,
$$

with

$$
W_U\in\mathbb{R}^{d_{model}\times |V|},\qquad
b_U\in\mathbb{R}^{1\times |V|},\qquad
z\in\mathbb{R}^{1\times |V|}.
$$

The shape ledger is therefore

$$
(1\times d_{model})(d_{model}\times |V|)+(1\times |V|)
=1\times |V|.
$$

Column $j$ of $W_U$ and bias entry $j$ together define how internal features contribute to vocabulary token $j$’s logit. The resulting scalar $z_j$ is an unrestricted score: it may be positive, zero, or negative. Only score differences matter to softmax. Adding the same constant to every logit leaves the probabilities unchanged.

Some models tie the unembedding matrix to the input embedding table, typically through a transpose under this row-vector convention. Weight tying reuses parameters, but it does not make embedding lookup and unembedding the same operation. Input embedding maps one discrete token ID to a model-width row. Unembedding maps one model-width row to scores across all token IDs. Other models keep separate matrices. The course should state the convention for the inspected architecture rather than implying that tying is universal.

During training, the network can compute vocabulary logits for every sequence position in parallel. If $H$ has shape $n\times d_{model}$, then $HW_U$ has shape $n\times|V|$: each row predicts the next target associated with that position. During ordinary autoregressive generation, the application needs only the newest prediction, so we focus on the last row. Efficient implementations may still represent batched prompts, multiple sequences, or several candidate beams; those add batch or beam axes without changing the conceptual map from model width to vocabulary width.

Unembedding does not search a dictionary for the nearest English word. Vocabulary columns correspond to tokens, which may be whole words, word fragments, spaces, punctuation, or bytes depending on the tokenizer. The selected token ID may therefore render as only part of the continuation. The generation loop operates in token space even when the interface presents fluent text.`,
    },
    {
      id: 'stable-softmax-worked-example',
      eyebrow: 'Glass-box calculation',
      heading: 'Exact transparent logits become the shared candidate distribution',
      diagramIds: ['lm-head-stable-softmax'],
      body: String.raw`This is an **exact educational glass-box calculation**. The six candidates and numbers are chosen to expose the arithmetic; they are not claimed to be hidden Bonsai logits. Suppose unembedding produces logits equal to the natural logarithms of these six positive masses:

| Candidate | Logit $z_j$ | Unnormalized mass $e^{z_j}$ |
| --- | ---: | ---: |
| tired | $\ln(0.48)\approx-0.7340$ | $0.48$ |
| frightened | $\ln(0.21)\approx-1.5606$ | $0.21$ |
| late | $\ln(0.14)\approx-1.9661$ | $0.14$ |
| small | $\ln(0.09)\approx-2.4079$ | $0.09$ |
| dark | $\ln(0.05)\approx-2.9957$ | $0.05$ |
| period | $\ln(0.03)\approx-3.5066$ | $0.03$ |

These masses sum to exactly one, so ordinary softmax recovers the requested distribution. To demonstrate the numerically stable method, subtract the largest logit, $m=\ln(0.48)$. The shifted logits are

$$
z-m=
\begin{bmatrix}
0,&
\ln(0.21/0.48),&
\ln(0.14/0.48),&
\ln(0.09/0.48),&
\ln(0.05/0.48),&
\ln(0.03/0.48)
\end{bmatrix}.
$$

Exponentiating gives exact ratios

$$
\begin{bmatrix}
1,&0.4375,&0.291\overline{6},&0.1875,&0.1041\overline{6},&0.0625
\end{bmatrix}.
$$

Their sum is $2.0833\overline{3}=25/12$. Dividing every entry by that sum yields

$$
p=
\begin{bmatrix}
0.48,&0.21,&0.14,&0.09,&0.05,&0.03
\end{bmatrix}.
$$

The invariants are visible: all entries are non-negative, the row sums to exactly one, and the highest logit remains the highest probability. Subtracting the maximum did not change the distribution because the common exponential factor cancels:

$$
\frac{e^{z_j-m}}{\sum_t e^{z_t-m}}
=\frac{e^{z_j}/e^m}{\sum_t e^{z_t}/e^m}
=\frac{e^{z_j}}{\sum_t e^{z_t}}.
$$

Why bother subtracting the maximum if our negative logits are harmless? Real logit magnitudes can be much larger. Directly calculating $e^{1000}$ exceeds common floating-point ranges, while stable softmax turns the largest exponent into $e^0=1$ and makes every other exponent at most one. The mathematical answer stays the same, but the implemented computation remains finite.

This table is only a six-token teaching vocabulary. A production distribution spans the model’s complete token vocabulary, including candidates not shown in a user interface. A chart that renormalizes only displayed candidates would describe the selected subset, not the original full-vocabulary probabilities, unless the omitted mass were explicitly accounted for.`,
    },
    {
      id: 'probability-and-loss',
      eyebrow: 'Learning signal',
      heading: 'Probability becomes loss only after a target is supplied',
      body: String.raw`At inference time, the distribution supports a decoding decision. During training, the data supplies the actual next-token target $y$, and the model is penalized by negative log-likelihood:

$$
\mathcal{L}=-\ln p_y.
$$

If the training target for the shared candidate row is “tired,” then

$$
\mathcal{L}_{tired}=-\ln(0.48)\approx0.734.
$$

For a contrasting target, suppose the recorded continuation is the period token with probability $0.03$. Then

$$
\mathcal{L}_{period}=-\ln(0.03)\approx3.507.
$$

The lower-probability observed target incurs a much larger loss. The logarithm makes confident mistakes expensive: reducing the target probability from $0.48$ to $0.03$ multiplies the probability by $1/16$, and increases loss by $\ln(16)\approx2.773$. If the target were “frightened,” the loss would be $-\ln(0.21)\approx1.561$.

Only the target column appears explicitly in the compact loss formula, but softmax couples all logits through its denominator. Raising a competing logit can reduce $p_y$ even when the target logit stays fixed. Backpropagation therefore sends a gradient across the vocabulary row, encouraging the target logit upward relative to competitors. The optimizer later uses accumulated gradients to update parameters throughout the model, including the unembedding and the transformations that produced $h_{last}$.

A target is not declared metaphysically true by the loss function. It is the next token recorded in a particular training example. Natural language often has many plausible continuations, but teacher-forced training observes one token at each position. Across many examples, the model can learn to distribute probability among alternatives. For this prompt, “tired,” “frightened,” and “small” may all make grammatical sense under different imagined situations. The data distribution, not a formal logic engine, supplies supervision.

Probability is also not the same as correctness. A model may assign high probability to a false statement because its training patterns, prompt framing, or missing evidence favor that continuation. It may assign modest probability to a true but rare name. The $0.48$ in our glass box means 48 percent of this model distribution’s mass is placed on that token under these stated logits. It does not mean there is a 48 percent chance that “tired” is objectively true about a real animal.`,
    },
    {
      id: 'temperature',
      eyebrow: 'Control',
      heading: 'Positive temperature changes concentration, not ranking',
      diagramIds: ['lm-head-temperature-decoder'],
      body: String.raw`Temperature modifies logits before softmax:

$$
p_j(T)=\frac{\exp(z_j/T)}{\sum_t\exp(z_t/T)},\qquad T>0.
$$

When $0<T<1$, division increases logit differences, making the distribution sharper. When $T>1$, division decreases the differences, making the distribution flatter. As $T$ approaches zero from above, mass concentrates near the maximum logit; as $T$ grows very large, a finite candidate set approaches a uniform distribution.

For every finite positive temperature, ranking is invariant. If $z_a>z_b$, then dividing both sides by positive $T$ preserves the inequality, exponentiation preserves it again, and the shared softmax denominator cannot reverse it. Therefore

$$
z_a>z_b \Longrightarrow p_a(T)>p_b(T) \quad \text{for } T>0.
$$

Temperature can change how much more likely “tired” is than “frightened,” but it cannot make “frightened” outrank “tired” without another operation. This provides a debugging invariant: if a UI shows positive temperature alone reversing candidate order, it is sorting incorrectly, filtering with another rule, rounding aggressively, or changing logits between requests.

The stable implementation subtracts the maximum **after** temperature scaling, or equivalently subtracts the scaled maximum:

$$
p_j(T)=\frac{\exp(z_j/T-m_T)}{\sum_t\exp(z_t/T-m_T)},
\qquad m_T=\max_t(z_t/T).
$$

Temperature does not itself introduce randomness. It defines a different distribution. A greedy decoder still selects the top-ranked token at every positive temperature, so it returns the same token unless ties or numerical edge cases intervene. Randomness appears only when a sampling procedure draws from the distribution.

Calling low temperature “more accurate” is unsafe. Lower temperature concentrates the model’s existing preference; it cannot repair incorrect rankings or introduce missing knowledge. It may make repeated output more predictable, which is useful for some applications, but it can also amplify an confidently wrong top candidate. Higher temperature increases diversity but also increases the chance of low-ranked choices. The appropriate setting depends on the cost of variation, the downstream validation process, and the task—not on a universal intelligence scale.`,
    },
    {
      id: 'decoding-policies',
      eyebrow: 'Application policy',
      heading: 'Greedy, sampling, top-k, and top-p answer different operational questions',
      body: String.raw`Once probabilities exist, the application must turn them into a token ID. The simplest policy is **greedy decoding**: select $\arg\max_j p_j$. For our distribution, greedy returns “tired.” It is deterministic for a fixed score row and tie-breaking rule. It does not find the globally most likely multi-token sequence; it makes the locally highest-ranked decision at each step.

**Categorical sampling** draws one token according to the complete distribution. In repeated draws from the unchanged educational row, “tired” should appear about 48 percent of the time in the long run, “frightened” about 21 percent, and so on. A single draw need not resemble those frequencies. A random seed can make a pseudorandom implementation reproducible, but it does not alter the mathematical probabilities.

**Top-k sampling** retains only the $k$ highest-probability tokens, sets all others to zero, and renormalizes the survivors. With $k=3$, our survivors are “tired,” “frightened,” and “late,” whose original mass is $0.83$. Their filtered probabilities are approximately $0.5783$, $0.2530$, and $0.1687$. The period token becomes impossible in this decoding step even though the network assigned it nonzero probability.

**Top-p**, or nucleus, sampling sorts candidates from most to least probable and retains the smallest prefix whose cumulative mass reaches at least threshold $p$. For threshold $0.80$, cumulative mass progresses $0.48$, $0.69$, $0.83$, so the same first three candidates survive. For threshold $0.60$, “tired” alone is below the threshold but adding “frightened” reaches $0.69$, so two survive. Exact boundary behavior and minimum-token rules should be documented because libraries can differ in implementation details.

Filtering is followed by renormalization and sampling. It is incorrect to report filtered values as the original network probabilities. The application has constructed a new policy distribution from the network distribution. Temperature is usually applied before top-k or top-p because it changes cumulative masses and can therefore change which items a top-p filter retains, even though positive temperature preserves ranking.

Production decoders may also include repetition penalties, forbidden-token lists, grammar constraints, beam search, speculative decoding, stop sequences, or minimum-length rules. These can change ranking or eligibility. The clean architecture boundary remains valuable: logits are network output; decoder transformations are application decisions. Logs and educational interfaces should preserve both when possible so a learner can determine whether a surprising token came from model scoring, filtering, or randomness.`,
    },
    {
      id: 'evidence-and-provenance',
      eyebrow: 'Interpretation',
      heading: 'A probability is a conditional model output, not a certificate of truth',
      body: String.raw`A displayed distribution needs provenance. An **exact educational calculation** declares its complete token set and chosen logits, as this chapter does. A **measured model distribution** requires access to the identified model’s full or partial log probabilities under an exact prompt, tokenizer, checkpoint, and generation configuration. A **live behavioral output** shows generated text but does not reveal hidden logits unless the API explicitly returns them. An **illustrative schematic** explains relationships without claiming measured values.

These labels prevent a common educational mistake: inventing plausible probabilities for a live model and presenting them as internals. If Bonsai returns only text, the defensible observation is the returned text, latency, and other exposed metadata. The six-candidate row can demonstrate softmax and decoding, but it cannot be attributed to Bonsai. Even when an API returns top log probabilities, omitted vocabulary mass must be handled honestly; renormalizing the displayed top candidates creates a different conditional distribution.

Model probabilities are conditional on far more than the visible English sentence. They depend on exact tokenization, system and conversation context, checkpoint, numerical implementation, and any server-side processing. Decoder settings then affect emitted text. A reproducible report should record those conditions rather than treating “the probability of tired” as an intrinsic property of the phrase.

Nor should probability be equated with calibrated confidence about the world. Next-token training rewards matching text distributions. Text frequency and truth can correlate, but they are not identical. The prompt may be underspecified, fictional, adversarial, outdated, or outside the model’s training support. A fluent high-probability continuation can be false. For high-stakes decisions, external evidence and task-specific validation remain necessary.

At the same time, probabilities are not meaningless. They support comparisons under controlled conditions, loss calculation, decoder design, uncertainty-oriented experiments, and regression testing. The correct interpretation is narrow but useful: under a specified model state and context, this is how the network distributes next-token mass. Stronger claims require additional evidence.

A good lab report therefore pairs every result with a limitation. Example: “In the declared six-token glass box, ‘tired’ has the highest logit and probability $0.48$, so every positive temperature preserves its rank.” Limitation: “The candidate set and logits are educational fixtures, not recovered values from a production checkpoint.” This practice teaches mechanism without manufacturing authority.`,
    },
    {
      id: 'experiment-summary-bridge',
      eyebrow: 'Synthesis',
      heading: 'Trace scores, policy, and selection as separate stages',
      body: String.raw`Use the lab in a predict–manipulate–observe loop. First predict whether an intervention affects logits, normalized probabilities, filter membership, or only the random draw. Then change one control. Observe the complete candidate table, row-sum invariant, retained set, renormalized decoder distribution, and selected token. Finally write what changed and at which system boundary.

Useful interventions include adding the same constant to every logit, changing one logit, lowering temperature, changing top-k from three to two, moving the top-p threshold across a cumulative-mass boundary, and repeating samples under fixed or changing seeds. Adding a constant should change neither probabilities nor output policy. Positive temperature should preserve ordering but change concentration. A top-p threshold can alter the retained set. Changing only the seed should leave distributions unchanged while potentially changing the draw.

When debugging, verify shapes first: last state $1\times d_{model}$, unembedding $d_{model}\times|V|$, and logits $1\times|V|$. Verify stable softmax produces finite, non-negative values summing approximately to one. Preserve both pre-filter model probabilities and post-filter decoder probabilities. If greedy output changes with positive temperature while logits do not, inspect extra penalties, filtering, ties, or implementation errors.

The full representation handoff is

$$
h_{last}\;(1\times d_{model})
\longrightarrow
z\;(1\times|V|)
\longrightarrow
p\;(1\times|V|)
\longrightarrow
q_{decoder}\;(1\times|V|)
\longrightarrow
\text{one token ID}.
$$

Here $p$ is the network softmax distribution and $q_{decoder}$ is the possibly temperature-adjusted, filtered, and renormalized application distribution. Keeping separate symbols makes policy visible.

Once a token is emitted, generation is not finished. The token is appended to the sequence, processed as a new position, and another last-position state produces another vocabulary row. Recomputing the entire prefix would waste work, so production decoders cache key and value states from earlier positions. That is the bridge to the next lesson: the language-model head explains **what** one step returns, while generation and the KV cache explain **how repeated steps are executed efficiently**.

The central lesson is simple enough to retrieve without formulas: the network scores tokens; softmax normalizes relative scores; the application chooses a decoding policy; one token is emitted. Mathematics makes each boundary testable, but it should not erase the practical distinction between a score, a probability, a target loss, a policy, a random selection, and a true statement.`,
    },
  ],
  diagrams: [
    {
      id: 'lm-head-course-location',
      title: 'From accumulated state to one appended token',
      caption: 'The language-model head produces scores and probabilities; the application decoder emits one token and repeats the loop.',
      alt: 'Pipeline from final token state through normalization, unembedding, logits, softmax, decoder policy, selected token, and append-and-repeat.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  H[Final last-position state] --> N[Optional final normalization]
  N --> U[Unembedding]
  U --> Z[Vocabulary logits]
  Z --> P[Stable softmax]
  P --> D[Application decoder]
  D --> T[Selected token ID]
  T --> A[Append and repeat]`,
    },
    {
      id: 'lm-head-shape-ledger',
      title: 'Unembedding shape ledger',
      caption: 'One model-width row is compared with every vocabulary column, producing one score per token ID.',
      alt: 'Shape diagram showing a one by model-width state multiplied by a model-width by vocabulary matrix to produce a one by vocabulary logit row.',
      kind: 'shape',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  H["last state: 1 x model width"] --> M["multiply"]
  W["unembedding: model width x vocabulary"] --> M
  B["bias: 1 x vocabulary"] --> M
  M --> Z["logits: 1 x vocabulary"]
  Z --> P["probabilities: 1 x vocabulary"]`,
    },
    {
      id: 'lm-head-stable-softmax',
      title: 'Stable softmax preserves the distribution',
      caption: 'Subtracting one row maximum controls exponent magnitude without changing normalized probabilities.',
      alt: 'Logits flow through maximum subtraction, exponentiation, summation, and division to become non-negative probabilities summing to one.',
      kind: 'mechanism',
      provenance: 'exact educational calculation',
      chart: String.raw`flowchart LR
  Z[Six declared logits] --> S[Subtract row maximum]
  S --> E[Exponentiate shifted values]
  E --> Q[Sum: 25 divided by 12]
  Q --> P["Probabilities: .48 .21 .14 .09 .05 .03"]`,
    },
    {
      id: 'lm-head-temperature-decoder',
      title: 'Network distribution and decoder policy are distinct',
      caption: 'Temperature reshapes the distribution; top-k or top-p changes eligibility; greedy or sampling finally emits a token.',
      alt: 'Branching pipeline from fixed network logits through temperature, optional top-k or top-p filtering, renormalization, then greedy selection or random sampling.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  Z[Fixed network logits] --> T[Positive temperature]
  T --> F{Filter policy}
  F -->|none| R[Decoder distribution]
  F -->|top-k| R
  F -->|top-p| R
  R --> G[Greedy argmax]
  R --> S[Categorical sample]
  G --> O[Token ID]
  S --> O`,
    },
  ],
  misconceptions: [
    {
      claim: 'A logit of 2 means the token has probability 200 percent.',
      whyPlausible: 'Logits are displayed next to candidates and look like direct scores on a familiar scale.',
      correction: 'Logits are unrestricted relative scores. Softmax considers the entire row and converts score differences into probabilities.',
      diagnostic: 'Can two logits both equal 2 even though probabilities must sum to one?',
    },
    {
      claim: 'A 0.48 probability means the continuation is 48 percent likely to be true.',
      whyPlausible: 'Probability language is often used for uncertainty about real-world events.',
      correction: 'It is conditional next-token mass under a specified model and context. Truth requires evidence beyond the text distribution.',
      diagnostic: 'Could a frequent false statement receive higher token probability than a rare true statement?',
    },
    {
      claim: 'Temperature adds randomness to the model.',
      whyPlausible: 'Higher temperature is associated with more varied generated text.',
      correction: 'Temperature deterministically reshapes logits into a distribution. Randomness is introduced only by a sampling operation.',
      diagnostic: 'Does greedy decoding return a random token when temperature is two?',
    },
    {
      claim: 'Positive temperature can make the second-largest logit become the top-ranked token.',
      whyPlausible: 'The probabilities visibly move when temperature changes.',
      correction: 'Division by a positive scalar preserves logit order, and softmax preserves it again. Other penalties or filters are needed to reverse ranking.',
      diagnostic: 'Which inequality changes sign when both sides are divided by a positive number?',
    },
    {
      claim: 'Top-k probabilities are the probabilities originally produced by the network.',
      whyPlausible: 'Interfaces often show only the filtered candidate table.',
      correction: 'Top-k removes candidates and renormalizes survivors, creating an application policy distribution distinct from network softmax.',
      diagnostic: 'Why does tired change from 0.48 to about 0.578 when top-k keeps the first three candidates?',
    },
    {
      claim: 'Greedy decoding finds the most probable complete response.',
      whyPlausible: 'It chooses the most probable token at every visible step.',
      correction: 'A sequence of locally best choices need not maximize the product of probabilities over an entire future sequence.',
      diagnostic: 'Could a slightly lower-probability first token lead to much higher-probability later tokens?',
    },
  ],
  exercises: [
    {
      id: 'lm-head-shapes',
      kind: 'trace',
      prompt: 'A model has width 768 and vocabulary size 50,000. Give the shapes of one last-position state, the unembedding matrix, bias, logits, and probabilities.',
      answer: 'The state is 1 by 768, unembedding is 768 by 50,000, bias is 1 by 50,000, and both logits and probabilities are 1 by 50,000. The inner model-width dimension cancels during projection.',
    },
    {
      id: 'lm-head-loss',
      kind: 'calculate',
      prompt: 'Using the shared distribution, calculate the loss for target tired and compare it with target frightened.',
      answer: 'For tired, negative natural log of 0.48 is approximately 0.734. For frightened, negative natural log of 0.21 is approximately 1.561. Frightened incurs about 0.827 more loss because the model assigned it less target probability.',
    },
    {
      id: 'lm-head-top-k',
      kind: 'calculate',
      prompt: 'Apply top-k with k equal to two to the shared distribution. Which tokens survive, and what are their renormalized probabilities?',
      answer: 'Tired and frightened survive with original mass 0.48 plus 0.21 equal to 0.69. Their new probabilities are 0.48 divided by 0.69, approximately 0.6957, and 0.21 divided by 0.69, approximately 0.3043.',
    },
    {
      id: 'lm-head-top-p',
      kind: 'trace',
      prompt: 'Apply top-p with threshold 0.90 to the shared distribution, retaining the smallest descending prefix that reaches the threshold.',
      answer: 'Cumulative mass is 0.48, 0.69, 0.83, 0.92, so tired, frightened, late, and small survive. Dark and period are removed. The four survivors are then renormalized by dividing each original probability by 0.92.',
    },
    {
      id: 'lm-head-temperature-debug',
      kind: 'debug',
      prompt: 'A UI claims that changing temperature from 0.5 to 2.0, with fixed logits and no other policy, moved frightened above tired. Diagnose the claim.',
      answer: 'It violates positive-temperature ranking invariance. Either logits changed, another penalty or filter was applied, values were rounded or sorted incorrectly, or the interface is mislabeled. Temperature alone cannot reverse the order.',
    },
    {
      id: 'lm-head-constant-shift',
      kind: 'predict',
      prompt: 'Predict what happens if 100 is added to every shared logit before stable softmax.',
      answer: 'Probabilities remain exactly the same because a common exponential factor cancels. A stable implementation subtracts the new maximum, returning the same shifted logits as before. Only absolute scores change.',
    },
    {
      id: 'lm-head-provenance',
      kind: 'transfer',
      prompt: 'Bonsai returns the text “tired” but no log probabilities. Can the lab display 0.48 as Bonsai’s probability? State the justified observation.',
      answer: 'No. The justified observation is that Bonsai emitted the token or text tired under the recorded request settings. The 0.48 fixture may demonstrate a glass-box mechanism, but it cannot be attributed to Bonsai without exposed measured scores.',
    },
    {
      id: 'lm-head-greedy-vs-global',
      kind: 'transfer',
      prompt: 'Explain in one example why greedy next-token choice need not maximize the probability of a two-token continuation.',
      answer: 'Suppose first token A has probability 0.6 but its best successor has probability 0.1, giving path probability 0.06. Token B has probability 0.4 and its best successor 0.9, giving 0.36. Greedy chooses A locally even though the B path is globally more probable.',
    },
  ],
  glossary: [
    { term: 'language-model head', definition: 'The final mapping from contextual model states to vocabulary logits.' },
    { term: 'unembedding', definition: 'The learned projection from model-width features to one score per vocabulary token.' },
    { term: 'logit', definition: 'An unrestricted relative score that becomes a probability only after normalization with competing scores.' },
    { term: 'vocabulary distribution', definition: 'A normalized row assigning next-token probability mass across the model vocabulary.' },
    { term: 'stable softmax', definition: 'Softmax evaluated after subtracting the row maximum to avoid overflow without changing probabilities.' },
    { term: 'negative log-likelihood', definition: 'Training loss equal to the negative natural logarithm of the probability assigned to the observed target.' },
    { term: 'temperature', definition: 'A positive divisor applied to logits before softmax to adjust probability concentration.' },
    { term: 'greedy decoding', definition: 'Selecting the highest-ranked candidate at the current generation step.' },
    { term: 'categorical sampling', definition: 'Randomly drawing one token according to a declared probability distribution.' },
    { term: 'top-k', definition: 'A decoder filter retaining the k highest-ranked candidates before renormalization and sampling.' },
    { term: 'top-p', definition: 'A decoder filter retaining the smallest descending candidate prefix whose cumulative mass reaches a threshold.' },
    { term: 'decoder policy distribution', definition: 'The possibly temperature-adjusted and filtered distribution used by the application to select a token.' },
    { term: 'weight tying', definition: 'Reusing the input embedding parameters for the output projection under a compatible transpose convention.' },
  ],
};
