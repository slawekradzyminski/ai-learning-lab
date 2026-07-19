import { LLM_COURSE_PROMPT, LLM_COURSE_TARGET } from '../../courseScenario';
import type { CourseTheoryChapter } from '../theoryTypes';

export const TRANSFORMER_BLOCK_CHAPTER = {
  question: 'How does one transformer block change every token state without changing the tensor shape?',
  estimatedMinutes: 42,
  prerequisites: [
    'Know that tokenization produces categorical token IDs rather than semantic measurements.',
    'Know that an embedding lookup and a position signal create one initial vector for every token position.',
    'Be comfortable adding short vectors component by component.',
    'Recognize a matrix as a rectangular collection of numbers with a stated number of rows and columns.',
    'Know that softmax turns a row of scores into non-negative weights that sum to one.',
  ],
  objectives: [
    'Locate a decoder transformer block between initial token representations and the language-model head.',
    'Explain why attention communicates between positions while the MLP transforms each position independently.',
    'Trace the two pre-normalization residual branches in their correct order.',
    'Use a tensor-shape ledger to verify that a block preserves sequence length and model width.',
    'Calculate one exact attention mixture, residual addition, MLP update, and final residual state.',
    'Explain what normalization contributes without treating it as memory, learning, or semantic interpretation.',
    'Separate an exact educational miniature from claims about unavailable Bonsai hidden states.',
    'Identify production variations that preserve the central communicate–compute–accumulate pattern.',
  ],
  sections: [
    {
      id: 'place-in-the-story',
      eyebrow: '1 · Orientation',
      heading: 'A block refines token states; it does not receive words and emit an answer',
      body: String.raw`Our shared prompt is “${LLM_COURSE_PROMPT} …”, and the observed continuation used later in the course is “${LLM_COURSE_TARGET}”. Before a transformer block receives this prompt, the tokenizer has already converted the visible text into token IDs. An embedding mechanism has already converted every ID into a vector and supplied position information. The block therefore receives neither a JavaScript string nor a list of dictionary definitions. It receives a matrix of numbers. Each row belongs to one token position, and every row has the same width, usually called the model dimension.

Suppose the prompt occupies $n$ token positions and the model width is $d_{model}$. The block input is

$$R_\ell\in\mathbb{R}^{n\times d_{model}}.$$

The subscript $\ell$ identifies depth: $R_0$ is the initial representation and $R_\ell$ is the residual state entering block $\ell$. The row for the final visible token, “too” in our prompt, begins as one position-specific vector. After many blocks it contains a context-dependent numerical representation influenced by earlier allowed positions such as “animal”, “street”, and “was”. It has not turned into prose. It remains a fixed-width vector that the language-model head can later map to vocabulary scores.

One decoder block has two main computational jobs. Self-attention allows rows to exchange information: a destination position forms a weighted mixture of value vectors from permitted source positions. The MLP, sometimes called the feed-forward network, performs a learned nonlinear transformation separately on each row. Residual connections add both updates to the shared state, and normalization prepares the input to each branch. A compact pre-normalization block is

$$A_\ell=\operatorname{Attention}(\operatorname{Norm}(R_\ell)),$$
$$R'_\ell=R_\ell+A_\ell,$$
$$M_\ell=\operatorname{MLP}(\operatorname{Norm}(R'_\ell)),$$
$$R_{\ell+1}=R'_\ell+M_\ell.$$

The primes and subscripts are bookkeeping, not new kinds of memory. $R'_\ell$ is simply the state after the attention update and before the MLP update. Both additions preserve the outer shape $n\times d_{model}$. This invariant is what lets dozens of differently parameterized blocks be stacked. The block changes the values carried by the matrix, but it does not normally change the number of token rows or the model width.

The diagram shows the important data dependency. The normalized branch computes an update while the unmodified residual path carries the prior state to an addition. That distinction prevents a common error: normalization does not replace the shared state in a pre-norm block. It prepares what the attention or MLP branch reads; the residual path still carries the original branch input.`,
      diagramIds: ['block-pipeline'],
    },
    {
      id: 'pre-norm-order',
      eyebrow: '2 · Architecture',
      heading: 'Read, update, add—then repeat with a different operation',
      body: String.raw`The adjective pre-norm means that normalization appears before each major sublayer. Start with $R_\ell$. One path carries it directly toward an addition. The other path normalizes it and computes attention. The paths meet at $R'_\ell=R_\ell+A_\ell$. The same pattern then repeats: one path carries $R'_\ell$, while the other normalizes it and computes the MLP update. Their sum becomes $R_{\ell+1}$.

Order matters. The MLP receives the state after the attention update, not the untouched block input. If attention routes subject or positional information into the row for “too”, the MLP can transform a representation that already contains that newly available context. Reversing the branches would define a different architecture. Computing both from exactly the same stale input would also define a different architecture. The course uses the common pre-norm decoder pattern because it makes the residual pathways and modern decoder stacks easier to discuss, but it should not be presented as the only possible transformer design.

The word residual describes an additive correction. If a branch produces a zero vector, the addition leaves the state unchanged. If it produces a small vector, the state moves by that amount. The branch does not need to reconstruct everything useful in the input because the skip path already preserves the input. This improves optimization in deep networks: there is a direct additive route through the stack, and learned branches can specialize in updates. It does not mean old information is perfectly protected. Later components can add opposing directions, rotate useful features through learned transformations, or make information difficult for a particular probe to recover.

The two branches also differ in which axis they can mix. Attention operates over the token-position axis. It can make row $i$ depend on rows $j\le i$ in a causal decoder. The MLP keeps rows separate: the same learned function is applied to row one, row two, and so on. It mixes feature dimensions within each row but does not directly fetch a neighboring row. This gives a durable mental model:

- attention communicates between token positions;
- the MLP computes locally at each position;
- residual additions accumulate both kinds of update;
- normalization stabilizes the input scale seen by each branch.

These statements describe data flow, not human roles. It is misleading to say that attention “looks for meaning” or that the MLP “thinks about” the gathered clue. The operations are learned numerical functions. We can describe their dependencies precisely without assigning intentions to them.`,
      diagramIds: ['block-pipeline', 'position-feature-axes'],
    },
    {
      id: 'attention-communication',
      eyebrow: '3 · Communication',
      heading: 'Attention changes a destination row by mixing information from allowed source rows',
      body: String.raw`For one attention head, a normalized state matrix $X$ is projected into queries, keys, and values:

$$Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V.$$

The query at a destination position is compared with keys at candidate source positions. Scaled dot products become scores. A causal mask blocks future sources, and row-wise softmax converts allowed scores into mixture weights:

$$A=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}+C\right).$$

Here $C_{ij}=-\infty$ when source position $j$ lies in the future of destination $i$. The head output is

$$O=AV.$$

For the final position “too”, one row of $A$ might assign nonzero weight to earlier positions representing “animal”, “street”, and “was”, as well as to “too” itself. The resulting row is a weighted sum of their value rows. This is why attention is the communication operation: changing an allowed source row can change the destination output even when the destination row itself is initially unchanged.

The attention weights do not by themselves reveal what was transported. A weight of $0.5$ multiplies a value vector, and the contents and direction of that vector matter. Two sources can receive equal weights but contribute different numerical information. Contributions can also reinforce or partially cancel after addition. Furthermore, a production block usually contains several heads. Each has learned projections, and the head outputs are combined through an output projection before the residual addition. A visually striking weight in one head is therefore evidence about one routing calculation, not a complete causal explanation of the next-token result.

Attention preserves one output row per destination position. If the input contains $n$ rows, the combined projected result is returned to model width and has shape $n\times d_{model}$. That shape is required for the residual sum. Internally, heads may use a smaller head dimension $d_h$, but concatenation or grouped processing and the output projection restore the branch output to model width.

In our shared prompt, causal attention at “too” can use earlier prompt positions, while a position near the beginning cannot read “too”. This asymmetry is necessary for autoregressive training and generation. Without it, a training position could copy evidence from the target’s future context, and the learned prediction task would not match left-to-right generation. The mask is therefore part of the model’s information boundary, not merely a rendering preference in an attention heatmap.`,
      diagramIds: ['position-feature-axes'],
    },
    {
      id: 'mlp-local-computation',
      eyebrow: '4 · Local transformation',
      heading: 'The MLP transforms every row with the same learned function',
      body: String.raw`After the attention update has been added, the MLP branch reads a normalized version of $R'_\ell$. A simple transformer MLP can be written as

$$H=\phi(XW_{up}+b_{up}),$$
$$M=HW_{down}+b_{down},$$

where $X=\operatorname{Norm}(R'_\ell)$ and $\phi$ is a nonlinearity. The first projection usually expands the feature width from $d_{model}$ to a larger hidden width $d_{ff}$. The nonlinearity makes the transformation more expressive than one matrix multiplication, and the second projection returns the result to $d_{model}$ so it can be added to $R'_\ell$.

The defining positional fact is that the formula is applied independently to every row. If $X$ has rows $x_1,\ldots,x_n$, then the MLP produces $f(x_1),\ldots,f(x_n)$ with the same function $f$. There is no term $x_i^\top x_j$ and no sum over other positions in this branch. Information from “animal” can influence the MLP update at “too” only if a previous operation—often attention in this or an earlier block—has already written relevant information into the “too” row.

Calling this operation local does not mean spatial locality in an image or a small subset of vector dimensions. It means position-wise locality: each token row is transformed without direct access to other rows during that MLP call. Within a row, the projections can mix all model features. The hidden width also creates many intermediate activation directions, and the nonlinearity controls which combinations contribute to the output. Modern decoder models often replace the simple activation formula with a gated variant such as a gated linear unit. The exact formula changes, but the position-wise property and the return to model width remain.

The MLP should not be described as a static dictionary of facts. Learned parameters can support associations and computations, and interpretability research can identify particular activation patterns, but one row of one weight matrix is not automatically one stored proposition. Nor is the MLP the only place where learned information affects output: token embeddings, attention projections, normalization parameters, and the output head are learned too.

For a beginner, the useful contrast is operational. If attention is disabled in an educational miniature, positions lose a direct communication route. If the MLP is disabled, each position can still receive a mixture from attention but loses that branch’s nonlinear feature transformation. The residual state continues to pass through in both counterfactuals. These interventions explain architecture more reliably than assigning a neat linguistic label to every component.`,
      diagramIds: ['position-feature-axes', 'shape-ledger'],
    },
    {
      id: 'normalization-and-residuals',
      eyebrow: '5 · Stability and accumulation',
      heading: 'Normalization prepares a branch; residual addition preserves the shared route',
      body: String.raw`Repeated learned transformations can produce states with very different magnitudes. A normalization operation gives a branch a more controlled numerical input. In a simplified LayerNorm description for one token row $r\in\mathbb{R}^{d_{model}}$,

$$\mu=\frac{1}{d_{model}}\sum_j r_j,$$
$$\sigma^2=\frac{1}{d_{model}}\sum_j(r_j-\mu)^2,$$
$$\operatorname{LN}(r)_j=\gamma_j\frac{r_j-\mu}{\sqrt{\sigma^2+\epsilon}}+\beta_j.$$

The small $\epsilon$ protects the division, while learned $\gamma$ and $\beta$ can rescale and shift dimensions. Many current decoder models use RMSNorm instead. RMSNorm scales using root mean square and does not subtract the mean in the same way. This is a production difference worth naming, but it does not change the main lesson: normalization conditions the numerical input to a learned branch; it does not mix token positions, choose a token, or update parameters during ordinary inference.

Pre-norm placement gives a clear residual path. The branch sees $\operatorname{Norm}(R)$, but the addition uses $R$ itself. Consequently, normalization does not erase the magnitude or mean of the residual state carried along the skip path. A common beginner diagram mistakenly draws normalization directly in the only path and then says the normalized tensor “becomes” the residual stream. The fork-and-add diagram is more faithful.

Residual addition is possible only because both operands have identical shapes. It is component-wise:

$$[r_1,r_2,\ldots,r_d]+[u_1,u_2,\ldots,u_d]
=[r_1+u_1,r_2+u_2,\ldots,r_d+u_d].$$

Nothing is concatenated, and the sequence does not gain extra rows. The values change while the coordinate capacity remains fixed. This is why a shape ledger is valuable: it catches explanations that accidentally claim attention adds tokens, the MLP changes sequence length, or residual addition doubles the width.

Preserving shape is not the same as preserving all information perfectly. Addition can overwrite in the practical sense that a new update opposes an old direction. Later normalization and nonlinear transformations can also change which features are easy to decode. Residual paths nevertheless make an identity-like route available and allow branches to learn corrections rather than total replacements. Across depth, the state at “too” may accumulate information routed from the subject, grammatical context, and many other learned signals, but exact claims require measurement from the actual model.`,
      diagramIds: ['block-pipeline', 'shape-ledger'],
    },
    {
      id: 'shape-ledger',
      eyebrow: '6 · Dimensional reasoning',
      heading: 'A shape ledger turns an intimidating block into checkable contracts',
      body: String.raw`Tensor shapes answer structural questions before any numerical values are known. Let batch size be $B$, sequence length be $n$, model width be $d_{model}$, number of query heads be $h$, head width be $d_h$, and MLP hidden width be $d_{ff}$. Ignoring implementation-specific layout changes, the residual input has shape $B\times n\times d_{model}$. Normalization preserves it.

Query projections are often viewed as $B\times h\times n\times d_h$. Keys and values may have the same number of heads in multi-head attention, or fewer KV heads in grouped-query or multi-query attention. For each query head, the score matrix has an $n\times n$ token-position plane. Applying scores to values returns one head output per destination position. The attention output projection produces $B\times n\times d_{model}$, matching the residual state.

The MLP up-projection changes only the final feature dimension:

$$B\times n\times d_{model}
\longrightarrow B\times n\times d_{ff}.$$

The down-projection reverses it:

$$B\times n\times d_{ff}
\longrightarrow B\times n\times d_{model}.$$

These changes occur independently for each of the $B\cdot n$ rows. Sequence length remains $n$. Both residual additions therefore combine tensors of shape $B\times n\times d_{model}$.

The score plane helps explain computational cost. During full-sequence training or prompt prefill, ordinary dense attention forms interactions across pairs of positions, giving an $n\times n$ structure per head. During cached autoregressive decoding, one new query compares with cached keys for the available history. KV caching changes which projections are recomputed and how memory is retained, but it does not change the logical role of the block.

A shape ledger is also a defense against vocabulary confusion. The model width $d_{model}$ is not vocabulary size. The MLP hidden width $d_{ff}$ is not the number of tokens. The sequence length $n$ is not the character count. Only after the final stack does an output projection map the last contextual state to a vector with one score per vocabulary entry. Keeping these axes named prevents “larger vector” from becoming an ambiguous explanation.`,
      diagramIds: ['shape-ledger'],
    },
    {
      id: 'worked-miniature',
      eyebrow: '7 · Exact educational calculation',
      heading: 'One small block update for the final token “too”',
      body: String.raw`This calculation is an exact educational miniature. Its values are chosen to be inspectable and are not claimed to be Bonsai weights, hidden states, attention weights, or activations. The aim is to make the operations literal.

Focus on the final row for “too”. Let its incoming residual vector be

$$r=[1.20,-0.40].$$

For two dimensions, simplified LayerNorm without learned scale, shift, or epsilon gives mean $0.40$. The centered vector is $[0.80,-0.80]$, its standard deviation is $0.80$, and therefore

$$\operatorname{LN}(r)=[1,-1].$$

Assume that one inspectable attention head has already produced the following permitted value rows for the four-token window [animal, street, was, too]:

$$v_1=[0.60,0.20],\quad v_2=[0.10,0.50],$$
$$v_3=[-0.20,0.10],\quad v_4=[0.20,-0.10].$$

For the destination “too”, let the exact softmax weights be

$$\alpha=[0.50,0.20,0.20,0.10].$$

They are non-negative and sum to one. The weighted value mixture is

$$a=0.50v_1+0.20v_2+0.20v_3+0.10v_4.$$

Component by component,

$$a_1=0.30+0.02-0.04+0.02=0.30,$$
$$a_2=0.10+0.10+0.02-0.01=0.21.$$

After the first residual addition,

$$r'=r+a=[1.20,-0.40]+[0.30,0.21]=[1.50,-0.19].$$

The MLP branch normalizes $r'$. Its mean is $0.655$ and its centered values are $[0.845,-0.845]$, so the same simplified normalization yields

$$\operatorname{LN}(r')=[1,-1].$$

Use an exact two-unit teaching MLP with

$$W_{up}=\begin{bmatrix}0.50&-0.25\\-0.50&0.25\end{bmatrix},\qquad b_{up}=[0,0].$$

Using the row-vector convention from the MLP formula, $[1,-1]W_{up}$ gives pre-activations $[1,-0.5]$. ReLU produces

$$h=[1,0].$$

Let

$$W_{down}=\begin{bmatrix}-0.20&0.50\\0&0\end{bmatrix},\qquad b_{down}=[0,0].$$

The down projection maps the hidden vector to

$$m=[-0.20,0.50].$$

The second residual addition gives the block output row:

$$r_{next}=r'+m=[1.50,-0.19]+[-0.20,0.50]=[1.30,0.31].$$

The row still has two components. Attention changed it using a mixture of four allowed source value rows. The MLP then changed it using only the normalized version of this destination row. Both updates were added rather than concatenated. If the attention branch had been zero, the MLP would have received a different state. If the MLP branch had been zero, the attention-enriched state $[1.50,-0.19]$ would have passed to the next block unchanged.

The calculation deliberately omits multiple heads, output projections, learned normalization parameters, dropout, gates, biases in some projections, and a batch dimension. Those omissions make the core dependencies visible. They must be stated rather than silently presenting the miniature as a complete production block.`,
      diagramIds: ['worked-vector'],
    },
    {
      id: 'production-and-provenance',
      eyebrow: '8 · Transfer and limits',
      heading: 'Production blocks vary, but claims must remain tied to observable evidence',
      body: String.raw`Real decoder models differ in important details. Some use LayerNorm and others RMSNorm. Some use learned absolute positions, while many current systems represent relative position within attention using rotary position encoding. MLPs may use GELU, SiLU, or gated variants. Attention may use multi-head, grouped-query, or multi-query layouts. Bias terms may be present or absent. Implementations can fuse kernels, use reduced precision, quantize weights, apply specialized attention algorithms, or distribute one block across devices. Training may include dropout even when inference disables it.

These differences matter when calculating exact shapes, parameter counts, cache size, speed, or numerical output. They do not invalidate the chapter’s central abstraction: a decoder block obtains position-dependent communication through attention, position-wise nonlinear transformation through an MLP, and an additive route that preserves the residual shape. When moving to a named model, the learner should consult that architecture’s configuration rather than assuming every displayed detail is universal.

The evidence boundary is equally important. In the course’s glass-box activities, displayed miniature vectors and matrices can be exact because the application defines every value and operation. A live model may expose tokenizer output, generated tokens, timing, or next-token probabilities through an API. Unless Bonsai explicitly returns internal states, the application cannot honestly claim to display Bonsai’s attention heads, residual vectors, MLP activations, or normalization values. A plausible-looking animation is still illustrative. It should be labeled as such.

This distinction is pedagogically useful rather than restrictive. The exact miniature answers “how can this mechanism be calculated?” The live behavioral result answers “what did this model return for this prompt?” These are different questions. Combining them without provenance would encourage learners to infer hidden causes from fabricated evidence.

Finally, a block is not a self-contained language model. One block has no direct obligation to produce ${LLM_COURSE_TARGET}. The shared prompt passes through a stack of blocks, final normalization, and a language-model head. The output head creates logits over the vocabulary; decoding then selects a token. Training is what previously adjusted the block’s parameters. During ordinary inference, the current prompt changes runtime states while the learned weights remain fixed.

The bridge to the attention lesson is to zoom into communication and calculate queries, keys, values, masking, and one attention row in greater detail. The bridge after attention is to return to the residual stream and follow how many block updates accumulate through depth. A learner who can name the representation, the operation, the resulting shape, and the evidence source at each transition has replaced an apparently mysterious box with a sequence of checkable contracts.`,
      diagramIds: ['block-pipeline', 'shape-ledger'],
    },
  ],
  diagrams: [
    {
      id: 'block-pipeline',
      title: 'One pre-normalization decoder block',
      caption: 'Each learned branch reads a normalized state, while the residual path carries the unnormalized branch input to an element-wise addition.',
      alt: 'The residual state forks into normalization and attention, is added, then forks into normalization and an MLP before a second residual addition.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  R0["Residual state R_l"] --> N1["Normalize"]
  R0 --> A1(("add"))
  N1 --> ATT["Causal self-attention"]
  ATT --> A1
  A1 --> RP["Intermediate state R'_l"]
  RP --> N2["Normalize"]
  RP --> A2(("add"))
  N2 --> MLP["Position-wise MLP"]
  MLP --> A2
  A2 --> R1["Residual state R_l+1"]`,
    },
    {
      id: 'position-feature-axes',
      title: 'Attention and the MLP operate along different axes',
      caption: 'Attention can mix allowed token rows. The MLP applies the same nonlinear feature transformation independently to each row.',
      alt: 'Token rows communicate through attention, then each resulting row passes through its own instance of the shared position-wise MLP function.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  subgraph A["Attention: communication across positions"]
    AN["animal row"] --> T["too update"]
    ST["street row"] --> T
    W["was row"] --> T
    TO["too row"] --> T
  end
  subgraph M["MLP: same function, separate rows"]
    R1["row 1"] --> F1["shared f"] --> O1["updated row 1"]
    R2["row 2"] --> F2["shared f"] --> O2["updated row 2"]
    R3["row n"] --> F3["shared f"] --> O3["updated row n"]
  end`,
    },
    {
      id: 'shape-ledger',
      title: 'Tensor shape ledger',
      caption: 'Internal branches temporarily expose head or MLP widths, but both branch outputs return to model width before residual addition.',
      alt: 'A sequence of tensor shapes shows model-width input, head-shaped attention intermediates, model-width attention output, expanded MLP hidden width, and model-width block output.',
      kind: 'shape',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  R["Residual\nB × n × d_model"] --> QKV["Q, K, V\nB × heads × n × d_h"]
  QKV --> S["Attention scores\nn × n per head"]
  S --> AO["Attention output\nB × n × d_model"]
  AO --> RP["Residual add\nB × n × d_model"]
  RP --> UP["MLP expansion\nB × n × d_ff"]
  UP --> DOWN["MLP projection\nB × n × d_model"]
  DOWN --> OUT["Residual add\nB × n × d_model"]`,
    },
    {
      id: 'worked-vector',
      title: 'Exact two-dimensional block update',
      caption: 'The values belong to the educational miniature. They demonstrate element-wise residual updates and do not represent Bonsai internals.',
      alt: 'The vector 1.20, negative 0.40 receives an attention update 0.30, 0.21 and an MLP update negative 0.20, 0.50 to become 1.30, 0.31.',
      kind: 'mechanism',
      provenance: 'exact educational calculation',
      chart: `flowchart LR
  R["r = [1.20, -0.40]"] --> ADD1(("add"))
  A["attention update\n[0.30, 0.21]"] --> ADD1
  ADD1 --> RP["r' = [1.50, -0.19]"]
  RP --> ADD2(("add"))
  M["MLP update\n[-0.20, 0.50]"] --> ADD2
  ADD2 --> O["r_next = [1.30, 0.31]"]`,
    },
  ],
  misconceptions: [
    {
      claim: 'Attention is the entire transformer block.',
      whyPlausible: 'Transformer explanations often devote most visual space to attention matrices and compress the MLP, normalization, and residual paths into small labels.',
      correction: 'A decoder block combines attention, a position-wise MLP, normalization, and two residual additions. Removing any branch changes the computation.',
      diagnostic: 'Ask the learner to point to the operation that provides nonlinear local feature transformation. If the answer is attention, the block model is incomplete.',
    },
    {
      claim: 'The MLP mixes information between neighboring tokens.',
      whyPlausible: 'The MLP receives contextual rows, so its output can contain information that originally came from other tokens.',
      correction: 'Within one MLP call, every token row is transformed independently by the same function. Cross-position information must already have been routed into that row.',
      diagnostic: 'Change one source row while holding a destination row fixed immediately before the MLP. The destination MLP output does not change unless its own input row changes.',
    },
    {
      claim: 'Residual addition concatenates old and new information and therefore doubles the width.',
      whyPlausible: 'Informal language such as “keep the old vector and attach the update” sounds like concatenation.',
      correction: 'Residual addition is component-wise and requires identical shapes. A model-width vector plus a model-width update remains model width.',
      diagnostic: 'Ask for the shape of $[1,2]+[3,4]$. The result is $[4,6]$, not a four-component vector.',
    },
    {
      claim: 'Normalization erases the residual state and replaces it with standardized values.',
      whyPlausible: 'A linear pipeline drawing may show normalization as the only path entering the sublayer.',
      correction: 'In a pre-norm block, normalization prepares the learned branch. The unnormalized branch input travels along the skip path and participates in the addition.',
      diagnostic: "Have the learner trace both arrows from $R_\ell$ to $R'_\ell$. One must bypass normalization.",
    },
    {
      claim: 'An attention heatmap identifies the cause of the final generated token.',
      whyPlausible: 'The heatmap is visible and interpretable-looking, while values, other heads, MLP updates, and later blocks are less visible.',
      correction: 'Weights describe one mixture in one head. The transported values and all subsequent computations affect the final logits.',
      diagnostic: 'Ask whether two identical weights applied to different value vectors produce identical outputs. They do not.',
    },
    {
      claim: 'The course miniature displays Bonsai hidden states because it uses the same prompt.',
      whyPlausible: 'A shared prompt makes a teaching trace feel connected to live generation.',
      correction: 'The miniature is exact only for its declared educational numbers. It represents Bonsai internals only if Bonsai explicitly provides those tensors and the application faithfully displays them.',
      diagnostic: 'Require a provenance label for every vector. If its source is not an API response or declared teaching data, the claim is unsupported.',
    },
  ],
  exercises: [
    {
      id: 'order-the-block',
      kind: 'trace',
      prompt: 'Place these operations in order for the pre-norm block: MLP, first residual add, attention, second residual add. Include normalization in your sequence.',
      answer: 'Normalize the incoming residual state, compute attention, and add that update to form the intermediate state. Normalize the intermediate state, compute the MLP, and add that update to form the block output. The MLP must follow the first addition because it reads the attention-enriched intermediate state.',
    },
    {
      id: 'identify-communication',
      kind: 'predict',
      prompt: 'If the row for “animal” changes but the row for “too” is held fixed immediately before a position-wise MLP, can that MLP call directly change its output for “too”? What changes if the same intervention occurs before self-attention?',
      answer: 'The position-wise MLP output for “too” does not directly change because it reads only the “too” row. Before self-attention, the changed “animal” row can alter its key or value and therefore can alter the attention update received by “too”. Attention is the cross-position communication route.',
    },
    {
      id: 'calculate-attention-update',
      kind: 'calculate',
      prompt: 'Using weights [0.50, 0.20, 0.20, 0.10] and values [0.60, 0.20], [0.10, 0.50], [-0.20, 0.10], [0.20, -0.10], calculate the attention mixture.',
      answer: 'The first component is $0.50(0.60)+0.20(0.10)+0.20(-0.20)+0.10(0.20)=0.30$. The second is $0.50(0.20)+0.20(0.50)+0.20(0.10)+0.10(-0.10)=0.21$. The exact mixture is $[0.30,0.21]$.',
    },
    {
      id: 'debug-shape-error',
      kind: 'debug',
      prompt: 'A diagram claims that an MLP maps $B\times n\times d_{model}$ to $B\times n\times d_{ff}$ and then adds that expanded tensor directly to the residual state. Identify the error and repair the diagram.',
      answer: 'Residual addition requires matching shapes, but $d_{ff}$ and $d_{model}$ are normally different. The MLP needs a down-projection from $d_{ff}$ back to $d_{model}$. Only the resulting $B\times n\times d_{model}$ update can be added to the residual state.',
    },
    {
      id: 'zero-branch-counterfactual',
      kind: 'predict',
      prompt: 'In the worked miniature, what reaches the next branch if attention returns [0, 0]? What leaves the block if both attention and the MLP return [0, 0]?',
      answer: 'With a zero attention update, the intermediate state remains the incoming $[1.20,-0.40]$, so the MLP reads a normalization of that state rather than $[1.50,-0.19]$. If both branches return zero, both residual additions act as identities and the block output is exactly $[1.20,-0.40]$.',
    },
    {
      id: 'classify-evidence',
      kind: 'transfer',
      prompt: 'The live model returns the token “ tired”, while the course animation shows attention from “too” to “animal”. What may be concluded, and what may not be concluded?',
      answer: 'It may be concluded that the live model returned the displayed token for the supplied request, subject to the recorded decoding settings. It may also be concluded that the educational attention calculation behaves as declared for its own numbers. It may not be concluded that Bonsai used the displayed attention weights or hidden vectors unless those tensors were explicitly returned by Bonsai and provenance was preserved.',
    },
  ],
  glossary: [
    { term: 'Residual stream', definition: 'The fixed-width token-state matrix carried through the transformer stack and updated by additive branches.' },
    { term: 'Pre-norm', definition: 'A block arrangement in which normalization is applied before attention and before the MLP branch.' },
    { term: 'Self-attention', definition: 'A content-dependent operation that mixes value information from allowed token positions into each destination position.' },
    { term: 'MLP', definition: 'A learned nonlinear transformation applied independently to every token row, usually expanding and then restoring feature width.' },
    { term: 'Residual addition', definition: 'Component-wise addition of a branch update to a same-shaped shared state.' },
    { term: 'LayerNorm', definition: 'A normalization that standardizes features within a row and commonly includes learned scale and shift parameters.' },
    { term: 'RMSNorm', definition: 'A normalization based on root mean square that is used by many decoder models and typically does not subtract the feature mean.' },
    { term: 'Model dimension', definition: 'The fixed feature width $d_{model}$ of each residual token state.' },
    { term: 'MLP hidden dimension', definition: 'The usually larger intermediate feature width $d_{ff}$ inside the MLP branch.' },
    { term: 'Causal mask', definition: 'The attention constraint that prevents a destination position from reading future token positions.' },
    { term: 'Glass-box miniature', definition: 'A deliberately small educational system whose displayed inputs, parameters, and calculations are fully declared and exactly reproducible.' },
    { term: 'Provenance', definition: 'A record of where a displayed value came from, such as educational data or a live model response.' },
  ],
} satisfies CourseTheoryChapter;
