# LLM course theory authoring standard

## Purpose

The canonical LLM course follows one unfinished sentence through one decoder-only transformer prediction and then connects that prediction to training. A lesson is not complete merely because it contains a definition. It must let a learner move from an intuitive question, through an inspectable mechanism and calculation, to an honest account of what a production model does differently.

The shared prompt is:

> The animal did not cross the street because it was too …

At every lesson boundary, answer:

1. What representation enters?
2. What operation changes it?
3. What representation leaves?

Semantic retrieval, neural-network foundations, and vision are separate paths. They may be linked as deeper study, but their representations must not be inserted into the decoder inference pipeline.

## Audience and voice

Write for a technically curious adult who knows basic algebra but may not know linear algebra, probability, or transformer terminology.

- Begin with observable behavior or a concrete problem.
- Introduce one abstraction at a time.
- Define jargon and symbols before using them.
- Explain equations in prose.
- Prefer “the representation makes this distinction available” over “the model understands.”
- State the boundary of every analogy.
- Keep token IDs, token embeddings, contextual states, retrieval embeddings, logits, probabilities, and selected tokens distinct.

## Minimum lesson package

Every canonical chapter must provide:

- 1,800 or more meaningful prose words; target 2,500–4,500 for core mechanisms;
- 6–11 ordered sections;
- 4–6 assessable learning objectives;
- prerequisites and an estimated study time;
- at least three substantive diagrams;
- one completely worked numerical example;
- a tensor-shape ledger where dimensions matter;
- at least four misconception diagnostics;
- at least six retrieval, calculation, debugging, or transfer exercises with reasoned answers;
- a glossary;
- explicit primary or official sources;
- a backward and forward narrative bridge.

Word count is a floor, not a quality proxy. Repetition, generic history, and padded restatement do not satisfy the standard.

## Required explanatory sequence

1. **Orientation:** locate the lesson in the full pipeline.
2. **Opening problem:** ask the learner to predict something before terminology is supplied.
3. **Intuition:** explain what problem the mechanism solves.
4. **Mechanism:** trace input, operation, output, and ownership of each value.
5. **Mathematics:** define notation, shapes, equations, and their purpose.
6. **Exact miniature:** expose all inputs, intermediate results, and a sanity check.
7. **Counterfactual:** change one input or parameter and predict the consequence.
8. **Production reality:** state what scales up, what differs, and which details are architecture-dependent.
9. **Limitations:** explain what the visualization or measurement cannot establish.
10. **Lab bridge:** connect a prediction to a control and an observable result.
11. **Practice and handoff:** retrieve, calculate, transfer, summarize, and continue.

## Mathematics

Use mathematics only when it materially explains the manipulated mechanism. Present it in this order:

```text
plain-language question
→ notation and shape ledger
→ equation
→ numerical substitution
→ interpretation
→ limitation or production form
```

Every important equation must identify:

- the role of the operation;
- the meaning of each symbol;
- operand and result shapes;
- what changes when one term changes;
- one invariant or verification check when available.

Display calculations use rounded values only for presentation. Tests and fixtures retain the unrounded values.

## Diagrams

Every core chapter requires:

1. a pipeline/location diagram;
2. a mechanism or causal trace;
3. a shape, mathematical, or temporal trace.

Mathematical deep dives should also include a counterfactual or comparison diagram.

A diagram counts only when it has a purpose, title, caption, meaningful alternative text, consistent notation, mobile-readable labels, and an explicit provenance label. Do not convey meaning with color alone. Learned parameters, runtime activations, cached state, and outputs must be visually distinguishable.

## Provenance

Use one of these labels:

- **Exact educational calculation:** deterministic result from visible miniature values.
- **Live behavioral output:** externally observable result from an identified tokenizer or model runtime.
- **Illustrative schematic:** conceptual structure, not measured model state.

Never:

- attribute invented attention, embeddings, activations, or residual values to Bonsai;
- present sentence/retrieval embeddings as internal token representations;
- claim that attention weights reveal a chain of reasoning;
- present an intermediate vocabulary projection as hidden prose;
- blur inference-time state with training-time parameter updates;
- silently replace a failed live request with guided values.

## Sources

Each core chapter should use 6–12 useful sources across its prose and further-reading list. Prefer:

1. project implementation and verified fixtures for claims about AI Lab;
2. primary papers, specifications, and model reports;
3. official implementation documentation;
4. textbooks, university notes, and peer-reviewed surveys;
5. high-quality visual explainers for pedagogy rather than sole technical authority.

Quantitative, historical, model-specific, and architecture-specific claims require support. Keep quoted text short and create original diagrams.

## Acceptance gates

### Technical

- equations, dimensions, and numerical results are independently reproducible;
- softmax rows and distributions normalize within tolerance;
- residual additions use compatible shapes;
- architectural variations are labelled;
- no unavailable model internal is presented as observed.

### Pedagogical

- objectives map to exercises or checkpoints;
- the opening creates a concrete question;
- no unexplained prerequisite appears;
- the shared prompt remains visible;
- exercises include prediction and transfer, not only recall;
- the final state is handed clearly to the next lesson.

### Product

- chapter schema checks pass;
- KaTeX and Mermaid render;
- diagrams, tables, and equations remain usable at 390px;
- exercise answers require a deliberate reveal;
- keyboard navigation and focus indicators work;
- static theory works without a live model;
- `npm test` and `npm run build` pass.

## Multi-agent workflow

Each lesson author owns one chapter file and first builds a research packet: objectives, source ledger, claim ledger, mathematical workbook, diagram specifications, and misconceptions. After drafting, a different author reviews the lesson. The course editor alone changes shared types, notation, scenario data, and course order.

After lesson-level review, run three course-wide audits:

- factual and mathematical correctness;
- pedagogy, accessibility, and exercise quality;
- terminology, provenance, and narrative continuity.

One canonical lesson package supplies the student essay, experiment bridge, exercises, glossary, sources, and presenter entry point. Do not maintain independent competing explanations for those surfaces.
