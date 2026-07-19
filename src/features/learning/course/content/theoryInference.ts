import type { CourseTheory } from './theoryTypes';

export const INFERENCE_THEORY = {
  'residual-stream': {
    heading: 'A shared page gathers useful notes',
    takeaway: 'Every block adds updates to temporary token states that keep the same shape.',
    explanation: 'Imagine every token position carrying a working page through the transformer. The page begins with that token’s initial vector. Each attention layer can add a note gathered from other positions, and each MLP can add a locally computed note. The page is the shared channel through which components communicate; it is not readable prose. Its size stays the same while its contents become increasingly contextual. For next-token prediction, the final page at the last prompt position goes to the language-model head. We can project earlier pages into vocabulary space to watch candidates rise and fall, but that projection is an interpretability probe. It helps form hypotheses about how a prediction develops; it is not a recording of private thoughts.',
    whyItMatters: 'This prevents one attention heatmap or one intermediate projection from being mistaken for the complete explanation, and clarifies what hidden-state tools can and cannot show.',
    misconception: { claim: 'The residual stream is readable memory or a hidden chain of thought.', correction: 'It is temporary numerical state. A vocabulary projection is our interpretation of that state, not private prose waiting to be decoded.' },
    tryThis: 'Scrub through the glass-box layers and track three candidates. Ask whether the model revealed a thought, or whether the probe revealed a changing prediction.',
    diagram: { alt: 'Attention and MLP components repeatedly add notes to the same working token state before the vocabulary head reads it.', chart: `flowchart LR
  I["Initial token state"] --> S["Shared working state"]
  A["Attention update"] --> S1["State + context"]
  S --> S1
  M["MLP update"] --> S2["State + computation"]
  S1 --> S2
  S2 --> N["Next block"]
  N --> F["Final contextual state"]
  F --> H["Vocabulary head"]` },
    sources: [
      { label: 'Elhage et al. — Transformer Circuits Framework', url: 'https://transformer-circuits.pub/2021/framework/index.html', note: 'Introduces the residual stream as a channel read from and written to by components.' },
      { label: 'Belrose et al. — The Tuned Lens', url: 'https://arxiv.org/abs/2303.08112', note: 'Explains the value and limitations of projecting intermediate states into vocabulary space.' },
      { label: 'Cho et al. — Transformer Explainer', url: 'https://ojs.aaai.org/index.php/AAAI/article/view/35347', note: 'Research-backed example of teaching internal state changes with interactive visuals.' },
    ],
  },
  'language-model-head': {
    heading: 'The model scores; the decoder chooses',
    takeaway: 'A final token state becomes alternatives, then a separate decoding rule selects one.',
    explanation: 'The transformer finishes with one contextual vector at each position. For generation, the last prompt position matters most: the language-model head compares its state with every token in the vocabulary and assigns each a raw score called a logit. Softmax turns relative scores into a distribution. The model has now finished this prediction step; a decoding rule decides what happens next. Greedy decoding always takes the highest-probability token. Sampling treats the distribution as a weighted lottery, often after controls such as temperature or top-p reshape the choices. This is why the same model and prompt can produce different continuations. These probabilities describe possible next tokens under the model—not truth, confidence in an entire answer, or guaranteed quality.',
    whyItMatters: 'Decoding settings change repeatability, diversity, and failure patterns without changing what the model learned during training.',
    misconception: { claim: 'Temperature makes the model smarter or changes its stored knowledge.', correction: 'For fixed logits and positive temperature, it changes distribution concentration. It does not add knowledge or change the score ranking by itself.' },
    tryThis: 'Run one prompt greedily, then sample it several times with a fixed seed. Compare distribution shape, repeated outputs, and factual quality as separate observations.',
    mathNote: 'A larger positive temperature shrinks differences between logits before softmax, making the distribution flatter. The ranking stays the same for fixed logits.',
    sources: [
      { label: 'Hugging Face — Generation strategies', url: 'https://huggingface.co/docs/transformers/generation_strategies', note: 'Practical comparison of greedy search, sampling, and other decoding strategies.' },
      { label: 'Holtzman et al. — Neural Text Degeneration', url: 'https://arxiv.org/abs/1904.09751', note: 'Primary research showing failure modes of maximum-likelihood decoding and motivating nucleus sampling.' },
      { label: 'Welch Labs — Illustrated Guide to AI', url: 'https://www.welchlabs.com/ai-book', note: 'The course companion for logits, distributions, and next-token selection.' },
    ],
  },
  'generation-cache': {
    heading: 'Reuse the past instead of recomputing it',
    takeaway: 'The KV cache stores temporary attention projections for the active sequence.',
    explanation: 'Generation has two phases. During prefill, the model processes the prompt and creates attention keys and values for every prompt position and layer. During decode, it produces one token at a time. A new token still needs to attend to earlier context, but those earlier keys and values do not need to be recalculated. The KV cache keeps them available and appends one new pair after each generated token. This speeds up repeated generation, but the cache grows with active context and consumes memory for every request. It is a temporary working shelf, not learned knowledge. Some serving systems can reuse a compatible cached prefix across requests, but that is an additional optimization—not the model permanently remembering a conversation.',
    whyItMatters: 'It explains time-to-first-token versus decode speed, why long conversations consume memory, and why concurrent long requests can reduce serving throughput.',
    misconception: { claim: 'The KV cache is the chatbot’s long-term memory.', correction: 'It is request-scoped inference state. Clearing it does not erase model weights, and keeping it does not teach the model a fact.' },
    tryThis: 'Compare short and long prompts. Observe time to first token, later-token speed, and estimated cache size; then disable caching and identify which work repeats.',
    mathNote: 'Cache memory grows roughly linearly with context length, layer count, and the number of key/value heads. The relationship matters more than memorizing the full byte formula.',
    diagram: { alt: 'Prompt keys and values are created once. Each decode pass reads the shelf; processing the selected token on the following pass creates one new key and value row.', chart: `flowchart LR
  P["Prompt"] -->|"prefill once"| K["KV working shelf"]
  T["Selected token"] -->|"next decode pass"| Q["Query + new K/V"]
  Q -->|"read old rows"| K
  K --> A["Attention result"]
  A --> O["Choose next token"]
  Q -->|"append its K/V"| K
  O -. "next step" .-> T` },
    sources: [
      { label: 'Hugging Face — Cache strategies', url: 'https://huggingface.co/docs/transformers/kv_cache', note: 'Current implementation guide to cache reuse and speed-versus-memory trade-offs.' },
      { label: 'Ainslie et al. — Grouped-Query Attention', url: 'https://arxiv.org/abs/2305.13245', note: 'Primary work showing how fewer KV heads improve decoder inference efficiency.' },
      { label: 'Kwon et al. — PagedAttention', url: 'https://arxiv.org/abs/2309.06180', note: 'Systems research explaining why KV-cache memory management governs serving throughput.' },
    ],
  },
  learning: {
    heading: 'Error becomes a small distributed update',
    takeaway: 'Loss measures the miss, backpropagation assigns responsibility, and the optimizer changes weights.',
    explanation: 'During training, ordinary text supplies many small practice questions. At each position, the model sees preceding tokens and predicts what came next. If the observed token receives low probability, the loss is large; if it already receives high probability, the loss is small. Backpropagation follows the recorded computation backward and calculates how each participating parameter contributed to the loss. An optimizer then makes a very small update. This repeats across enormous numbers of token examples. The model learns distributed statistical patterns rather than saving every sentence as a database record. Loss, backpropagation, and optimization are different: loss measures error, backpropagation computes gradients, and the optimizer decides how to use them. During ordinary inference, no update occurs.',
    whyItMatters: 'Fine-tuning depends on data quality, repetition, learning rate, and evaluation—not merely showing the model one desired answer. Prompt context is not durable learning.',
    misconception: { claim: 'Backpropagation writes the correct answer into the model.', correction: 'It computes gradient signals. The optimizer applies small distributed changes whose generalization must be evaluated on unseen examples.' },
    tryThis: 'Move the target probability from 0.1 to 0.5 to 0.9 and watch loss fall. Then mark the exact boundary where inference ends and updating begins.',
    mathNote: '`loss = -log(target probability)` captures the useful intuition: being confidently wrong receives a much larger penalty.',
    diagram: { alt: 'Training repeatedly predicts a token, measures error, backpropagates responsibility, and applies a small weight update.', chart: `flowchart LR
  D["Training text"] --> P["Predict next token"]
  P --> L["Compare with observed token"]
  L --> B["Backpropagate responsibility"]
  B --> O["Optimizer: small update"]
  O --> W["Slightly changed weights"]
  W -. "repeat on more examples" .-> P` },
    sources: [
      { label: 'Google ML Crash Course — Backpropagation', url: 'https://developers.google.com/machine-learning/crash-course/neural-networks/backpropagation', note: 'Beginner-oriented explanation separating gradient computation from parameter updates.' },
      { label: 'PyTorch — Automatic differentiation', url: 'https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html', note: 'Authoritative walkthrough of forward graphs, backward passes, and accumulated gradients.' },
      { label: 'Stanford CS336 — Language Modeling from Scratch', url: 'https://cs336.stanford.edu/', note: 'Connects prediction, optimizers, training systems, and evaluation in a current university course.' },
    ],
  },
  capstone: {
    heading: 'Trace dependencies, then measure the unknowns',
    takeaway: 'A prompt edit changes runtime representations; learned weights stay fixed during inference.',
    explanation: 'A useful mental model predicts what changes before a run—and identifies what cannot be known without one. Replace “animal” with “robot.” The text changes immediately. Token IDs may change, and sequence length may change, depending on the tokenizer. Different IDs select different initial vectors. From there, attention patterns, residual states, logits, probabilities, and the generated token are model-dependent results that require inference to know exactly. Decoding settings can also change the selected token from the same distribution. The learned model weights do not change during ordinary inference. This trace turns transformer theory into a debugging tool: identify the current representation, identify the operation, and classify the result as directly inspectable, model-dependent, application-controlled, or fixed.',
    whyItMatters: 'When an AI feature surprises you, this locates the responsible layer—input formatting, tokenization, inference, decoding, caching, or training—instead of encouraging random parameter tweaks.',
    misconception: { claim: 'Changing one word changes every downstream value in a simple, predictable way.', correction: 'The dependencies are predictable; exact values are not. Token length or output ranking may remain stable despite internal changes.' },
    tryThis: 'Change one word and classify each stage as “observable now,” “requires inference,” “application setting,” or “stays fixed.” Verify with the tokenizer and Bonsai.',
    diagram: { alt: 'An input edit flows through inspectable tokenization, teaching-only glass-box vectors, and model-dependent Bonsai states to application-controlled decoding. Learned weights stay fixed.', chart: `flowchart LR
  E["Edit one word"] --> T["Text"]
  T -->|"inspect"| I["Token IDs"]
  I -->|"glass-box only"| V["Teaching vectors"]
  V -->|"run model"| H["Contextual states"]
  H -->|"run model"| P["Distribution"]
  P -->|"app setting"| D["Decoder"]
  D --> R["Response"]
  W["Learned weights"] -. "fixed in inference" .-> H` },
    sources: [
      { label: 'Cho et al. — Transformer Explainer', url: 'https://ojs.aaai.org/index.php/AAAI/article/view/35347', note: 'Demonstrates a teaching progression from system overview to live internal operations.' },
      { label: 'Stanford CS336 — Language Modeling from Scratch', url: 'https://cs336.stanford.edu/', note: 'Broad engineering map from tokenizer and transformer construction through training and inference.' },
      { label: 'Welch Labs — Illustrated Guide to AI', url: 'https://www.welchlabs.com/ai-book', note: 'Visual, exercise-oriented companion spanning the complete model path.' },
    ],
  },
} satisfies Record<string, CourseTheory>;
