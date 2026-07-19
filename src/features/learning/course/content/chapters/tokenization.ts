import type { CourseTheoryChapter } from '../theoryTypes';

export const TOKENIZATION_CHAPTER: CourseTheoryChapter = {
  question: 'How does visible text become the discrete token IDs that a language model can process?',
  estimatedMinutes: 60,
  prerequisites: [
    'Distinguish a character displayed on screen from a number stored by a computer.',
    'Recognize a list index as an address into a table.',
    'Understand that a model has a finite input budget.',
  ],
  objectives: [
    'Trace text through Unicode code points, UTF-8 bytes, token pieces, and token IDs.',
    'Explain why a token ID is a categorical address rather than a numerical measurement.',
    'Distinguish tokenizer training from encoding a new prompt.',
    'Compare the central ideas of BPE and Unigram tokenization without treating either name as one universal implementation.',
    'Identify how special tokens and chat templates change the actual sequence sent to a model.',
    'Predict how language, emoji, whitespace, and source code can change token count and boundaries.',
    'Connect token count to context capacity, prefill work, latency, and API cost while stating model-specific limits.',
  ],
  sections: [
    {
      id: 'tokenization-contract',
      eyebrow: 'Orientation',
      heading: 'A model receives categorical addresses, not the sentence on screen',
      diagramIds: ['tokenization-representation-ladder'],
      body: String.raw`Our shared prompt is **“The animal did not cross the street because it was too …”**. A person sees words, spaces, and punctuation. A transformer does not receive those visual objects directly. Before any embedding lookup or attention calculation, a tokenizer converts the input into a finite sequence of integer token IDs. Each ID addresses one entry in the model’s token vocabulary.

The representation ladder is longer than “words become numbers.” Text is represented by Unicode code points; an encoding such as UTF-8 represents those code points as bytes; a tokenizer groups text or byte-derived symbols into reusable pieces; the fixed vocabulary assigns each piece an integer ID. Implementations can combine or hide stages, but keeping them conceptually separate prevents several common errors.

The input–operation–output contract is:

1. **Input:** an exact Unicode string, including whitespace and invisible control characters.
2. **Preprocessing:** model-specific normalization and pre-tokenization, if configured.
3. **Segmentation:** the trained tokenizer selects vocabulary pieces that cover the input.
4. **Lookup:** each selected piece maps to one vocabulary ID.
5. **Output:** an ordered ID sequence, possibly wrapped in special tokens from an application template.

Order and exact boundaries matter. The strings “street,” “ street,” and “Street” can receive different segmentations. A visible ellipsis character can differ from three period characters. A composed accented character can differ at the code-point level from a base letter followed by a combining mark, even when both render similarly. A tokenizer may normalize some differences, preserve them, or fall back to byte-level pieces. There is no safe universal answer without identifying the tokenizer.

The token sequence is the model’s actual discrete interface. Context limits are counted in tokens, not human words. The embedding table has one row per token ID, not one row per dictionary meaning. Generated output also arrives as token IDs before the tokenizer decodes it back toward text. Understanding this boundary explains why prompts that look similar can use different budgets and why token boundaries do not line up neatly with concepts.`,
    },
    {
      id: 'unicode-and-bytes',
      eyebrow: 'Text representation',
      heading: 'Characters, code points, graphemes, and UTF-8 bytes are different units',
      body: String.raw`Unicode assigns abstract **code points** such as U+0041 for capital A and U+2026 for the ellipsis character “…” used in our prompt. A code point is not necessarily one byte, one visible character, or one token. UTF-8 encodes U+0041 as the single byte 41 in hexadecimal, while U+2026 uses the three bytes E2 80 A6. The space between words is normally U+0020 and byte 20, but text can contain other spaces that look similar.

A user-perceived character is often a **grapheme cluster** made from multiple code points. The displayed “é” can be the single code point U+00E9 or the sequence U+0065 followed by combining acute accent U+0301. Emoji can be more elaborate: a visible family or profession symbol may join several emoji code points with zero-width joiners, variation selectors, and skin-tone modifiers. JavaScript string length, Unicode code-point count, grapheme count, byte count, and token count can therefore all disagree.

Why do bytes matter to tokenization? Many modern tokenizers ensure broad text coverage by operating on bytes directly or providing a byte fallback when a larger Unicode piece is absent. This prevents an unknown-character failure for arbitrary input, because every UTF-8 string can ultimately be represented by bytes. It can also make unfamiliar scripts or unusual symbols expand into several pieces.

Normalization is a tokenizer decision, not an automatic law of Unicode. NFC can compose some equivalent sequences; NFKC can additionally fold compatibility forms and may change distinctions an application cares about. Some tokenizer pipelines normalize aggressively, some minimally, and some byte-level designs preserve the input closely. The same visible input can therefore produce different pieces under different models even before vocabulary differences are considered.

For the shared prompt, replacing U+2026 with three U+002E periods changes the underlying sequence from one code point and three UTF-8 bytes to three code points and three bytes. Equal byte counts do not imply equal tokenization: the vocabulary may contain a whole ellipsis piece, a period piece reused three times, or pieces that combine preceding space with punctuation. To explain a real trace, record the exact string or code points rather than relying on how a proportional font renders them.`,
    },
    {
      id: 'pieces-and-ids',
      eyebrow: 'Vocabulary',
      heading: 'A token piece is reusable text; its ID is only a categorical address',
      body: String.raw`A tokenizer vocabulary is a finite mapping between token pieces and integer IDs. A piece may be a common word, part of a word, punctuation, whitespace plus text, one byte, or a reserved special symbol. The model’s embedding table has one row for each vocabulary entry. If the tokenizer emits ID $i$, embedding lookup selects row $i$.

The number itself has no ordinal semantics. ID 9,000 is not “larger,” more important, or more animal-like than ID 400. It is a categorical address chosen by how the vocabulary file was assembled. Permuting every vocabulary ID and applying the same permutation to the model’s embedding and output matrices would preserve the represented system. Arithmetic on raw IDs is therefore meaningless: averaging the IDs for “animal” and “street” does not create a token halfway between their meanings.

This distinction explains why token IDs should not be fed into a network as scalar magnitudes. Embedding lookup converts a categorical identity into a learned vector where numerical operations become useful. Tokenization chooses the row; embedding supplies the coordinates. The next lesson begins precisely at that handoff.

Whitespace frequently participates in pieces. SentencePiece-style visualizations often show a marker such as “▁” for a word-initial space. Byte-level BPE visualizers may use another printable symbol for a space byte. Those markers are display conventions, not literal characters necessarily typed by the user. A piece rendered as “▁animal” can mean that the boundary includes preceding whitespace.

Vocabulary size creates a tradeoff. A larger vocabulary can store more frequent sequences as single pieces, shortening some inputs, but it enlarges the embedding and unembedding tables. A smaller vocabulary reuses fewer pieces broadly, but common words may require more positions. Vocabulary content matters as much as size: a tokenizer trained heavily on one language or programming ecosystem can represent its recurring sequences efficiently while fragmenting others.

Tokens are also not stable linguistic units. One tokenizer may encode “animal” as one piece, another as “an” plus “imal,” and another through byte-derived fragments. A word can split differently after a space, after punctuation, or under capitalization. When discussing an actual model, always use that model’s tokenizer artifact and version.`,
    },
    {
      id: 'subword-motivation',
      eyebrow: 'Design problem',
      heading: 'Subword tokenization balances coverage, reuse, and sequence length',
      body: String.raw`A word-only vocabulary seems intuitive but fails operationally. Natural language contains names, inflections, spelling variants, URLs, numbers, typos, technical identifiers, and newly coined words. Storing every possible word is impossible, while mapping unseen words to one unknown symbol destroys distinctions. Character-only or byte-only tokenization guarantees coverage, but it makes common expressions much longer and forces the model to rebuild recurring patterns over many positions.

Subword tokenization occupies the middle ground. Frequent sequences can become one vocabulary piece, while rare strings are assembled from smaller pieces. “Crossing” might reuse pieces related to “cross” and a suffix; an unseen product name can fall back to letters or bytes. The scheme does not perform morphological analysis in a linguistic sense, even when some boundaries resemble morphemes. It optimizes a corpus-driven objective under an algorithm and vocabulary budget.

This tradeoff affects the transformer directly. If one representation uses $n$ tokens and another uses $m$ for the same visible text, they consume different context positions. In standard dense attention, the conceptual score matrix has $n^2$ destination–source entries, so fragmentation can increase prompt-processing work strongly. Optimized kernels alter constants and memory behavior, and architectures may use other attention patterns, but token count remains a major operational quantity.

Subwords also let parameters be shared across contexts. A recurring piece can acquire an embedding and participate in learned transformations wherever it appears. Yet sharing is not automatically fair or semantically clean. If one language’s frequent words are single tokens while another language regularly needs several pieces, the second language spends more context positions expressing comparable text. It may also require more decoding steps and API-billed tokens.

There is no universally optimal segmentation. A tokenizer is co-designed with a training corpus, model, context budget, and deployment priorities. Changing the tokenizer after model training is not a harmless frontend preference: token IDs address learned rows. Unless embeddings and the rest of the model are adapted consistently, the new mapping breaks the model’s input contract.`,
    },
    {
      id: 'bpe-training-encoding',
      eyebrow: 'Algorithm',
      heading: 'BPE training learns merge rules; encoding applies the frozen rules',
      diagramIds: ['tokenization-bpe-two-phases'],
      body: String.raw`Byte Pair Encoding, or BPE, is best understood as two different phases. During **tokenizer training**, the algorithm analyzes a corpus and builds a vocabulary or ranked merge list. During **encoding**, it applies that frozen artifact to one new string. The model does not retrain its tokenizer whenever a prompt arrives.

In a simplified teaching version, training begins with small symbols, perhaps characters or bytes. It counts adjacent symbol pairs across the corpus, merges a selected frequent pair into a new symbol, adds that symbol to the vocabulary, and repeats until a vocabulary budget or stopping rule is reached. If “t” followed by “h” is frequent, “th” may become a piece; later merges can build longer pieces from earlier ones.

Real implementations differ in pre-tokenization, byte mapping, normalization, pair scoring, tie-breaking, merge constraints, and special-token handling. “Uses BPE” is therefore not enough to reproduce boundaries. The vocabulary and merge ranks are part of the model artifact.

At encoding time, the tokenizer first performs its configured normalization and pre-tokenization, then resolves pieces according to learned merge ranks. A frequent pair in the current prompt does not receive a new merge unless that merge was learned and stored. Encoding is deterministic for many BPE tokenizers under fixed input and settings, although optional sampling variants exist.

Consider an illustrative starting sequence for “street”: “s t r e e t.” If training learned merges “s+t,” “st+r,” “e+e,” and eventually “str+eet” under compatible intermediate symbols, the final word may become one piece. If the longer merge is absent, it remains several pieces. This example explains the mechanism; it does not claim any specific model learned those exact rules.

The distinction between training and encoding prevents a frequent misconception. The tokenizer is not scanning the current sentence and choosing whichever fragments seem semantically meaningful. It is applying a statistical codebook learned earlier. Meaning may correlate with frequent boundaries, but the encoding procedure is governed by stored rules and exact text.`,
    },
    {
      id: 'unigram-contrast',
      eyebrow: 'Comparison',
      heading: 'Unigram chooses a likely segmentation from a fixed piece model',
      body: String.raw`The Unigram language-model tokenizer offers a useful contrast. A simplified Unigram trainer begins with an overcomplete set of candidate pieces, assigns probabilities to them, estimates how well combinations explain the training corpus, and repeatedly removes pieces whose absence harms the objective least. Encoding then seeks a high-probability segmentation of the input, often using dynamic programming such as the Viterbi algorithm.

For a string with several valid covers, BPE follows its learned merge priorities, while Unigram compares complete segmentations under piece probabilities. Both ultimately emit pieces from a fixed vocabulary, and both can include fallback behavior. Their training objectives and encoding procedures differ.

Unigram tokenizers may support **subword regularization**, sampling alternative segmentations during model training so the neural network does not rely on only one boundary pattern. Some BPE systems also provide dropout-like segmentation variants. These optional techniques show why algorithm family names are insufficient for exact claims. Configuration and mode matter.

Neither BPE nor Unigram discovers one correct linguistic decomposition. A piece can cross a human morpheme boundary because doing so compresses common corpus sequences. Conversely, an uncommon proper name may fragment despite being one concept to a reader. The tokenizer’s objective is an efficient, reusable discrete representation, not a dictionary analysis.

When comparing models, do not ask only “Which algorithm is better?” Ask what corpus shaped the vocabulary, what normalization and byte fallback are used, how many tokens representative workloads consume, whether special-token behavior is documented, and whether the tokenizer is shipped reproducibly. Empirical counts on the target languages and formats are more informative than the BPE or Unigram label alone.`,
    },
    {
      id: 'illustrative-trace',
      eyebrow: 'Worked example',
      heading: 'Illustrative trace: the shared prompt becomes pieces and categorical IDs',
      diagramIds: ['tokenization-shared-prompt-trace'],
      body: String.raw`The following is an **illustrative glass-box tokenizer trace**, not output measured from Bonsai or a universal tokenizer. We declare a tiny vocabulary convention in which “▁” displays a preceding word boundary or space. Assume the vocabulary contains each shown piece and assigns arbitrary IDs:

| Visible span | Displayed piece | Illustrative ID |
| --- | --- | ---: |
| The | ▁The | 417 |
| animal | ▁animal | 9,021 |
| did | ▁did | 733 |
| not | ▁not | 441 |
| cross | ▁cross | 5,284 |
| the | ▁the | 279 |
| street | ▁street | 6,318 |
| because | ▁because | 1,147 |
| it | ▁it | 376 |
| was | ▁was | 403 |
| too | ▁too | 892 |
| … | ▁… | 12,440 |

Under this declared fixture, encoding produces

$$
[417, 9021, 733, 441, 5284, 279, 6318, 1147, 376, 403, 892, 12440].
$$

The sequence has 12 tokens. ID 12,440 is not a larger or richer meaning than ID 279; both are row addresses. A trained embedding table would turn each address into a vector. Decoding maps the pieces back toward the visible string, interpreting “▁” according to this display convention.

Now declare a second equally valid vocabulary that lacks “▁animal” but contains “▁ani” with ID 2,501 and “mal” with ID 814. The same prompt becomes 13 tokens because that one visible word uses two pieces. No word changed, but context usage, embedding lookups, and the number of sequence positions did.

Changing the final U+2026 ellipsis to three periods may produce one “▁” boundary piece plus three period pieces, one special three-period piece, or another segmentation. We cannot infer the result from byte count alone. Changing “animal” to an emoji sequence can add many UTF-8 bytes and potentially several fallback tokens even if the interface shows one grapheme.

To produce a **measured** trace, record the exact tokenizer name and revision, input string, normalization settings, special-token option, pieces, IDs, and decoded round trip. Do not reuse the illustrative IDs in API calls or documentation about a real model. Token IDs are local to a vocabulary; the same integer can mean an unrelated piece in another model.`,
    },
    {
      id: 'special-tokens-and-templates',
      eyebrow: 'Application boundary',
      heading: 'Chat templates add tokens that are invisible in the message editor',
      diagramIds: ['tokenization-chat-context-budget'],
      body: String.raw`Applications rarely send only the visible user sentence. Chat models expect a model-specific serialization that may include beginning-of-sequence, role, message-boundary, tool-call, and end-of-turn tokens. A template can turn a system message and user prompt into a longer structured token sequence. The exact control symbols are tokenizer and model artifacts, not a universal chat protocol.

**Special tokens** have reserved IDs and application-defined roles. Examples include BOS for sequence start, EOS for sequence end, PAD for batch padding, and role delimiters for system, user, or assistant messages. Their names and semantics vary. Padding is especially easy to confuse with causality: a padding mask prevents computation from treating batch filler as content, while a causal mask prevents a position from reading future content. They solve different access problems.

Use the official chat-template function for the target model when available. Manually inserting visible strings that resemble special tokens can fail because the tokenizer may encode them as ordinary fragments or because the template adds a second copy. Conversely, asking a tokenizer to add special tokens automatically and also applying a chat template can duplicate boundaries. A reproducible trace states whether special tokens were included.

These hidden additions consume context budget. If a model supports a maximum sequence length $C$, a simplified budget is

$$
N_{system}+N_{history}+N_{user}+N_{template}+N_{output}\le C.
$$

Provider rules may reserve output capacity separately or impose additional limits, so application code should follow the identified API rather than rely only on this equation. The crucial point is that visible user words are only one part of the token sequence.

Token count affects more than capacity. More prompt tokens increase embedding work, prompt processing, cache size, and often latency or billed input units. Standard dense attention exposes an $n\times n$ relationship during prefill, though optimized kernels and model architectures change actual scaling and constants. Generated tokens require repeated decoding steps, so verbose tokenization can increase output latency and cost as well.

Budget estimates should use the deployed model’s tokenizer and complete rendered template. A generic “one token is four characters” rule can be a rough English average but is unreliable for multilingual text, code, emoji, whitespace-heavy data, and exact limit enforcement.`,
    },
    {
      id: 'boundary-effects',
      eyebrow: 'Failure modes',
      heading: 'Language, emoji, and code reveal whose patterns the vocabulary favors',
      body: String.raw`Tokenizer boundaries are model-specific and corpus-sensitive. English prose that resembles the training data may use common long pieces. A language with less representation in tokenizer training may fragment into shorter Unicode or byte-derived units. Two sentences with comparable human meaning can therefore consume very different token counts. This affects usable context, API cost, and the number of computation steps; it is an engineering and accessibility concern, not merely a visualization curiosity.

Scripts without spaces demonstrate that word boundaries are not required. A tokenizer can learn common character sequences, but segmentation may not correspond to a reader’s notion of a word. Mixed-script text, transliteration, diacritics, and normalization can further change boundaries. Evaluation should include the actual languages and writing styles of intended users.

Emoji expose the distance between graphemes and stored units. One rendered emoji may contain multiple code points and many UTF-8 bytes. A vocabulary may contain the whole sequence, individual code points, byte fragments, or combinations. Skin-tone changes and zero-width joiners can alter token count without changing the broad concept perceived by a user.

Source code has different regularities from prose. Indentation, repeated spaces, newlines, punctuation, operators, and long identifiers all matter. A code-oriented vocabulary may store common whitespace-plus-keyword patterns efficiently; another tokenizer may split the same program heavily. Changing formatting can change token count and model behavior even when a compiler would treat the code as equivalent. Never normalize user code casually merely to reduce tokens, because whitespace can be syntactically meaningful.

Numbers, URLs, and random identifiers are other stress cases. A long digit sequence may be grouped in model-specific chunks. UUIDs and hashes contain low-frequency combinations and often fragment. Prompt budgeting based on word count performs particularly poorly for such data.

These observations do not prove that fewer tokens always produce better model quality. Fragmentation changes the learning and inference problem, but quality also depends on corpus, architecture, parameter count, training, and task. Token fertility—tokens per word or per character—can identify disparities, but it is one diagnostic rather than a complete model evaluation.`,
    },
    {
      id: 'tokenization-experiment-summary',
      eyebrow: 'Synthesis',
      heading: 'Inspect exact boundaries before reasoning about vectors',
      body: String.raw`Use a tokenizer lab as a predict–inspect–compare experiment. Before encoding, predict which spans might be single pieces and which might split. Then reveal code points, UTF-8 bytes, pieces, IDs, and total count. Change exactly one feature—capitalization, leading space, ellipsis form, accent normalization, language, emoji modifier, indentation, or chat role—and compare the trace.

Record provenance. An illustrative fixture demonstrates concepts with declared values. A measured trace identifies the tokenizer artifact and options. A live text-only model response does not expose token IDs unless its API or local tokenizer contract supplies them. Never label convenient example IDs as Bonsai internals.

Useful debugging invariants include a successful encode–decode round trip under the tokenizer’s documented guarantees, IDs within vocabulary range, deterministic output under deterministic settings, and a count that includes special tokens when the deployed request includes them. If the frontend count and server count disagree, compare tokenizer revision, normalization, template rendering, and add-special-token settings before blaming the model.

The complete handoff is

$$
\text{Unicode text}
\longrightarrow
\text{UTF-8-aware preprocessing}
\longrightarrow
\text{vocabulary pieces}
\longrightarrow
\text{token IDs}
\longrightarrow
\text{embedding rows}.
$$

For the shared prompt, our declared fixture produced 12 categorical addresses, while a second vocabulary produced 13. Neither trace is universal. The exact model tokenizer decides what is actually sent.

That last arrow is the bridge to token embeddings. An ID does not contain coordinates or meaning; it selects one learned row. The next lesson asks how that row becomes a numerical state, how position is introduced, and why the initial embedding for a piece must not be confused with its later contextual representation. Tokenization defines the discrete interface. Embedding lookup begins the continuous computation.`,
    },
  ],
  diagrams: [
    {
      id: 'tokenization-representation-ladder',
      title: 'The representation ladder from text to model input',
      caption: 'Visible text passes through exact computer encodings and a model-specific vocabulary before becoming token IDs.',
      alt: 'Pipeline from displayed text through Unicode code points, UTF-8 bytes, tokenizer pieces, categorical token IDs, and embedding lookup.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  T[Displayed text] --> U[Unicode code points]
  U --> B[UTF-8 bytes]
  B --> P[Tokenizer pieces]
  P --> I[Categorical token IDs]
  I --> E[Embedding lookup]`,
    },
    {
      id: 'tokenization-bpe-two-phases',
      title: 'BPE training and prompt encoding are separate phases',
      caption: 'Corpus analysis creates a fixed vocabulary and merge artifact; prompt-time encoding only applies that artifact.',
      alt: 'Two-stage diagram showing a training corpus producing merge rules and a vocabulary, which are then applied with a new prompt to produce pieces.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  C[Training corpus] --> COUNT[Count candidate pairs]
  COUNT --> MERGE[Select and record merges]
  MERGE --> ART[Fixed vocabulary and merge ranks]
  ART --> ENC[Prompt-time encoder]
  P[New prompt] --> ENC
  ENC --> OUT[Token pieces and IDs]`,
    },
    {
      id: 'tokenization-shared-prompt-trace',
      title: 'Declared shared-prompt tokenization fixture',
      caption: 'The pieces and IDs are transparent educational values; a real tokenizer may split every span differently.',
      alt: 'Shared sentence split into twelve displayed word-boundary pieces, then mapped to twelve arbitrary example token IDs.',
      kind: 'mechanism',
      provenance: 'exact educational calculation',
      chart: String.raw`flowchart TB
  S[Shared prompt] --> P["12 declared pieces: The | animal | did | not | cross | the | street | because | it | was | too | ellipsis"]
  P --> I["12 illustrative IDs: 417 | 9021 | 733 | 441 | 5284 | 279 | 6318 | 1147 | 376 | 403 | 892 | 12440"]
  I --> N[12 embedding-table addresses]`,
    },
    {
      id: 'tokenization-chat-context-budget',
      title: 'The visible message is only part of the context budget',
      caption: 'Templates serialize system text, history, roles, user content, and an output allowance into the model’s actual token sequence.',
      alt: 'System message, conversation history, visible user prompt, and special role tokens combine into an input sequence alongside reserved output capacity.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: String.raw`flowchart LR
  S[System message] --> T[Chat template]
  H[Conversation history] --> T
  U[Visible user prompt] --> T
  R[Role and boundary tokens] --> T
  T --> I[Actual input token sequence]
  I --> C[Context budget]
  O[Output allowance] --> C`,
    },
  ],
  misconceptions: [
    {
      claim: 'One token is one word.',
      whyPlausible: 'Many common English words appear as single pieces in tokenizer visualizations.',
      correction: 'Tokens may be words, subwords, punctuation, whitespace-bearing pieces, bytes, or special symbols. One word may use several tokens.',
      diagnostic: 'How might a tokenizer represent an unseen product name that is absent from its vocabulary?',
    },
    {
      claim: 'A larger token ID represents a larger or more important concept.',
      whyPlausible: 'The output is numeric, so ordinary arithmetic intuition seems applicable.',
      correction: 'The ID is a categorical vocabulary address. Its magnitude has no semantic ordering.',
      diagnostic: 'Would consistently permuting vocabulary rows and IDs change what the system represents?',
    },
    {
      claim: 'BPE learns new merges from every prompt.',
      whyPlausible: 'Encoding visibly combines smaller text fragments into pieces.',
      correction: 'Training learns the fixed merge artifact. Prompt-time encoding applies it without modifying the vocabulary.',
      diagnostic: 'Where would a newly learned prompt merge be stored so the embedding table had a matching row?',
    },
    {
      claim: 'The same text always has the same token IDs across models.',
      whyPlausible: 'Unicode and UTF-8 are standards shared by software systems.',
      correction: 'Tokenizer normalization, vocabulary, algorithms, merge ranks, and ID assignments are model-specific.',
      diagnostic: 'Could ID 417 refer to unrelated pieces in two vocabulary files?',
    },
    {
      claim: 'A visible character always becomes one token.',
      whyPlausible: 'Text editors display a character as one selectable-looking symbol.',
      correction: 'One grapheme may contain several code points and UTF-8 bytes, and tokenizers can segment those units into multiple pieces.',
      diagnostic: 'Why can a joined family emoji consume several tokens while appearing as one glyph?',
    },
    {
      claim: 'The chat input contains only the words typed by the user.',
      whyPlausible: 'The UI hides serialization details to keep conversation readable.',
      correction: 'System messages, history, role delimiters, tool descriptions, and boundary tokens may also consume context.',
      diagnostic: 'Why can server token counts exceed a local count of the visible user string?',
    },
  ],
  exercises: [
    {
      id: 'tokenization-unicode-trace',
      kind: 'trace',
      prompt: 'Compare the single ellipsis character U+2026 with three period characters. State their code-point and UTF-8 byte counts, then explain why token counts still cannot be inferred.',
      answer: 'U+2026 is one code point encoded by three UTF-8 bytes. Three periods are three U+002E code points and three bytes. Token count depends on the model vocabulary, preceding space, normalization, and merge rules, so equal byte counts do not force equal pieces.',
    },
    {
      id: 'tokenization-id-arithmetic',
      kind: 'debug',
      prompt: 'A learner averages token IDs 417 and 9,021 to estimate a semantic midpoint. Diagnose the error.',
      answer: 'IDs are categorical addresses, not coordinates. Their average is just another integer that may address an unrelated vocabulary row. Semantic numerical operations become meaningful only after lookup into learned vector representations.',
    },
    {
      id: 'tokenization-fixture-count',
      kind: 'calculate',
      prompt: 'The declared trace uses 12 tokens. If animal splits into two pieces and the ellipsis splits into three pieces instead of one, how many tokens result?',
      answer: 'The animal change adds one position and the ellipsis change adds two, producing 15 tokens. This arithmetic applies only to the declared modifications, not to an unidentified real tokenizer.',
    },
    {
      id: 'tokenization-bpe-phase',
      kind: 'trace',
      prompt: 'Sort these actions into BPE training or encoding: count corpus pairs, store a merge rank, apply existing ranks to a prompt, emit IDs, add a learned piece to the vocabulary.',
      answer: 'Training counts corpus pairs, stores merge ranks, and adds learned pieces. Encoding applies the existing ranks and emits IDs. Encoding must not silently mutate the fixed vocabulary expected by the model.',
    },
    {
      id: 'tokenization-chat-budget',
      kind: 'calculate',
      prompt: 'A context limit is 8,192 tokens. System and template tokens use 700, history uses 4,800, and the user message uses 692. What maximum output remains under the simplified shared budget?',
      answer: 'The remainder is 8,192 minus 700 minus 4,800 minus 692, which equals 2,000 tokens. A real provider may impose separate output limits, so this is a simplified capacity calculation.',
    },
    {
      id: 'tokenization-normalization',
      kind: 'predict',
      prompt: 'Two strings display as é, but one uses U+00E9 and the other uses e plus U+0301. Predict when their tokens match and when they may differ.',
      answer: 'They can match if the tokenizer normalizes both to the same canonical form before segmentation. They may differ if normalization preserves the code-point sequences or byte-level pieces encode them separately. The tokenizer configuration decides.',
    },
    {
      id: 'tokenization-provenance',
      kind: 'transfer',
      prompt: 'A live API returns text but exposes neither tokenizer version nor token IDs. May the illustrative ID 9,021 be reported as its ID for animal?',
      answer: 'No. The fixture only demonstrates the address concept. A measured claim requires the model’s actual tokenizer artifact or an explicit API trace. The defensible observation is limited to the exposed text and metadata.',
    },
    {
      id: 'tokenization-workload',
      kind: 'transfer',
      prompt: 'Design a small tokenizer comparison for a multilingual coding assistant. What inputs and measurements should it include?',
      answer: 'Use matched prose across target languages, emoji with modifiers, identifiers, URLs, indentation-sensitive code, comments, and mixed-script text. Record exact strings, tokenizer revisions, pieces, IDs, counts, round trips, special-token settings, and tokens per character or task unit. Do not infer overall model quality from counts alone.',
    },
  ],
  glossary: [
    { term: 'Unicode code point', definition: 'An abstract numbered text element such as U+2026, distinct from its byte encoding and visual rendering.' },
    { term: 'grapheme cluster', definition: 'A sequence of one or more code points perceived by a user as one displayed character.' },
    { term: 'UTF-8', definition: 'A variable-length encoding that represents Unicode code points as one or more bytes.' },
    { term: 'tokenizer vocabulary', definition: 'A fixed mapping between reusable token pieces and categorical integer IDs.' },
    { term: 'token piece', definition: 'A vocabulary unit that can represent text, a byte-derived fragment, punctuation, whitespace, or a special symbol.' },
    { term: 'token ID', definition: 'A categorical integer address selecting one tokenizer vocabulary entry and model embedding row.' },
    { term: 'subword tokenization', definition: 'Representing text with reusable units between whole-word and character or byte granularity.' },
    { term: 'BPE', definition: 'A tokenizer family that learns ranked combinations of smaller symbols and applies the frozen merge artifact during encoding.' },
    { term: 'Unigram tokenizer', definition: 'A tokenizer family that scores candidate pieces and selects a likely segmentation from a fixed probabilistic vocabulary.' },
    { term: 'normalization', definition: 'A configured transformation of input text before segmentation, which may preserve or combine Unicode distinctions.' },
    { term: 'byte fallback', definition: 'A coverage mechanism that represents otherwise unavailable text through its encoded bytes.' },
    { term: 'special token', definition: 'A reserved vocabulary entry used for structural roles such as sequence or message boundaries.' },
    { term: 'chat template', definition: 'A model-specific serialization that combines messages, roles, and special tokens into the actual input sequence.' },
    { term: 'context budget', definition: 'The maximum token capacity shared by the input sequence and, under model or provider rules, generated output.' },
    { term: 'token fertility', definition: 'A diagnostic ratio such as tokens per word or character for a language or workload.' },
  ],
};
