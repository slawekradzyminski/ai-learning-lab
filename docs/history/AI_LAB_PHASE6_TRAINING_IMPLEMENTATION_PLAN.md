# AI Learning Lab - Phase 6 training implementation plan

## Goal

Add the missing learning sequence after the Perceptron:

```text
Perceptron -> Gradient Descent -> Backpropagation -> Depth -> Convolution -> Digit CNN
```

Deliver the sequence in two coordinated forms:

1. three practical, mathematically exact browser labs;
2. a web-native instructor slide deck that alternates theory, discussion, practical exercise, and return-to-theory moments.

The slides are implemented in the existing React/TypeScript frontend and rendered as HTML plus JavaScript. This keeps the entire workshop in the single deployable training project while providing keyboard navigation, deep links, full-screen presentation, instructor notes, and direct links to the practical labs.

## Book-derived teaching principles

The original teaching sequence is informed by *The Welch Labs Illustrated Guide to AI*, especially Chapters 2-4:

- begin from a concrete prediction and measurable error;
- visualize a loss landscape without claiming that a two-dimensional slice fully describes a large model;
- distinguish numerical slope estimates from analytic gradients;
- treat gradient descent as a repeated local update, not a magical optimizer;
- make backpropagation a chain of local derivatives and explicit credit assignment;
- use XOR to show the geometric limitation of one linear boundary;
- explain depth as learned composition and representation change;
- repeatedly move from prediction to calculation to reflection, as the book exercises do.

The deck also references our existing work:

- Perceptron: an update rule and the XOR limitation;
- Next Token: cross-entropy as a training signal;
- Attention: intermediate activations and composed transformations;
- Convolution and Digit CNN: learned features composed through deeper layers.

No book artwork, exercise text, or substantial prose is reproduced. All examples, calculations, diagrams, prompts, and slide copy are original.

## Visual and interaction direction

### Visual thesis

A chalkboard control room: near-black presentation canvases, crisp white type, sky-blue mathematical signals, and one dominant diagram per slide.

### Content plan

1. Opening: the full prediction-to-learning loop.
2. Gradient descent theory: loss, landscape, gradient, and learning rate.
3. Gradient descent practical break.
4. Language-model bridge: per-token cross-entropy.
5. Backpropagation theory: forward values, local derivatives, and chain rule.
6. Backpropagation practical break.
7. Depth theory: XOR, representation change, and composition.
8. Depth practical break.
9. Return to our Attention, Convolution, and Digit CNN labs.
10. Recap and instructor discussion.

### Interaction thesis

- left/right arrows, space, Home, and End move through the talk with a clear progress transition;
- each slide enters with a short hierarchy-preserving reveal and reduced-motion support;
- exercise slides use one dominant action that opens the lab in a new tab, preserving slide state;
- instructor notes are hidden by default and toggled without changing audience content;
- the current slide is encoded in the URL so a teaching segment can be bookmarked.

## Practical lab 1: Gradient Descent

Route:

```text
/learn/gradient-descent
```

Use a real two-parameter linear regression model over a small visible dataset:

```text
prediction = wx + b
loss = mean((prediction - target)^2)
dw = mean(2(prediction - target)x)
db = mean(2(prediction - target))
w <- w - learningRate * dw
b <- b - learningRate * db
```

Interactions and theory:

- plot the samples and current prediction line;
- render a contour-map slice over `w` and `b`, with the current point and complete step trajectory;
- expose prediction, residual, squared error, and gradient contribution for every sample;
- step once, run ten steps, and reset;
- provide useful, slow, and unstable learning-rate presets;
- compare analytic gradients with central finite differences;
- include a predict-before-reveal question about update direction;
- state that a two-parameter convex surface is an inspectable teaching case, not the geometry of a frontier model.

## Practical lab 2: Backpropagation

Route:

```text
/learn/backpropagation
```

Use a one-hidden-neuron computation graph:

```text
z1 = w1*x + b1
h = ReLU(z1)
z2 = w2*h + b2
prediction = sigmoid(z2)
loss = binaryCrossEntropy(prediction, target)
```

Interactions and theory:

- move through forward pass, loss, backward pass, and update stages;
- select nodes to inspect value, local derivative, upstream gradient, and resulting parameter gradient;
- show `dL/dz2 = prediction - target` and propagate it through multiplication and ReLU;
- step the parameters and show before/after loss;
- switch between active and inactive ReLU examples to make zero-gradient behavior visible;
- compare the analytic gradient with a numerical estimate;
- include a predict-before-reveal question about where gradient flow stops.

## Practical lab 3: Depth

Route:

```text
/learn/depth
```

Use a transparent two-hidden-feature XOR network:

```text
hOR  = step(x1 + x2 - 0.5)
hAND = step(x1 + x2 - 1.5)
output = step(hOR - 2*hAND - 0.5)
```

