import type { CourseTheoryChapter } from '../theoryTypes';

export const CAPSTONE_CHAPTER = {
  question: 'Can you trace one prompt through the complete LLM system, identify every representation change, and state which conclusions require actual execution?',
  estimatedMinutes: 48,
  prerequisites: [
    'You can distinguish visible text, token IDs, token states, attention updates, residual states, logits, probabilities, and selected tokens.',
    'You can explain the roles of tokenization, embeddings, position, transformer blocks, attention, MLPs, residual connections, the language-model head, and decoding.',
    'You understand the prefill and decode phases and the purpose of a key-value cache.',
    'You can distinguish inference-time activations from stored parameters and explain how training updates parameters.',
  ],
  objectives: [
    'Narrate the complete path from the shared unfinished sentence to one selected next token without collapsing distinct representations.',
    'Classify claims as directly observable, exact glass-box, model-dependent runtime result, application-controlled, or fixed during inference.',
    'Trace the counterfactual replacement animal → robot and identify which downstream values may change and which contracts remain stable.',
    'Use an end-to-end ledger to name each stage’s input, operation, output, shape, and controlling part of the system.',
    'Separate structural predictions that follow from the architecture from exact numerical results that require model execution.',
    'Trace the generation loop through decoding and KV-cache reuse, then branch from logits into the training objective and optimizer update.',
    'Design an evidence-backed experiment that tests one causal dependency without claiming access to hidden production internals.',
  ],
  sections: [
    {
      id: 'capstone-contract',
      eyebrow: 'Mission',
      heading: 'Trace one changing representation and label the strength of every claim',
      body: String.raw`The course began with one unfinished sentence:

> The animal did not cross the street because it was too …

The capstone asks you to follow this input through an entire autoregressive language-model system, then repeat the trace after replacing animal with robot. The goal is not to memorize a list of component names. It is to explain what representation enters each stage, what operation occurs, what representation leaves, who controls the operation, and what evidence supports the explanation.

Use five claim classes throughout the trace.

1. **Directly observable** means visible at a documented interface: supplied text, returned text, latency, streamed chunks, or exposed token IDs and probabilities when an identified API actually returns them.
2. **Exact glass-box** means calculated from fully declared educational inputs. A toy matrix addition can be exact without being a production-model measurement.
3. **Model-dependent runtime result** means an activation or output whose exact value depends on the identified model, tokenizer, parameters, context, numerical implementation, and current execution. It must be measured rather than invented.
4. **Application-controlled** means chosen by surrounding software: prompt assembly, retrieval, tool calls, temperature, top-$p$, maximum length, stop rules, and often caching or batching policy.
5. **Fixed during inference** means stored configuration or learned parameters are read but not updated during an ordinary forward pass. Vocabulary, embedding rows, projection weights, and MLP weights normally belong here for a loaded model artifact.

These classes describe different dimensions of evidence and control. A model's returned text is directly observable and also influenced by application-controlled decoding. A tokenizer vocabulary may be fixed during inference and directly inspectable if the tokenizer is published. When asked for one label, choose the class most relevant to the claim being evaluated and mention overlaps when they matter.

The complete pipeline diagram is an illustrative map, not a dump of Bonsai internals. Each arrow is a representation contract that later sections will audit.`,
      diagramIds: ['complete-inference-pipeline'],
    },
    {
      id: 'text-to-initial-state',
      eyebrow: 'Stages 1–3',
      heading: 'Visible text becomes token occurrences and then model-width initial states',
      body: String.raw`The first representation is a character string assembled by the application. It may include system instructions, conversation history, retrieved passages, tool results, role markers, and the visible user prompt. Prompt assembly is application-controlled. The final string or structured message payload can be directly observed when the product exposes it; hidden system instructions cannot be inferred reliably from output alone.

The identified tokenizer converts text to vocabulary pieces and integer IDs:

$$
(t_1,\ldots,t_n)=T(\text{text}).
$$

For a published deterministic tokenizer and exact input bytes, the result is reproducible. For an undisclosed production tokenizer, exact boundaries and IDs are model-dependent and require execution or documentation. Replacing animal with robot may change one token ID, several token IDs, or even the total sequence length. We can predict that tokenization must be reconsidered; we cannot predict the exact IDs without the tokenizer.

Each token ID selects a row from an embedding matrix $E$ with shape $V \times d_{\text{model}}$. In the additive educational pattern, position information $P$ combines with selected token rows:

$$
X^{(0)} = E[t_1,\ldots,t_n] + P.
$$

The result has shape $n \times d_{\text{model}}$: one initial state per token occurrence. Embedding parameters and architecture configuration are fixed during ordinary inference. The selected initial-state values are model-dependent runtime results because they depend on token IDs, learned rows, position method, and numerical execution. A declared toy table can instead produce exact glass-box values.

The animal → robot counterfactual has a clear causal entry point. If both words occupy one token under the chosen tokenizer, the sequence length and position indices can remain unchanged while the selected row at that position changes. If their token counts differ, later token positions shift, masks and positional treatment change, and many downstream tensors change shape. The architecture contract still holds: there is one initial state per resulting token position and every state has model width.

Do not call the initial vector the complete meaning of animal or robot in the sentence. It is a reusable starting representation. Contextual distinctions emerge as transformer blocks process the sequence.`,
    },
    {
      id: 'blocks-and-residual',
      eyebrow: 'Stages 4–6',
      heading: 'Attention communicates, the MLP transforms, and residual additions accumulate updates',
      body: String.raw`The initial-state matrix enters a stack of transformer blocks. In a common sequential pre-normalization block,

$$
R' = R + \operatorname{Attention}(\operatorname{LN}(R)),
$$

$$
R_{\text{next}} = R' + \operatorname{MLP}(\operatorname{LN}(R')).
$$

Attention lets each position gather a learned weighted mixture from permitted positions. For one head, a common calculation is

$$
Q=RW_Q,\qquad K=RW_K,\qquad V=RW_V,
$$

$$
A=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}+M\right),
\qquad O=AV.
$$

The causal mask $M$ prevents a generation position from reading future tokens. Multi-head outputs are combined and projected back to model width before residual addition. The MLP operates per position, commonly expanding to a feed-forward width before projecting back. Both branches ultimately return updates compatible with the $n \times d_{\text{model}}$ residual state.

For the final position too, attention can route information from earlier permitted positions. Replacing animal with robot changes at least one initial state when tokenization length is stable. That change may alter queries, keys, values, attention scores, routed updates, MLP activations, and residual states across later layers. “May” is the correct structural claim. Exact attention weights and activation values are model-dependent runtime results and cannot be deduced from the visible word substitution alone.

Some contracts remain fixed. Projection matrix shapes and parameter values do not change during ordinary inference. A causal decoder still blocks access to nonexistent future continuation tokens. Each residual write must return to model width. These are architecture or loaded-model facts, not measured semantic effects.

An attention heatmap is not a causal explanation by itself. A high weight shows routing under one head and layer, while value content, output projections, MLPs, other heads, and later layers all affect the final result. A text-only production endpoint supplies no hidden attention values. An AI Lab heatmap must therefore identify whether it is an exact toy calculation, an actual tensor from an inspectable model, or an illustrative schematic.`,
    },
    {
      id: 'head-decoder-cache',
      eyebrow: 'Stages 7–9',
      heading: 'The final state becomes vocabulary scores, then application policy selects and repeats',
      body: String.raw`After the last transformer block, the model reads the final position's residual state through its output pathway. A simplified form is

$$
z = W_U\operatorname{LN}(r_{\text{last}}),
\qquad
p_i = \frac{e^{z_i}}{\sum_j e^{z_j}}.
$$

The logit vector $z$ and probability vector $p$ have vocabulary width $V$. The final residual state has model width $d_{\text{model}}$. The language-model head changes the representation from accumulated token-state features to one score per possible next token.

The model has now scored candidates but has not necessarily chosen one. Surrounding application or serving code applies a decoder: greedy choice, temperature-adjusted sampling, top-$k$, top-$p$, structured constraints, penalties, or another policy. Decoding settings are application-controlled even when a hosted provider hides some defaults. The selected token ID is converted to text and appended to context.

Generation then repeats. During prefill, the model processes the prompt and forms attention keys and values for its positions. During decode, it computes the next token while reusing cached keys and values for prior positions. The cache is a runtime optimization containing layer-specific projected states, not a memory of prose and not the complete residual stream. Cache use can be controlled by serving implementation and constrained by memory.

The animal → robot substitution can change final logits and selected text because its effect may propagate through the stack. It can also change prefill cost if token count changes. Exact candidate rankings, probabilities, latency, and generated continuation require execution under a named tokenizer, model, hardware path, cache state, and decoding configuration. By contrast, we can predict structurally that a greedy decoder selects the maximum eligible score and that a selected token becomes context for the next step.

The generation-loop diagram separates model-dependent scoring from application-controlled selection and cache policy. A product may return only final text. In that case, text and coarse timing are observable, but internal logits, probability distributions, and cache contents are not.`,
      diagramIds: ['generation-and-cache-loop'],
    },
    {
      id: 'end-to-end-ledger',
      eyebrow: 'Audit',
      heading: 'A compact ledger keeps representations, shapes, control, and evidence aligned',
      body: String.raw`Use this ledger before making any interpretation claim:

| Stage | Input → output | Typical shape | Main control | Evidence class for exact value |
| --- | --- | --- | --- | --- |
| Prompt assembly | messages → input text | bytes or characters | application | directly observable if exposed |
| Tokenization | text → IDs | $n$ | tokenizer fixed during inference | exact with identified tokenizer; otherwise runtime-dependent |
| Embedding and position | IDs → initial states | $n \times d_{\text{model}}$ | learned parameters and architecture | model-dependent; exact in declared glass box |
| Transformer stack | states → contextual residual states | $n \times d_{\text{model}}$ | fixed weights, runtime context | model-dependent runtime result |
| LM head | final state → logits | $V$ at prediction position | fixed output weights | model-dependent runtime result |
| Softmax | logits → probabilities | $V$ | fixed numerical operation | exact given exposed logits |
| Decoding | probabilities → selected ID | scalar per step | application policy | observable only if exposed or reconstructed exactly |
| Token decoding | IDs → emitted text | variable | tokenizer | directly observable output |
| KV cache | prior K/V → reused K/V | layer/head dependent | serving implementation | runtime result, often hidden |
| Training | targets and logits → updated parameters | model dependent | objective and optimizer | separate from ordinary inference |

The ledger distinguishes a known transformation from its unknown values. You can know that the output head produces $V$ logits without knowing any logit. You can know that replacing animal might change downstream states without knowing the direction or magnitude. You can know that greedy decoding selects an argmax if greedy decoding is actually configured; you cannot infer a hidden configuration merely because one run looks deterministic.

The ledger also exposes ownership. Learned parameters determine mappings but remain fixed during inference. Runtime activations depend on parameters and current context. Application code determines prompt composition and decoding. External systems determine retrieved or tool-provided evidence. Good diagnosis identifies the owner before changing a control.

When comparing the original and counterfactual prompts, preserve all documented controls other than the intended substitution: model version, tokenizer, system message, decoding settings, random seed when supported, maximum tokens, tool availability, retrieval results, and cache conditions. Otherwise a changed output cannot be attributed cleanly to animal → robot.`,
      diagramIds: ['counterfactual-dependency'],
    },
    {
      id: 'counterfactual-experiment',
      eyebrow: 'Counterfactual',
      heading: 'Predict causal reach without inventing the direction of the effect',
      body: String.raw`A counterfactual changes one input while attempting to hold other causes constant. Here the intervention is

$$
\text{animal} \longrightarrow \text{robot}.
$$

Before execution, classify expected effects.

- The visible prompt change is **directly observable**.
- Prompt replacement is **application-controlled**.
- Token IDs and token count are **exact only after applying the identified tokenizer**.
- Stored model weights are **fixed during inference**.
- Selected embedding rows, contextual states, logits, and probabilities are **model-dependent runtime results**.
- A toy trace using declared token rows and matrices is an **exact glass-box** result but not a production measurement.
- The decoder setting is **application-controlled**; the returned continuation is **directly observable**.

Some causal dependencies are guaranteed by the dataflow. Tokenization occurs before embedding lookup. A changed ID selects a different row. If sequence length changes, later occurrence positions and tensor sequence dimensions change. Transformer outputs depend on their input states. Logits depend on the final state. Later decode steps depend on earlier selected tokens.

Other outcomes are not guaranteed. The top candidate might remain the same despite different logits. A change in one early hidden state might be attenuated or redirected. Sampling might produce different output even under identical probabilities, or the same output under changed probabilities. Latency may vary because of unrelated system load. Exact direction and magnitude require controlled execution and, for hidden claims, actual tensor access.

Run repeated or seeded trials appropriate to the claim. Greedy comparison reduces selection randomness but still measures only one configuration. Seeded sampling can make selection reproducible when the implementation guarantees it. Multiple samples characterize behavioral variation but do not reveal internal causality. If an inspectable educational model exposes tensors, compare stage by stage and mark the first changed value. If only text is exposed, keep conclusions at the behavioral level.

The dependency diagram uses solid arrows for architectural dataflow and avoids semantic labels on internal vectors. It shows where an intervention can propagate, not what a named neuron “means.”`,
      diagramIds: ['counterfactual-dependency'],
    },
    {
      id: 'training-branch',
      eyebrow: 'Learning',
      heading: 'Training branches from logits and targets instead of selecting a response token',
      body: String.raw`Inference and training share a forward computation, then diverge. During supervised next-token training, the dataset provides the observed target token for each prediction position. If the correct target is $y$, cross-entropy or negative log-likelihood measures how much probability the model assigned to it:

$$
\mathcal{L}=-\log P_\theta(y\mid x_{<t}).
$$

Backpropagation uses the chain rule to compute how the loss changes with respect to model parameters. An optimizer then updates parameters, schematically:

$$
\theta_{\text{new}}=\theta-\eta\nabla_\theta\mathcal{L}.
$$

Here $\eta$ is a learning rate in the simplest gradient-descent picture. Production optimizers maintain additional state, aggregate batches, use schedules, regularization, clipping, mixed precision, and distributed computation. The conceptual boundary remains: gradients plus an optimizer change stored parameters.

The training branch does not normally sample a token and judge whether the resulting paragraph feels good. Teacher forcing supplies known prefixes and targets, allowing losses at many positions to be computed in parallel under causal masking. The loss is scalar or aggregated, but its gradients reach embedding rows, attention projections, MLP weights, normalization parameters, and the output head according to their contribution.

Adding “The robot…” to an ordinary chat changes the current context but does not execute this training branch. Retrieval and tool use similarly supply runtime evidence without updating $\theta$. A product can store external memory or later use conversations in a separate training pipeline, but those are distinct system events requiring explicit policy and implementation.

Training metrics also inherit the plausibility boundary. Reducing next-token loss improves predictions on the training objective and relevant evaluation distribution. It does not automatically guarantee factuality, fairness, robustness, or safe tool use. Those qualities need dedicated data, objectives, system controls, and evaluation.

The training diagram deliberately branches before decoder selection. It shows that the same logits can feed either inference-time decoding or a target-based loss, while only the optimization path modifies parameters.`,
      diagramIds: ['inference-training-branch'],
    },
    {
      id: 'final-protocol',
      eyebrow: 'Demonstration',
      heading: 'A successful capstone states contracts, evidence, and uncertainty',
      body: String.raw`Your final demonstration should narrate both prompts side by side. At each stage, name the representation, its shape, the controlling component, the expected dependency, and the evidence class. Use exact arithmetic only where all inputs are declared. Use measured language for executed results. Use conditional language for architecture-dependent predictions.

A strong statement sounds like this: “With this published tokenizer, animal is one token and robot is one token, so both traces have the same sequence length but select different embedding rows. The model weights and model width remain fixed. The resulting hidden states and logits may change; these exact values require executing the identified model. Under the fixed greedy decoder, both runs selected the directly observable continuation tired.”

A weak statement sounds like this: “The robot embedding makes the model think mechanically, so attention decides that tired is wrong.” It assigns unmeasured semantics to a vector, treats attention as a decision-maker, omits the decoder, and offers no provenance.

The capstone is complete when you can answer four audits. **Representation audit:** did every arrow connect compatible objects? **Control audit:** did you separate model parameters, runtime state, and application policy? **Evidence audit:** did each exact claim name its source? **Causal audit:** did the intervention change only the intended variable, and did you avoid claiming more than the observations support?

The lab should remain usable without a live model. Its glass-box fixture can provide deterministic token IDs, vectors, attention calculations, residual additions, logits, softmax, and decoding. A live option can compare observable text behavior through the shared API boundary. The two lanes should be visually distinct so educational calculations are never mistaken for hidden production internals.

This course ends where it began: one next-token prediction. The difference is that the path is no longer mysterious. Text becomes token IDs; IDs become position-aware states; blocks update a residual stream; the head produces vocabulary scores; application decoding selects; caching accelerates repetition; and training uses targets and gradients to change future mappings. That complete narration is the durable mental model.`,
    },
  ],
  diagrams: [
    {
      id: 'complete-inference-pipeline',
      title: 'Complete representation path for one next-token step',
      caption: 'Illustrative synthesis of the course pipeline. It describes architectural roles, not measured Bonsai internals.',
      alt: 'Pipeline from application-assembled text through tokenization, embedding and position, transformer blocks and residual states, language-model head, probabilities, decoder, selected token, and appended context.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  A["application text"] --> T["token pieces and IDs"]
  T --> E["initial token states"]
  E --> B["transformer blocks"]
  B --> R["final residual states"]
  R --> H["vocabulary logits"]
  H --> P["probabilities"]
  P --> D["application decoder"]
  D --> S["selected token"]
  S --> C["append to context"]`,
    },
    {
      id: 'generation-and-cache-loop',
      title: 'Prefill once, then decode repeatedly with reusable K/V',
      caption: 'Illustrative serving loop. Exact cache layout, batching, and optimization are implementation-dependent.',
      alt: 'Prompt prefill creates initial keys and values, the newest token runs a decode step using cached prior keys and values, decoding selects a token, and the new keys and values join the cache.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  P["prompt prefill"] --> K["K/V cache for prompt"]
  P --> L["next-token logits"]
  K --> D["decode newest position"]
  L --> S["decoder selects token"]
  S --> D
  D --> N["new logits and new K/V"]
  N --> K
  N --> S`,
    },
    {
      id: 'counterfactual-dependency',
      title: 'Where animal → robot can propagate',
      caption: 'Illustrative causal dependency map. It predicts possible reach, not exact direction or magnitude.',
      alt: 'The visible word replacement can change tokenization, selected embedding rows and positions, contextual states, logits, selected output, and later generation context, while stored weights remain fixed.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  I["intervention<br/>animal becomes robot"] --> T["tokenization may change"]
  T --> E["initial states may change"]
  E --> R["runtime block states may change"]
  R --> L["logits may change"]
  L --> O["selected output may change"]
  O --> N["later context changes"]
  W["stored weights<br/>fixed during inference"] --> E
  W --> R
  W --> L
  D["decoder policy<br/>application-controlled"] --> O`,
    },
    {
      id: 'inference-training-branch',
      title: 'The same logits feed two different system paths',
      caption: 'Illustrative branch separating inference-time selection from target-based parameter optimization.',
      alt: 'Forward-pass logits branch to an application decoder during inference or combine with target tokens to form loss, gradients, and optimizer updates during training.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  F["forward pass"] --> L["logits"]
  L --> D["inference decoder"]
  D --> O["selected token"]
  L --> X["loss with target token"]
  Y["dataset target"] --> X
  X --> G["backpropagation gradients"]
  G --> U["optimizer update"]
  U --> W["changed parameters"]`,
    },
  ],
  misconceptions: [
    {
      claim: 'If animal and robot are both one visible word, replacing one must preserve token count and all later positions.',
      whyPlausible: 'Human word boundaries appear stable in the displayed sentence.',
      correction: 'Tokenizers operate on vocabulary pieces, bytes, and learned rules rather than human word counts. Exact boundaries require the identified tokenizer.',
      diagnostic: 'Which executable or published artifact would let you determine whether both strings use one token?',
    },
    {
      claim: 'A changed output proves that the replacement changed the most important attention weight.',
      whyPlausible: 'Attention is a visible communication mechanism and heatmaps invite single-cause explanations.',
      correction: 'The change can propagate through embeddings, all heads, MLPs, residual states, decoding randomness, tools, and application controls. Output alone does not identify an internal cause.',
      diagnostic: 'What controlled intervention or tensor evidence would isolate one attention contribution?',
    },
    {
      claim: 'If both prompts generate tired, their internal logits and residual states must be identical.',
      whyPlausible: 'The same final token makes the two runs look equivalent.',
      correction: 'Different distributions can share the same top candidate or sampled outcome. Equality of visible output does not imply equality of hidden computation.',
      diagnostic: 'Can two probability vectors have the same argmax while assigning different probabilities?',
    },
    {
      claim: 'The KV cache is the model’s long-term memory of the conversation.',
      whyPlausible: 'It stores information about earlier tokens and is reused later.',
      correction: 'The cache contains request-specific attention projections used for efficient decoding. It is not persistent learned knowledge or a semantic conversation database.',
      diagnostic: 'What normally happens to cache entries when a request or serving session ends?',
    },
    {
      claim: 'Giving the model a retrieved document updates its parameters with the document’s facts.',
      whyPlausible: 'The response can immediately incorporate the supplied material.',
      correction: 'Retrieval changes context. Parameter updates require a separate loss, backpropagation, and optimizer process.',
      diagnostic: 'Which branch of the capstone diagram contains gradients and an optimizer?',
    },
    {
      claim: 'Knowing the architecture lets us calculate exact production activations from the visible prompt.',
      whyPlausible: 'The equations specify how the components are connected.',
      correction: 'Exact values require tokenizer output, parameter tensors, numerical conventions, runtime context, and execution. Architecture predicts contracts and dependencies, not hidden numbers by itself.',
      diagnostic: 'Which missing inputs prevent the attention equation from yielding an exact Bonsai matrix?',
    },
  ],
  exercises: [
    {
      id: 'trace-complete-pipeline',
      kind: 'trace',
      prompt: 'Trace the shared prompt from visible text to one emitted token, naming every representation boundary in order.',
      answer: 'Application-assembled text becomes token pieces and IDs; IDs select embeddings and receive positional treatment; transformer blocks produce contextual residual states through attention, MLPs, normalization, and residual additions; the final-position state maps to vocabulary logits and probabilities; application decoding selects an ID; tokenizer decoding emits text; the selected token joins context for the next step.',
    },
    {
      id: 'classify-effects',
      kind: 'transfer',
      prompt: 'Classify these claims: the visible word changed; temperature was set to 0.7; embedding weights changed during the request; the exact final logits differ; a declared toy residual sum equals [0.43, 0.13, 0.35].',
      answer: 'The visible change is directly observable. Temperature is application-controlled. Embedding weights are fixed during ordinary inference, so claiming they changed is normally false. Exact final logits are model-dependent runtime results requiring execution. The declared toy sum is an exact glass-box calculation.',
    },
    {
      id: 'predict-versus-measure',
      kind: 'predict',
      prompt: 'Before executing animal → robot, list two conclusions you can predict structurally and two exact values you cannot know.',
      answer: 'We can predict that tokenization must run again and that any changed token IDs alter selected embedding rows; we can also predict that stored weights remain fixed during inference. We cannot know exact token IDs without the tokenizer or exact logits/attention values without executing the identified model.',
    },
    {
      id: 'causal-dependency',
      kind: 'trace',
      prompt: 'Construct the shortest causal chain by which animal → robot could change the second generated token, including the first decoder decision.',
      answer: 'Replacement changes tokenization or selected embedding input; changed initial states can change contextual states and first-step logits; the decoder may select a different first token; that token is appended to context; the updated context changes the next forward pass and can change the second selected token. Each arrow is possible dataflow, while exact outcomes require execution.',
    },
    {
      id: 'debug-hidden-internals',
      kind: 'debug',
      prompt: 'A live text-only comparison draws two different attention heatmaps and labels them exact Bonsai computation. Diagnose the evidence failure.',
      answer: 'Text output does not expose attention tensors. The heatmaps must be labelled illustrative unless an identified interface actually returned those tensors. The comparison can report observable output differences but cannot attribute them to invented internal weights.',
    },
    {
      id: 'shape-ledger',
      kind: 'calculate',
      prompt: 'A prompt has n = 16 tokens, d_model = 768, and vocabulary size V = 32,000. Give the initial-state shape, residual-state shape at a layer boundary, and final-position logit shape.',
      answer: 'Initial and layer-boundary residual matrices are 16 × 768. The language-model head reads the final width-768 row and produces one 32,000-value logit vector for next-token prediction.',
    },
    {
      id: 'separate-inference-training',
      kind: 'debug',
      prompt: 'A teammate says appending the correct answer to the prompt performs one gradient update. Correct the trace.',
      answer: 'Appending text only changes inference context. A gradient update requires a target-based loss, backpropagation through the computation graph, and an optimizer step that writes new parameter values. Those operations belong to a separate training branch.',
    },
    {
      id: 'design-controlled-comparison',
      kind: 'transfer',
      prompt: 'Design a controlled behavioral comparison for animal → robot and state one conclusion it cannot support.',
      answer: 'Hold model version, system prompt, retrieval, tools, decoding policy, seed when supported, stop rules, and request conditions fixed; change only the target word and record tokenization if exposed plus repeated outputs. The experiment can support behavioral sensitivity claims. Without internal tensor access, it cannot identify a particular head, residual direction, or hidden chain of reasoning as the cause.',
    },
  ],
  glossary: [
    { term: 'Representation contract', definition: 'A precise statement of the input, operation, output, and shape at a system boundary.' },
    { term: 'Directly observable', definition: 'Visible or returned through a documented interface without inferring hidden computation.' },
    { term: 'Exact glass-box', definition: 'Reproducible from fully declared educational inputs and operations.' },
    { term: 'Model-dependent runtime result', definition: 'An exact activation or output that depends on a named model and execution context and must be measured.' },
    { term: 'Application-controlled', definition: 'Selected by surrounding software, such as prompt assembly, retrieval, decoding, and stop policy.' },
    { term: 'Fixed during inference', definition: 'Read during an ordinary forward pass without being updated, as learned parameters normally are.' },
    { term: 'Tokenization', definition: 'Conversion of input bytes or text into tokenizer vocabulary pieces and IDs.' },
    { term: 'Initial state', definition: 'The token-identity and position-aware model-width activation entering the first transformer block.' },
    { term: 'Residual stream', definition: 'The continuing model-width state per token position that components update across blocks.' },
    { term: 'Attention update', definition: 'A model-width contribution produced by routing value information among permitted positions.' },
    { term: 'Logit', definition: 'An unnormalized vocabulary score produced by the language-model head.' },
    { term: 'Decoder', definition: 'Application or serving logic that selects a token from model scores under a configured policy.' },
    { term: 'Prefill', definition: 'Initial processing of prompt tokens that produces first-step outputs and reusable attention keys and values.' },
    { term: 'Decode step', definition: 'One generation iteration that processes the newest position, selects a token, and extends context.' },
    { term: 'KV cache', definition: 'Runtime storage of earlier key and value projections reused by autoregressive attention.' },
    { term: 'Counterfactual', definition: 'A comparison that changes one intended cause while holding other relevant conditions fixed.' },
    { term: 'Cross-entropy loss', definition: 'A training objective that penalizes low probability assigned to the observed target token.' },
    { term: 'Backpropagation', definition: 'Application of the chain rule to compute parameter gradients from a loss.' },
    { term: 'Optimizer', definition: 'A training algorithm that uses gradients and optimizer state to update learned parameters.' },
    { term: 'Provenance', definition: 'The documented source of a value and the boundary of conclusions that source supports.' },
  ],
} satisfies CourseTheoryChapter;
