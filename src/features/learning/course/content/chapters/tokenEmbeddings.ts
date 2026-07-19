import type { CourseTheoryChapter } from '../theoryTypes';

export const TOKEN_EMBEDDINGS_CHAPTER = {
  question: 'How does an arbitrary token ID become a position-aware numerical state that a transformer can work with?',
  estimatedMinutes: 42,
  prerequisites: [
    'You can explain why a tokenizer produces token pieces and integer token IDs rather than sending raw text directly to a transformer.',
    'You understand that a token ID is an index in a fixed vocabulary, not a measurement of a token\'s meaning.',
    'You can read a small vector such as [0.72, -0.18] and identify its number of dimensions.',
  ],
  objectives: [
    'Trace one token from visible text to token ID, embedding-table row, position signal, and initial transformer state.',
    'Use matrix shapes to explain why embedding lookup returns one vector per token position.',
    'Calculate an initial state by adding a token vector and a position vector in a transparent two-dimensional example.',
    'Distinguish an initial token embedding from a contextual token state produced by transformer blocks.',
    'Distinguish internal token-level representations from sentence or retrieval embeddings used in semantic search.',
    'State exactly what an educational embedding visualization demonstrates and what it cannot reveal about a live model.',
  ],
  sections: [
    {
      id: 'from-id-to-state',
      eyebrow: 'Orientation',
      heading: 'A token ID is an address, not a tiny packet of meaning',
      body: String.raw`Return to the unfinished sentence used throughout this course:

> The animal did not cross the street because it was too …

Tokenization converts that visible text into a sequence of token pieces and then assigns each piece an integer ID. Suppose, purely for illustration, that one piece is animal and its ID is 4172. The number 4172 does not mean more animal-like than ID 200, and changing the vocabulary-building procedure could assign an entirely different number to the same text. The ID is useful because it addresses one row in a learned table. That table is the embedding matrix.

An embedding lookup is the first bridge from symbolic input to continuous neural computation. Before lookup, the model has discrete choices: token 4172 is present and token 200 is not. After lookup, the model has a vector of real numbers that can participate in additions, dot products, normalizations, and learned projections. During training, the table is adjusted along with the model's other parameters. A row can therefore become a useful starting representation for the contexts in which its token appeared. It is not a dictionary definition written into individual coordinates. Its usefulness comes from how the whole trained network reads and transforms it.

The pipeline diagram locates this step precisely. Text is tokenized first. Each token ID selects one embedding row. The model also makes order available through some form of positional information. These ingredients produce an initial state for every sequence position. Only then do transformer blocks exchange and transform information. This ordering prevents a common conceptual shortcut: the embedding lookup does not already understand why animal is related to it or why too invites an adjective. Those relationships must be developed through context-sensitive computation.

For the shared sentence, ask two separate questions. Identity asks, “Which reusable token piece is at this position?” Position asks, “Where in this particular sequence occurrence is it?” A transformer needs both. If it received identity without order, the same bag of token vectors would be compatible with many differently ordered sentences. The embedding stage prepares the ingredients from which attention can later construct a context-dependent interpretation.`,
      diagramIds: ['embedding-pipeline'],
    },
    {
      id: 'lookup-matrix',
      eyebrow: 'Mechanism',
      heading: 'Embedding lookup selects a row from a learned matrix',
      body: String.raw`Let the vocabulary contain $V$ token IDs and let every token state have $d_{\text{model}}$ numerical components. The token embedding matrix has shape

$$
E \in \mathbb{R}^{V \times d_{\text{model}}}.
$$

For a token ID (t), lookup returns row (t):

$$
e_t = E[t] \in \mathbb{R}^{d_{\text{model}}}.
$$

If a sequence contains (n) token positions with IDs (t_0, t_1, \ldots, t_{n-1}), the model performs the lookup once for every occurrence. Stacking the selected rows produces a matrix (X_{\text{token}}) of shape (n \times d_{\text{model}}). Repeated IDs select the same parameter row at this point. They are still separate sequence occurrences, however, and later receive different position information and different contextual updates.

Imagine a toy vocabulary of five IDs and an embedding width of two. Then (E) has shape (5 \times 2), and each row contains two learned values. Looking up IDs [3, 1, 3] selects rows 3, 1, and 3 in that order. The result has shape (3 \times 2). Row 3 appears twice because the same token identity occurred twice. Lookup does not average the rows, sort them by ID, or calculate a semantic formula from the integer. It performs indexed selection.

This operation is mathematically equivalent to multiplying a one-hot vector by (E). A one-hot representation for ID 3 contains a 1 at index 3 and zeros elsewhere; multiplying it by the matrix selects row 3. Implementations use direct lookup because materializing enormous mostly-zero vectors would be wasteful. The one-hot interpretation remains useful because it shows how gradients update the rows: when a training example uses a token, the loss can send an update through the selected occurrence toward the corresponding parameters. Across many examples, many rows are repeatedly refined.

Real vocabularies and model widths are much larger than this toy table. The shape rule does not change. The vocabulary axis tells us how many reusable token identities have rows. The model-width axis tells us how many values travel together as one token state. A dimension is simply one coordinate in this computational workspace. It should not automatically be labelled with a human concept such as animalness, negation, or politeness. Learned properties are normally distributed across many coordinates and components.`,
      diagramIds: ['lookup-mechanism', 'embedding-shapes'],
    },
    {
      id: 'worked-example',
      eyebrow: 'Exact calculation',
      heading: 'Identity plus place: a two-dimensional worked example',
      body: String.raw`Now calculate one complete educational example. The values below are deliberately tiny and are not claimed to come from Bonsai or another production model. They exist so every arithmetic step can be inspected.

Suppose the token at sequence position 0 selects the row

$$
e_{\text{animal}} = [0.72, -0.18].
$$

For this teaching model, position 0 has the position vector

$$
p_0 = [0.00, 0.00].
$$

The initial state is the elementwise sum:

$$
x_0 = e_{\text{animal}} + p_0
    = [0.72 + 0.00, -0.18 + 0.00]
    = [0.72, -0.18].
$$

This exact result is intentionally consistent with the activity: adding the zero position vector at position 0 leaves the selected token row unchanged. “Unchanged” does not mean that position is irrelevant in every architecture. It only describes this transparent fixture and this particular position.

Next, imagine that the same token identity occurs at position 1, where the teaching position vector is (p_1=[0.10, 0.30]). Lookup still produces the same token row because identity did not change, but the combined state becomes

$$
x_1 = [0.72, -0.18] + [0.10, 0.30] = [0.82, 0.12].
$$

Both operands and the sum have width two. Element 0 adds to element 0, and element 1 adds to element 1. Adding vectors with different widths would be undefined. At production scale, the same rule applies to hundreds or thousands of coordinates at once.

Now perform a counterfactual. Put a different token at position 1 with toy row (e_{\text{street}}=[-0.25,0.60]). Its initial state is ([-0.15,0.90]). This lets us separate two causes of change. Moving animal from position 0 to position 1 changes only the position contribution; replacing animal with street changes the selected token row. If both identity and position change, both terms change. The activity should invite the learner to predict these effects before revealing the values.

This example is exact within the educational model, but it is not a report of hidden production activations. Its purpose is to reveal the data contract: a vector representing token identity and a compatible source of positional information jointly prepare the initial sequence state. The model's later layers operate on that state, not on the visible word or the integer ID directly.`,
      diagramIds: ['worked-vector-addition'],
    },
    {
      id: 'position-information',
      eyebrow: 'Order',
      heading: 'Position must be available, but architectures encode it differently',
      body: String.raw`A sequence model must distinguish “dog bites person” from “person bites dog.” If it received only the same three identity vectors with no order information, those two sequences would begin as the same unordered collection. Position makes sequence structure available to the computation.

The worked example uses the simplest learner-facing rule:

$$
X_0 = X_{\text{token}} + P.
$$

Here (X_{\text{token}}) and (P) both have shape (n \times d_{\text{model}}), so each token occurrence receives a position vector of the same width. In some transformers, (P) contains fixed sinusoidal values. In others, position rows are learned parameters. Both produce an additive signal before the main stack, although their construction differs.

Modern architectures also encode relative position inside attention. Rotary positional embeddings, for example, transform query and key components using position-dependent rotations. Other systems add relative-position biases to attention scores. In those cases, the exact phrase “token embedding plus position vector” is not a literal description of the complete implementation. The durable idea is broader: the architecture gives attention information about order or distance, and token identity alone is insufficient.

This distinction is pedagogically useful. We can first manipulate an additive fixture because it makes identity and place independently visible. We should then label the fixture as one architecture pattern rather than a universal law. When investigating a real model, ask which positional method its architecture declares instead of inferring one from a generic transformer diagram.

Position is associated with a token occurrence, not permanently stored inside the vocabulary row. If the token piece too appears at positions 4 and 12, both occurrences initially select the same token embedding row. Their position mechanisms differ because their locations differ. After attention begins, their contextual states may diverge even more because they can access different preceding tokens under a causal mask.

Long-context behavior also cannot be inferred merely from knowing that position exists. A model's supported context length, position scaling, training distribution, attention implementation, and available memory all matter. The embedding lesson establishes the minimum contract: the computation must be able to tell where token occurrences are. Later lessons will show how attention uses that information while routing context.`,
    },
    {
      id: 'initial-versus-contextual',
      eyebrow: 'Representation change',
      heading: 'An initial token vector is not the token’s meaning in this sentence',
      body: String.raw`Consider the token piece it in two contexts: “The robot dropped the glass because it was heavy” and “The robot dropped the glass because it was careless.” The identity lookup for it starts from the same embedding row, assuming the same tokenizer and model. Yet the evidence surrounding that occurrence differs. Transformer blocks use attention and local transformations to update the state at each position. The resulting contextual state can support different next-token predictions.

It helps to reserve different notation for different stages. Let (x_i^{(0)}) denote the initial state at position (i), after token identity and the architecture's positional method have been introduced. Let (x_i^{(\ell)}) denote the state after transformer block (\ell). A simplified residual update can be written as

$$
x_i^{(\ell+1)} = x_i^{(\ell)} + \Delta_i^{(\ell)}.
$$

The update (\Delta_i^{(\ell)}) depends on learned transformations and, through attention, on permitted context. The initial row is therefore a reusable starting point; contextual states are occurrence-specific intermediate results. They are activations computed during a particular run, not persistent rows in the vocabulary table.

This also separates parameters from activations. The embedding matrix (E) is a collection of learned parameters stored with the model. A selected row participates in constructing an activation for the current sequence. Contextual token states are further activations. They exist for this forward pass and can differ when the prompt changes, even though the stored embedding parameters remain fixed during ordinary inference.

Return to “The animal did not cross the street because it was too …”. Before contextual processing, the token row for street does not know that this occurrence participates in a reason for not crossing. The row for too does not by itself encode which adjective should follow. Through successive blocks, the state at the final position can gather information about animal, negation, cross, street, because, and other clues. The language-model head will later use the final contextual state to score candidate next tokens.

Calling every one of these objects an embedding obscures the mechanism. In casual conversation, people sometimes say “the embedding at layer 12,” but for this course, initial token embedding and contextual token state are better labels. They tell us where the vector came from, whether it is a persistent parameter or a per-request activation, and what kind of evidence it can already contain.`,
      diagramIds: ['representation-comparison'],
    },
    {
      id: 'geometry-and-learning',
      eyebrow: 'Learned space',
      heading: 'Useful geometry is distributed and depends on the training system',
      body: String.raw`Why can vectors represent anything useful? During training, the model repeatedly predicts targets and receives an error signal. Gradients adjust parameters that contributed to those predictions, including selected embedding rows. Tokens used in partially similar computational roles may receive updates that make some relationships easier for later layers to exploit. No teacher needs to assign a dimension named “animal.” The geometry emerges from many optimization steps interacting with the rest of the network.

Distance or direction can be informative, but it is not self-interpreting. Two rows being close under cosine similarity means they point in similar directions according to that metric. It does not prove synonymy, factual equivalence, or interchangeable use. Frequency, morphology, topic, syntax, data imbalance, and the downstream network can all affect the space. A visible two-dimensional projection can further distort distances from the original high-dimensional vectors.

The observatory's static GloVe vectors provide an honest way to manipulate a learned word-vector space. They can demonstrate nearest neighbors, directions, and analogy-like arithmetic using identified public vectors. They are not the current model's token embedding table, and GloVe words are not necessarily the same units as a subword tokenizer's tokens. The observatory therefore teaches transferable geometric ideas while keeping provenance explicit.

One coordinate should not be interpreted alone without evidence. A concept can be encoded across a direction involving many dimensions, and a single dimension can participate in multiple computations. Moreover, a row's function depends on the projections and later layers that read it. Rotating an entire internal space while correspondingly adjusting its readers can preserve behavior while changing what individual coordinates look like. This is one reason coordinate labels are usually unreliable.

Static geometry is also only the beginning. The same token row enters different contexts and develops different states. A neighborhood computed directly from the initial table answers a different question from similarity between contextual states in one prompt. Both may be studied, but they should not be silently exchanged.

The safe conclusion is modest and useful: training creates vector parameters whose relative structure helps the model compute. An educational space can make vector operations visible. It cannot, without model access and evidence, reveal a proprietary model's hidden rows, identify a single semantic coordinate, or certify why a live response occurred.`,
    },
    {
      id: 'different-embedding-products',
      eyebrow: 'Boundary',
      heading: 'Token embeddings, contextual states, and retrieval embeddings solve different problems',
      body: String.raw`The word embedding is overloaded in modern AI products. Three objects must remain separate.

First, a token embedding row is selected from the language model's input table. It represents one vocabulary identity at the start of model computation. A prompt with (n) tokens produces (n) selected rows before context is processed.

Second, contextual token states are activations inside the transformer. There is still one state per sequence position, but each state can incorporate information routed from permitted context. These states change across layers and prompts.

Third, a sentence, document, or retrieval embedding is normally a single fixed-width vector deliberately produced to compare whole pieces of content. A retrieval system may split documents into chunks, call an embedding model for each chunk, store those vectors, and compare a query vector with them. This is an application-level semantic-search interface. It is not simply “the token embedding after more layers,” and it need not come from the same model used to generate text.

The shapes expose the distinction. For a tokenized sequence of length (n), internal token representations commonly have shape (n \times d_{\text{model}}). A retrieval API may map an entire input string to one vector in (\mathbb{R}^{d_{\text{retrieval}}}). Two different texts can also have different token counts while still producing retrieval vectors of the same width. That fixed width makes database comparison practical.

The objectives differ too. A language model's token table is optimized as part of next-token prediction. A retrieval embedding model is commonly trained or tuned so semantically useful matches receive favorable similarity scores. Details depend on the model and training procedure. Similar terminology does not imply identical parameters, dimensions, tokenizers, or geometry.

This boundary matters when interpreting AI Lab. The word-vector observatory can expose identified static vectors. A retrieval lab can expose vectors returned by a documented embedding endpoint. A Bonsai generation request exposes input and output behavior unless the service explicitly returns internals. None of those observations authorizes us to draw a heatmap and call it Bonsai's private token embedding matrix.

When someone says “compare the embeddings,” ask four questions: embedding of what unit, produced by which model, at what stage, and optimized for which job? Those questions usually resolve the ambiguity.`,
      diagramIds: ['representation-comparison'],
    },
    {
      id: 'experiment-and-handoff',
      eyebrow: 'Experiment',
      heading: 'Use the lab to separate identity, position, context, and evidence',
      body: String.raw`A strong experiment begins with a prediction. Before changing a control, state which quantity should remain invariant and which should change.

Start with the exact toy row [0.72, -0.18] at position 0. Predict the combined state, reveal the zero position vector, and verify the elementwise addition. Then move the same identity to position 1. The token row should remain [0.72, -0.18], while the position contribution and combined initial state change in the additive fixture. Next, keep position 1 fixed but select another token ID. The position contribution remains fixed while the selected row changes. Finally, change earlier context while keeping the final token identity and position fixed. The lookup stage is unchanged, but later contextual states and output candidates may change.

For every panel, classify the displayed value. Is it a parameter from an identified dataset, an exact calculation from declared toy inputs, an activation actually returned by an inspectable model, a live behavioral output, or an illustrative schematic? This provenance check is part of the lesson, not administrative decoration. It prevents a smooth visualization from making a stronger claim than its data supports.

The miniature can prove shape rules and arithmetic because all inputs are visible. It can show that lookup is indexed selection and that compatible vectors add elementwise. Static public word vectors can demonstrate real learned geometry under their documented training method. A live generation can show that prompt changes alter behavior. Without an interface exposing internal activations, however, it cannot show the live model's actual token rows or contextual states.

By the end of the activity, you should be able to narrate the representation transition in one precise sentence: “The tokenizer's ID selects a learned row; the architecture introduces position; the resulting state enters the first transformer block.” You should also be able to reject two tempting but false shortcuts: the numeric ID is not semantic magnitude, and the selected row is not yet the token's complete contextual meaning.

The next lesson opens the transformer block. There, the input will no longer be visible text or raw IDs. It will be a matrix with one initial state per position. Attention will let positions exchange information, an MLP will transform each position, and residual connections will preserve a shared working stream. Token embeddings establish what the block receives; the later lessons explain how those starting vectors become useful predictions.`,
    },
  ],
  diagrams: [
    {
      id: 'embedding-pipeline',
      title: 'From text to the first transformer block',
      caption: 'Illustrative course map: token identity and positional information prepare one initial state per sequence position before contextual processing begins.',
      alt: 'Pipeline showing text becoming token pieces and IDs, IDs selecting token vectors, position information joining them, and initial token states entering transformer blocks.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  A["Visible text"] --> B["Token pieces"]
  B --> C["Token IDs"]
  C --> D["Embedding row lookup"]
  P["Position information"] --> E["Initial token states"]
  D --> E
  E --> F["Transformer blocks"]
  F --> G["Contextual token states"]`,
    },
    {
      id: 'lookup-mechanism',
      title: 'An ID selects one matrix row',
      caption: 'Illustrative lookup mechanism. The ID acts as an address; its numerical size is not used as semantic magnitude.',
      alt: 'A token ID points to one row in an embedding matrix, returning a vector whose width equals the model width.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  I["token ID t"] --> L["select row t"]
  E["Embedding matrix E<br/>V rows by d_model columns"] --> L
  L --> R["token vector e_t<br/>width d_model"]`,
    },
    {
      id: 'embedding-shapes',
      title: 'Lookup preserves sequence length and introduces model width',
      caption: 'Illustrative shape trace for a sequence of n token IDs and a vocabulary of V rows.',
      alt: 'Shape diagram showing n token IDs selecting from a V by d-model matrix to produce n vectors of width d-model.',
      kind: 'shape',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  T["IDs<br/>shape n"] --> O["row lookup"]
  M["E<br/>shape V x d_model"] --> O
  O --> X["Token vectors<br/>shape n x d_model"]
  P["Position information<br/>compatible shape"] --> A(("combine"))
  X --> A
  A --> S["Initial states<br/>shape n x d_model"]`,
    },
    {
      id: 'worked-vector-addition',
      title: 'Exact toy calculation at position zero',
      caption: 'Exact educational calculation used by the activity. These declared toy values are not production-model internals.',
      alt: 'Token row 0.72, negative 0.18 plus position-zero vector 0, 0 equals initial state 0.72, negative 0.18.',
      kind: 'mechanism',
      provenance: 'exact educational calculation',
      chart: `flowchart LR
  T["token row<br/>[0.72, -0.18]"] --> A(("elementwise add"))
  P["position 0<br/>[0.00, 0.00]"] --> A
  A --> X["initial state<br/>[0.72, -0.18]"]`,
    },
    {
      id: 'representation-comparison',
      title: 'Three vectors that should not share one vague label',
      caption: 'Illustrative comparison of representation stages and purposes; exact widths and production methods depend on the identified model.',
      alt: 'Comparison of a persistent token embedding row, per-request contextual token states, and a whole-text retrieval embedding used for similarity search.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  A["Token embedding row<br/>one vocabulary identity<br/>learned parameter"] --> B["Initial state<br/>identity plus position"]
  B --> C["Contextual token state<br/>one occurrence at one layer<br/>per-request activation"]
  D["Whole text or chunk"] --> E["Retrieval embedding model"]
  E --> F["One fixed-width vector<br/>for similarity search"]
  C -. "not automatically the same object" .-> F`,
    },
  ],
  misconceptions: [
    {
      claim: 'A larger token ID represents a stronger or more important meaning.',
      whyPlausible: 'In ordinary measurements, larger numbers usually mean more of a property.',
      correction: 'A token ID is an arbitrary vocabulary address. Its magnitude is not used as semantic strength; the addressed matrix row carries the learned numerical representation.',
      diagnostic: 'If two vocabulary rows were swapped together with their IDs everywhere, should semantic behavior change merely because the integers changed?',
    },
    {
      claim: 'One embedding coordinate can safely be labelled animalness, negation, or another human concept.',
      whyPlausible: 'A table view presents columns separately, encouraging one-label-per-column interpretations.',
      correction: 'Useful properties are generally distributed across directions involving many coordinates, and coordinates acquire function only through the components that read them.',
      diagnostic: 'What evidence beyond a few selected examples would be required before assigning a semantic label to one coordinate?',
    },
    {
      claim: 'The token embedding is the complete meaning of that token in the sentence.',
      whyPlausible: 'Embeddings are often described loosely as vectors that contain meaning.',
      correction: 'The lookup row is a reusable initial representation. Transformer blocks compute occurrence-specific contextual states using the surrounding sequence.',
      diagnostic: 'Why can the same token ID begin from the same row but support different predictions in two prompts?',
    },
    {
      claim: 'All transformers literally add a learned position vector to each token row.',
      whyPlausible: 'Additive positional encoding is easy to visualize and appears in many introductory diagrams.',
      correction: 'Architectures may use fixed or learned additive encodings, rotary transformations, relative biases, or other methods. The invariant requirement is that order becomes available to the computation.',
      diagnostic: 'Which model documentation would you inspect before claiming that its implementation uses additive position vectors?',
    },
    {
      claim: 'A retrieval embedding returned for a paragraph is the same kind of object as one input token row inside a language model.',
      whyPlausible: 'Both are fixed-width lists of floating-point values and both are called embeddings.',
      correction: 'They represent different units, are exposed at different stages, and are optimized for different jobs. Retrieval embeddings normally summarize whole inputs for similarity comparison.',
      diagnostic: 'For each vector, can you name the represented unit, producing model, computation stage, and training objective?',
    },
  ],
  exercises: [
    {
      id: 'predict-repeated-id',
      kind: 'predict',
      prompt: 'The same token ID appears at positions 0 and 4. Before transformer processing, what should remain the same and what may differ?',
      answer: 'The token ID selects the same embedding-matrix row at both occurrences. Positional information differs because the sequence locations differ, so their initial states may differ. Once transformer blocks process context, their contextual states may diverge further because each occurrence has different available evidence.',
    },
    {
      id: 'calculate-initial-state',
      kind: 'calculate',
      prompt: 'Using token row [0.72, -0.18] and position vector [0.10, 0.30], calculate the initial state and explain the operation.',
      answer: 'Add corresponding coordinates: [0.72 + 0.10, -0.18 + 0.30] = [0.82, 0.12]. This is elementwise addition between compatible width-two vectors, not concatenation and not a dot product.',
    },
    {
      id: 'trace-shapes',
      kind: 'trace',
      prompt: 'A tokenizer emits 12 IDs. The vocabulary contains 32,000 rows and the model width is 768. Give the shapes of E, the selected token-vector matrix, and the initial-state matrix in an additive-position model.',
      answer: 'E has shape 32,000 × 768. Looking up 12 IDs produces 12 × 768 because there is one width-768 row per sequence position. Compatible position information and the resulting initial-state matrix also have shape 12 × 768.',
    },
    {
      id: 'debug-id-arithmetic',
      kind: 'debug',
      prompt: 'A teammate averages token IDs 4172 and 200 and feeds 2186 into the network to represent a semantic blend. Diagnose the mistake.',
      answer: 'IDs are categorical addresses, so arithmetic on their integer values has no semantic interpretation. A valid computation first looks up the relevant rows. Even averaging those vectors would be a declared modeling choice, not a guaranteed representation of a meaningful blended token.',
    },
    {
      id: 'transfer-retrieval',
      kind: 'transfer',
      prompt: 'A retrieval service returns one 1,024-value vector for a 300-token document. Is that vector the document’s token embedding matrix? Explain using shape and purpose.',
      answer: 'No. The internal token representation would normally retain a sequence axis, such as 300 × d_model. The service returned one fixed-width vector intended to compare the whole document with other inputs. The producing model, width, and training objective may also differ from those of the generator.',
    },
    {
      id: 'debug-provenance',
      kind: 'debug',
      prompt: 'A visualization uses GloVe rows but labels them “Bonsai token embeddings.” What should the label say, and what conclusion remains valid?',
      answer: 'It should identify the values as static GloVe word vectors and describe the displayed calculation or projection. The visualization can demonstrate inspectable learned-vector geometry, such as neighbors under a declared metric. It cannot claim to expose Bonsai’s tokenizer rows, dimensions, contextual states, or private internal computation.',
    },
  ],
  glossary: [
    { term: 'Token ID', definition: 'An integer address assigned to a vocabulary entry; its numeric magnitude has no inherent semantic meaning.' },
    { term: 'Vocabulary', definition: 'The tokenizer’s finite inventory of token pieces and their IDs.' },
    { term: 'Embedding matrix', definition: 'A learned parameter matrix with one row per vocabulary ID and one column per model dimension.' },
    { term: 'Embedding lookup', definition: 'Indexed selection of the matrix row addressed by a token ID.' },
    { term: 'Model width', definition: 'The number of coordinates carried together in each token state, commonly written d_model.' },
    { term: 'Dimension', definition: 'One coordinate of a vector space; an individual learned dimension should not be assumed to map to one human concept.' },
    { term: 'Position information', definition: 'A signal or transformation that makes token order or relative location available to the model.' },
    { term: 'Initial token state', definition: 'The position-aware vector that enters the first transformer block.' },
    { term: 'Contextual token state', definition: 'A per-occurrence activation produced after transformer computation has incorporated permitted context.' },
    { term: 'Parameter', definition: 'A stored numerical value learned during training, such as an entry in the embedding matrix.' },
    { term: 'Activation', definition: 'An intermediate value computed for a particular input during a forward pass.' },
    { term: 'One-hot vector', definition: 'A vocabulary-sized vector containing one 1 and otherwise zeros; multiplying it by E is a conceptual equivalent of row lookup.' },
    { term: 'Retrieval embedding', definition: 'A fixed-width vector produced to compare a whole query, sentence, or document chunk for semantic search.' },
    { term: 'Cosine similarity', definition: 'A comparison based on the angle between vectors; useful for declared spaces but not proof of semantic equivalence.' },
    { term: 'Provenance', definition: 'An explicit account of where displayed values came from and which claims they can support.' },
  ],
} satisfies CourseTheoryChapter;
