import type { CourseTheoryChapter } from '../theoryTypes';

export const PREDICTION_GOAL_CHAPTER = {
  question: 'How can repeating one next-token prediction produce a response, and what does that objective imply about truth, context, and control?',
  estimatedMinutes: 36,
  prerequisites: [
    'You can distinguish visible text from the numerical computation performed by a software system.',
    'You understand that probability describes uncertainty over alternatives rather than a guarantee about one outcome.',
    'You can multiply small decimal probabilities with a calculator or by hand.',
  ],
  objectives: [
    'Explain the immediate task of an autoregressive language model as estimating a conditional distribution over next-token alternatives.',
    'Trace one forward pass from an existing token context to vocabulary logits and a next-token distribution.',
    'Separate model scoring from the decoding rule that selects a token.',
    'Trace the autoregressive loop in which a selected token is appended and becomes context for the next pass.',
    'Use the probability chain rule to relate local next-token probabilities to the probability assigned to a complete sequence.',
    'Explain why fluent probability estimates are not independent verification of truth.',
    'Distinguish adding prompts, retrieved documents, or tool results to context from updating model parameters.',
  ],
  sections: [
    {
      id: 'unfinished-sentence',
      eyebrow: 'Orientation',
      heading: 'Begin with alternatives, not a completed answer',
      body: String.raw`Consider the unfinished sentence that will follow us through this course:

> The animal did not cross the street because it was too …

Several continuations are possible. Tired might fit if the animal could not continue. Dark might fit if it refers to the street or the situation. Late, dangerous, wide, frightened, and many other token pieces may receive some support. The language model's immediate job is not to retrieve one officially completed sentence. Given the tokenized context so far, it assigns a score to every token in its vocabulary and turns those scores into a conditional distribution.

Write the central question as

$$
P(\text{next token} \mid \text{tokens already in context}).
$$

The vertical bar means “given.” The distribution is conditional because changing the context can change the scores. It is a distribution because many alternatives receive probability mass, even when one is much more likely than the rest. The probabilities sum to 1 across the vocabulary after softmax.

This modest objective is the organizing thread for the complete course. Tokenization determines the discrete context the model actually receives. Embeddings turn those token IDs into numerical states. Transformer blocks and attention make earlier clues available at the prediction position. The language-model head produces vocabulary scores. Decoding chooses one candidate. Training changes parameters so observed continuations tend to receive higher probability in their contexts.

The next-token objective can produce surprisingly rich behavior because solving it across enormous and varied training data rewards sensitivity to grammar, style, facts present in data, program structure, dialogue patterns, and many other regularities. That does not change the immediate operation. At each generation step, the model scores possible next tokens given the context currently available.

This framing also prevents two misleading pictures. The model does not normally prepare a finished paragraph and then uncover it token by token. Nor is it limited to selecting one whole dictionary word at a time. The selectable units are tokenizer vocabulary entries, which may be words, subwords, punctuation, whitespace patterns, bytes, or other pieces.`,
      diagramIds: ['prediction-course-map'],
    },
    {
      id: 'conditional-distribution',
      eyebrow: 'Probability',
      heading: 'One context produces a complete distribution over the vocabulary',
      body: String.raw`Let the existing context tokens be $x_1, x_2, \ldots, x_t$. The model with parameters $\theta$ estimates

$$
P_\theta(x_{t+1}=v \mid x_1,\ldots,x_t)
$$

for every vocabulary candidate $v$. The subscript $\theta$ reminds us that stored learned parameters determine the computation. The context after the vertical bar tells us which request-specific evidence conditions the result.

Internally, the model first produces one unnormalized score, called a logit, for every vocabulary entry. Softmax converts the logit vector into non-negative probabilities that sum to 1. A high probability is relative to the other candidates under this model and context. It is not a certified statement that the candidate is grammatically perfect, factually correct, or desirable for the application.

The context includes more than the last visible word. Depending on the product, it may include a system instruction, earlier conversation turns, retrieved text, tool results, formatting markers, and the user's current message. All of this must eventually be represented as tokens within the model's accessible context. The model conditions on what was supplied and on patterns encoded in its parameters.

Conditional probability explains prompt sensitivity. Compare “The animal did not cross the street because it was too …” with “The road crew closed the street because it was too …”. The suffix because it was too is identical, but the earlier subject and event differ. Candidate probabilities can therefore shift toward descriptions appropriate to an animal in the first case and a street in the second. Even punctuation, spacing, role markers, or an earlier instruction can affect tokenization and later scores.

A displayed list of five candidates is usually only a slice of the full distribution. A realistic vocabulary may contain tens of thousands of entries. An interface should label whether it shows exact probabilities from an identified model, a declared educational fixture, or illustrative bars. Hiding most candidates for readability is acceptable; presenting invented values as a live model's distribution is not.`,
      diagramIds: ['conditional-distribution'],
    },
    {
      id: 'one-forward-pass',
      eyebrow: 'Mechanism',
      heading: 'A forward pass scores the next position; it does not select the token',
      body: String.raw`A forward pass applies the model's stored parameters to the current input tokens. During the first generation step, the model processes the prompt, producing contextual states and vocabulary logits. For next-token generation, the important readout is the distribution associated with the final input position. The model computation ends with scores; a selection rule still has to decide what token to append.

Decoder-only transformers can compute training-time predictions for many positions in parallel because a causal mask prevents each position from reading future targets. During interactive generation, however, token $x_{t+1}$ must be selected before the model can condition on it to score $x_{t+2}$. This dependency makes response generation sequential even though much of each forward pass is highly parallel matrix computation.

The boundary between model and application is essential. The model maps context to logits or probabilities. Application code applies decoding settings, stops at a token or length condition, may reject outputs, and may call tools. A hosted API can hide this boundary by accepting one request and returning a whole paragraph. Internally, its generation service still performs a repeated selection loop, possibly with batching, caching, speculative decoding, or other optimizations.

One forward pass should therefore not be confused with one complete answer. For the prompt ending in too, the pass can score tired, dark, late, and the rest. If tired is selected, another step is needed to score what follows tired. The newly selected token changes the context and hence the next conditional distribution.

The diagram labels the outputs carefully. Logits are unnormalized scores. Softmax probabilities form a distribution. A selected token is the result of a decoding decision. Visible text appears only after the token ID is converted through the tokenizer's decoding rules. These stages are connected but should not share one vague label such as “the prediction.”`,
      diagramIds: ['single-forward-pass'],
    },
    {
      id: 'exact-candidates',
      eyebrow: 'Exact calculation',
      heading: 'Four declared candidates show how scoring and selection separate',
      body: String.raw`Use a deliberately small educational distribution for the prompt ending in too. Suppose the visible candidate set contains all four entries in this toy vocabulary:

| Candidate | Probability |
| --- | ---: |
| tired | 0.45 |
| dark | 0.30 |
| late | 0.15 |
| wide | 0.10 |

The values are non-negative and sum to

$$
0.45 + 0.30 + 0.15 + 0.10 = 1.00.
$$

Under greedy decoding, the application selects tired because 0.45 is the largest probability. This outcome is deterministic as long as the distribution and tie-breaking rule remain the same. Greedy does not mean tired has probability 1, and it does not prove tired is the best continuation according to a human evaluator. It means the rule chooses the locally highest-scoring candidate.

Under ordinary sampling, the application treats the probabilities as selection weights. A random draw falls into tired's interval 45 percent of the time, dark's 30 percent, late's 15 percent, and wide's 10 percent over many independent draws from this unchanged fixture. A single sampled run might select dark even though tired has the largest individual probability. That is expected behavior, not evidence that the displayed probabilities were ignored.

Suppose the application applies a top-two restriction before sampling. It keeps tired and dark, removes late and wide, and renormalizes the retained mass. The retained total is $0.45+0.30=0.75$, so the new probabilities are

$$
P(\text{tired}) = \frac{0.45}{0.75}=0.60,
\qquad
P(\text{dark}) = \frac{0.30}{0.75}=0.40.
$$

The model scores did not change. The application changed the eligible set and selection distribution. Temperature, top-$k$, top-$p$, repetition penalties, constrained decoding, and safety filters likewise belong to the broader generation policy, though exact order and implementation vary by product.

Every number in this example is a declared teaching value. The arithmetic conclusions are exact for the fixture. The example does not claim to expose Bonsai logits, tokenization, filters, or private decoding defaults.`,
      diagramIds: ['exact-candidate-selection'],
    },
    {
      id: 'autoregressive-loop',
      eyebrow: 'Generation',
      heading: 'Append the selection, then ask the same question again',
      body: String.raw`Autoregressive means that earlier tokens condition later token predictions. After the application selects tired, it appends that token to the context:

> The animal did not cross the street because it was too tired

The model is then evaluated for the next position. It might assign high probability to punctuation or a token beginning the next phrase. The application selects again, appends again, and repeats until a stopping condition is met.

In compact form:

$$
\text{context}_t
\rightarrow P(x_{t+1}\mid\text{context}_t)
\rightarrow \text{select }x_{t+1}
\rightarrow \text{context}_{t+1}.
$$

The new context equals the old context plus the selected token. Because every selection becomes an input to later steps, two sampled generations that diverge once may develop increasingly different continuations. Even if their initial distributions were identical, selecting different first candidates creates different conditions for the next pass.

Generation stops because application policy says it should, not because probability has run out. The model may emit a designated end token; the service may reach a maximum token count; a stop sequence may appear; a structured-output constraint may finish; or an external controller may interrupt the loop. Streaming simply exposes selected pieces as they become available. It does not imply that the remainder already exists unchanged behind the stream.

Efficient implementations avoid repeating all possible computation. During prompt prefill, the service can process many prompt positions together. During decoding, a key-value cache preserves certain attention projections for previous tokens so each step need not recompute them from scratch. These optimizations change cost and latency, but not the logical dependence: the next selected token joins the context before the following distribution is determined.

The loop diagram is an architectural schematic. It describes the observable contract shared by autoregressive generators without asserting a service's hidden batching, caching, or speculative-decoding implementation.`,
      diagramIds: ['autoregressive-loop'],
    },
    {
      id: 'sequence-probability',
      eyebrow: 'Mathematics',
      heading: 'A complete sequence probability is built from local conditional probabilities',
      body: String.raw`The probability chain rule connects next-token prediction to complete sequences. For tokens $x_1,\ldots,x_T$, an autoregressive model assigns

$$
P(x_1,\ldots,x_T)
= \prod_{t=1}^{T} P(x_t \mid x_1,\ldots,x_{t-1}).
$$

Each factor is a next-token probability under the prefix available at that step. The first factor is conditioned on the model's start convention or empty prefix. Later factors condition on progressively longer prefixes.

For an exact miniature, suppose three selected tokens have conditional probabilities 0.60, 0.50, and 0.40 under their respective prefixes. The model's joint probability for that complete three-token continuation is

$$
0.60 \times 0.50 \times 0.40 = 0.12.
$$

It would be wrong to add the probabilities or to multiply three values taken from the same initial distribution. Each probability must be read after conditioning on the tokens that precede it.

Products of many probabilities become extremely small, so training and evaluation commonly use logarithms. The logarithm turns a product into a sum:

$$
\log P(x_1,\ldots,x_T)
= \sum_{t=1}^{T}\log P(x_t \mid x_{<t}).
$$

Negative log-probability then yields a loss that penalizes low probability on observed target tokens. The learning lesson will connect that loss to gradients and parameter updates.

Sequence probability also explains why greedy decoding does not necessarily find the globally highest-probability complete sequence. A locally strongest first token may lead to weaker later factors than a slightly weaker first choice. Search methods can compare alternative paths, but open-ended generation usually balances quality, diversity, latency, and memory rather than exhaustively enumerating the enormous tree of possible continuations.

The formula describes probability assigned by a model, not the probability that the completed statement is true. A sequence can have high model probability because it resembles frequent or coherent training patterns while still making a factual error.`,
    },
    {
      id: 'context-not-learning',
      eyebrow: 'System boundary',
      heading: 'Prompts, retrieval, and tools change context without changing parameters',
      body: String.raw`A model can respond differently after receiving an instruction, document, or calculator result. That immediate adaptation is usually inference conditioned on new context, not weight learning.

Suppose a retrieval system finds a document stating that a road was closed at 18:00 and inserts the passage before the user's question. The inserted tokens can affect attention and the next-token distribution during this request. The model parameters $\theta$ remain unchanged. Remove the passage in a later request and the evidence may no longer be available unless it appears elsewhere in context or stored application memory.

A tool call follows a similar pattern. Application code decides to call a search engine, database, or calculator. The result is serialized into messages or another model input. The next forward pass conditions on those result tokens. The external tool may provide fresh or exact evidence, but the language model still generates by predicting tokens from its updated context.

Fine-tuning or continued pretraining is different. A training process computes loss, gradients, and optimizer updates that change stored parameters. Those changes can persist across requests in the updated model artifact. Merely placing a correction in a chat does not normally perform that optimization.

This distinction avoids two opposite mistakes. One is to claim that the model “learned forever” whenever it follows an in-chat example. The other is to ignore how powerfully context can alter behavior. Contextual adaptation is real, but it is bounded by what the model can access, how the prompt is constructed, and how reliably it uses supplied evidence.

Products may store conversation summaries, user preferences, retrieval indexes, or tool state outside the model. Those application memories can be reintroduced on later requests, creating persistent product behavior without modifying language-model parameters. When analyzing an AI system, separate model parameters, current model context, and external application state.`,
      diagramIds: ['context-versus-parameters'],
    },
    {
      id: 'plausibility-and-handoff',
      eyebrow: 'Limits and practice',
      heading: 'Fluency measures learned plausibility, not independent truth',
      body: String.raw`A next-token predictor is rewarded for assigning probability to continuations that fit its training objective. This can produce accurate facts when the relevant patterns were learned or trustworthy evidence is present. It can also produce confident errors. The probability distribution is computed by the model; it is not an independent comparison against reality.

Several failure routes follow. Training data may contain outdated, contradictory, or false claims. The prompt may omit a required fact. Retrieved context may be irrelevant or malicious. A tool result may be misread. Decoding may select a lower-probability candidate. The model may combine individually familiar patterns into a novel but unsupported statement. Fluent grammar does not remove any of these possibilities.

Verification therefore belongs to system design. High-stakes claims may require cited retrieval, deterministic tools, validation rules, human review, or refusal when evidence is insufficient. A confidence-sounding phrase generated by the same model is not a calibrated external check. Even a high next-token probability concerns one token under one context, not the truth of the complete proposition.

In the lab, compare greedy selection with seeded sampling using the same declared distribution. Then alter one earlier phrase and observe whether candidate scores or visible behavior change. Keep three questions separate: Did the context change? Did the model distribution change? Did the decoding choice change? A different output can result from any combination of those events.

Every panel should state provenance. Exact teaching fixtures support exact arithmetic. An identified model endpoint may support behavioral comparisons of returned text or exposed token probabilities. A text-only response does not expose private logits, hidden states, or internal reasoning. Illustrative distributions should never be labelled as measurements from Bonsai.

The next lesson examines the first transformation hidden by our phrase “tokens in context.” Visible text must be divided into vocabulary pieces and mapped to integer IDs before the model can process it. Tokenization will explain why apparently tiny changes in spelling, spacing, language, or emoji can change the sequence on which every later conditional probability depends.`,
    },
  ],
  diagrams: [
    {
      id: 'prediction-course-map',
      title: 'The course begins and ends with one next-token question',
      caption: 'Illustrative course map. Later lessons open each transformation between context tokens and a selected continuation.',
      alt: 'Pipeline from unfinished text through tokenization, transformer computation, vocabulary distribution, token selection, and appended text.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  A["unfinished text"] --> B["context tokens"]
  B --> C["transformer forward pass"]
  C --> D["next-token distribution"]
  D --> E["decoding selects token"]
  E --> F["append to context"]
  F -. "repeat" .-> B`,
    },
    {
      id: 'conditional-distribution',
      title: 'One prefix supports several alternatives',
      caption: 'Illustrative distribution shape. The bars communicate conditional alternatives and are not Bonsai measurements.',
      alt: 'The shared prompt branches to candidate continuations tired, dark, late, and other vocabulary entries with different probability mass.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  P["The animal did not cross<br/>the street because it was too"] --> D["conditional distribution"]
  D --> A["tired"]
  D --> B["dark"]
  D --> C["late"]
  D --> O["many other token pieces"]`,
    },
    {
      id: 'single-forward-pass',
      title: 'Scoring ends before selection begins',
      caption: 'Illustrative mechanism separating model computation from application decoding.',
      alt: 'Current token context enters the model, producing vocabulary logits and softmax probabilities, after which application decoding selects one token.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  C["current context tokens"] --> M["model forward pass"]
  M --> L["vocabulary logits"]
  L --> S["softmax probabilities"]
  S --> B["model boundary"]
  B --> D["application decoding rule"]
  D --> T["selected token"]`,
    },
    {
      id: 'exact-candidate-selection',
      title: 'Exact educational candidate distribution',
      caption: 'Exact declared fixture: probabilities sum to 1. Greedy selects tired; sampling may select any candidate according to the weights.',
      alt: 'Four candidate probabilities: tired 0.45, dark 0.30, late 0.15, and wide 0.10, with tired marked as the greedy choice.',
      kind: 'comparison',
      provenance: 'exact educational calculation',
      chart: `flowchart TB
  D["declared distribution"] --> A["tired: 0.45<br/>greedy choice"]
  D --> B["dark: 0.30"]
  D --> C["late: 0.15"]
  D --> E["wide: 0.10"]
  A --> S["sum = 1.00"]
  B --> S
  C --> S
  E --> S`,
    },
    {
      id: 'autoregressive-loop',
      title: 'Every selected token changes the next prediction context',
      caption: 'Illustrative generation loop. Serving implementations may add caching and batching without changing the logical dependency.',
      alt: 'Context enters a model pass, decoding selects a next token, the token is appended to context, and the cycle repeats until a stop condition.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  C["context at step t"] --> P["next-token probabilities"]
  P --> D["select x at t+1"]
  D --> A["append selected token"]
  A --> N["context at step t+1"]
  N -. "next step" .-> P
  D --> Q{"stop condition?"}
  Q -->|yes| O["return output"]`,
    },
    {
      id: 'context-versus-parameters',
      title: 'Immediate context changes are not weight updates',
      caption: 'Illustrative system boundary separating request-specific context, persistent model parameters, and external application state.',
      alt: 'Prompts, retrieved documents, and tool results join current context, while training is a separate process that updates persistent parameters.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  P["prompt and conversation"] --> C["current context"]
  R["retrieved text"] --> C
  T["tool result"] --> C
  W["stored model parameters"] --> M["forward pass"]
  C --> M
  M --> O["next-token distribution"]
  G["training: loss, gradients, optimizer"] -. "updates separately" .-> W`,
    },
  ],
  misconceptions: [
    {
      claim: 'The model prepares the full response before the first token appears.',
      whyPlausible: 'A hosted API accepts one request, and streaming can look like revealing a prewritten message.',
      correction: 'Autoregressive generation repeatedly scores, selects, and appends tokens. Each selected token becomes context for the following step.',
      diagnostic: 'Why can two sampled runs diverge more after selecting different early tokens?',
    },
    {
      claim: 'The model itself decides whether to use greedy decoding, temperature, or top-p sampling.',
      whyPlausible: 'Products present model and generation settings through one interface.',
      correction: 'The model produces logits or probabilities. Application or serving code applies a decoding policy, though a hosted service may hide the boundary.',
      diagnostic: 'Can the same model distribution produce different selected tokens under two decoding rules?',
    },
    {
      claim: 'A 90 percent next-token probability means the statement being generated is 90 percent likely to be true.',
      whyPlausible: 'Both claims use the language of probability and confidence.',
      correction: 'The score concerns a token under the model and context. Truth requires external evidence and cannot be inferred directly from one token probability.',
      diagnostic: 'Could a frequently repeated false sentence receive high model probability?',
    },
    {
      claim: 'Correcting the model in a prompt permanently updates its knowledge.',
      whyPlausible: 'The model may immediately follow the correction in later turns of the same conversation.',
      correction: 'The correction changes request context. Persistent parameter learning requires a separate optimization process, while product memory may store information externally and reinsert it later.',
      diagnostic: 'What would happen in a fresh request where neither the correction nor external memory is supplied?',
    },
    {
      claim: 'Greedy decoding finds the most probable complete response.',
      whyPlausible: 'It chooses the highest-probability option at every local step.',
      correction: 'A locally strongest token can lead to weaker later conditional probabilities. Greedy maximizes each immediate choice, not necessarily the product over a complete sequence.',
      diagnostic: 'Can a path beginning with probability 0.45 lose overall to one beginning with 0.40 if their later factors differ?',
    },
  ],
  exercises: [
    {
      id: 'predict-context-change',
      kind: 'predict',
      prompt: 'Predict how changing “The animal” to “The road crew” could affect candidates after “because it was too,” even though the suffix remains identical.',
      answer: 'The complete prefix conditions the distribution, not only the last few words. The new subject changes available evidence, so probabilities may move toward road or work conditions. The exact direction requires an identified model measurement; the principled prediction is that the distribution is allowed to change.',
    },
    {
      id: 'calculate-greedy-and-top-two',
      kind: 'calculate',
      prompt: 'Given tired 0.45, dark 0.30, late 0.15, and wide 0.10, identify the greedy choice and calculate the renormalized top-two probabilities.',
      answer: 'Greedy selects tired, the largest value. The top-two retained mass is 0.75. Renormalization gives tired 0.45/0.75 = 0.60 and dark 0.30/0.75 = 0.40.',
    },
    {
      id: 'trace-generation',
      kind: 'trace',
      prompt: 'Trace the minimum logical steps needed to generate two new tokens after the existing prompt.',
      answer: 'First run the model on current context to obtain next-token scores, apply decoding, and append token one. Then evaluate the updated context, decode the new distribution, and append token two. A service may optimize with caching, but token one must logically condition the distribution for token two.',
    },
    {
      id: 'calculate-sequence-probability',
      kind: 'calculate',
      prompt: 'Three selected tokens have conditional probabilities 0.60, 0.50, and 0.40 under their successive prefixes. Calculate the assigned joint probability.',
      answer: 'Multiply the step-specific conditional factors: 0.60 × 0.50 × 0.40 = 0.12. Adding them or taking all three values from the first-step distribution would not apply the chain rule.',
    },
    {
      id: 'debug-learning-claim',
      kind: 'debug',
      prompt: 'A product retrieves a document, inserts it into the prompt, and gets a corrected answer. A teammate says the model weights learned the document. Diagnose the claim.',
      answer: 'The evidence changed the model context for that inference. Unless the system ran loss calculation, backpropagation, and an optimizer update, the model parameters did not learn the document. The product may separately retain the document in an external index.',
    },
    {
      id: 'transfer-verification',
      kind: 'transfer',
      prompt: 'Design one extra safeguard for a generated medication dosage and explain why a high next-token score is insufficient.',
      answer: 'A suitable safeguard could require retrieval from an authoritative current formulary plus deterministic validation and qualified human review. A high token score measures learned contextual plausibility, not patient-specific safety, current guidance, or factual verification.',
    },
  ],
  glossary: [
    { term: 'Autoregressive model', definition: 'A model that factors sequence generation into predictions conditioned on earlier tokens.' },
    { term: 'Context', definition: 'The tokens available to condition the current prediction, potentially including instructions, conversation, retrieval, and tool results.' },
    { term: 'Conditional probability', definition: 'A probability evaluated given specified evidence, written with a vertical bar meaning given.' },
    { term: 'Vocabulary', definition: 'The finite set of token entries that the model can score and select.' },
    { term: 'Logit', definition: 'An unnormalized score assigned to a vocabulary candidate before softmax.' },
    { term: 'Softmax', definition: 'A transformation that converts logits into non-negative probabilities summing to 1.' },
    { term: 'Forward pass', definition: 'Application of stored model parameters to current inputs to compute activations and output scores without updating the parameters.' },
    { term: 'Decoding', definition: 'The application policy that converts model scores into selected output tokens.' },
    { term: 'Greedy decoding', definition: 'A rule that selects the highest-scoring available token at each step.' },
    { term: 'Sampling', definition: 'Selection using a probability distribution so multiple candidates may be chosen across repeated runs.' },
    { term: 'Temperature', definition: 'A decoding transformation that changes the relative sharpness of candidate probabilities before sampling.' },
    { term: 'Top-k decoding', definition: 'A policy that restricts selection to the k highest-scoring candidates before renormalization.' },
    { term: 'Top-p decoding', definition: 'A policy that retains a smallest high-probability candidate set reaching a chosen cumulative mass.' },
    { term: 'Sequence probability', definition: 'The product of successive token probabilities, each conditioned on the prefix before that token.' },
    { term: 'Parameter', definition: 'A persistent learned numerical value used by the model’s computations.' },
    { term: 'Retrieval', definition: 'An application process that finds external material and commonly inserts it into model context.' },
    { term: 'Provenance', definition: 'The documented origin of a displayed value and the limit of claims it can support.' },
  ],
} satisfies CourseTheoryChapter;
