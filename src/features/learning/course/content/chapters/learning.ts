import { LLM_COURSE_PROMPT, LLM_COURSE_TARGET } from '../../courseScenario';
import type { CourseTheoryChapter } from '../theoryTypes';

export const LEARNING_CHAPTER = {
  question: 'How does a low probability for the observed next token become a small, useful change to model parameters?',
  estimatedMinutes: 58,
  prerequisites: [
    'Know that the language-model head produces one logit and one probability for every vocabulary token.',
    'Know that autoregressive inference conditions each next-token prediction on earlier tokens only.',
    'Be comfortable with vectors, weighted sums, and simple derivatives such as the slope of a line.',
    'Recognize that model weights are learned parameters while residual states and KV tensors are prompt-dependent runtime values.',
    'Know that a logarithm converts multiplication into addition and that $\log(1)=0$.',
  ],
  objectives: [
    'Construct shifted next-token targets from a token sequence and explain teacher forcing.',
    'Calculate token cross-entropy as $-\log p_y$, including the shared target example $p_y=0.48$.',
    'Distinguish attention masks, padding masks, and loss masks.',
    'Explain how token losses are averaged across variable-length batches.',
    'Trace a scalar loss through a computation graph using local derivatives and the chain rule.',
    'Explain why reverse-mode differentiation is efficient when one scalar loss depends on many parameters.',
    'Separate gradients from the optimizer that applies parameter updates.',
    'Calculate one exact vector gradient and SGD update for a miniature vocabulary head.',
    'Use a finite-difference check to test an analytic gradient.',
    'Compare SGD and Adam conceptually without treating either as a guarantee of learning.',
    'Explain why batches, repetition, held-out evaluation, and data quality matter for generalization.',
    'Identify the boundary between ordinary inference and training or fine-tuning.',
  ],
  sections: [
    {
      id: 'training-question',
      eyebrow: 'Part A · 1 · The signal',
      heading: 'Training begins with an observed token, not with a verbal correction inside the model',
      body: String.raw`The shared course prompt is “${LLM_COURSE_PROMPT}”, and the observed continuation is “${LLM_COURSE_TARGET}”. During inference, the model uses fixed parameters to produce a next-token distribution and a decoder chooses a continuation. During training, an observed continuation supplies a target. The training system asks a quantitative question: how much probability did the model assign to the token that actually occurred?

Suppose the model assigned probability $0.48$ to “ tired”. That probability is neither a grade for the whole sentence nor a statement that tiredness is $48\%$ true. It is the model’s conditional probability for one vocabulary item at one prediction position under the current parameters and context. Training converts that local probability into a scalar loss. A high target probability produces a small loss; a low target probability produces a large loss.

One scalar is essential because optimization needs a defined objective. The network contains many layers and parameters, but the training example must ultimately say what should decrease. Cross-entropy supplies that quantity for next-token prediction. Backpropagation then computes how sensitive the loss is to intermediate values and parameters. An optimizer uses those sensitivities to choose a small update. These are three separate jobs:

- the loss measures the current miss;
- backpropagation computes gradients;
- the optimizer changes parameters.

The phrase “the model learns the answer” compresses all three jobs and can suggest that a sentence is inserted into a storage location. In reality, a training step changes many numerical parameters by small amounts. Those changes may increase the probability of the observed token in related contexts, decrease alternatives, affect other examples, or interfere with earlier behavior. Whether the update generalizes usefully is an empirical question for held-out evaluation.

This chapter therefore has two internal parts. Part A defines training examples and their loss: shifted targets, teacher forcing, cross-entropy, masks, and averaging. Part B follows that loss backward through a computation graph and then forward into an optimizer update. Keeping the parts distinct makes it possible to diagnose whether a problem comes from labels, objective construction, gradient computation, update choice, or evaluation.`,
      diagramIds: ['training-inference-boundary'],
    },
    {
      id: 'teacher-forcing',
      eyebrow: 'Part A · 2 · Targets',
      heading: 'One token sequence supplies many shifted next-token exercises',
      body: String.raw`Let a tokenized sequence be

$$x_1,x_2,\ldots,x_T.$$

At position $t$, a causal language model sees tokens through $x_t$ and predicts $x_{t+1}$. The training input and target are shifted versions of the same sequence:

$$\text{input}=[x_1,x_2,\ldots,x_{T-1}],$$
$$\text{target}=[x_2,x_3,\ldots,x_T].$$

For the end of our shared example, the context ending in “too” has the target “ tired”. At an earlier position, the context ending in “street” might have the target “because”. A single length-$T$ sequence can therefore provide up to $T-1$ supervised next-token comparisons.

During training, the model normally receives the actual earlier tokens from the dataset rather than its own sampled mistakes. This is called teacher forcing. The target sequence is available to the training system, but the causal mask prevents position $t$ from reading future token representations. Each position must form its prediction from the allowed prefix. Because every target position is known, modern hardware can calculate many positions in parallel instead of performing a sampled decode loop for every training token.

Teacher forcing does not mean that the target token is secretly exposed to its own prediction position. Correct shifting and causal masking are essential. An off-by-one error can train the model to reconstruct the current token or leak future evidence. A useful debugging table includes the visible position, input token, allowed context, target token, and whether loss is enabled.

Pretraining often applies next-token loss to nearly every non-padding target token. Supervised fine-tuning can choose a more selective loss mask. For an instruction-response record, the system may provide system and user tokens as context while calculating loss only on assistant response tokens. The model still processes the prompt tokens because the response depends on them; those prompt positions simply may not contribute directly to the averaged objective.

Teacher forcing also creates a train–generate difference. At inference, a sampled token becomes part of the next context, so one early choice can redirect later predictions. During teacher-forced training, later positions continue to receive the observed dataset prefix. This does not invalidate the objective, but it explains why low average token loss does not guarantee flawless long free-running generations.`,
      diagramIds: ['shifted-targets'],
    },
    {
      id: 'cross-entropy',
      eyebrow: 'Part A · 3 · Token loss',
      heading: 'Cross-entropy reads the probability assigned to the observed vocabulary item',
      body: String.raw`At one position, the language-model head produces logits $z_1,\ldots,z_V$ for a vocabulary of size $V$. Softmax turns those relative scores into probabilities:

$$p_i=\frac{e^{z_i}}{\sum_{j=1}^{V}e^{z_j}}.$$

Represent the observed target as a one-hot vector $y$, where $y_i=1$ for the observed token and $0$ elsewhere. Categorical cross-entropy is

$$\ell=-\sum_{i=1}^{V}y_i\log p_i.$$

Only one one-hot component is nonzero, so this reduces to

$$\ell=-\log p_y.$$

For the shared target “ tired”, use $p_y=0.48$:

$$\ell=-\log(0.48)\approx0.733969\text{ nats}.$$

The unit is a nat because the natural logarithm is used. If the target probability rises to $0.80$, loss falls to about $0.223$. If it falls to $0.01$, loss rises to about $4.605$. The logarithm makes confident mistakes expensive while preserving a smooth derivative. As $p_y$ approaches one, loss approaches zero. As $p_y$ approaches zero, loss grows without a finite upper bound.

The loss is not based only on whether the target ranked first. Two distributions can select the same top token but assign it probabilities $0.35$ and $0.90$, producing very different losses. Conversely, a target can rank second with meaningful probability and receive a moderate penalty rather than a binary failure. This graded signal is valuable for optimization.

In a numerically stable implementation, frameworks usually combine log-softmax and negative log-likelihood rather than computing tiny probabilities and then taking their logarithms. Adding the same constant to every logit does not change softmax, so subtracting the maximum logit prevents unnecessary overflow. The mathematical target remains the same.

An especially useful derivative appears at the logits:

$$\frac{\partial\ell}{\partial z_i}=p_i-y_i.$$

For the target token, the derivative is $p_y-1$, which is negative unless the probability is already one. For every non-target token, it is $p_i$, which is positive. Gradient descent subtracts these derivatives, tending to raise the target logit and lower alternatives for this example. The worked update later will calculate this exactly.`,
      diagramIds: ['loss-and-mask'],
    },
    {
      id: 'averaging-and-masks',
      eyebrow: 'Part A · 4 · From tokens to a batch',
      heading: 'The training objective averages selected token losses, not every rectangular array cell',
      body: String.raw`Training batches usually contain several sequences, often padded to a common length. Let $b$ index examples and $t$ index target positions. Let $m_{b,t}$ be a loss mask equal to one when a position should contribute and zero otherwise. A token-averaged batch loss is

$$L=\frac{\sum_{b,t}m_{b,t}\ell_{b,t}}{\sum_{b,t}m_{b,t}}.$$

The denominator counts active target tokens. Padding cells must not reduce or distort the loss. In supervised fine-tuning, prompt tokens can also receive mask value zero while response tokens receive one. Other objectives can apply custom weights rather than a binary mask, but their normalization must remain explicit.

Three masks are often confused. The causal attention mask controls which source positions a destination representation may read. A padding attention mask prevents computation from treating padding as meaningful context. A loss mask controls which target comparisons contribute to the scalar objective. A prompt token can be readable context with loss mask zero. Therefore “masked” is incomplete unless the affected operation is named.

Token averaging gives longer examples proportionally more influence because they contribute more active tokens. Sequence averaging can first average each example and then average examples, giving every sequence equal weight regardless of length. Both are defensible for particular objectives, but they are not numerically identical. Reports and tests should state the reduction rule.

Batches serve two purposes. They improve hardware utilization by processing many tokens together, and their averaged gradient estimates the direction suggested by a larger sample of data. A small batch produces a noisier estimate; a very large batch is more stable but consumes more memory and can require learning-rate changes. Gradient accumulation can combine several microbatches before an optimizer step when the full batch does not fit at once.

Dataset-level metrics aggregate beyond one batch. Mean cross-entropy can be exponentiated to obtain perplexity:

$$\operatorname{perplexity}=e^{L}.$$

Perplexity is meaningful only when tokenization, data, masking, and reduction are comparable. A model with a different tokenizer partitions text into different prediction events, so raw perplexities are not automatically commensurable. Neither cross-entropy nor perplexity directly measures factuality, safety, instruction following, or usefulness.`,
      diagramIds: ['loss-and-mask'],
    },
    {
      id: 'computation-graph',
      eyebrow: 'Part B · 5 · Forward graph',
      heading: 'The loss depends on parameters through a graph of small operations',
      body: String.raw`A transformer forward pass can be represented as a directed computation graph. Nodes hold operations or values: embedding lookups, matrix products, normalization, attention, nonlinearities, residual additions, logits, softmax, and cross-entropy. Edges express numerical dependence. The final scalar loss depends on the target probability; that probability depends on logits; logits depend on the final residual state and output parameters; the final state depends on every contributing earlier block.

During the forward pass, the system calculates values and retains enough intermediate information for differentiation. A multiplication may need its input operands. ReLU needs to know which pre-activations were positive. Softmax-cross-entropy can use the resulting probabilities and target indices. Memory-efficient techniques may recompute some activations during backward instead of storing all of them, trading computation for memory, but the logical graph remains.

Consider a short chain $u=f(x)$, $v=g(u)$, and $L=h(v)$. The chain rule states

$$\frac{\partial L}{\partial x}
=\frac{\partial L}{\partial v}
\frac{\partial v}{\partial u}
\frac{\partial u}{\partial x}.$$

Each factor is local to one edge or operation. A node does not need a symbolic understanding of the entire network. It receives an upstream derivative describing how loss changes with its output, multiplies by its local derivative, and passes the resulting derivative to its inputs.

When one value influences loss through several downstream paths, gradient contributions add. Residual connections are a simple example: if $r'=r+f(r)$, then $r$ affects $r'$ through the identity path and through $f$. Backward differentiation accounts for both. Shared parameters also accumulate contributions from every token position and batch example where they were used.

The graph is a mathematical record, not a narrative of private reasoning. A backward edge communicates a derivative, not blame in a psychological sense. The word credit assignment can be a useful metaphor if it is immediately grounded in partial derivatives.`,
      diagramIds: ['forward-backward-graph'],
    },
    {
      id: 'reverse-mode',
      eyebrow: 'Part B · 6 · Backward pass',
      heading: 'Reverse mode reuses downstream derivatives to obtain many parameter gradients efficiently',
      body: String.raw`A large model can have billions of parameters but one scalar batch loss. Computing the loss separately after perturbing every parameter would require an enormous number of forward passes. Reverse-mode automatic differentiation exploits this many-inputs-to-one-output structure. It evaluates the forward graph once, starts with

$$\frac{\partial L}{\partial L}=1,$$

and traverses operations in reverse topological order. At each node it combines the arriving derivative with local Jacobian information. The result is one gradient component for every parameter that contributed to the loss.

The parameter gradient is written

$$\nabla_\theta L
=\left[\frac{\partial L}{\partial\theta_1},\ldots,
\frac{\partial L}{\partial\theta_P}\right].$$

It points in the direction of steepest local increase under the ordinary Euclidean interpretation. A descent optimizer moves approximately in the opposite direction. The gradient is local: it describes the first-order sensitivity near the current parameters, not the globally best destination.

Backpropagation is the organized application of reverse-mode differentiation to the network graph. It computes derivatives; it does not decide the learning rate, maintain Adam moments, clip gradients, or change a weight by itself. Framework calls often place backward and optimizer operations close together, which can obscure this separation.

Gradients from separate active tokens and examples add before the chosen reduction is applied. If the batch loss is a mean, division by the number of active tokens scales the resulting gradient. If microbatches are accumulated, care is needed to match the intended full-batch normalization. Mixed-precision training may scale the loss temporarily to protect small gradients, then unscale before clipping or updating.

The existing Backpropagation side lab is the appropriate place to slow down and inspect every local derivative through one hidden ReLU unit. This course chapter uses the same principle to connect token loss to a transformer-scale graph. The side lab provides the glass-box arithmetic; the canonical lesson supplies the role it plays in language-model training.`,
      diagramIds: ['forward-backward-graph'],
    },
    {
      id: 'exact-update',
      eyebrow: 'Part B · 7 · Exact educational calculation',
      heading: 'One target token produces a vector gradient and a measurable SGD improvement',
      body: String.raw`This miniature is fully declared educational arithmetic. It does not claim to show Bonsai weights, gradients, optimizer state, or training data. Use a three-token teaching vocabulary:

$$[\text{ tired},\text{ frightened},\text{ late}].$$

Let the current probabilities be

$$p=[0.48,0.32,0.20],$$

and let “ tired” be the observed target, so

$$y=[1,0,0].$$

Choose logits equal to the natural logarithms of the probabilities:

$$z=[\log0.48,\log0.32,\log0.20]$$
$$\phantom{z}\approx[-0.733969,-1.139434,-1.609438].$$

Because the probabilities already sum to one, softmax of these logits returns the declared $p$. The initial loss is

$$\ell=-\log0.48\approx0.733969.$$

The logit gradient is

$$g_z=p-y=[-0.52,0.32,0.20].$$

The negative target component means that subtracting the gradient will raise the “ tired” logit. Positive alternative components mean descent will lower those logits.

Now make the output layer transparent. Let the incoming feature row be

$$h=[1,-1].$$

Let each vocabulary item have a two-component weight row $W_i$, initially zero, and let the output biases equal the logits above. Thus $z_i=W_i\cdot h+b_i$. The gradients are

$$\frac{\partial\ell}{\partial W_i}=g_{z_i}h,$$
$$\frac{\partial\ell}{\partial b_i}=g_{z_i}.$$

For “ tired”, $\partial\ell/\partial W_1=[-0.52,0.52]$. For “ frightened” it is $[0.32,-0.32]$, and for “ late” it is $[0.20,-0.20]$. With SGD learning rate $\eta=0.1$,

$$W'_i=W_i-0.1g_{z_i}h,\qquad b'_i=b_i-0.1g_{z_i}.$$

Because $h\cdot h=2$, the updated logit for class $i$ changes by $-0.1g_{z_i}(2+1)=-0.3g_{z_i}$. The new logits are approximately

$$z'=[-0.577969,-1.235434,-1.669438].$$

Softmax gives

$$p'\approx[0.596847,0.308416,0.094736].$$

The new loss is

$$\ell'=-\log0.596847\approx0.516094.$$

For this example and step size, the target probability rose and loss fell. That is a successful local update, not evidence of generalization. The same parameters may participate in many other contexts, so evaluation must measure their broader effects.`,
      diagramIds: ['exact-update-flow'],
    },
    {
      id: 'gradient-checks',
      eyebrow: 'Part B · 8 · Verification',
      heading: 'Finite differences can detect broken gradients without replacing backpropagation',
      body: String.raw`An analytic or automatically differentiated gradient should agree with the observed local slope of the loss. For one parameter $\theta_j$, a central finite-difference estimate is

$$\frac{\partial L}{\partial\theta_j}
\approx
\frac{L(\theta+\epsilon e_j)-L(\theta-\epsilon e_j)}{2\epsilon}.$$

Here $e_j$ changes only parameter $j$, and $\epsilon$ is small. The method runs two forward evaluations and compares their loss difference. It is far too expensive to train a large model parameter by parameter, but it is useful for testing a small implementation, custom operation, or educational derivative.

Choosing $\epsilon$ requires judgment. If it is too large, curvature makes the finite step differ from the local derivative. If it is too small, floating-point cancellation can dominate. Relative error is usually more informative than demanding bit-for-bit equality. Non-differentiable points such as the exact ReLU kink also require care because a framework adopts a derivative convention while symmetric finite differences may reflect both sides.

Other sanity checks are cheaper. Confirm that loss is finite and that active-token counts are nonzero. Inspect gradient norms by layer. Verify that masked tokens make no direct loss contribution. Test whether a very small update changes a miniature loss in the predicted direction. Compare training with shuffled targets: if loss improves suspiciously well, leakage or label alignment may be broken. Overfit a tiny batch deliberately; inability to do so can reveal an implementation problem, while success does not prove generalization.

Exploding gradients can make an update unstable, and vanishing gradients can make parts of the model change very slowly. Gradient clipping limits a chosen norm before the optimizer step, but it does not repair incorrect targets or guarantee convergence. Monitoring should distinguish raw gradients, clipped gradients, optimizer-adjusted updates, and parameter changes.

The existing Gradient Descent side lab makes analytic slopes, finite differences, and learning-rate instability visible on a two-parameter regression surface. That lab is a deliberate low-dimensional microscope. The transformer chapter should link to it without suggesting that a convex bowl accurately represents the geometry of language-model training.`,
      diagramIds: ['exact-update-flow'],
    },
    {
      id: 'optimizers',
      eyebrow: 'Part B · 9 · Applying gradients',
      heading: 'SGD follows the current gradient; Adam also uses moving estimates of scale and direction',
      body: String.raw`The simplest update is stochastic gradient descent:

$$\theta_{t+1}=\theta_t-\eta\nabla_\theta L_t.$$

The adjective stochastic reflects that $L_t$ is usually computed from a sampled mini-batch rather than the complete dataset. The learning rate $\eta$ controls step scale. If it is too small, useful progress can be slow. If it is too large, the first-order approximation may be poor and loss can oscillate or diverge. Schedules often warm up the learning rate and then reduce it over training.

Momentum maintains a moving direction so that consistent gradients accumulate and alternating noise is damped. Adam keeps exponential moving averages of the gradient and its element-wise square. In conceptual form,

$$m_t=\beta_1m_{t-1}+(1-\beta_1)g_t,$$
$$v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^2.$$

After bias correction, Adam scales the first-moment estimate using the square root of the second-moment estimate plus a small numerical stabilizer. Parameters with different observed gradient scales can therefore receive differently normalized steps. AdamW handles weight decay separately from the adaptive gradient update, a distinction that matters in real implementations.

An optimizer does not know whether data are correct, whether an objective represents user needs, or whether a gradient came from leakage. It applies a numerical rule. Adaptive steps do not guarantee better generalization, and a decreasing training loss can coexist with memorization, bias, or degradation on other tasks.

Large-model training adds distributed gradient reduction, mixed precision, checkpointing, parameter sharding, clipping, schedules, and failure recovery. Those systems determine whether the mathematical update can be executed efficiently and reproducibly. The beginner-level invariant remains: backpropagation computes $g_t$; optimizer state combines $g_t$ with its history and hyperparameters; the optimizer produces an update; only then do parameters change.`,
      diagramIds: ['training-inference-boundary'],
    },
    {
      id: 'generalization-and-boundary',
      eyebrow: 'Part B · 10 · What learning means',
      heading: 'Repeated updates can produce generalization, but ordinary inference does not perform them',
      body: String.raw`One worked update increased the probability of “ tired” for one declared feature vector. Useful learning requires repetition across many contexts and targets. Batches expose varied examples, epochs or long streams provide repeated opportunities, and validation data test behavior on examples excluded from parameter updates. Data diversity and quality influence which statistical regularities the model can acquire. Deduplication, sampling weights, curriculum, and objective design all affect the training distribution.

Generalization means that parameter changes improve relevant unseen cases, not merely the examples used to calculate gradients. A model can reduce training loss by memorizing repeated sequences, exploiting leakage, or learning shortcuts. Held-out loss, task-specific evaluations, robustness tests, and safety checks measure different aspects of behavior. One scalar training objective is necessary for optimization but insufficient as a complete quality definition.

Dataset splitting is part of the evidence, not administrative cleanup. If near-duplicate documents, answers, or benchmark items appear in both training and validation sets, validation can overstate generalization. A chronological split can test behavior on later data, while a source-based split can test transfer to new publishers, repositories, or users. The right split follows the intended deployment claim. Evaluation records should preserve tokenizer, masking, checkpoint, decoding, and dataset-version details so that an apparent gain can be reproduced and interpreted.

Training curves also require comparison rather than isolated inspection. A falling training loss with rising validation loss is evidence of overfitting to the measured distribution. Both losses can fall while a safety or instruction-following evaluation degrades because the scalar token objective does not name every desired behavior. Conversely, noisy batch loss can rise temporarily even when the longer validation trend improves. Checkpoint selection is therefore an evaluation decision, not simply “use the final update.”

Fine-tuning follows the same basic pipeline as pretraining: construct examples and masks, run a forward pass, compute a loss, backpropagate, and apply optimizer steps. It usually starts from existing weights and uses a smaller, more targeted dataset and learning regime. Showing a model one correction in a chat does not by itself fine-tune it. A product may insert that correction into later context, store it in application memory, or send it to a separate training pipeline. Durable parameter learning occurs only if an authorized update process actually changes weights or adapters.

One-shot memorization is also a poor default model of fine-tuning. A single example can create a gradient, but the update is distributed across participating parameters and interacts with many behaviors. Learning rate, batching, repetition, regularization, parameter-efficient adapters, and dataset balance determine whether the example has a durable, useful effect. Excessive optimization on narrow data can overfit or cause catastrophic forgetting.

Parameter-efficient fine-tuning changes only a selected subset or introduces trainable adapter parameters while keeping most base weights frozen. This can reduce training memory and make versions easier to manage, but it does not remove the need for targets, loss, gradients, optimizer state, and evaluation. An adapter is learned state, not prompt context. Loading a different adapter can change behavior even when the base checkpoint is identical, so adapter identity belongs in provenance and cache-compatibility records.

The inference boundary is concrete. In ordinary inference, token IDs, residual states, logits, selected tokens, and KV cache contents change with the prompt. Learned weights and optimizer state do not change. In training, a target and loss are introduced, gradients are computed, optimizer state advances, and selected parameters are updated. Some applications run online learning, but that is an explicit system feature with data governance, safety, and evaluation consequences—not an automatic property of generation.

Provenance remains mandatory. The $0.48$ probability and exact SGD calculation in this chapter are educational data. A live Bonsai response can establish returned tokens, probabilities, or timing only if its API exposes them. The course must not claim to display Bonsai gradients, training batches, weights, or optimizer state without an authoritative source. The side labs provide exact transparent gradient calculations; they do not reconstruct a private model’s training history.

The capstone bridge is to change “animal” to “robot” and classify consequences. Tokenization and runtime states may change immediately; exact downstream values require inference; decoding settings remain application-controlled; weights stay fixed unless the example enters a genuine training pipeline. That classification turns the course from a list of formulas into a debugging model for real AI systems.`,
      diagramIds: ['training-inference-boundary'],
    },
  ],
  diagrams: [
    {
      id: 'shifted-targets',
      title: 'Teacher-forced next-token targets are shifted by one position',
      caption: 'Every input position predicts the observed token immediately to its right, while causal attention blocks future information.',
      alt: 'A sequence of prompt tokens is aligned with a target sequence shifted one place left, ending with too predicting tired.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  I["Input positions\nThe | animal | ... | was | too"]
  T["Observed targets\nanimal | did | ... | too | tired"]
  I -->|"shift by one token"| T
  C["Causal rule: position t reads only positions at or before t"] --> I
  T --> L["One token loss at every enabled position"]`,
    },
    {
      id: 'loss-and-mask',
      title: 'Selected token losses become one batch objective',
      caption: 'Cross-entropy is calculated per target token. A loss mask selects valid positions before token averaging.',
      alt: 'Probability distributions feed token cross-entropies, masked padding and prompt cells are excluded, and active losses are averaged.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  P1["Position probabilities"] --> CE1["-log p_target"]
  P2["Position probabilities"] --> CE2["-log p_target"]
  P3["Padding or masked prompt"] --> ZERO["loss mask = 0"]
  CE1 --> SUM["Sum active token losses"]
  CE2 --> SUM
  ZERO -. "excluded" .-> SUM
  SUM --> AVG["Divide by active token count"]`,
    },
    {
      id: 'forward-backward-graph',
      title: 'Values move forward; derivatives are accumulated backward',
      caption: 'Reverse mode starts from one scalar loss and combines upstream gradients with local derivatives throughout the recorded graph.',
      alt: 'A computation graph runs from parameters and tokens through transformer states and logits to loss, with gradient arrows returning toward parameters.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  X["Tokens and parameters"] --> H["Transformer states"]
  H --> Z["Vocabulary logits"]
  Z --> P["Probabilities"]
  P --> L["Scalar loss"]
  L -. "dL/dp" .-> P
  P -. "dL/dz" .-> Z
  Z -. "upstream × local" .-> H
  H -. "accumulate parameter gradients" .-> X`,
    },
    {
      id: 'exact-update-flow',
      title: 'Exact miniature update for the target “ tired”',
      caption: 'The teaching distribution produces a logit gradient, one SGD update, and a lower loss for the same example.',
      alt: 'Probabilities 0.48, 0.32, 0.20 yield gradient negative 0.52, 0.32, 0.20; an SGD step raises tired to about 0.597 and lowers loss.',
      kind: 'mechanism',
      provenance: 'exact educational calculation',
      chart: `flowchart LR
  P["p = [0.48, 0.32, 0.20]"] --> LOSS["loss = 0.733969"]
  Y["target = [1, 0, 0]"] --> G["g_z = p - y\n[-0.52, 0.32, 0.20]"]
  P --> G
  G --> SGD["SGD step, eta = 0.1"]
  SGD --> PN["p' approximately\n[0.596847, 0.308416, 0.094736]"]
  PN --> LN["new loss = 0.516094"]`,
    },
    {
      id: 'training-inference-boundary',
      title: 'Inference changes runtime state; training also changes selected parameters',
      caption: 'A target, loss, backward pass, and optimizer step mark the additional path from inference-like prediction into learning.',
      alt: 'Both modes tokenize and run a forward pass; only training compares with a target, backpropagates, and updates parameters.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  IN["Tokens"] --> FW["Forward pass with fixed weights"]
  FW --> OUT["Logits and next-token distribution"]
  OUT --> DEC["Inference: decode and continue"]
  OUT --> CMP["Training: compare with observed target"]
  CMP --> LOSS["Loss"]
  LOSS --> BACK["Backward gradients"]
  BACK --> UPDATE["Optimizer update"]
  UPDATE --> WEIGHTS["Slightly changed weights"]`,
    },
  ],
  misconceptions: [
    {
      claim: 'Teacher forcing gives the answer token to the same position that predicts it.',
      whyPlausible: 'The full target sequence is present in the training batch and all positions are processed in parallel.',
      correction: 'Inputs and targets are shifted, and causal attention prevents a prediction position from reading future target tokens.',
      diagnostic: 'Write the input and target rows beneath each other. If token $x_t$ is trained to predict itself rather than $x_{t+1}$, alignment is wrong.',
    },
    {
      claim: 'Cross-entropy is zero whenever the target token ranks first.',
      whyPlausible: 'A top-one accuracy metric treats any correct winner as success.',
      correction: 'Token loss is $-\log p_y$ and approaches zero only as target probability approaches one. Rank alone does not determine loss.',
      diagnostic: 'Compare target probabilities $0.35$ and $0.90$ when both are ranked first; their losses differ substantially.',
    },
    {
      claim: 'The causal attention mask and loss mask are the same thing.',
      whyPlausible: 'Both are rectangular masks associated with token positions.',
      correction: 'The causal mask controls readable source positions. The loss mask controls which target comparisons contribute to the scalar objective.',
      diagnostic: 'A user prompt token can be readable context while having loss mask zero in supervised fine-tuning.',
    },
    {
      claim: 'Backpropagation changes the parameters.',
      whyPlausible: 'Framework examples often call backward immediately before an optimizer step and describe the combined sequence as training.',
      correction: 'Backpropagation computes gradients. An optimizer uses them, its hyperparameters, and possibly its state to apply updates.',
      diagnostic: 'Run backward without optimizer step; gradient buffers change, but parameter values should not.',
    },
    {
      claim: 'The gradient points downhill.',
      whyPlausible: 'It is commonly introduced alongside gradient descent arrows moving toward lower loss.',
      correction: 'The gradient points toward steepest local increase. Descent subtracts it.',
      diagnostic: 'For a negative derivative, subtracting the gradient increases the parameter, revealing that the derivative described an uphill slope toward decreasing parameter values.',
    },
    {
      claim: 'A training step that lowers loss proves that the model learned generally useful behavior.',
      whyPlausible: 'The optimizer’s immediate purpose is to reduce the objective.',
      correction: 'A local batch improvement can coexist with overfitting or interference. Generalization requires held-out evaluation and broader criteria.',
      diagnostic: 'Evaluate on unseen contexts and unrelated retained capabilities rather than rerunning only the update example.',
    },
    {
      claim: 'Telling a chatbot a correction automatically fine-tunes its weights.',
      whyPlausible: 'Later messages in the same conversation may follow the correction, resembling learning.',
      correction: 'The correction can remain in prompt context or application memory. Weights change only if an explicit training process computes loss, gradients, and updates.',
      diagnostic: 'Start a fresh request without saved context and verify whether an authorized parameter-update pipeline ever ran.',
    },
    {
      claim: 'The chapter’s exact gradient reconstructs how Bonsai was trained.',
      whyPlausible: 'The shared target and plausible probabilities connect the miniature to live model behavior.',
      correction: 'The arithmetic is exact only for declared teaching tensors. Bonsai training data, weights, gradients, and optimizer state are unknown unless authoritative interfaces expose them.',
      diagnostic: 'Require provenance for each displayed parameter and gradient; the shared prompt alone is not evidence of internal equality.',
    },
  ],
  exercises: [
    {
      id: 'shift-a-sequence',
      kind: 'trace',
      prompt: 'For tokens [The, animal, was, too, tired], write the teacher-forced input and target sequences.',
      answer: 'The input is [The, animal, was, too] and the target is [animal, was, too, tired]. Each input prefix position predicts the observed token one position to its right.',
    },
    {
      id: 'calculate-shared-loss',
      kind: 'calculate',
      prompt: 'Calculate the token cross-entropy when “ tired” has probability $0.48$. Compare with probabilities $0.80$ and $0.01$.',
      answer: '$-\log0.48\approx0.734$ nats. At $0.80$ the loss is about $0.223$; at $0.01$ it is about $4.605$. The logarithm heavily penalizes assigning very little probability to the observed target.',
    },
    {
      id: 'average-with-mask',
      kind: 'calculate',
      prompt: 'Token losses are [0.4, 0.8, 1.2, 2.0] and the loss mask is [1, 1, 0, 1]. Calculate the token-averaged loss.',
      answer: 'Only active losses contribute: $(0.4+0.8+2.0)/3=3.2/3\approx1.067$. Dividing by four would incorrectly let the masked position reduce the average.',
    },
    {
      id: 'separate-masks',
      kind: 'debug',
      prompt: 'An assistant-response fine-tuning example sets user-token loss to zero, and a developer concludes the response cannot attend to the user prompt. Diagnose the error.',
      answer: 'A loss mask does not determine attention visibility. User tokens can remain readable context through the attention mask while being excluded from direct target loss. The response still conditions on them.',
    },
    {
      id: 'derive-logit-gradient',
      kind: 'calculate',
      prompt: 'For $p=[0.48,0.32,0.20]$ and target $y=[1,0,0]$, calculate $p-y$ and explain the update signs.',
      answer: 'The gradient is $[-0.52,0.32,0.20]$. Subtracting it raises the target logit because its component is negative and lowers the alternative logits because their components are positive.',
    },
    {
      id: 'trace-chain-rule',
      kind: 'trace',
      prompt: 'If $u=2x$, $v=u^2$, and $L=3v$ at $x=2$, calculate $dL/dx$ using local derivatives.',
      answer: '$u=4$ and $v=16$. The local derivatives are $dL/dv=3$, $dv/du=2u=8$, and $du/dx=2$. Their product is $dL/dx=3\cdot8\cdot2=48$.',
    },
    {
      id: 'optimizer-boundary',
      kind: 'transfer',
      prompt: 'After calling backward, gradients are nonzero but weights are unchanged. Is training broken?',
      answer: 'Not necessarily. Backward is expected to populate gradients without changing parameters. The optimizer must then apply a step. A complete diagnosis checks that the optimizer owns the intended parameters, gradients are finite, and an update is authorized.',
    },
    {
      id: 'finite-difference-plan',
      kind: 'debug',
      prompt: 'Describe a central finite-difference test for one output bias and state two reasons it may not match exactly.',
      answer: 'Evaluate loss at bias plus $\epsilon$ and bias minus $\epsilon$, then divide the difference by $2\epsilon$. Curvature makes a large $\epsilon$ inaccurate, while floating-point cancellation makes a very small $\epsilon$ noisy. Non-differentiable points also require conventions.',
    },
    {
      id: 'distinguish-generalization',
      kind: 'transfer',
      prompt: 'A fine-tuning run reaches almost zero loss on one correction repeated 500 times. What has been established, and what remains unknown?',
      answer: 'It establishes that the selected parameters can fit the repeated training record under the measured objective. It does not establish useful behavior on paraphrases, unrelated contexts, retained capabilities, factuality, or safety. Held-out and regression evaluations remain necessary.',
    },
    {
      id: 'classify-inference-training',
      kind: 'predict',
      prompt: 'Classify these as ordinary inference state or training machinery: KV cache, logits, target labels, gradients, Adam moments, and selected token.',
      answer: 'KV cache, logits, and the selected token are ordinary inference state or output. Target labels, gradients, and Adam moments belong to training. A training forward pass also creates logits and runtime states, but their presence alone does not mean parameters are being updated.',
    },
  ],
  glossary: [
    { term: 'Teacher forcing', definition: 'Training in which observed earlier tokens, rather than sampled model outputs, supply the prefix for next-token predictions.' },
    { term: 'Shifted target', definition: 'The token one position to the right of a prediction input in autoregressive language modeling.' },
    { term: 'Cross-entropy', definition: 'For a one-hot next-token target, the loss $-\log p_y$ assigned to the observed token.' },
    { term: 'Nat', definition: 'A logarithmic information unit produced when loss uses the natural logarithm.' },
    { term: 'Loss mask', definition: 'A selector or weight determining which token-level losses contribute to the batch objective.' },
    { term: 'Causal mask', definition: 'An attention constraint preventing a position from reading future token positions.' },
    { term: 'Computation graph', definition: 'A directed record of numerical operations and dependencies used for forward evaluation and differentiation.' },
    { term: 'Gradient', definition: 'A vector of partial derivatives describing local loss sensitivity with respect to parameters.' },
    { term: 'Backpropagation', definition: 'Reverse-mode differentiation through a network graph to compute gradients efficiently.' },
    { term: 'Optimizer', definition: 'An algorithm that combines gradients, hyperparameters, and optional state to choose parameter updates.' },
    { term: 'SGD', definition: 'Stochastic gradient descent, which subtracts a learning-rate-scaled mini-batch gradient.' },
    { term: 'Adam', definition: 'An adaptive optimizer using moving estimates of gradient first and second moments.' },
    { term: 'Learning rate', definition: 'A hyperparameter controlling the scale of an optimizer step.' },
    { term: 'Mini-batch', definition: 'A sampled group of training examples or tokens whose losses and gradients are processed together.' },
    { term: 'Gradient accumulation', definition: 'Combining gradients from several microbatches before one optimizer update.' },
    { term: 'Finite-difference check', definition: 'A numerical derivative estimate used to sanity-check analytic or automatically differentiated gradients.' },
    { term: 'Generalization', definition: 'Useful performance on relevant unseen examples rather than only the data used for updates.' },
    { term: 'Fine-tuning', definition: 'Additional parameter or adapter training that starts from pretrained weights and uses a targeted dataset and objective.' },
    { term: 'Inference boundary', definition: 'The distinction between computing outputs with fixed weights and running an authorized loss, backward, and update process.' },
  ],
} satisfies CourseTheoryChapter;
