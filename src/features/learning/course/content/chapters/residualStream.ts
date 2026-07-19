import type { CourseTheoryChapter } from '../theoryTypes';

export const RESIDUAL_STREAM_CHAPTER = {
  question: 'How do attention and MLP components repeatedly update token states without replacing the information already carried through the model?',
  estimatedMinutes: 44,
  prerequisites: [
    'You can trace text through tokenization, embedding lookup, and positional information to obtain one initial state per sequence position.',
    'You understand that attention can route a weighted mixture of information from permitted token positions.',
    'You can distinguish a stored model parameter from an activation computed for one input.',
    'You can add vectors element by element and read a matrix shape such as n × d_model.',
  ],
  objectives: [
    'Describe the residual stream as the evolving token-state workspace shared by the components in a transformer stack.',
    'Trace a pre-normalization block using R_prime = R + Attention(LN(R)) and R_next = R_prime + MLP(LN(R_prime)).',
    'Calculate two exact residual updates in a transparent three-dimensional example.',
    'Use a shape ledger to explain why attention and MLP outputs must return to model width before residual addition.',
    'Distinguish residual states from attention outputs, logits, and key-value cache entries.',
    'Interpret a logit-lens readout as a declared analytical probe rather than hidden prose or a literal transcript of model reasoning.',
  ],
  sections: [
    {
      id: 'shared-workspace',
      eyebrow: 'Orientation',
      heading: 'The transformer keeps revising a shared state for every token position',
      body: String.raw`Return to the course sentence:

> The animal did not cross the street because it was too …

At the moment the model must predict what follows too, it has one evolving state for every token position in the prompt. The initial states came from token identity and positional information. A stack of transformer blocks now refines them. The useful organizing idea is the residual stream: a model-width workspace that flows through the stack while attention and MLP components contribute updates.

The word stream emphasizes continuity. A block does not normally discard the incoming token-state matrix and replace it with an unrelated object. Instead, a component reads a version of the current state, computes an update of compatible shape, and adds that update back. The next component receives the accumulated result. Across many layers, the state at the final position can preserve aspects of the initial token too while also accumulating information routed from animal, did not cross, street, because, and other relevant context.

This is a computational abstraction, not a claim that the model stores a sentence-shaped explanation inside one location. A residual vector is a list of numbers. Components have learned to read and write useful directions in that numerical space. Different features may overlap, interact, or be distributed across dimensions. Saying that the residual stream is a workspace helps us follow data flow, but the workspace is not a human notebook with separate labelled sentences.

The same abstraction also clarifies why a transformer block contains more than attention. Attention enables communication between positions. The MLP transforms the information available at each position. Normalization controls the scale and geometry presented to those components. Residual addition lets their contributions join the continuing state. Removing any one of these ideas leaves an incomplete account of the block.

For the last position too, the learner should repeatedly ask: what state entered this component, what update did the component compute, and what state continued afterward? Those three objects are related but not identical. The block-flow diagram makes those read-compute-add steps visible before we introduce the exact equations.`,
      diagramIds: ['pre-norm-block-flow'],
    },
    {
      id: 'pre-norm-equations',
      eyebrow: 'Mechanism',
      heading: 'A pre-normalization block reads a normalized copy and writes an additive update',
      body: String.raw`Let $R$ be the residual-state matrix entering one transformer block. For a sequence of $n$ token positions and model width $d_{\text{model}}$, its shape is

$$
R \in \mathbb{R}^{n \times d_{\text{model}}}.
$$

A common pre-normalization block can be summarized by two equations:

$$
R' = R + \operatorname{Attention}(\operatorname{LN}(R)),
$$

$$
R_{\text{next}} = R' + \operatorname{MLP}(\operatorname{LN}(R')).
$$

Read the first equation from inside outward. Layer normalization produces a normalized version of the current states. Attention reads that normalized input and computes a model-width update for each position. The original $R$ bypasses the attention computation along the residual path. Addition combines the old state and the update, producing $R'$.

The second equation repeats the pattern. The MLP receives a normalized version of $R'$, computes a per-position update, and adds that update back to $R'$. The output $R_{\text{next}}$ then enters the following block. In this common sequential design, the MLP can therefore operate on a state that already contains the current block's attention update.

Layer normalization does not mean the residual stream itself is permanently replaced by normalized values. In these equations, LN constructs the input read by the component. The bypass path retains the unnormalized state for addition. This is the central meaning of pre-norm. It matters when tracing a real architecture because a post-norm transformer places normalization after residual addition, and some modern blocks use parallel attention and MLP branches or additional normalization variants.

The equations are a map, not a complete implementation specification. Attention contains projections, multiple heads, masking, weighted value mixtures, and an output projection. An MLP commonly expands model width to a larger intermediate width, applies a nonlinear operation or gated transformation, and projects back. Biases, normalization type, activation function, and branch arrangement depend on the model. Before claiming that a particular model uses these exact equations, consult its architecture documentation or code.

What remains stable is the interface: a subcomponent may perform complicated work internally, but its residual update must have a shape compatible with the state it joins. This interface allows a deep stack to compose many specialized transformations while preserving a consistent main pathway.`,
      diagramIds: ['pre-norm-block-flow', 'residual-shape-ledger'],
    },
    {
      id: 'exact-update',
      eyebrow: 'Exact calculation',
      heading: 'Follow two residual additions at the final position',
      body: String.raw`Use a deliberately small three-dimensional fixture for the state at the final position too. The values are declared educational inputs, not activations extracted from Bonsai or any other production model.

Suppose the incoming residual state is

$$
r_{\text{too}} = [0.40, -0.10, 0.30].
$$

The attention component reads normalized states for the whole permitted sequence. After its internal query, key, value, masking, mixing, concatenation, and output-projection operations, suppose it returns this declared update for the final position:

$$
a_{\text{too}} = [0.05, 0.20, -0.10].
$$

Residual addition is elementwise:

$$
r'_{\text{too}} = r_{\text{too}} + a_{\text{too}}
= [0.45, 0.10, 0.20].
$$

No coordinate was concatenated, averaged, or overwritten. The first coordinate increased by 0.05, the second increased by 0.20, and the third decreased by 0.10. Negative update components are perfectly valid: an additive write can reduce a coordinate as well as increase it.

Next, the MLP reads the normalized intermediate state. Suppose its declared output update is

$$
m_{\text{too}} = [-0.02, 0.03, 0.15].
$$

The second residual addition gives

$$
r_{\text{next, too}} = r'_{\text{too}} + m_{\text{too}}
= [0.43, 0.13, 0.35].
$$

This final vector is the state at too that continues to the next block in the toy trace. The arithmetic is exact given the three declared vectors. The component outputs are stipulated so we can isolate residual addition; the example does not pretend to reproduce the internal weights or layer-normalization calculation of a live model.

Perform two useful counterfactuals. If the attention branch returned a zero vector, then $r'=r$, and the block could still change the state through the MLP. If both branches returned zero vectors, then $r_{\text{next}}=r$: the residual path would carry the input through unchanged for this position. This does not mean trained blocks routinely do nothing. It reveals the architectural route by which information can survive a component whose current update is small or unhelpful.

The final state cannot be interpreted by reading each coordinate as a word. Its significance depends on learned downstream readers. What we can conclude exactly is narrower: the state after the block contains the previous state plus two model-width updates, and all three vectors share the same width.`,
      diagramIds: ['exact-residual-update'],
    },
    {
      id: 'shape-ledger',
      eyebrow: 'Shapes',
      heading: 'Internal widths may change, but every residual write returns to model width',
      body: String.raw`A shape ledger prevents several common misunderstandings. Begin with $R$, whose shape is $n \times d_{\text{model}}$. Layer normalization preserves that shape. Attention may project each token state into query, key, and value representations for $h$ heads. If one head has width $d_{\text{head}}$, a head-level query matrix has shape $n \times d_{\text{head}}$. Attention scores compare positions and therefore have a sequence-by-sequence shape such as $n \times n$ for one head before implementation-specific batching and masking details.

The weighted values for all heads are combined and passed through an output projection. Whatever internal head width was used, the attention branch must return an update of shape $n \times d_{\text{model}}$ before it can be added to $R$. An $n \times n$ attention-weight matrix cannot itself be added to the residual stream. It controls routing; it is not the update being written.

The MLP changes width internally in another way. A common first projection maps each position from $d_{\text{model}}$ to a larger $d_{\text{ff}}$. The intermediate activation then has shape $n \times d_{\text{ff}}$. A second projection maps it back to $n \times d_{\text{model}}$. Only that returned model-width result can be added to $R'$.

At the single final position too, we can temporarily omit the sequence axis and discuss vectors of width $d_{\text{model}}$. That is what the three-dimensional worked example does. The complete implementation still processes a matrix containing states for every prompt position, even when the lesson highlights one row.

These shape contracts explain both continuity and cost. The residual stream maintains one model-width state per token position per layer boundary. Attention additionally creates projections and score-related intermediates. The MLP may use a much larger internal width. During training, enough activations must be retained or recomputed for gradients. During autoregressive inference, some attention state is cached for reuse. The objects have different roles even when their dimensions share symbols.

Whenever a diagram says “attention writes to the residual stream,” mentally insert the output projection. Individual heads need not each return a full residual-width vector directly. Their contributions are composed into a compatible update. Likewise, the MLP's expanded hidden activation is not poured raw into the stream. Shape compatibility is enforced at the write boundary.`,
      diagramIds: ['residual-shape-ledger'],
    },
    {
      id: 'what-is-not-the-stream',
      eyebrow: 'Boundaries',
      heading: 'Residual states, attention outputs, logits, and the KV cache are different objects',
      body: String.raw`Several transformer objects are arrays of floating-point values, which makes vague diagrams dangerously easy to misread. Their origin and purpose distinguish them.

The residual state is the continuing model-width representation at each sequence position and layer boundary. It is the main object updated by residual addition. An attention output is a branch contribution computed from normalized residual states. After its output projection, it has compatible shape and can be added to the stream, but it is not the entire continuing state. In the exact example, [0.05, 0.20, -0.10] was the attention update; [0.45, 0.10, 0.20] was the state after adding it.

Logits are vocabulary scores used for prediction. Near the end of the transformer, a normalization and language-model head map the final position's residual state from model width to vocabulary width. If the vocabulary has $V$ entries, the logit vector has width $V$, not $d_{\text{model}}$. Softmax and decoding operate on these scores. Logits are a readout from a state, not another residual stream passed through every block.

The key-value cache stores projected key and value representations needed by attention during autoregressive generation. It is organized by layer, token position, head, and head dimension according to the implementation. The cache avoids recomputing earlier keys and values at every decode step. It does not replace the residual stream, and a cached value vector is not the same as the complete token state from which it was projected. Queries for the newest token are generally computed for the current step rather than retained in the same way.

Parameters form another category. Projection matrices, MLP weights, normalization parameters, and the embedding table are stored learned values. Residual states, branch outputs, logits, and cache entries are request-dependent activations derived using those parameters. Ordinary inference changes the activations as the prompt changes but does not update the stored weights.

The comparison diagram is a classification tool. For any displayed tensor, ask: Is it persistent across requests? Does it have one row per token? Is its width model dimensions, head dimensions, feed-forward dimensions, or vocabulary entries? Is it an input to residual addition, a continuing state, a cached projection, or a prediction readout? Naming those roles is more reliable than calling every internal array an embedding.`,
      diagramIds: ['transformer-object-comparison'],
    },
    {
      id: 'depth-and-causality',
      eyebrow: 'Across layers',
      heading: 'Depth lets many partial updates compose without assigning one tidy job to each layer',
      body: String.raw`One block rarely completes a human-readable task such as “resolve what it refers to” or “decide the final adjective.” Instead, many attention heads and MLP computations across many blocks contribute partial updates. A useful direction written early can be read, transformed, strengthened, cancelled, or combined with other information later. Residual continuity makes this composition possible.

For the final position too, causal attention permits reading states at too and earlier positions but not future tokens that have not been generated. One head might route information associated with animal; another might respond to the construction because it was too; an MLP might transform combinations already present at the final position. These are illustrative possibilities, not claims about named heads in Bonsai. Evidence about actual circuits requires access to a specific inspectable model and careful interventions, not an appealing story alone.

Residual addition also does not guarantee that information remains perfectly recoverable. Later components can write updates that interfere with earlier directions, normalization can affect how readers respond, and limited numerical precision can matter. The bypass offers a direct path for carrying the current state, but the evolving representation remains subject to all subsequent computation.

The phrase residual stream is especially useful because it shifts attention away from assigning isolated semantics to layers. A component reads from a shared numerical medium and writes back to it. Its behavior depends on what earlier components have already made available and how later components use the contribution. Explanations should therefore connect components through their interfaces rather than list disconnected layer labels.

Architectures vary. Some use post-normalization, some compute attention and MLP branches in parallel from a common normalized input, and some use gated residual pathways or scaling factors. Encoder-decoder transformers add cross-attention. The pre-norm equations in this chapter describe an important common pattern and the course's transparent fixture. They should not be projected onto every model without verification.

Despite those variations, the diagnostic questions remain stable: what representation enters, what normalized or projected view does the component read, what update does it return, how is that update merged, and what shape continues? Those questions will also help when the next lesson maps the final residual state to vocabulary logits.`,
    },
    {
      id: 'logit-lens',
      eyebrow: 'Interpretability',
      heading: 'A logit lens is a readout probe, not hidden prose',
      body: String.raw`The language-model head normally reads the state after the final block. Researchers and educators sometimes apply a related readout to intermediate residual states. A basic logit lens takes a state from layer $\ell$, applies the declared normalization and unembedding or output matrix, and inspects the resulting vocabulary scores:

$$
z^{(\ell)} = W_U\,\operatorname{LN}(r^{(\ell)}).
$$

Exact orientation conventions vary, so $W_U$ may be written on the other side when row vectors are used. The conceptual operation is a projection from model width to vocabulary width. A tuned lens may learn additional transformations to compensate for differences between intermediate and final representations.

This probe can answer a limited question: if we read this intermediate state through this specified lens, which token directions receive high scores? It may reveal an evolving prediction or make layer-to-layer changes easier to inspect. It does not show a sentence that the model secretly wrote, prove that the model had a stable belief, or establish the causal importance of one feature. The readout itself imposes an interpretation.

Several limitations matter. Intermediate states were not necessarily optimized to be directly readable by the final unembedding at every layer. Normalization choice affects scores. A strong candidate under the lens can later be reversed. Multiple possible computations can yield a similar readout. Most importantly, correlating a probe result with the final answer does not demonstrate that the probed direction caused that answer. Interventions and controlled comparisons provide stronger evidence.

In AI Lab, a logit-lens panel must identify the model and state source. If it uses the exact educational fixture, it should say that the values are illustrative or calculated from declared inputs. If an inspectable local model actually returns intermediate states, the interface should document the layer, normalization, and projection. A live text-only Bonsai response does not expose a residual stream merely because the frontend can draw one.

Avoid anthropomorphic labels such as “the model is thinking animal but then changes its mind.” A more accurate description is: “Under the declared projection, the intermediate residual state assigns a higher score to this vocabulary token at this layer.” That language is less dramatic and far more informative.`,
      diagramIds: ['logit-lens-probe'],
    },
    {
      id: 'experiment-and-handoff',
      eyebrow: 'Experiment',
      heading: 'Manipulate updates, preserve provenance, and predict the next representation',
      body: String.raw`The residual-stream lab should follow a predict-manipulate-observe rhythm. Begin with the incoming state for too and the two declared update vectors from the exact example. Before revealing the sum, predict which coordinates increase and which decrease. Toggle the attention update off and verify that only the MLP branch can change the state. Restore attention, toggle the MLP update off, and separate communication-derived contribution from local transformation in the fixture. Then restore both and trace the complete block.

A second experiment should focus on shapes. Change sequence length while keeping model width fixed. The residual matrix gains or loses rows, but each row's width remains $d_{\text{model}}$. Change the illustrative feed-forward width and observe that only the MLP's internal activation width changes; its output must still return to model width. A deliberate shape mismatch should fail visibly rather than being silently coerced.

For each display, classify provenance. The exact addition panel uses declared educational values and supports an exact arithmetic claim. A schematic of many layers supports an architectural explanation but contains no measured Bonsai activations. A live generation panel supports claims about observable output behavior. Only a model interface that explicitly returns identified internal tensors can support claims about its actual residual states, attention updates, or lens scores.

The learner's final narration should be precise: “At every layer boundary, the model carries one residual state per token position. In a common pre-norm block, attention and the MLP each read normalized states, return model-width updates, and add them to the continuing stream.” The narration should also mention the boundary: the residual stream is neither attention weights nor cached keys and values nor the vocabulary logits used for decoding.

The next lesson follows the final-position state out of the transformer stack. A final normalization and language-model head will project the $d_{\text{model}}$-wide state for too into $V$ vocabulary logits. Softmax and decoding will then turn those scores into a next-token choice. The residual stream explains where the accumulated evidence lives before that readout; the language-model head explains how the evidence becomes a prediction.`,
    },
  ],
  diagrams: [
    {
      id: 'pre-norm-block-flow',
      title: 'Read, compute, and add in a pre-normalization block',
      caption: 'Illustrative schematic of a common sequential pre-norm transformer block. Specific architectures may arrange normalization and branches differently.',
      alt: 'Residual states split into a bypass and a normalized attention branch, are added, then split into a bypass and normalized MLP branch before a second addition.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  R["R: incoming residual states"] --> B1["bypass"]
  R --> N1["LN"]
  N1 --> A["Attention"]
  B1 --> P1(("add"))
  A --> P1
  P1 --> RP["R prime"]
  RP --> B2["bypass"]
  RP --> N2["LN"]
  N2 --> M["MLP"]
  B2 --> P2(("add"))
  M --> P2
  P2 --> RN["R next"]`,
    },
    {
      id: 'exact-residual-update',
      title: 'Exact two-step update for the final position',
      caption: 'Exact educational calculation with declared three-dimensional values. The component outputs are toy inputs, not measured production activations.',
      alt: 'Incoming state 0.40 negative 0.10 0.30 plus attention update 0.05 0.20 negative 0.10 gives 0.45 0.10 0.20, then adding MLP update negative 0.02 0.03 0.15 gives 0.43 0.13 0.35.',
      kind: 'mechanism',
      provenance: 'exact educational calculation',
      chart: `flowchart LR
  R["incoming state<br/>[0.40, -0.10, 0.30]"] --> A1(("add"))
  AU["attention update<br/>[0.05, 0.20, -0.10]"] --> A1
  A1 --> RP["R prime<br/>[0.45, 0.10, 0.20]"]
  RP --> A2(("add"))
  MU["MLP update<br/>[-0.02, 0.03, 0.15]"] --> A2
  A2 --> RN["R next<br/>[0.43, 0.13, 0.35]"]`,
    },
    {
      id: 'residual-shape-ledger',
      title: 'Internal branches return to residual width',
      caption: 'Illustrative shape ledger. Head arrangement and MLP implementation vary, but an additive residual update must match n × d_model.',
      alt: 'Residual states with shape n by d-model pass through attention internals and return to n by d-model, while the MLP expands to n by d-ff and projects back to n by d-model.',
      kind: 'shape',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  R["Residual R<br/>n x d_model"] --> N1["LN<br/>n x d_model"]
  N1 --> QKV["Q, K, V projections<br/>heads use d_head"]
  QKV --> S["attention scores<br/>positions x positions"]
  S --> O["output projection<br/>n x d_model"]
  O --> ADD1(("add to R"))
  R --> ADD1
  ADD1 --> RP["R prime<br/>n x d_model"]
  RP --> N2["LN<br/>n x d_model"]
  N2 --> UP["MLP expansion<br/>n x d_ff"]
  UP --> DOWN["MLP projection<br/>n x d_model"]
  DOWN --> ADD2(("add to R prime"))
  RP --> ADD2
  ADD2 --> RN["R next<br/>n x d_model"]`,
    },
    {
      id: 'transformer-object-comparison',
      title: 'Do not collapse distinct transformer objects into one vector',
      caption: 'Illustrative comparison by role and typical width. Exact storage layouts depend on the architecture and implementation.',
      alt: 'Comparison showing residual states as continuing model-width activations, attention output as an additive update, KV cache as saved per-layer projections, and logits as vocabulary-width prediction scores.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  R["Residual state<br/>continues across block<br/>width d_model"]
  A["Attention output<br/>branch update<br/>returns to d_model"] --> R
  R --> K["K and V projections<br/>cached for attention<br/>head dimensions"]
  R --> L["Final readout<br/>logits width V"]
  P["Learned parameters<br/>persistent across requests"] -. "compute all activations" .-> R`,
    },
    {
      id: 'logit-lens-probe',
      title: 'A lens projects an intermediate state into vocabulary space',
      caption: 'Illustrative probe pipeline. A readout is an analyst-selected projection, not a transcript of hidden prose.',
      alt: 'An intermediate residual state passes through a declared normalization and unembedding projection to produce probe logits and ranked token candidates.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  R["intermediate residual state<br/>width d_model"] --> N["declared normalization"]
  N --> U["unembedding or lens"]
  U --> Z["probe logits<br/>width V"]
  Z --> C["ranked token candidates"]
  C --> W["interpret with limitations"]`,
    },
  ],
  misconceptions: [
    {
      claim: 'A transformer layer replaces the old token representation with a completely new one.',
      whyPlausible: 'Many pipeline diagrams draw layers as boxes that consume one object and emit another without showing the bypass path.',
      correction: 'In a residual block, components compute updates that are added to a continuing state. The state can preserve earlier information while accumulating new contributions.',
      diagnostic: 'In R_prime = R + Attention(LN(R)), which term supplies the direct path from the previous state?',
    },
    {
      claim: 'The attention matrix is added directly to the residual stream.',
      whyPlausible: 'Attention heatmaps are the most visible artifact and are often labelled simply as attention output.',
      correction: 'Attention weights control mixtures of value vectors. The combined result is projected back to model width before being added as the attention update.',
      diagnostic: 'Why would an n × n score matrix usually fail the shape requirement for addition to an n × d_model residual matrix?',
    },
    {
      claim: 'The residual stream is the KV cache used during generation.',
      whyPlausible: 'Both contain per-token internal activations and both relate to attention across earlier positions.',
      correction: 'The residual stream is the evolving model-width state. The KV cache stores layer-specific projected keys and values so previous attention inputs need not be recomputed.',
      diagnostic: 'Which object is directly updated by residual addition, and which object is retained to accelerate later decode steps?',
    },
    {
      claim: 'Every model uses exactly the two pre-norm equations shown in this lesson.',
      whyPlausible: 'A clean educational equation can look like a universal transformer definition.',
      correction: 'Pre-norm sequential blocks are common, but models may use post-norm, parallel branches, different normalization, scaling, gating, or other arrangements.',
      diagnostic: 'What primary architecture evidence would you need before applying the course equation to a named model?',
    },
    {
      claim: 'A logit lens reveals the words the model is secretly thinking at each layer.',
      whyPlausible: 'The probe produces familiar vocabulary candidates from otherwise opaque vectors.',
      correction: 'A lens is a declared projection applied by the analyst. It provides one view of an intermediate state, with assumptions and limitations, rather than hidden prose or a causal reasoning transcript.',
      diagnostic: 'Would the same intermediate state necessarily produce identical rankings under a basic lens, a tuned lens, and a different normalization?',
    },
  ],
  exercises: [
    {
      id: 'calculate-two-updates',
      kind: 'calculate',
      prompt: 'Starting from [0.40, -0.10, 0.30], add attention update [0.05, 0.20, -0.10] and then MLP update [-0.02, 0.03, 0.15]. Show both intermediate and final states.',
      answer: 'The attention addition gives [0.45, 0.10, 0.20]. Adding the MLP update gives [0.43, 0.13, 0.35]. Each operation is coordinate-by-coordinate, and both updates have the same width as the continuing state.',
    },
    {
      id: 'predict-zero-branches',
      kind: 'predict',
      prompt: 'What crosses the block boundary if both attention and MLP return zero updates for one position in the sequential pre-norm fixture?',
      answer: 'The incoming residual state crosses unchanged: R_prime = R + 0 = R and R_next = R_prime + 0 = R. This follows from the bypass additions; it does not claim that a trained production block normally emits exact zeros.',
    },
    {
      id: 'trace-shapes',
      kind: 'trace',
      prompt: 'For n = 20, d_model = 768, and d_ff = 3072, give the shapes of R, the MLP expanded activation, the MLP residual update, and R_next.',
      answer: 'R is 20 × 768. The expanded MLP activation is 20 × 3072. The MLP projects back to a 20 × 768 update so addition is defined. R_next remains 20 × 768.',
    },
    {
      id: 'debug-attention-addition',
      kind: 'debug',
      prompt: 'A diagram adds a 20 × 20 attention-weight matrix directly to a 20 × 768 residual matrix. Diagnose and repair it.',
      answer: 'The shapes are incompatible and the weights are routing coefficients, not the residual update. The weights mix value vectors; head results are combined and output-projected to 20 × 768. That projected result can then be added to the residual matrix.',
    },
    {
      id: 'transfer-object-classification',
      kind: 'transfer',
      prompt: 'Classify each object as continuing state, branch update, cache, or prediction readout: R_prime, attention output after output projection, saved K/V tensors, and final vocabulary logits.',
      answer: 'R_prime is the continuing residual state after attention addition. The projected attention output is a branch update. Saved K/V tensors are the inference cache. Vocabulary logits are the prediction readout. Their numerical nature does not make their roles interchangeable.',
    },
    {
      id: 'debug-lens-claim',
      kind: 'debug',
      prompt: 'A panel projects a toy intermediate vector to vocabulary scores and says, “Bonsai is internally thinking ‘tired’ here.” Rewrite the claim accurately.',
      answer: 'A valid label would say that under the declared educational projection, the toy intermediate state assigns a specified score or rank to the token tired. Unless Bonsai exposes identified internal states and the exact probe is documented, the panel cannot claim to show Bonsai internals, hidden prose, belief, or reasoning.',
    },
  ],
  glossary: [
    { term: 'Residual stream', definition: 'The continuing model-width token-state workspace that components read from and update across transformer blocks.' },
    { term: 'Residual connection', definition: 'A bypass path that adds a component output to the state that entered the component.' },
    { term: 'Residual update', definition: 'A component’s model-width output that is added to the continuing state.' },
    { term: 'Pre-normalization', definition: 'A block arrangement in which a component reads a normalized copy of the state before its output is added to the bypassed state.' },
    { term: 'Post-normalization', definition: 'An alternative arrangement that applies normalization after a residual addition.' },
    { term: 'Layer normalization', definition: 'A learned normalization operation that rescales and shifts each token state according to an architecture-specific formula.' },
    { term: 'Attention output', definition: 'The information-routed branch result, returned to model width by an output projection before residual addition.' },
    { term: 'MLP', definition: 'A per-position nonlinear transformation that commonly expands to a feed-forward width and projects back to model width.' },
    { term: 'Model width', definition: 'The number of coordinates in each residual token state, commonly written d_model.' },
    { term: 'Feed-forward width', definition: 'The internal expanded width of an MLP, commonly written d_ff.' },
    { term: 'Logit', definition: 'An unnormalized vocabulary score produced by a prediction readout.' },
    { term: 'KV cache', definition: 'Saved key and value projections from earlier positions and layers, reused during autoregressive decoding.' },
    { term: 'Activation', definition: 'A numerical value computed for a particular input, including residual states, branch outputs, and logits.' },
    { term: 'Parameter', definition: 'A stored learned value, including projection weights and normalization parameters.' },
    { term: 'Logit lens', definition: 'An analytical probe that projects an intermediate residual state into vocabulary-score space under declared assumptions.' },
    { term: 'Provenance', definition: 'The documented origin of displayed values and the boundary of claims those values support.' },
  ],
} satisfies CourseTheoryChapter;
