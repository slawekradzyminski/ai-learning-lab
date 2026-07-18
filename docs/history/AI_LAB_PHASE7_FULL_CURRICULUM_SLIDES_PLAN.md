# AI Lab Phase 7 - Full Curriculum Instructor Slides

## Goal

Expand the instructor deck from a learning-foundations sequence into a complete narrative for all eleven AI Lab exercises:

1. Tokenization
2. Attention
3. Next Token
4. KV Cache
5. Semantic Embeddings
6. Perceptron
7. Gradient Descent
8. Backpropagation
9. Depth
10. Convolution
11. Digit CNN

The deck must remain a web-native part of the existing React application and support the workshop rhythm:

```text
story and theory -> prediction -> practical exercise -> debrief -> next chapter
```

## Narrative model derived from the book

The Welch Labs Guide repeatedly uses a strong pedagogical cadence without treating modern AI as a list of definitions:

1. **Start with tension.** Open on a surprising modern behavior, a historical disagreement, or a concrete question.
2. **Make one example visible.** Replace the large system with the smallest example that still contains the real mechanism.
3. **Trace the mechanism.** Follow real or inspectable values through the computation instead of hiding behind terminology.
4. **Ask before explaining.** Give the learner a prediction, hand calculation, or interpretation task before revealing the result.
5. **Return to the large system.** State why the small example matters for current models.
6. **Name the limitation.** Distinguish what the example demonstrates from what it cannot justify.

The deck will follow this cadence with original wording and original diagrams. It will not copy book prose or figures.

## Visual thesis

A dark technical blackboard becomes a sequence of illuminated mechanisms: one dominant diagram, one question, and one conclusion per slide. Cyan remains the computational signal; amber marks uncertainty, prediction, and exercise handoffs.

## Content plan

- one opening slide explaining the workshop contract;
- one track introduction before each of the three curriculum tracks;
- four slides for every lab:
  - **Hook** - concrete puzzle or historical tension;
  - **Mechanism** - one inspectable trace;
  - **Exercise** - tasks and a new-tab handoff to the real lab;
  - **Debrief** - takeaway, limitation, and bridge forward;
- one closing synthesis slide.

This produces 49 slides:

```text
1 opening
3 track introductions
11 labs x 4 slides
1 closing synthesis
= 49 slides
```

## Interaction thesis

- keyboard and URL navigation preserve presenter flow;
- the overview groups slides by track and lab instead of presenting one flat list;
- exercise links open in new tabs so the deck remains parked on the handoff slide;
- deck-only fullscreen removes application chrome during presentation;
- instructor notes provide questions and debrief prompts;
- short slide entrance and progress transitions reinforce chapter changes, with reduced-motion support.

## Slide map

| Slides | Chapter |
| --- | --- |
| 1 | Opening |
| 2 | Track A - Language model inference |
| 3-6 | Tokenization |
| 7-10 | Attention |
| 11-14 | Next Token |
| 15-18 | KV Cache |
| 19 | Track B - Semantic systems |
| 20-23 | Semantic Embeddings |
| 24 | Track C - Neural and vision |
| 25-28 | Perceptron |
| 29-32 | Gradient Descent |
| 33-36 | Backpropagation |
| 37-40 | Depth |
| 41-44 | Convolution |
| 45-48 | Digit CNN |
| 49 | Closing synthesis |

Exercise handoff slides are therefore `5, 9, 13, 17, 22, 27, 31, 35, 39, 43, 47`.

## Content boundaries

- Guided calculations must remain explicitly inspectable or mocked.
- Live Bonsai/Ollama output must retain its provenance and must never be presented as hidden model internals.
- The embeddings lab remains a separate semantic pipeline, not an intermediate Bonsai activation.
- Attention patterns remain evidence of information routing, not proof of human-readable reasoning.
- The two-parameter gradient surface remains an educational slice, not a literal view of a billion-dimensional model.
- Handcrafted XOR features demonstrate composition; they do not claim that real networks receive those features by hand.
- The Digit CNN demonstrates local inference on its training distribution, not general visual understanding.

## Architecture

- Keep the presenter shell in `TrainingSlidesPage.tsx`.
- Move curriculum content into a typed `trainingSlideCatalog.tsx`.
- Generate each lab chapter from one narrative definition while keeping a unique visual for every concept.
- Export slide metadata and exercise-slide mappings for focused structural tests and lab return links.
- Keep all slide content in HTML, SVG, CSS, and React; no third-party slide framework.

## Verification

1. Structural test proves all eleven labs have contiguous Hook -> Mechanism -> Exercise -> Debrief slides.
2. Structural test proves every exercise route opens in a new tab and every exercise slide mapping is stable.
3. Presenter tests cover URL state, keyboard navigation, notes, grouped overview, and representative exercise links.
4. Existing lab tests are updated where deck return-slide numbers change.
5. Run the complete frontend test suite, lint, build, and `git diff --check`.
6. Browser QA the opening, each track introduction, every exercise handoff, and representative hook/mechanism/debrief slides at desktop size.
7. Browser QA all slide types at `390x844` and verify no document-level horizontal overflow.
8. Verify deck-only fullscreen and zero console errors or warnings.

## Out of scope

- adding new practical labs;
- duplicating every book exercise;
- copying book illustrations or prose;
- backend, container, or deployment changes.

## Completion evidence

Implemented on 2026-07-17 in the existing Vite/React frontend.

Delivered:

- a 49-slide instructor deck covering all eleven AI Lab exercises;
- three track introductions and one four-beat chapter for every lab: Question -> Mechanism -> Exercise -> Debrief;
- original HTML/CSS/SVG visuals for token pieces, attention routing, token probabilities, KV cache growth, embedding geometry, a perceptron, a loss surface, forward/backward gradient flow, XOR, convolution, and digit classification;
- exercise instructions tied to the actual controls and checkpoints in each current lab;
- eleven new-tab handoffs at slides `5, 9, 13, 17, 22, 27, 31, 35, 39, 43, 47`;
- a grouped 49-button overview organized into three tracks and eleven lab chapters;
- stable URL, keyboard, notes, progress, mobile, and deck-only fullscreen behavior;
- updated return-slide links for Gradient Descent, Backpropagation, and Depth;
- a deterministic completion step in the pre-existing Admin Product deletion-state test, removing a full-suite asynchronous teardown race exposed during verification.

Automated verification:

```text
npm test       87 files passed, 530 tests passed, zero unhandled errors
npm run lint   passed with zero errors or warnings
npm run build  passed (Vite production build)
git diff --check passed in frontend and orchestration repositories
```

Authenticated browser QA:

- desktop `1440x1000`: all 49 slides traversed in deck-only fullscreen with zero clipping or horizontal overflow;
- mobile `390x844`: all 49 slides traversed with document, body, and slide content widths constrained to the viewport;
- overview verified with three track groups, eleven lab groups, and 49 unique jump targets;
- first and last exercise handoffs verified to open a second tab while the deck retained slides 5 and 47;
- distinct hook visuals, track maps, mechanism traces, exercise handoffs, debrief layout, notes, keyboard navigation, URL state, and fullscreen verified visually;
- browser console: zero errors and zero warnings on a clean full-deck run.

No backend, container, deployment, or infrastructure changes were made.
