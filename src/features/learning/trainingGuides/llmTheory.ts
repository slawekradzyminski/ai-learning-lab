import type { LabTheory, TrackTheory } from './types';

const book = (pages: string) => ({
  label: `Stephen Welch, The Welch Labs Illustrated Guide to AI, rev. V15 (2026), pp. ${pages}`,
  url: 'https://www.welchlabs.com/',
});

export const llmLabTheory: LabTheory[] = [
  {
    labId: 'tokenization',
    premise: 'A tokenizer is a reversible interface between text and a finite vocabulary. Subword tokenization avoids both the enormous vocabulary of whole-word systems and the long sequences of character systems. BPE repeatedly merges frequent adjacent units; unigram tokenization instead chooses a likely segmentation from a learned inventory. Neither process discovers linguistically “true” words. It optimizes a representation trade-off for a particular corpus and vocabulary size.',
    mathematics: String.raw`For a segmentation $s=(t_1,\ldots,t_n)$, a unigram tokenizer can choose

$$s^*=\arg\max_{s\in S(x)}\prod_{i=1}^{n}p(t_i).$$

Every selected piece is mapped by a vocabulary function $V(t_i)=j_i$. The model receives IDs $(j_1,\ldots,j_n)$, then looks up vectors $E[j_i]$. IDs are categorical addresses: $|42-43|=1$ says nothing about semantic similarity.`,
    mechanism: 'The important boundary is text → bytes/pieces → IDs → embedding lookup. UTF-8 means one visible character may occupy several bytes, while merge rules mean several characters may occupy one token. Vocabulary construction therefore affects sequence length, multilingual fairness, latency, and context consumption before a transformer performs any attention.',
    exercise: 'Use punctuation, whitespace, accented text, emoji, and a rare Polish compound. Predict the segmentation first. Then compare piece text, byte sequence, ID, and token count. A useful quantitative check is compression ratio: characters per token or UTF-8 bytes per token. Compare only within the same tokenizer; cross-tokenizer IDs are unrelated.',
    debrief: 'A token boundary is a model artifact, not a semantic claim. Token counts are exact only for a named tokenizer and normalization pipeline. The guided demo is valuable because it exposes the representation; the Bonsai result is valuable because it is the actual runtime contract. Keep those two provenance claims separate.',
    diagram: `flowchart LR
  A["Unicode text"] --> B["UTF-8 / normalization"]
  B --> C["Subword segmentation"]
  C --> D["Vocabulary IDs"]
  D --> E["Embedding rows"]`,
    sources: [
      { label: 'Sennrich, Haddow & Birch — Neural Machine Translation of Rare Words with Subword Units (2016)', url: 'https://aclanthology.org/P16-1162/' },
      { label: 'Kudo & Richardson — SentencePiece (2018)', url: 'https://aclanthology.org/D18-2012/' },
    ],
  },
  {
    labId: 'attention',
    premise: 'Self-attention is content-dependent routing. Each position asks a query; every allowed source position exposes a key for matching and a value for transport. The attention matrix describes how value vectors are mixed for this head and this prompt. It is neither a database lookup nor a complete explanation of model reasoning.',
    mathematics: String.raw`For input states $X\in\mathbb{R}^{n\times d_{model}}$,

$$Q=XW_Q,\quad K=XW_K,\quad V=XW_V,$$
$$A=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}+M\right),\quad O=AV.$$

The scale $\sqrt{d_k}$ prevents dot products from growing with dimension. In a causal decoder, $M_{ij}=-\infty$ when $j>i$, so those probabilities become zero. Every row of $A$ sums to one.`,
    mechanism: 'The QK circuit decides where information is read from; the OV path decides what is written back. Multi-head attention repeats this with separately learned projections, concatenates the head outputs, and applies an output projection. Different heads can implement different routing patterns, but an attractive heatmap alone does not establish a causal or human-readable function.',
    exercise: 'Trace one row only. Compute its dot products, divide by the scale, apply the causal mask, subtract the row maximum for numerical stability, exponentiate, normalize, and use the weights to mix value rows. Verify that masked entries are zero and the remaining weights sum to one. Turning off the mask is a deliberate counterfactual: it leaks future evidence unavailable during generation.',
    debrief: 'Attention weights answer “how strongly did this head mix these value positions?” They do not say whether the information was later used, cancelled, or transformed by another head or MLP. A faithful explanation follows the resulting vector into the residual stream and ultimately to logits.',
    diagram: `flowchart LR
  X["Token states X"] --> Q["Queries Q"]
  X --> K["Keys K"]
  X --> V["Values V"]
  Q --> S["Scaled QK scores"]
  K --> S
  S --> A["Mask + softmax"]
  A --> O["Weighted values"]
  V --> O`,
    sources: [book('269–290'), { label: 'Vaswani et al. — Attention Is All You Need (2017)', url: 'https://arxiv.org/abs/1706.03762' }],
  },
  {
    labId: 'residual-stream',
    premise: 'A decoder-only transformer maintains one vector per token position. Attention and MLP sublayers read from this shared residual stream and add updates back into it. This additive structure preserves an information path across depth and gives components a common communication channel. The representation is contextual: after several layers, a row is no longer merely its original token embedding.',
    mathematics: String.raw`A pre-normalization transformer block can be summarized as

$$R'_{\ell}=R_{\ell}+\operatorname{Attention}(\operatorname{LN}(R_{\ell})),$$
$$R_{\ell+1}=R'_{\ell}+\operatorname{MLP}(\operatorname{LN}(R'_{\ell})).$$

At the end, $z=\operatorname{LN}(R_L)W_U$ produces vocabulary logits. A basic logit lens applies the same unembedding earlier: $z_\ell\approx\operatorname{LN}(R_\ell)W_U$.`,
    mechanism: 'Residual addition lets later components see the original embedding plus every previous write. The stream itself performs no nonlinear computation; attention and MLP blocks do. A logit lens is a probe that reuses the final unembedding at intermediate layers. It can reveal trends, but early-layer geometry may not align with the final layer, so the readout is an approximation.',
    exercise: 'While scrubbing layers, distinguish three objects: the residual vector, a projected logit distribution, and the final sampled token. Track top candidates and logit margins rather than expecting a monotonic winner. A candidate can rise, fall, and recover because later components add competing evidence.',
    debrief: 'Intermediate decoding is measurement, not a transcript of thought. A token-like readout can be useful even when it is not causally decisive; conversely, important internal directions need not have a clean vocabulary label. State explicitly that the current guided trace is illustrative unless hidden states come from the live model.',
    diagram: `flowchart LR
  E["Token + position"] --> R0["Residual stream R0"]
  R0 -->|"+ attention update"| R1["R'"]
  R1 -->|"+ MLP update"| R2["R next"]
  R2 --> D["Normalize + unembed"]
  D --> Z["Vocabulary logits"]`,
    sources: [
      book('245–264'),
      { label: 'Elhage et al. — A Mathematical Framework for Transformer Circuits (2021)', url: 'https://transformer-circuits.pub/2021/framework/index.html' },
    ],
  },
  {
    labId: 'next-token',
    premise: 'An autoregressive language model factorizes the probability of a sequence into conditional next-token distributions. The network outputs logits, which are relative scores rather than probabilities. Decoding is a separate algorithm that turns the distribution into one continuation. Greedy selection, sampling, top-k, and nucleus sampling can therefore produce different text from identical model logits.',
    mathematics: String.raw`The sequence likelihood factorizes as

$$p(x_{1:n})=\prod_{t=1}^{n}p(x_t\mid x_{<t}).$$

Temperature produces $p_i=\exp(z_i/T)/\sum_j\exp(z_j/T)$. For observed target $y$, token cross-entropy is $L=-\log p_y$, and perplexity over a corpus is $\exp(\frac{1}{N}\sum_t L_t)$. Lower $T$ sharpens ratios; higher $T$ flattens them.`,
    mechanism: 'Softmax is invariant to adding the same constant to every logit, so only differences matter. Temperature divides all logits before softmax; for positive temperature it preserves their ordering while changing concentration. Sampling then introduces controlled stochasticity. A probability of 0.4 means the model allocates 40% of its local mass to that token under this context—not that the proposition expressed by the token is 40% true.',
    exercise: String.raw`Hold the logits and random seed fixed while changing temperature. Check whether ranks remain the same and how entropy changes. Then select different target tokens and compute $-\ln p_y$: 0.8 gives about 0.223 nats, while 0.01 gives about 4.605. This ties a visible probability bar directly to training pressure.`,
    debrief: 'Generation quality is not identical to likelihood, and likelihood is not calibrated factuality. Decoding can trade repetition for diversity, but it cannot add knowledge absent from the distribution. The important conceptual bridge is that inference samples from the distribution that training optimized with cross-entropy.',
    diagram: `flowchart LR
  H["Final token state"] --> Z["Logits over vocabulary"]
  Z --> T["Temperature / truncation"]
  T --> P["Probability distribution"]
  P --> C["Choose one token"]
  C --> H2["Append and repeat"]`,
    sources: [book('67–98'), { label: 'Brown et al. — Language Models are Few-Shot Learners (2020)', url: 'https://arxiv.org/abs/2005.14165' }],
  },
  {
    labId: 'kv-cache',
    premise: 'During autoregressive decoding, all earlier token states are fixed. Recomputing their key and value projections at every step wastes work, so serving systems retain those tensors. The newest query must still compare against the retained keys and mix the retained values. The cache accelerates repeated projection work but creates a memory cost that grows with sequence length.',
    mathematics: String.raw`Ignoring small metadata, cache bytes are approximately

$$B=2\,L\,N_{kv}\,S\,d_h\,b,$$

where the factor 2 stores keys and values, $L$ is layer count, $N_{kv}$ KV heads, $S$ cached tokens, $d_h$ head dimension, and $b$ bytes per scalar. MHA uses $N_{kv}=N_q$; MQA uses one KV head; GQA lies between them.`,
    mechanism: 'Prefill processes the prompt in parallel and creates K/V rows for all prompt positions. Decode then appends one row per layer and KV head. Old queries are not cached because each query was used to compute the output for its own position; future tokens need new queries but reuse old keys and values as address/content pairs.',
    exercise: 'Double one variable at a time and predict the memory multiplier. Sequence length, layer count, KV-head count, head dimension, and bytes per element are linear factors. Then compare MHA, GQA, and MQA. Keep latency claims separate: less cache memory often improves throughput, while attention over a longer sequence still has per-token work proportional to the number of cached positions.',
    debrief: 'The KV cache is request-scoped inference state, not learned weights, semantic memory, or a transcript store. Paging reduces fragmentation and permits sharing, but it does not make the tensors free. Production systems must budget cache capacity alongside model weights and concurrent requests.',
    diagram: `sequenceDiagram
  participant P as Prompt prefill
  participant C as KV cache
  participant D as Decode step
  P->>C: store K1..n and V1..n
  D->>C: append Kn+1 and Vn+1
  C-->>D: reuse all cached K and V
  D->>D: compute only Qn+1`,
    sources: [
      { label: 'Ainslie et al. — GQA: Training Generalized Multi-Query Transformer Models (2023)', url: 'https://arxiv.org/abs/2305.13245' },
      { label: 'Kwon et al. — Efficient Memory Management with PagedAttention (2023)', url: 'https://arxiv.org/abs/2309.06180' },
    ],
  },
  {
    labId: 'embeddings',
    premise: 'A sentence embedding maps variable-length text to a fixed-length vector intended for comparison. Unlike token hidden states inside a generator, these vectors are usually trained so semantically related inputs have useful geometric relationships. Retrieval then separates representation from generation: first find nearby evidence, then optionally give it to a language model.',
    mathematics: String.raw`Cosine similarity removes magnitude and compares direction:

$$\operatorname{cos}(a,b)=\frac{a^\top b}{\lVert a\rVert_2\lVert b\rVert_2}=\hat a^\top\hat b.$$

For normalized vectors, squared Euclidean distance satisfies $\lVert\hat a-\hat b\rVert_2^2=2-2\cos(a,b)$, so ranking by either measure is equivalent. Top-$k$ retrieval chooses the largest similarities, not guaranteed truths.`,
    mechanism: 'A bi-encoder embeds query and candidate independently, allowing candidate vectors to be precomputed and indexed. This is much cheaper than a cross-encoder that jointly scores every pair, though often less precise. Pooling, training objective, normalization, language coverage, and domain all affect the geometry; an individual coordinate rarely maps cleanly to a human concept.',
    exercise: 'Include a lexical trap: one candidate shares words with the query but changes the meaning, while a paraphrase uses different vocabulary. Compare the complete similarity matrix, not only the winner. In guided 4D mode, calculate one dot product by hand; in live mode, record the model identity and avoid implying that the displayed dimensions correspond to named concepts.',
    debrief: 'Similarity is model- and corpus-relative. A nearest neighbor can be irrelevant, biased, or outside the intended threshold. Retrieval needs evaluation with task-specific positives and negatives, and generation needs citations or outcome checks of its own. Embeddings support semantic search; they do not establish semantic correctness.',
    diagram: `flowchart LR
  Q["Query text"] --> EQ["Embedding encoder"]
  D["Document texts"] --> ED["Precomputed vectors"]
  EQ --> S["Cosine similarity"]
  ED --> S
  S --> K["Top-k candidates"]`,
    sources: [{ label: 'Reimers & Gurevych — Sentence-BERT (2019)', url: 'https://arxiv.org/abs/1908.10084' }],
  },
  {
    labId: 'perceptron',
    premise: 'The perceptron is a linear binary classifier. Its weights define the orientation of a separating hyperplane and its bias shifts that plane. Rosenblatt’s learning rule corrects only misclassified examples. The convergence theorem says the algorithm finds a separator in finitely many updates when the training data are linearly separable with a positive margin; it does not say every classification problem has such a separator.',
    mathematics: String.raw`With labels $y\in\{-1,+1\}$,

$$s=w^\top x+b,\qquad \hat y=\operatorname{sign}(s).$$

On a mistake, $y(w^\top x+b)\le 0$, update $w\leftarrow w+\eta yx$ and $b\leftarrow b+\eta y$. The boundary $w^\top x+b=0$ is a line in 2D. XOR has alternating labels on the corners of a square, so no single line separates it.`,
    mechanism: 'The update rotates or shifts the boundary toward classifying the current example correctly. The learning rate scales each correction but does not create nonlinear capacity. Bias can be represented as an extra always-on input. A hard sign activation is useful for the historical algorithm but has derivative zero almost everywhere, which blocks ordinary gradient-based multilayer learning.',
    exercise: 'For each OR example, compute the score, sign, margin $ys$, and proposed update before pressing Step. Plot the resulting boundary. On XOR, distinguish failure modes: cycling updates are evidence of non-separability, not a UI bug. A useful comparison is to add hidden features such as OR and AND and observe that the output becomes linearly separable in the new coordinates.',
    debrief: 'The enduring idea is not that modern networks use the exact perceptron rule. It is the learned weighted sum as a computational unit. Modern MLPs use differentiable nonlinearities, losses, and backpropagation; their depth composes many boundaries. Preserve that historical continuity without calling a GPT block “just one perceptron.”',
    diagram: `flowchart LR
  X["Inputs x"] --> M["Weighted sum w·x + b"]
  M --> Y["Sign decision"]
  Y --> C{"Mistake?"}
  C -->|"yes"| U["w ← w + ηyx"]
  C -->|"no"| N["No update"]`,
    sources: [book('13–39'), { label: 'Rosenblatt — The Perceptron: A Probabilistic Model (1958)', url: 'https://doi.org/10.1037/h0042519' }],
  },
  {
    labId: 'gradient-descent',
    premise: 'Gradient descent optimizes a scalar objective by repeatedly using first-order local information. A gradient contains one partial derivative per parameter and points in the direction of steepest local increase under the Euclidean norm. Descent subtracts it. This is a local method: the update is justified by a linear approximation that is accurate only for a sufficiently small step.',
    mathematics: String.raw`For parameters $\theta$ and differentiable loss $L$,

$$L(\theta+\Delta)\approx L(\theta)+\nabla L(\theta)^\top\Delta,$$
$$\theta_{t+1}=\theta_t-\eta\nabla L(\theta_t).$$

For $\hat y_i=wx_i+b$ and mean-squared error, $\partial L/\partial w=\frac{2}{n}\sum_i(\hat y_i-y_i)x_i$ and $\partial L/\partial b=\frac{2}{n}\sum_i(\hat y_i-y_i)$.`,
    mechanism: 'The loss defines what “better” means; the derivative defines local sensitivity; the optimizer chooses the step. The learning rate changes distance, not the gradient direction. Mini-batch stochastic gradients estimate the full-data gradient and add noise that can help exploration but also increases variance. High-dimensional neural landscapes do not behave like a simple two-dimensional valley.',
    exercise: String.raw`Compute one analytic step and verify it with central finite differences: $[L(\theta+\epsilon e_j)-L(\theta-\epsilon e_j)]/(2\epsilon)$. Agreement supports the derivative implementation. Then increase the learning rate until loss oscillates or diverges; explain this as overshooting the region where the local linear approximation is useful.`,
    debrief: 'A small gradient can indicate a minimum, a saddle, saturation, or an insensitive direction. A falling training loss does not by itself establish generalization. The lab’s convex surface isolates the update rule; production training adds batching, momentum/Adam, schedules, regularization, and a non-convex parameter space.',
    diagram: `flowchart LR
  P["Parameters θ"] --> F["Forward prediction"]
  F --> L["Scalar loss L"]
  L --> G["Gradient ∇L"]
  G --> U["θ ← θ - η∇L"]
  U --> P`,
    sources: [book('67–98'), { label: 'Ruder — An overview of gradient descent optimization algorithms (2016)', url: 'https://arxiv.org/abs/1609.04747' }],
  },
  {
    labId: 'backpropagation',
    premise: 'Backpropagation is reverse-mode automatic differentiation specialized to a scalar loss. The forward pass records intermediate values. The reverse pass traverses the computation graph backward, multiplying by local derivatives and adding contributions where downstream paths merge. Its efficiency comes from reusing these partial results instead of differentiating the whole network separately for every parameter.',
    mathematics: String.raw`If $u=f(x)$, $v=g(u)$, and $L=h(v)$, then

$$\frac{\partial L}{\partial x}=\frac{\partial L}{\partial v}\frac{\partial v}{\partial u}\frac{\partial u}{\partial x}.$$

At a branch, contributions add: $\bar u=\sum_k \bar v_k\,\partial v_k/\partial u$. For ReLU, $\partial\max(0,z)/\partial z$ is $1$ for $z>0$ and $0$ for $z<0$ (a convention is chosen at zero).`,
    mechanism: 'Each node needs an upstream adjoint and its local derivative. Parameters shared across examples or positions accumulate gradient contributions. A dead ReLU blocks gradients through that activation for that example, but downstream biases may still receive gradients because they lie on paths that do not pass backward through the inactive unit.',
    exercise: String.raw`Trace one scalar network in both directions. Label forward values, then start with $\partial L/\partial L=1$. For every edge, write “upstream × local.” Check selected parameter gradients with finite differences. When the ReLU becomes inactive, identify precisely which paths become zero rather than saying “backprop stops.”`,
    debrief: 'Backprop computes derivatives; gradient descent or another optimizer uses them. This distinction prevents a common category error. The 1986 result emphasized that hidden units learn useful internal features because error signals reach them. Modern frameworks automate the bookkeeping, but the local chain rule remains the mechanism.',
    diagram: `flowchart LR
  X["x"] --> Z1["z1 = w1x+b1"]
  Z1 --> H["h = ReLU(z1)"]
  H --> Z2["z2 = w2h+b2"]
  Z2 --> L["loss"]
  L -. "gradients" .-> Z2
  Z2 -.-> H
  H -.-> Z1`,
    sources: [book('107–136'), { label: 'Rumelhart, Hinton & Williams — Learning representations by back-propagating errors (1986)', url: 'https://www.nature.com/articles/323533a0' }],
  },
  {
    labId: 'depth',
    premise: 'Depth composes functions. A hidden layer can transform a problem into coordinates where a simple downstream rule succeeds. XOR is the smallest geometric demonstration: no line separates the original labels, but two hidden threshold features can encode “at least one input” and “both inputs,” after which the output subtracts the exceptional both-active case.',
    mathematics: String.raw`One constructive XOR network is

$$h_1=\operatorname{step}(x_1+x_2-0.5),\quad h_2=\operatorname{step}(x_1+x_2-1.5),$$
$$\hat y=\operatorname{step}(h_1-2h_2-0.5).$$

For inputs $00,01,10,11$, the hidden representations are $(0,0),(1,0),(1,0),(1,1)$, so one output boundary separates the positive middle pair from the endpoints.`,
    mechanism: 'The hidden units do not merely add more lines in the original plot; together they define a representation map $h=f(Wx+b)$. Later layers operate on $h$, not directly on raw $x$. Differentiable activations let backpropagation learn such features rather than requiring the instructor to handcraft OR and AND.',
    exercise: 'First exhaust the one-line hypothesis: draw any boundary and name the misclassified corner. Then fill the hidden truth table and plot the four points in $(h_1,h_2)$ space. The decisive question is whether the output became more complex or its input representation became easier.',
    debrief: 'XOR proves a capacity gap, not that deeper is always better. Extra layers can improve parameter efficiency and hierarchical composition, but training, data, inductive bias, and optimization still matter. The slide should motivate learned representations without implying that every hidden feature has a clean human name.',
    diagram: `flowchart LR
  X1["x1"] --> H1["OR-like feature"]
  X2["x2"] --> H1
  X1 --> H2["AND-like feature"]
  X2 --> H2
  H1 --> Y["Linear output"]
  H2 --> Y`,
    sources: [book('147–176'), { label: 'Rumelhart, Hinton & Williams — Learning representations by back-propagating errors (1986)', url: 'https://www.nature.com/articles/323533a0' }],
  },
  {
    labId: 'convolution',
    premise: 'A convolutional layer applies the same local detector at every spatial location. Local connectivity reduces the receptive field of one activation; weight sharing makes the detector translation-equivariant and drastically reduces parameter count. The learned kernel is not an image template—it is a set of coefficients whose dot product with each patch becomes a feature response.',
    mathematics: String.raw`For a 2D input $X$ and kernel $K$ of size $k_h\times k_w$,

$$Y_{r,c}=b+\sum_{i=0}^{k_h-1}\sum_{j=0}^{k_w-1}K_{i,j}X_{r+i,c+j}.$$

With stride $s$, padding $p$, input width $W$, and kernel width $k$, output width is $\lfloor(W+2p-k)/s\rfloor+1$. Deep-learning libraries usually implement cross-correlation (no kernel flip) while calling it convolution.`,
    mechanism: 'One output cell depends on one patch, but one kernel weight affects every output location. Multiple output channels learn multiple detectors; each spans all input channels. Nonlinearities and pooling then build tolerance and larger effective receptive fields. Convolution is equivariant to translation in the ideal interior, while boundaries, stride, pooling, and classification can alter that property.',
    exercise: 'Select one output cell and enumerate the nine products for a 3×3 kernel. Verify the bias and sum. Then change one kernel coefficient and predict which cells change: every cell whose receptive patch uses that coefficient. Compare an edge kernel with a blur kernel to connect sign patterns to activation maps.',
    debrief: 'A bright activation means this learned local calculation responded strongly; it is not object recognition. Recognition emerges when later layers compose many spatial features. Weight sharing explains why moving a feature need not require a separately learned detector at every coordinate.',
    diagram: `flowchart LR
  X["Image tensor"] --> P["Local patch"]
  K["Shared kernel"] --> M["Elementwise products"]
  P --> M
  M --> S["Sum + bias"]
  S --> A["One activation"]
  A --> Y["Slide to form map"]`,
    sources: [
      book('182–212'),
      { label: 'Krizhevsky, Sutskever & Hinton — ImageNet Classification with Deep CNNs (2012)', url: 'https://proceedings.neurips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html' },
    ],
  },
  {
    labId: 'digits',
    premise: 'A digit CNN is a complete learned representation pipeline: normalized pixels become early activation maps, pooling reduces spatial resolution, later filters combine larger patterns, and a classifier converts the final feature tensor into ten logits. Confidence emerges from relative logits; the model does not compare the drawing directly with ten stored prototypes.',
    mathematics: String.raw`For class logits $z\in\mathbb{R}^{10}$,

$$p(y=c\mid x)=\frac{e^{z_c}}{\sum_{j=0}^{9}e^{z_j}},\qquad L=-\log p(y_{true}\mid x).$$

A $3\times3$ convolution followed by $2\times2$ pooling expands the effective receptive field. Flattening $16\times7\times7$ produces $784$ features; a dense matrix $W\in\mathbb{R}^{10\times784}$ turns them into class evidence.`,
    mechanism: 'Early maps often resemble edges or strokes because their receptive fields are small. Later maps combine earlier responses and can be harder to name. Pooling trades exact spatial detail for lower resolution and some local tolerance. Softmax normalizes class scores but does not make confidence calibrated, especially for drawings outside the training distribution.',
    exercise: 'Run a clean sample, then perturb one stroke while holding preprocessing fixed. Compare the full probability vector, not just argmax. Inspect where the activation difference first appears. A strong exercise records tensor shapes at each layer and asks how many scalar activations were retained or discarded.',
    debrief: 'High confidence is conditional on the model and its training distribution, not a guarantee. MNIST-like success is narrow competence. The unifying lesson is that learned local filters, nonlinear composition, loss, and backpropagation together shape a representation useful for a fixed ten-class task.',
    diagram: `flowchart LR
  P["1×28×28 pixels"] --> C1["Conv / ReLU"]
  C1 --> M1["8×14×14"]
  M1 --> C2["Conv / ReLU"]
  C2 --> M2["16×7×7"]
  M2 --> F["Flatten 784"]
  F --> Z["10 logits + softmax"]`,
    sources: [
      book('182–216'),
      { label: 'LeCun et al. — Gradient-Based Learning Applied to Document Recognition (1998)', url: 'https://yann.lecun.com/exdb/publis/' },
      { label: 'LeCun — MNIST handwritten digit database', url: 'https://yann.lecun.com/exdb/mnist/' },
    ],
  },
];

