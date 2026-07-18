# AI Learning Lab — Phase 4 implementation plan

## Goal

Reshape the AI Learning Lab around two coherent learning tracks and add the missing language-model foundations before next-token prediction:

```text
Language models
Tokenization → Embeddings → Next token → KV cache

Neural networks and vision
Perceptron → Convolution → Digit CNN
```

The new tokenization and embedding labs must each work as a deterministic guided exercise and as an explicitly model-backed local exercise. No live failure may silently substitute guided data.

## Data-source boundaries

### Tokenization

- **Guided example:** a small, inspectable teaching tokenizer exposes word/punctuation splitting, illustrative subword boundaries, stable teaching IDs, characters, and UTF-8 bytes. It is never labelled as Bonsai output.
- **Bonsai tokenizer:** the frontend loads the matching `Qwen/Qwen3.6-27B` tokenizer assets locally and runs the Hugging Face pure TypeScript tokenizer in the browser. The assets are fetched reproducibly and record their source revision and SHA-256 digests.
- **Verify with Bonsai:** an authenticated Spring endpoint performs one raw, one-token Bonsai generation and returns Ollama's `prompt_eval_count`. The lab compares that runtime count with the browser tokenizer count and displays the generated continuation token as evidence of a real model call.

Tokenization is deterministic and does not require GPU inference. Exact tokenizer work therefore belongs in the browser; the Ollama call is a verification boundary, not the source of the token visualization.

### Embeddings

- **Guided example:** compact four-dimensional teaching vectors make cosine similarity calculable by hand.
- **Live local model:** an authenticated Spring endpoint calls Ollama `/api/embed` using `embeddinggemma` and returns validated vectors in a stable application response.
- The frontend computes cosine similarity and a deterministic two-dimensional projection for visualization.
- The lab explicitly distinguishes semantic text embeddings from Bonsai's internal token embeddings. Bonsai remains the generation model; `embeddinggemma` is the dedicated semantic embedding model.

## Backend API

Add two authenticated, rate-limited endpoints under the existing Ollama controller:

```text
POST /api/v1/ollama/learning/token-count
POST /api/v1/ollama/learning/embeddings
```

Token-count request:

```json
{
  "model": "hf.co/prism-ml/Bonsai-27B-gguf:Q1_0",
  "prompt": "Tokenization turns text into pieces."
}
```

Token-count response:

```json
{
  "source": "ollama-live",
  "modelLabel": "hf.co/prism-ml/Bonsai-27B-gguf:Q1_0",
  "prompt": "Tokenization turns text into pieces.",
  "promptTokenCount": 7,
  "generatedToken": " It"
}
```

Embedding request:

```json
{
  "model": "embeddinggemma",
  "inputs": [
    "A puppy is playing outside.",
    "A dog runs through the park.",
    "The database migration failed."
  ]
}
```

Embedding response contains the application source, exact model label, dimensions, total prompt token count, and one finite vector per input.

Validation:

- model: nonblank, at most 200 characters;
- tokenization prompt: nonblank, at most 2,000 characters;
- embeddings: 2–8 nonblank inputs, each at most 500 characters, at most 2,000 characters total;
- upstream vectors must be nonempty, finite, equal-length, and match the request count;
- missing prompt token counts or invalid vectors return a useful `422` response;
- existing authentication, upstream error translation, and Ollama rate limiting apply.

## Frontend routes

Add:

```text
/learn/tokenization
/learn/embeddings
```

### Tokenization lab acceptance

- Guided and Bonsai tokenizer modes are explicit.
- Editable text updates the visualization without network work.
- Each token shows display form, ID, ordinal position, and a character/byte detail.
- Whitespace, newline, emoji, Polish characters, and code are available as examples.
- Bonsai assets load only when the model-backed mode is requested.
- Runtime verification reports loading, success, mismatch, and failure states without replacing token data.
- The page explains context-window cost and links conceptually to next-token prediction.

### Embedding lab acceptance

- Guided and live modes are explicit.
- Students can select a text, inspect its vector dimensions, compare cosine similarities, and view a two-dimensional semantic map.
- Live mode accepts 2–8 newline-separated inputs and a model name.
- Projection and similarity math are pure, tested TypeScript outside React.
- Live provenance, dimensions, and prompt token count are visible.
- The page explains projection loss and why generation and embedding models may differ.

## Navigation and presentation