Interactions and theory:

- select all four XOR inputs and inspect every hidden activation;
- compare the inseparable input plane with the hidden representation;
- toggle a shallow linear boundary and the composed two-layer solution;
- show how the first layer creates reusable OR and AND features and the second layer separates them;
- include a predict-before-reveal question for one input;
- clearly state that the hard step functions and handcrafted weights are an inspectable construction, while trainable networks normally use differentiable activations and learned weights.

## Instructor slide deck

Route:

```text
/learn/training-slides
```

Requirements:

- 13-16 slides with a deliberate alternation of theory, reflection, and practice;
- semantic HTML headings and buttons;
- keyboard, clickable, and URL-based navigation;
- slide counter and progress indicator;
- full-screen action when the browser supports it;
- instructor-notes toggle and presenter cues;
- overview/jump menu;
- exercise buttons open the matching labs in a new tab;
- links to Perceptron, Next Token, Attention, Convolution, and Digit CNN;
- mobile fallback remains readable, although desktop presentation is the primary mode;
- no dependency on a third-party slide framework.

## Curriculum integration

- Extend the neural-and-vision track to six labs in the stated learning order.
- Keep the language-inference and semantic tracks unchanged.
- Add a prominent `Open instructor slides` action to the AI Lab overview.
- Extend catalog, protected routes, sub-navigation, numbering, tests, and overview copy from eight to eleven labs.
- Keep the slide deck out of the numbered student lab count because it orchestrates the labs rather than adding a separate concept.

## Architecture

- All teaching math lives in pure TypeScript outside React.
- React manages interaction, navigation, and presentation only.
- Calculation code retains full precision; rounding happens only in display helpers.
- No backend is required.
- No live-model data is represented as an internal gradient, activation, or parameter trace.

## Verification

1. Unit-test regression loss, analytic and numerical gradients, update steps, divergence behavior, backprop forward/backward values, finite-difference checks, inactive ReLU behavior, and XOR truth-table behavior.
2. Component-test all three labs, predict-before-reveal checkpoints, slide keyboard navigation, URL state, notes, jump menu, and exercise links.
3. Update overview, catalog, layout, and routing tests for eleven labs and the unnumbered deck.
4. Run the complete frontend suite, ESLint, TypeScript/Vite build, and `git diff --check`.
5. Run authenticated browser QA for the deck and each lab at 1440x1000 and 390x844.
6. Verify no document overflow, zero console errors/warnings, keyboard operation, exercise return flow, and full-screen graceful fallback.
7. Record completion evidence in this file.

## Out of scope

- training Bonsai or the Digit CNN during a workshop;
- claiming that the two-parameter landscape is a faithful view of a high-dimensional LLM loss surface;
- exposing unavailable Ollama gradients or activations;
- copying book figures or prose;
- production deployment, container builds, or infrastructure changes.

## Completion evidence

Implemented on 2026-07-17 in the existing Vite/React frontend, with no backend or infrastructure changes.

Delivered:

- pure TypeScript training math for exact two-parameter MSE gradient descent, numerical finite differences, a one-hidden-ReLU backpropagation graph, and a transparent two-layer XOR construction;
- `/learn/gradient-descent`, `/learn/backpropagation`, and `/learn/depth` practical labs with predict-before-reveal checkpoints and return links into the instructor sequence;
- `/learn/training-slides?slide=1`, a 15-slide web-native instructor deck with URL and keyboard navigation, presenter notes, overview, progress, deck-only fullscreen, and new-tab exercise handoffs;
- theory-to-practice bridges to the existing Perceptron, Next Token, Attention, Convolution, and Digit CNN labs;
- an eleven-lab curriculum catalog and a prominent instructor-deck action on the AI Lab overview;
- automatic horizontal positioning of the active curriculum item for later labs.

Automated verification:

```text
npm test       86 files passed, 527 tests passed
npm run lint   passed with zero errors or warnings
npm run build  passed (Vite production build)
git diff --check passed in frontend and orchestration repositories
```

Authenticated browser QA:

- desktop `1440x1000`: overview, slides, exercise handoff tabs, all three lab workspaces, notes, overview jump, keyboard navigation, URL state, and deck-only fullscreen verified;
- mobile `390x844`: slides and all three labs verified with document and body widths equal to the viewport (no document-level horizontal overflow);
- Gradient Descent: one useful step reduced loss `17.167 → 7.632`; the unstable preset reached `345.038` after ten steps;
- Backpropagation: analytic and numerical gradients matched, inactive ReLU produced zero first-layer gradients, and one active update reduced loss `0.3529 → 0.2604`;
- Depth: the composed OR/AND representation produced the complete `4/4` XOR truth table;
- browser console: zero errors and zero warnings.