export const llmTrackTheory: TrackTheory[] = [
  {
    trackId: 'language',
    premise: 'Autoregressive inference is a chain of representations: text becomes token IDs, IDs become vectors, attention routes context, residual blocks accumulate updates, unembedding creates logits, decoding selects a token, and cached keys and values make the next step cheaper. The chapter is coherent only if each arrow names both its input representation and its operation.',
    mathematics: String.raw`The outer objective is $p(x_{1:n})=\prod_t p(x_t\mid x_{<t})$; the transformer implements each conditional distribution through embeddings, residual updates, attention, and a vocabulary softmax.`,
    diagram: `flowchart LR
  T["Text"] --> I["Token IDs"] --> R["Residual states"] --> Z["Logits"] --> P["Probabilities"] --> N["Next token"]`,
    sources: [book('269–290'), { label: 'Vaswani et al. — Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762' }],
  },
  {
    trackId: 'semantic',
    premise: 'Semantic retrieval uses a different contract from generation. A bi-encoder maps whole inputs to vectors so many candidates can be searched cheaply; a generator consumes an ordered token sequence and predicts continuations. Calling both outputs “embeddings” hides their training objective, granularity, and valid comparisons.',
    mathematics: String.raw`Normalize vectors $\hat e=e/\lVert e\rVert_2$, then rank candidates by $\hat q^\top\hat e_i$. The score orders candidates but requires task-specific thresholds and evaluation.`,
    diagram: `flowchart LR
  Q["Query"] --> E["Sentence encoder"] --> V["Vector"] --> K["Nearest neighbors"]`,
    sources: [{ label: 'Reimers & Gurevych — Sentence-BERT', url: 'https://arxiv.org/abs/1908.10084' }],
  },
  {
    trackId: 'neural',
    premise: 'The neural track separates four ideas often blurred together: a parameterized prediction, a scalar loss, efficient derivative computation, and representation learned through depth. Vision then makes the same pipeline spatial by reusing local weights. The book’s central “find the bottom” method is strongest here because each stage can be computed by hand.',
    mathematics: String.raw`Training repeats $\hat y=f_\theta(x)$, $L=\ell(\hat y,y)$, $g=\nabla_\theta L$ via backpropagation, and $\theta\leftarrow\theta-\eta g$.`,
    diagram: `flowchart LR
  X["Data"] --> F["Network fθ"] --> Y["Prediction"] --> L["Loss"] --> G["Backprop gradient"] --> U["Parameter update"]`,
    sources: [book('13–216'), { label: 'Rumelhart, Hinton & Williams — Back-propagating errors', url: 'https://www.nature.com/articles/323533a0' }],
  },
];
