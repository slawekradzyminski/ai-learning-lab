import { LLM_COURSE_PROMPT, LLM_COURSE_TARGET } from '../../courseScenario';
import type { CourseTheoryChapter } from '../theoryTypes';

export const GENERATION_CACHE_CHAPTER = {
  question: 'What can autoregressive generation reuse, what must it recompute, and what memory does that reuse require?',
  estimatedMinutes: 38,
  prerequisites: [
    'Know that an autoregressive language model selects one next token and then repeats the prediction process.',
    'Know the distinct roles of queries, keys, and values in causal self-attention.',
    'Know that a decoder contains many transformer layers and that each layer has its own attention projections.',
    'Be comfortable multiplying integer dimensions and converting bytes to MiB or GiB.',
    'Distinguish learned model parameters from prompt-dependent runtime activations.',
  ],
  objectives: [
    'Distinguish prompt prefill from token-by-token decode.',
    'Explain why earlier keys and values remain useful to future queries while earlier queries do not.',
    'Trace when one new key row and one new value row are appended at every layer.',
    'Derive the standard dense KV-cache estimate from tensor dimensions.',
    'Calculate the exact 1 GiB example and predict changes caused by context, precision, and KV-head count.',
    'Compare MHA, GQA, and MQA without assuming that every model has the same head arrangement.',
    'Explain which attention work remains after caching and why long context is not computationally free.',
    'Separate a KV cache from weights, saved conversation memory, and compatible prefix caching.',
    'State which cache claims are exact educational calculations and which require evidence from a live runtime.',
  ],
  sections: [
    {
      id: 'generation-has-two-phases',
      eyebrow: '1 · Lifecycle',
      heading: 'Generation begins with prefill and continues with repeated decode steps',
      body: String.raw`The shared course prompt is “${LLM_COURSE_PROMPT}”. A tokenizer first turns that text into a sequence of token IDs. The model then has to process every prompt position before it can score the continuation “${LLM_COURSE_TARGET}” and its alternatives. This initial processing phase is called prefill. In an ordinary dense decoder, all prompt positions can be processed together because the causal mask determines which earlier positions each row may use. At every transformer layer, prefill creates a key vector and a value vector for each prompt position.

After the model chooses one next token, generation enters the repeated decode phase. The selected token extends the sequence, but the model does not yet have layer-by-layer keys and values for that new position. On the following model step, the selected token is embedded and passed through the stack. At each layer it forms a new query, a new key, and a new value. Its query reads the earlier cached keys and values, including the new position’s own key and value when the implementation constructs causal self-attention for that position. The final layer eventually produces the distribution for the token after the selected token.

This timing is easy to describe imprecisely. Selecting “ tired” does not magically place all of its layer-specific tensors into the cache. Processing “ tired” through the next forward step creates those tensors. Once that step has completed, one new K row and one new V row per layer are available for later positions. The next selected token repeats the same process.

Without reuse, every decode step could run the entire longer prefix through all layers again. The earlier token representations would produce the same earlier key and value projections because model weights and earlier context have not changed. The KV cache retains those reusable projections. The newest position still requires a complete trip through the transformer stack, but earlier K and V tensors do not need to be regenerated.

Prefill and decode therefore have different performance characteristics. Prefill handles many token positions and is often efficient at using parallel hardware, even though dense attention compares many pairs of positions. Decode handles one or a small number of new positions at a time and repeatedly reads a growing cache. Time to first token is strongly influenced by prompt processing; the rate of later tokens is strongly influenced by per-step decode work, memory movement, and serving strategy. Combining both into one vague statement such as “the model reads the prompt” hides the engineering reason the cache exists.`,
      diagramIds: ['prefill-decode-lifecycle'],
    },
    {
      id: 'why-keys-and-values',
      eyebrow: '2 · Reuse rule',
      heading: 'Future positions need old keys and values, but they need a new query of their own',
      body: String.raw`For one attention layer, normalized token states are projected into queries, keys, and values:

$$Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V.$$

For a new destination position $t$, its query $q_t$ is compared with the keys available from positions $1$ through $t$. After scaling, masking, and softmax, the resulting weights mix the corresponding values:

$$\alpha_t=\operatorname{softmax}\left(\frac{q_tK_{1:t}^{\top}}{\sqrt{d_h}}+C_t\right),$$
$$o_t=\alpha_tV_{1:t}.$$

This pair of formulas states the reuse rule. A key remains useful because every future query may compare with it. A value remains useful because every future attention output may include some weighted contribution from it. An old query is different. Query $q_j$ was used to compute the attention output for destination position $j$. Future destination $t$ does not mix old queries; it creates $q_t$ from its own current layer state. Retaining $q_j$ would not help evaluate the displayed formula for $o_t$.

A useful address-and-content analogy can support the mathematics if its limits are kept visible. Keys provide learned matching coordinates, and values provide the learned content vectors that are mixed. A query describes the current destination’s matching coordinates. This is not a literal database: all three are dense learned projections, multiple heads operate in parallel, and the result passes through an output projection and residual addition.

Each transformer layer needs a separate cache because the same token position has different hidden states and projections at different depths. A key from layer 4 cannot generally replace the key for layer 17. Cache layouts therefore include a layer axis, a KV-head axis, a token-position axis, and a head-feature axis. Batch or request axes may surround them in an implementation.

Positional methods also matter. In architectures using rotary position encoding, rotation is commonly applied to queries and keys as part of attention. A runtime may cache keys after the relevant positional transformation. Other architectures and libraries can choose different layouts. The durable statement is not a particular byte order but the logical dependency: later queries require compatible earlier K and V representations at every layer.`,
      diagramIds: ['kv-not-query'],
    },
    {
      id: 'append-one-position',
      eyebrow: '3 · Cache growth',
      heading: 'Every processed generated token extends every layer’s cache by one position',
      body: String.raw`Let the prompt contain $S_0$ tokens after exact tokenization. Prefill produces K and V rows for positions $1$ through $S_0$ in every decoder layer. Suppose the model then selects one token. When that token is processed, each layer computes the new position’s K and V rows and appends them. The cached sequence length becomes $S_0+1$. After $g$ generated tokens have been processed through the stack, the cache represents $S_0+g$ positions.

The word row is conceptual. For one KV head, one token contributes a vector of length $d_h$ to K and another vector of length $d_h$ to V. With $N_{kv}$ KV heads, that position contributes $N_{kv}d_h$ scalars to each tensor at each layer. An implementation may store these dimensions in a different physical order, allocate memory in pages, reserve space in advance, or pack multiple requests together. Those choices do not change the logical quantity of stored K/V elements represented by the standard estimate.

The cache is append-like during ordinary left-to-right decoding because prior context is fixed. If an application edits an earlier token, the downstream prefix is no longer identical. The old cache beyond the compatible prefix cannot simply be treated as correct for the edited sequence. Similarly, switching to different model weights, an incompatible adapter, or incompatible positional treatment invalidates reuse. Cache compatibility is a property of the complete computation, not merely of a matching visible string.

Some models restrict attention to a sliding window. Once a position falls outside the permitted window, its K/V rows may no longer be required by later queries at that layer. Other systems use sinks, recurrent summaries, compressed attention state, or architecture-specific latent caches. The simple “one row forever” account describes standard full-context dense causal attention. It should be taught first and then bounded explicitly.

Beam search and speculative decoding complicate the lifecycle too. Several candidate continuations may share an exact prefix and then branch, causing systems to share, copy, or reference cache pages. Speculative verification can process more than one proposed token in a step. These serving strategies modify allocation and scheduling but retain the same evidence rule: a cached tensor is reusable only for positions whose computation is compatible with the current sequence and model configuration.`,
      diagramIds: ['prefill-decode-lifecycle', 'cache-growth-shape'],
    },
    {
      id: 'derive-memory',
      eyebrow: '4 · Memory mathematics',
      heading: 'The standard cache estimate is a product of five dimensions and one K-plus-V factor',
      body: String.raw`For one active sequence under standard dense attention, ignore allocator metadata and write the K tensor shape conceptually as

$$L\times N_{kv}\times S\times d_h.$$

Here $L$ is the number of decoder layers, $N_{kv}$ is the number of key/value heads per layer, $S$ is the number of cached token positions, and $d_h$ is the dimension of one key or value head. The number of K scalars is the product of those four dimensions. V has the same shape, so K and V together supply the factor two:

$$\text{scalar count}=2LN_{kv}Sd_h.$$

If each cached scalar occupies $b$ bytes, the estimated cache bytes are

$$B=2LN_{kv}Sd_hb.$$

Every factor is linear in this model. Holding everything else fixed, doubling sequence length doubles bytes. Doubling layer count doubles bytes. Doubling KV heads doubles bytes. Doubling head dimension doubles bytes. Changing from one byte to two bytes per cached scalar doubles bytes. This direct proportionality makes counterfactual reasoning possible before using a calculator.

The formula is per active sequence unless a batch factor is added. For $R$ independent requests with equal shapes and no sharing, an approximate total is $RB$. Real serving workloads contain different sequence lengths, reserved capacity, page fragmentation, temporary workspace, model weights, activations, and framework metadata. Therefore measured device memory will not equal this formula alone. The formula estimates payload for the standard K/V tensors, not total inference memory.

It also assumes the cache stores full per-head vectors with one uniform byte width. Quantized KV caches may use fewer data bytes plus scale or metadata overhead. Architectures with latent attention or compressed cache representations need a different dimensional derivation. Sliding-window layers replace total sequence length with the retained window after it fills. The correct habit is to derive memory from the actual cached tensor shapes rather than applying the memorized formula after its assumptions no longer hold.

Units deserve care. Memory vendors and user interfaces may use decimal gigabytes, where $1\text{ GB}=10^9$ bytes, or binary gibibytes, where $1\text{ GiB}=2^{30}=1{,}073{,}741{,}824$ bytes. The exact example in the next section equals one GiB. Calling it one GB is close in casual speech but not exact.`,
      diagramIds: ['cache-growth-shape'],
    },
    {
      id: 'exact-one-gibibyte',
      eyebrow: '5 · Worked calculation',
      heading: 'A realistic-looking configuration produces exactly one GiB per sequence',
      body: String.raw`Use the following educational configuration:

- layers: $L=32$;
- KV heads: $N_{kv}=8$;
- cached positions: $S=8192$;
- head dimension: $d_h=128$;
- bytes per cached scalar: $b=2$.

Substitution gives

$$B=2\cdot32\cdot8\cdot8192\cdot128\cdot2.$$

It is useful to calculate in interpretable stages. One token position contains K and V for eight heads:

$$2\cdot8\cdot128=2048\text{ scalars}.$$

At two bytes per scalar, that is $4096$ bytes per layer per token. Across $8192$ cached positions and $32$ layers,

$$4096\cdot8192\cdot32
=1{,}073{,}741{,}824\text{ bytes}
=1\text{ GiB}.$$

Now hold four factors fixed and change one at a time. Doubling context from $8192$ to $16384$ doubles the cache to $2$ GiB. Halving storage from two bytes to one byte per scalar halves it to $0.5$ GiB, before metadata for any quantization scheme. Increasing from two-byte storage to four-byte storage doubles it to $2$ GiB. If the architecture instead uses $32$ KV heads while query-head dimensions remain compatible, increasing $N_{kv}$ from $8$ to $32$ multiplies memory by four, producing $4$ GiB. Reducing from eight KV heads to one produces $1/8$ GiB, or $128$ MiB.

Counterfactuals combine multiplicatively. Doubling context and changing from two-byte to four-byte values multiplies memory by $2\cdot2=4$, so the result is $4$ GiB. Doubling context while halving bytes per scalar has multiplier $2\cdot0.5=1$, leaving the estimated payload at $1$ GiB. Increasing both context and KV-head count by four multiplies cache memory by sixteen.

These comparisons do not establish equal model quality or speed. Fewer KV heads are an architectural choice that can affect attention capacity and usually requires suitable training or conversion. Lower-precision cache storage can introduce numerical error and conversion overhead. A longer context may contain irrelevant information and causes additional attention work. The equation answers how the standard cache payload scales; it does not choose the best system design.`,
      diagramIds: ['cache-growth-shape', 'head-layouts'],
    },
    {
      id: 'mha-gqa-mqa',
      eyebrow: '6 · Architecture',
      heading: 'Query heads and KV heads need not have the same count',
      body: String.raw`In conventional multi-head attention, or MHA, each query head has a corresponding key head and value head. If a model has $N_q$ query heads, then typically $N_{kv}=N_q$. This gives every query head its own K/V projections, but it makes the cache grow with the full query-head count.

Multi-query attention, or MQA, uses many query heads with one shared key head and one shared value head. Therefore $N_{kv}=1$. Query heads can still ask different questions because their query projections differ, but they compare against and mix a shared K/V representation. In the standard cache formula this greatly reduces the KV-head factor.

Grouped-query attention, or GQA, lies between those designs. Several query heads share each KV head. For example, $32$ query heads and $8$ KV heads form groups of four query heads per KV head. The cache uses $N_{kv}=8$, not $32$, producing one quarter of the MHA cache payload when all other relevant dimensions and storage widths match.

The memory ratio for these layouts is simple only under controlled assumptions. If $d_h$, layer count, sequence length, and bytes per scalar are equal, cache memory is proportional to $N_{kv}$. Thus the example with $N_q=32$ gives relative factors $32$ for MHA, $8$ for eight-head GQA, and $1$ for MQA. Normalized to MHA, those are $1$, $1/4$, and $1/32$.

Architecture configuration must remain authoritative. Head dimension is often $d_{model}/N_q$, but not every architecture exposes or derives dimensions identically. Some layers can use local attention while others use global attention. Some models use latent compression rather than conventional K/V heads. A model name alone is not sufficient evidence for exact cache bytes; the layer count, attention configuration, numerical cache type, retained context, batch layout, and runtime behavior must be known.

GQA and MQA reduce cache size and memory bandwidth, which can improve decode throughput, but they do not make attention independent of sequence length. A new query still compares with the retained keys and mixes retained values. Head sharing changes how much K/V data is stored and moved; it does not eliminate the history axis.`,
      diagramIds: ['head-layouts'],
    },
    {
      id: 'work-that-remains',
      eyebrow: '7 · Performance limits',
      heading: 'Caching removes repeated projections, not the need to attend over history',
      body: String.raw`At decode position $t$, the model avoids recomputing K and V for positions $1$ through $t-1$. It still computes the new position’s layer states, query, key, and value. More importantly, each new query must compare against the available cached keys and use the resulting weights to mix cached values. For ordinary dense attention, the amount of history read by one decode step grows roughly linearly with cached sequence length.

This distinction separates cache memory from attention compute. Cache payload grows linearly with $S$ under the standard formula. The attention score work for one new query also grows with $S$. Across many successive decode steps, the total history processed accumulates: later tokens read longer prefixes than earlier tokens. Optimized kernels, batching, head sharing, quantization, and hardware can change constants and bottlenecks, but caching does not turn long-context attention into constant work.

Prefill has a different shape. A dense prefill over $S$ prompt positions considers a causal portion of an $S\times S$ score plane per head. Implementations such as memory-efficient exact attention avoid materializing the entire matrix in high-bandwidth memory, improving memory traffic and temporary allocation, but the mathematical dependencies remain. Sparse, local, or compressed attention changes those dependencies and must be analyzed separately.

Decode performance is often limited by moving model weights and cache data rather than by arithmetic alone. A smaller GQA cache can reduce data movement and allow more concurrent requests. Paged allocation can reduce waste and manage variable-length sequences. Prefix sharing can avoid duplicate payload for compatible shared prefixes. Offloading can expand capacity while adding transfer cost. These are systems trade-offs around the basic tensor lifecycle.

The cache also does not reduce the memory occupied by learned model weights. A server must budget weights, KV payload, temporary activations, allocator overhead, runtime workspaces, and concurrent batches. Saying that a model “fits” because its weights fit ignores request state. Conversely, a one-GiB per-sequence example does not imply every request immediately reserves exactly one GiB; runtimes allocate and page memory differently, and actual sequence lengths vary.`,
      diagramIds: ['prefill-decode-lifecycle', 'cache-growth-shape'],
    },
    {
      id: 'boundaries-and-provenance',
      eyebrow: '8 · Correct mental model',
      heading: 'A KV cache is temporary inference state, not knowledge or a saved conversation',
      body: String.raw`Learned weights persist across requests and encode the parameters produced by training. Ordinary generation reads those weights but does not change them. A KV cache is different: it contains prompt-dependent attention projections created by running one compatible sequence through those fixed weights. Clearing the cache does not erase learned knowledge. Retaining the cache does not teach the model a new fact.

Conversation memory is usually an application-level concept. A product may save message text, summaries, database records, files, or user preferences. To use that information in a later request, the application normally selects and supplies it again as context, after which the model creates new runtime states. Saving transcript text is not equivalent to preserving every layer’s K/V tensors, and preserving a KV cache is not a durable, searchable account of what happened.

Prefix caching is closer to KV reuse but still needs precise language. A serving system can sometimes reuse computed state for an identical or otherwise compatible prefix across requests. Compatibility can depend on token IDs, model and adapter weights, positional offsets, attention settings, and implementation details. Product documentation may also use prompt caching to describe billing or latency behavior without exposing the physical cache representation. Prefix reuse is an optimization for matching computation, not long-term semantic memory.

Provenance determines which statements the course can make. The one-GiB result is an exact educational calculation under the declared formula and dimensions. A live tokenizer can establish the exact prompt token count for a named tokenizer. A live serving runtime may report timing, cache allocation, numerical type, or architecture metadata. Unless the runtime exposes internal tensors or authoritative metrics, the course must not claim that Bonsai allocated the displayed byte count, used a particular head layout, or stored the illustrated values. An animation can show the general lifecycle while remaining labeled as an illustrative schematic.

The practical bridge is now complete. The language-model head chooses one token, the next decode step processes it, and the cache grows by one compatible position at every layer. The following training lesson asks a different question: how did the fixed projections and other parameters become useful before inference began? Cache entries are consequences of the current prompt under learned weights; gradients and optimization are what changed those weights during training.`,
      diagramIds: ['kv-not-query', 'head-layouts'],
    },
  ],
  diagrams: [
    {
      id: 'prefill-decode-lifecycle',
      title: 'Prefill once, then decode repeatedly',
      caption: 'Prefill creates prompt K/V rows at every layer. Each subsequent processed token creates one new row and uses the compatible history.',
      alt: 'A sequence diagram shows prompt prefill filling the cache, followed by repeated decode steps that read old keys and values and append a new pair.',
      kind: 'pipeline',
      provenance: 'illustrative schematic',
      chart: `sequenceDiagram
  participant P as Prompt tokens
  participant M as Decoder stack
  participant C as Layer KV caches
  participant D as Token decoder
  P->>M: Prefill all prompt positions
  M->>C: Store K and V for every prompt position
  M->>D: Next-token distribution
  D->>M: Process selected token on next step
  C-->>M: Reuse compatible earlier K and V
  M->>C: Append one new K/V row per layer
  M->>D: Following-token distribution`,
    },
    {
      id: 'kv-not-query',
      title: 'Why K and V remain useful but an old Q does not',
      caption: 'Every new destination creates its own query. That query compares with prior keys and mixes prior values; old queries already served their own destinations.',
      alt: 'A new query points to a shelf of old and new keys and values, while old queries end at their already-computed outputs.',
      kind: 'mechanism',
      provenance: 'illustrative schematic',
      chart: `flowchart LR
  QOLD["Old queries"] --> DONE["Old destination outputs already computed"]
  QNEW["New query q_t"] --> MATCH["Compare with K_1 through K_t"]
  KS["Cached keys K_1 through K_t-1"] --> MATCH
  KNEW["New key K_t"] --> MATCH
  MATCH --> W["Attention weights"]
  VS["Cached values V_1 through V_t-1"] --> MIX["Weighted value mixture"]
  VNEW["New value V_t"] --> MIX
  W --> MIX`,
    },
    {
      id: 'cache-growth-shape',
      title: 'Cache shape and linear memory factors',
      caption: 'K and V each contain one vector per layer, KV head, cached position, and head feature. Bytes multiply all dimensions.',
      alt: 'A tensor-shape flow derives two times layers times KV heads times sequence length times head dimension times bytes per scalar.',
      kind: 'shape',
      provenance: 'exact educational calculation',
      chart: `flowchart LR
  K["K shape\nL × N_kv × S × d_h"] --> TWO["K plus V\n× 2"]
  V["V has the same shape"] --> TWO
  TWO --> SCALARS["2 L N_kv S d_h scalars"]
  SCALARS --> BYTES["× b bytes per scalar"]
  BYTES --> RESULT["B = 2 L N_kv S d_h b"]
  RESULT --> EX["32, 8, 8192, 128, 2\n= 1 GiB"]`,
    },
    {
      id: 'head-layouts',
      title: 'MHA, GQA, and MQA store different numbers of KV heads',
      caption: 'For 32 query heads, MHA may store 32 KV heads, eight-head GQA shares one KV pair across four queries, and MQA stores one shared KV pair.',
      alt: 'Three attention layouts compare thirty-two independent KV heads, eight shared KV groups, and one KV head shared by all query heads.',
      kind: 'comparison',
      provenance: 'illustrative schematic',
      chart: `flowchart TB
  MHA["MHA\nN_q = 32, N_kv = 32\nrelative cache 1"]
  GQA["GQA\nN_q = 32, N_kv = 8\nrelative cache 1/4"]
  MQA["MQA\nN_q = 32, N_kv = 1\nrelative cache 1/32"]
  MHA --> NOTE["Same L, S, d_h, and b assumed"]
  GQA --> NOTE
  MQA --> NOTE`,
    },
  ],
  misconceptions: [
    {
      claim: 'The KV cache is the model’s long-term memory of a conversation.',
      whyPlausible: 'It persists information from earlier tokens while a response is generated, so the word memory sounds natural.',
      correction: 'It is temporary, prompt-dependent inference state. Durable conversation memory is normally saved by the surrounding application and supplied again as context.',
      diagnostic: 'Ask what happens after the cache is cleared. Learned weights remain unchanged, and saved conversation text may still exist outside the model.',
    },
    {
      claim: 'Old queries should be cached together with old keys and values.',
      whyPlausible: 'Q, K, and V are introduced as a symmetric trio and are computed by similar projections.',
      correction: 'An old query was used for its own destination output. A future destination creates a new query and needs prior keys for comparison and prior values for mixing.',
      diagnostic: 'Write $o_t=\operatorname{softmax}(q_tK_{1:t}^{\top})V_{1:t}$ and identify where $q_{t-1}$ appears. It does not.',
    },
    {
      claim: 'Selecting a token immediately appends all of its layer K/V rows.',
      whyPlausible: 'User interfaces show the token appearing before exposing the mechanics of the next forward step.',
      correction: 'The selected token’s layer-specific K/V rows are created when that token is processed through the stack on the following decode step.',
      diagnostic: 'Ask which layer hidden state would be used to create layer 20 K/V before the token has passed through layers 1 through 19.',
    },
    {
      claim: 'Caching makes the cost of each new token independent of context length.',
      whyPlausible: 'Descriptions often stop after saying that earlier projections are not recomputed.',
      correction: 'The new query still compares with retained keys and mixes retained values. Standard dense decode attention reads a history that grows with context.',
      diagnostic: 'Double cached positions while holding the new query fixed and count the dot products required for that query.',
    },
    {
      claim: 'KV-cache memory grows quadratically with context length.',
      whyPlausible: 'Dense attention score computation is associated with an $S\times S$ matrix during prefill.',
      correction: 'The standard stored K/V payload has one row per position and grows linearly with $S$. Dense attention compute and temporary score structures are separate quantities.',
      diagnostic: 'Inspect $B=2LN_{kv}Sd_hb$: sequence length occurs once, not squared.',
    },
    {
      claim: 'A smaller GQA or MQA cache is a free runtime switch for any trained MHA model.',
      whyPlausible: 'The memory formula suggests simply reducing $N_{kv}$.',
      correction: 'KV-head layout is an architectural property with learned projections. Conversion or retraining may be required, and quality and speed trade-offs depend on the model and runtime.',
      diagnostic: 'Ask where the missing MHA key/value projection weights and their learned behavior would go after changing the head count.',
    },
    {
      claim: 'The one-GiB educational calculation proves the live server allocates exactly one GiB.',
      whyPlausible: 'The dimensions look realistic and the arithmetic is exact.',
      correction: 'The result is exact under declared assumptions. Live allocation also depends on actual architecture, token count, numerical type, batching, paging, metadata, and runtime behavior.',
      diagnostic: 'Require authoritative live values for every factor and distinguish payload bytes from total allocated device memory.',
    },
  ],
  exercises: [
    {
      id: 'trace-first-two-steps',
      kind: 'trace',
      prompt: 'Trace the shared prompt through prefill, selection of “ tired”, and the following decode step. State exactly when the new K/V rows appear.',
      answer: 'Prefill processes all prompt tokens and fills each layer cache for those positions. The language-model head and decoder select “ tired”. On the following forward step, “ tired” passes through every layer, creates a new query plus one new K and V row at that layer, reads compatible earlier K/V, and appends its new K/V. The resulting final state scores the token after “ tired”.',
    },
    {
      id: 'explain-no-query-cache',
      kind: 'transfer',
      prompt: 'A teammate proposes storing every old query because storage should be symmetric across Q, K, and V. Give a formula-based response.',
      answer: 'For destination $t$, attention uses $q_tK_{1:t}^{\top}$ and mixes $V_{1:t}$. Earlier queries do not occur in the computation. Their destination outputs were already computed, whereas earlier K and V remain operands for future destinations.',
    },
    {
      id: 'calculate-one-gib',
      kind: 'calculate',
      prompt: 'Calculate cache payload for $L=32$, $N_{kv}=8$, $S=8192$, $d_h=128$, and $b=2$. Report bytes and GiB.',
      answer: '$2\cdot32\cdot8\cdot8192\cdot128\cdot2=1{,}073{,}741{,}824$ bytes. Dividing by $2^{30}$ gives exactly $1$ GiB for one sequence under the standard dense-cache assumptions.',
    },
    {
      id: 'counterfactual-factors',
      kind: 'predict',
      prompt: 'Starting from 1 GiB, double context, change two-byte cache storage to four bytes, and increase KV heads from 8 to 16. Predict the result before multiplying.',
      answer: 'Each change doubles one independent factor, so the combined multiplier is $2\cdot2\cdot2=8$. The estimated cache payload becomes $8$ GiB.',
    },
    {
      id: 'compare-head-layouts',
      kind: 'calculate',
      prompt: 'For 32 query heads, compare cache ratios for MHA with 32 KV heads, GQA with 8 KV heads, and MQA with 1 KV head. Hold all other factors equal.',
      answer: 'Memory is proportional to $N_{kv}$. Relative to MHA, GQA is $8/32=1/4$ and MQA is $1/32$. If the MHA cache is 4 GiB, the corresponding payloads are 1 GiB and 128 MiB under equal remaining assumptions.',
    },
    {
      id: 'debug-quadratic-claim',
      kind: 'debug',
      prompt: 'A dashboard description says, “KV cache is quadratic because attention is quadratic.” Repair the statement without denying dense-attention cost.',
      answer: 'The stored standard K/V payload grows linearly with cached positions because it stores one K row and one V row per position, layer, and KV head. Dense prefill attention has pairwise $S\times S$ dependencies, and one decode query still reads $S$ cached positions. Cache memory and attention computation should be reported separately.',
    },
    {
      id: 'classify-four-kinds-of-memory',
      kind: 'transfer',
      prompt: 'Classify model weights, active-request KV tensors, saved chat text, and a compatible shared prefix cache by lifetime and purpose.',
      answer: 'Weights are learned parameters reused across requests. Active-request KV tensors are prompt-dependent projections used by future attention steps. Saved chat text is durable application data that can be selected and supplied again. A compatible prefix cache reuses computed inference state for matching prefixes; it is an optimization and does not teach the weights.',
    },
  ],
  glossary: [
    { term: 'Prefill', definition: 'The phase that processes prompt tokens and creates their layer-by-layer attention state before the first generated token.' },
    { term: 'Decode step', definition: 'A forward step that processes a newly selected token position and produces the distribution for the following token.' },
    { term: 'KV cache', definition: 'Stored key and value projections for compatible earlier positions at every attention layer.' },
    { term: 'Query', definition: 'The current destination position’s learned projection used to score available keys.' },
    { term: 'Key', definition: 'A learned projection retained so current and future queries can compute matching scores.' },
    { term: 'Value', definition: 'A learned projection retained so attention weights can mix information from a source position.' },
    { term: 'KV head', definition: 'One key/value projection group; its count may equal or be smaller than the number of query heads.' },
    { term: 'MHA', definition: 'Multi-head attention in which query heads conventionally have separate corresponding key and value heads.' },
    { term: 'GQA', definition: 'Grouped-query attention in which groups of query heads share each key/value head.' },
    { term: 'MQA', definition: 'Multi-query attention in which many query heads share one key head and one value head.' },
    { term: 'Head dimension', definition: 'The feature length $d_h$ of one query, key, or value head vector.' },
    { term: 'Prefix cache', definition: 'Reusable computed state for an identical or otherwise compatible beginning of a sequence.' },
    { term: 'GiB', definition: 'A binary gibibyte equal to $2^{30}$ or $1{,}073{,}741{,}824$ bytes.' },
    { term: 'Cache provenance', definition: 'Evidence identifying whether a cache value or metric comes from declared teaching data, architecture metadata, or an observed runtime.' },
  ],
} satisfies CourseTheoryChapter;
