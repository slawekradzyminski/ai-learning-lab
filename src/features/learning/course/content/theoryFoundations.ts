import type { CourseTheory } from './theoryTypes';

export const FOUNDATION_THEORY = {
  'prediction-goal': {
    heading: 'One small prediction, repeated',
    takeaway: 'The model creates a response one next-token choice at a time.',
    explanation: 'An autoregressive language model has one immediate job: given the tokens already in its context, estimate which token could come next. It produces a distribution of possibilities rather than one certainty. A decoding rule chooses a candidate, appends it to the context, and runs the same process again. Repeating this small loop creates a sentence, answer, or program. The response is not normally prepared in full and then revealed word by word. It emerges from learned patterns and the context supplied now. This explains why a tiny prompt edit can change later output, why two sampled runs can diverge, and why fluent text can still be wrong: plausibility is not independent fact-checking.',
    whyItMatters: 'Prompts, conversation history, tool results, and decoding settings all influence later choices. This is the right starting model for understanding streaming, sampling, and hallucinations.',
    misconception: { claim: 'The model writes the complete answer internally before streaming it.', correction: 'Token generation repeatedly extends the context. A surrounding product may add hidden reasoning, retrieval, or tools, but generation itself remains iterative.' },
    tryThis: 'Run the unfinished sentence greedily, then with seeded sampling, then after changing one earlier word. Separate changes caused by context from changes caused by selection.',
    mathNote: '`P(next token | tokens seen so far)` is enough. The vertical bar means “given this context,” not “proven by this context.”',
    sources: [
      { label: 'Brown et al. — Language Models are Few-Shot Learners', url: 'https://arxiv.org/abs/2005.14165', note: 'Primary source for autoregressive GPT-style language modelling and in-context task specification.' },
      { label: 'Google ML Crash Course — Large language models', url: 'https://developers.google.com/machine-learning/crash-course/llm/transformers', note: 'Accessible overview of decoder-only prediction, tokens, and hallucination risk.' },
      { label: 'Jay Alammar — The Illustrated GPT-2', url: 'https://jalammar.github.io/illustrated-gpt2/', note: 'Use the generation sequence to see the next-token loop visually.' },
    ],
  },
  tokenization: {
    heading: 'Text becomes model-sized pieces',
    takeaway: 'The model receives reusable token pieces and IDs—not words.',
    explanation: 'Before a model can process text, a tokenizer turns it into vocabulary entries called tokens. A token may be a whole word, part of a word, punctuation, whitespace, or part of an emoji. Each token receives a numeric ID used as a lookup address; the number itself carries no meaning. Boundaries come from the tokenizer vocabulary and rules, not grammar. A familiar word may fit in one token while an unusual name, code identifier, or underrepresented language needs several. Tokenization happens before transformer computation. It determines the sequence the model actually sees and affects how much text fits in the context window, how usage is counted, and which pieces later layers must combine.',
    whyItMatters: 'Token count affects context limits, latency, and often cost. Names, code, spacing, emoji, and multilingual prompts may therefore behave differently from their visible character length.',
    misconception: { claim: 'One token is one word.', correction: 'Spaces, capitalization, Unicode, language, and the selected tokenizer can all change token boundaries.' },
    tryThis: 'Compare `tired`, `Tired`, ` very tired`, a rare surname, an emoji, and the same sentence in another language. Predict the longest token sequence before revealing it.',
    sources: [
      { label: 'Kudo & Richardson — SentencePiece', url: 'https://arxiv.org/abs/1808.06226', note: 'Primary paper for language-independent subword tokenization trained from raw text.' },
      { label: 'Sennrich, Haddow & Birch — Subword Units', url: 'https://aclanthology.org/P16-1162/', note: 'Influential primary work adapting byte-pair encoding to open-vocabulary language processing.' },
      { label: 'Hugging Face Course — Tokenizers', url: 'https://huggingface.co/docs/course/chapter2/4', note: 'A practical explanation of why models need numeric tokens and why word-level splitting is insufficient.' },
    ],
  },
  'token-embeddings': {
    heading: 'Identity plus place becomes model input',
    takeaway: 'A token ID selects a learned vector; position makes word order available.',
    explanation: 'A token ID is only an address. The model uses it to look up a trainable vector that gives the token a useful starting representation. Identity alone cannot distinguish “dog bites person” from “person bites dog,” so the model also needs position information. The token signal and position signal are combined before or within attention, depending on the architecture. This is still only a starting state, not the rich contextual meaning formed by later blocks. The same token can begin with the same lookup vector in two sentences and develop different internal states as it gathers different context. The observatory uses real static GloVe word vectors to make neighborhoods, directions, and analogy arithmetic inspectable; it demonstrates learned geometry without pretending those rows are Bonsai’s private token weights.',
    whyItMatters: 'This connects tokenizer IDs to neural computation, explains why order matters, and prevents confusion between internal token states and document embeddings used by RAG systems.',
    misconception: { claim: 'Nearby token IDs have similar meaning, or one vector dimension means “animalness.”', correction: 'IDs are arbitrary addresses, and useful meaning is distributed across many learned dimensions.' },
    tryThis: 'Swap two tokens while keeping their identities. Inspect the token vector, position signal, and combined input. Ask which values moved and what later attention can now distinguish.',
    mathNote: 'In this teaching model: `initial state = token vector + position signal`. Some modern models encode relative position inside attention instead.',
    sources: [
      { label: 'Vaswani et al. — Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', note: 'Primary architecture source for token embeddings and positional encodings.' },
      { label: 'Google ML Crash Course — Obtaining embeddings', url: 'https://developers.google.com/machine-learning/crash-course/embeddings/obtaining-embeddings', note: 'Distinguishes learned lookup vectors, position, and representations changed by context.' },
      { label: 'Jay Alammar — The Illustrated GPT-2', url: 'https://jalammar.github.io/illustrated-gpt2/', note: 'See the visual transition from token IDs and positions into the first transformer block.' },
      { label: 'Carnegie Mellon — Word Embedding Demo', url: 'https://www.cs.cmu.edu/~dst/WordEmbeddingDemo/', note: 'Interactive reference for spatial word neighborhoods, vector fingerprints, analogies, and nearest-neighbor navigation.' },
      { label: 'Stanford NLP — GloVe', url: 'https://nlp.stanford.edu/projects/glove/', note: 'Primary source for the public-domain GloVe 6B vectors used by the word observatory.' },
      { label: 'Pennington, Socher & Manning — GloVe paper', url: 'https://aclanthology.org/D14-1162/', note: 'Explains how global word co-occurrence statistics produce a vector space with useful linear relationships.' },
    ],
  },
  'transformer-block': {
    heading: 'Read context, transform locally, keep what helps',
    takeaway: 'Attention communicates between positions; the MLP transforms each position.',
    explanation: 'A model passes every token state through a stack of transformer blocks. Each block has two complementary jobs. Attention lets a position gather relevant information from other permitted positions. The MLP then transforms the information available at each position independently. Residual connections add each result to a shared working state instead of replacing it, so useful information can persist while new evidence accumulates. Normalization keeps repeated updates manageable. One block usually makes only a partial refinement; depth lets many refinements compose. Think of the stack as a team repeatedly annotating the same working document, not an assembly line where each layer owns one tidy linguistic rule.',
    whyItMatters: 'The two verbs—communicate and compute—make depth, activation memory, quantization, adapters, and inference cost easier to reason about.',
    misconception: { claim: 'Attention is the whole transformer, or one layer reliably “does grammar.”', correction: 'Attention, MLPs, residual connections, and normalization cooperate; learned functions are distributed and overlap across blocks.' },
    tryThis: 'Disable attention in the miniature, then restore it and disable the MLP. Name what each intervention removes: communication between positions or local transformation.',
    mathNote: 'The useful shorthand is simply: `new state = old state + useful update`.',
    diagram: { alt: 'A shared token state receives an attention update and then an MLP update before entering the next block.', chart: `flowchart TB
  R0["Shared token states"] --> A["Attention: gather clues"]
  R0 --> X1(("add"))
  A --> X1
  X1 --> M["MLP: transform locally"]
  X1 --> X2(("add"))
  M --> X2
  X2 --> R1["Richer states for next block"]` },
    sources: [
      { label: 'Vaswani et al. — Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', note: 'Defines the original attention, feed-forward, residual, and normalization sublayers.' },
      { label: 'Elhage et al. — Transformer Circuits Framework', url: 'https://transformer-circuits.pub/2021/framework/index.html', note: 'Introduces the useful model of components reading from and writing to a residual stream.' },
      { label: 'Jay Alammar — The Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/', note: 'Visual reference for how attention and feed-forward sublayers compose across depth.' },
    ],
  },
  attention: {
    heading: 'Move the right clue to the right place',
    takeaway: 'Each position gathers a weighted mixture of information from allowed positions.',
    explanation: 'Attention lets a token position gather information from other positions. A useful mental model is: the current position asks a question, earlier positions advertise what they contain, and the best matches contribute information to the current state. In a text-generating model, a causal mask prevents reading future tokens. Multiple heads perform different learned searches in parallel. The resulting weights control a mixture of information; they are not a database lookup or a complete human-readable explanation. High attention to a token says that one head routed information from that position in this computation. It does not prove that the token caused the final answer or that the model understood it in a human sense.',
    whyItMatters: 'It explains why instruction placement and available context affect output, and why attention heatmaps are diagnostic clues rather than proof of reasoning.',
    misconception: { claim: 'The largest attention weight reveals what the model considered most important.', correction: 'Many heads and layers interact, and the content carried by a value vector matters as much as its displayed weight.' },
    tryThis: 'Change the likely clue in the shared sentence and compare attention weights with next-token candidates. Ask whether weight, output, both, or neither changed.',
    mathNote: 'The learner-level idea is: `output = weighted mix of available value vectors`.',
    sources: [
      { label: 'Vaswani et al. — Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', note: 'Primary source for scaled dot-product attention, multi-head attention, and masking.' },
      { label: 'Google ML Crash Course — Self-attention', url: 'https://developers.google.com/machine-learning/crash-course/llm/transformers#self-attention', note: 'Accessible explanation using an animal-and-street reference example.' },
      { label: 'Elhage et al. — Transformer Circuits Framework', url: 'https://transformer-circuits.pub/2021/framework/index.html', note: 'Technically useful view of attention heads moving information between token positions.' },
    ],
  },
} satisfies Record<string, CourseTheory>;
