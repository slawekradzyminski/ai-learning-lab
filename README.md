# AI Learning Lab

A standalone, instructor-friendly application for practical AI training. It contains 19 interactive labs, two presentation decks, and researched companion guides covering language models and AI agent systems.

The lab is intentionally independent of the e-commerce demo that originally hosted it. Guided exercises run entirely in the browser. Tokenization can use the pinned Bonsai base tokenizer. The next-token, token-count, and embedding exercises can additionally call the awesome-localstack backend when a live runtime is available.

## Learning design

- **Practical first:** begin with a user goal, inspect the mechanism, try it, and verify an observable outcome.
- **Agents without a math tax:** the primary agent course focuses on product decisions, context, boundaries, recovery, and evaluation. Equations are not required to follow the course.
- **Focused LLM mathematics:** equations remain where they explain a concrete model mechanism such as attention, loss, or gradient flow.
- **Guided and live modes:** deterministic browser exercises make workshops reliable; selected labs can use Bonsai or another configured model.
- **Source-backed:** theory guides link to primary papers, official Codex and Claude Code documentation, security guidance, and [The Welch Labs Illustrated Guide to AI](https://www.welchlabs.com/).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:8083/learn/](http://localhost:8083/learn/).

Useful checks:

```bash
npm test
npm run build
```

## Live runtime configuration

Copy `.env.example` to `.env.local` when the live exercises should use a separately hosted backend:

```dotenv
VITE_AI_API_BASE_URL=http://localhost:8080
VITE_DEFAULT_OLLAMA_MODEL=hf.co/prism-ml/Bonsai-27B-gguf:Q1_0
```

When the app is served through the awesome-localstack gateway, leave `VITE_AI_API_BASE_URL` empty. Requests then use the same origin at `/api/v1/ollama/learning/*`. Authentication and public-demo policy belong at the gateway/backend boundary; credentials are never compiled into the browser bundle. Guided modes remain available if live endpoints are unavailable.

## Docker

```bash
docker build -t ai-learning-lab:local .
docker run --rm -p 8083:80 ai-learning-lab:local
```

The image supports both direct `/learn/` access and gateway access where the `/learn/` prefix is stripped before proxying.

## Repository boundary

- `src/features/learning/` contains the curriculum, labs, slides, theory, and tests.
- `src/lib/api.ts` is the deliberately small live-runtime adapter.
- `public/learning-models/bonsai-tokenizer/` pins the browser tokenizer assets and provenance.
- `nginx/default.conf` provides SPA routing and immutable asset caching.

The public route contract is `/learn/`, so existing training links continue to work when awesome-localstack sends that path to this service.
