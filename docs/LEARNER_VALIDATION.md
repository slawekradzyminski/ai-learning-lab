# Learner validation protocol

Use this protocol before expanding either canonical course with additional theory or labs. The goal is to validate pacing, evidence provenance, and representation handoffs in the maintained lesson spine.

## Participants and scope

Run five observed sessions with learners who know basic programming but have not implemented a transformer. Assign lessons 2–7 of the LLM course, with at least two participants covering tokenization → embeddings and at least two covering attention → language-model head. Reserve 35–45 minutes per session.

Do not coach terminology during the task. Ask learners to think aloud, and record observations rather than interpretations. Obtain consent before recording audio, video, or identifiable notes.

## Session script

1. Ask the learner to open the assigned lesson without explaining the interface.
2. Record whether they commit a prediction before interacting with the experiment.
3. Observe where they pause, backtrack, stop scrolling, or open the deep-dive chapter.
4. After the experiment, ask them to explain the result in their own words.
5. Let them attempt the checkpoint once without help.
6. Ask: “What representation enters the next lesson, and what evidence supports that claim?”
7. Ask them to identify whether the experiment used hand-calculated teaching data, GPT-2 inspector data, or a Bonsai/Ollama comparison.

## Observation record

For every session, capture:

| Measure | Record |
|---|---|
| Assigned lesson and prior experience | Short categorical note |
| Last point reached without prompting | Section and control |
| Prediction committed before experiment | Yes / no |
| Evidence lane identified correctly | Hand calculation / GPT-2 / local AI / confused |
| Token ID vs embedding vs contextual state vs sentence embedding | Correct distinctions and exact confusion |
| First checkpoint attempt | Correct / incorrect and selected answer |
| Representation handed forward | Learner’s words, then reviewer rating |
| Deep dive opened | Before checkpoint / after checkpoint / not opened |
| Trace observation saved | Yes / no and whether it cites evidence |
| Friction | Scroll stop, unclear label, interaction failure, or copy ambiguity |

## Decision rules

Treat the learner spine as ready for content expansion only when:

- at least four of five learners commit a prediction before the experiment;
- at least four of five correctly name the active evidence lane;
- at least four of five distinguish token IDs, embedding rows, contextual token states, and sentence embeddings after the relevant lessons;
- at least four of five can state the representation handed to the next lesson;
- no learner mistakes `tired` for an observed output before the language-model-head lesson;
- the median learner reaches the checkpoint without an unprompted abandonment or a premature deep-dive detour.

If a threshold fails, revise the smallest responsible label, mechanism paragraph, experiment boundary, or checkpoint. Do not add another explanatory surface until the revised spine has been observed again.