- The overview becomes two tracks rather than one artificial seven-step sequence.
- The language track begins with tokenization and embeddings.
- The sub-navigation keeps all seven labs accessible and horizontally scrollable on small screens.
- The existing dark graphite, white, and sky-blue technical-workbench language remains, with token and embedding visuals acting as the primary anchors.

## Deployment integration

- The custom Ollama image pre-pulls `embeddinggemma` as its default extra model alongside Bonsai.
- Tokenizer assets ship with the frontend and are loaded only by the tokenization route.
- No image build, registry push, Compose start, Ansible run, or production deployment is performed.

## Verification

1. Verify tokenizer source files and hashes, then compare representative tokenization with the upstream tokenizer library.
2. Run focused tokenizer, embedding math, hooks, pages, catalog, and route tests.
3. Run focused Spring parser/controller/validation/failure tests.
4. Run complete frontend and backend suites, frontend lint/build, backend fast verify, and `git diff --check` in all touched repositories.
5. Run authenticated Playwright checks for both guided modes, mocked successful live modes, explicit live failure behavior, and 390 px overflow/console health.
6. Record completion evidence here.

## References

- [Ollama generate API](https://docs.ollama.com/api/generate)
- [Ollama embed API](https://docs.ollama.com/api/embed)
- [Ollama embedding guide](https://docs.ollama.com/capabilities/embeddings)
- [Bonsai 27B model card](https://huggingface.co/prism-ml/Bonsai-27B-gguf)
- [Qwen 3.6 27B tokenizer source](https://huggingface.co/Qwen/Qwen3.6-27B)

## Completion evidence — 2026-07-17

Phase 4 is implemented locally across the frontend, backend, and orchestration repositories.

### Delivered

- The overview now presents two tracks and seven labs, with Tokenization and Embeddings before Next Token and KV Cache.
- `/learn/tokenization` includes the guided tokenizer, six edge-case presets, selectable token details, the exact pinned Qwen tokenizer used by Bonsai, and an authenticated Bonsai runtime count check.
- `/learn/embeddings` includes guided four-dimensional vectors, selectable projection points, vector bars, a cosine-similarity matrix, and live local embeddings through `embeddinggemma`.
- Live requests never fall back to guided fixtures. An unavailable Ollama runtime returns `503` with a useful start-the-service message.
- The custom Ollama image defaults `OLLAMA_EXTRA_MODELS` to `embeddinggemma`; native setup documentation pulls it alongside Bonsai.

### Reproducibility

- Tokenizer source: `Qwen/Qwen3.6-27B` at revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`.
- `tokenizer.json`: 12,807,982 bytes, SHA-256 `5f9e4d4901a92b997e463c1f46055088b6cca5ca61a6522d1b9f64c4bb81cb42`.
- `tokenizer_config.json`: 16,718 bytes, SHA-256 `5186f0defcd7f232382c7f0aebcd2252d073bb921ab240e407b7ae8745d2b29b`.
- The tokenizer engine is emitted as a separate lazy browser chunk; the vocabulary JSON is requested only after selecting Bonsai mode.

### Automated verification

- Frontend clean install: 0 audit vulnerabilities.
- Frontend unit/component suite: 77 files, 490 tests passed.
- Frontend ESLint: passed with no warnings.
- Frontend TypeScript and production Vite build: passed.
- Backend fast verify: 412 tests passed; build succeeded.
- Spring learning controller coverage includes authentication, request validation, exact upstream shapes, successful parsing, invalid upstream responses, and missing-runtime behavior.
- `git diff --check`: passed in all three repositories.

### Browser verification

- Guided tokenization: 11 transparent teaching tokens for the default text, with explicit non-Bonsai provenance.
- Exact Bonsai tokenization: 7 tokens with IDs `3214, 1954, 10263, 1414, 1083, 9378, 13`.
- Missing Ollama: both labs retained their live state and displayed the explicit `503` message without fixture substitution.
- Mocked Bonsai verification: browser and runtime counts matched at 7 and displayed generated evidence.
- Mocked live embeddings: rendered three 6D vectors, a projection, cosine similarities, model provenance, and 19 prompt tokens.
- Fresh guided-page console check: 0 errors and 0 warnings.
- Tokenization and Embeddings at 390×844: document and body scroll widths both equalled the 390 px viewport.

The feature frontend and backend remain running locally on `http://localhost:8083` and `http://localhost:4001`. No Ollama image was built or pushed, and no production deployment was performed.
