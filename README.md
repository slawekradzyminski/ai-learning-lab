# AI Learning Lab

A standalone, instructor-friendly application for practical AI training. Its canonical ten-lesson LLM course follows one sentence through a transformer, while its canonical eight-lesson AI Agents course follows one bounded research goal through a controlled runtime. Nineteen standalone labs, two presentation decks, and researched companion guides provide additional practice.

See the exact migrated inventory in [`docs/CONTENT_INVENTORY.md`](docs/CONTENT_INVENTORY.md). The application also exposes complete materials indexes at `/learn/how-llm-works/materials` and `/learn/how-ai-agent-works/materials`.

The lab is intentionally independent of the e-commerce demo that originally hosted it. Guided exercises run entirely in the browser. Tokenization can use the pinned Bonsai base tokenizer. The next-token, token-count, and embedding exercises can additionally call the awesome-localstack backend when a live runtime is available.

## Learning design

- **One coherent LLM journey:** ten lessons reuse the sentence `The animal did not cross the street because it was too`, showing how its representation changes from text to tokens, vectors, contextual states, and a next-token distribution.
- **One coherent agent journey:** eight lessons reuse a laptop-research task, showing how a goal becomes selected context, model proposals, policy decisions, bounded effects, evidence, a verified stop, and repeated evaluation.
- **One learner flow:** experiment, visible plain-language explanation, misconception, checkpoint, and forward bridge stay in one coherent sequence; notation and annotated sources remain optional.
- **Practical first:** begin with a user goal, inspect the mechanism, try it, and verify an observable outcome.
- **Agents without a math tax:** the primary agent course focuses on product decisions, context, boundaries, recovery, and evaluation. Equations are not required to follow the course.
- **Focused LLM mathematics:** equations remain where they explain a concrete model mechanism such as attention, loss, or gradient flow.
- **Guided and live modes:** deterministic browser exercises make workshops reliable; selected labs can use Bonsai or another configured model.
- **Authenticated platform surface:** `/learn/*` uses the existing awesome-localstack local-storage session and login return flow; it does not introduce a second cookie-based auth system.
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
npm run test:e2e
npm run build
npm run audit:extraction
```

## Live runtime configuration

Copy `.env.example` to `.env.local` when the live exercises should use a separately hosted backend:

```dotenv
VITE_AI_API_BASE_URL=http://localhost:8080
VITE_DEFAULT_OLLAMA_MODEL=hf.co/prism-ml/Bonsai-27B-gguf:Q1_0
```

When the app is served through the awesome-localstack gateway, leave `VITE_AI_API_BASE_URL` empty. Requests then use the same origin at `/api/v1/ollama/learning/*`. The Lab validates the platform session through `/api/v1/users/me`; anonymous deep links move to the commerce login with a safe `returnTo`, then return to the original Lab route after sign-in. The existing JWT and refresh-token keys remain in `localStorage`, and credentials are never compiled into the browser bundle. Guided modes remain available if live endpoints are unavailable.

Run the opt-in browser check against a full stack with real Bonsai:

```bash
E2E_BASE_URL=http://localhost:8081 \
E2E_REAL_BONSAI=1 \
npx playwright test e2e/real-bonsai.spec.ts --reporter=list
```

This covers anonymous routing, login return navigation, offline mock mode, live logprobs, and switching back to offline mode.

## Docker

```bash
docker build -t ai-learning-lab:local .
docker run --rm -p 8083:80 ai-learning-lab:local
```

The image supports both direct `/learn/` access and gateway access where the `/learn/` prefix is stripped before proxying.

## Repository boundary

- `src/features/learning/` contains the curriculum, labs, slides, theory, and tests.
- `docs/CONTENT_INVENTORY.md` records the complete content and host-binding replacement contract.
- `docs/history/` preserves the Phase 4–7 implementation plans that led to the current curriculum.
- `src/lib/api.ts` is the deliberately small live-runtime adapter.
- `public/learning-models/bonsai-tokenizer/` pins the browser tokenizer assets and provenance.
- `nginx/default.conf` provides SPA routing and immutable asset caching.

The public route contract is `/learn/`, so existing training links continue to work when awesome-localstack sends that path to this service.
