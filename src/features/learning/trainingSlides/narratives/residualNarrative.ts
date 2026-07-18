import type { LabNarrative } from '../types';

export const residualNarrative: LabNarrative = {
  id: 'residual-stream',
  chapter: 'Language inference · 3 of 5',
  hookTitle: 'Where does a prediction exist before it becomes a probability?',
  hookCopy: 'Every transformer block reads a token-position matrix and adds an update. The shared matrix—the residual stream—gradually changes from input embeddings into states that can support the next-token prediction.',
  hookPrompt: 'If we decoded after every layer, would the same token lead throughout?',
  mechanismTitle: 'Embedding starts the stream; attention and MLP blocks keep adding evidence.',
  mechanismSteps: [
    { label: 'Embed', expression: 'R₀ = token + position', copy: 'Each token begins as a learned vector at its position.' },
    { label: 'Attend', expression: 'R′ = R + Attention(norm(R))', copy: 'Attention routes contextual information and adds its update.' },
    { label: 'Transform', expression: 'Rnext = R′ + MLP(norm(R′))', copy: 'The MLP adds learned nonlinear features at every position.' },
    { label: 'Decode', expression: 'logits = norm(Rfinal)Wᵀ', copy: 'The last position is projected back across the vocabulary.' },
  ],
  mechanismConclusion: 'The stream is the evolving workspace; a logit lens is an intermediate probe, not a literal transcript of model thought.',
  exerciseTitle: 'Exercise 3 — watch a continuation emerge across layers.',
  duration: '8–10 minutes',
  tasks: ['Scrub from the final input embedding to the final normalized state.', 'Compare the changing heatmap with the top vocabulary candidates.', 'Explain why an intermediate top token may wobble without becoming the final output.'],
  returnQuestion: 'What persisted through every block: probabilities, queries, or the updated token matrix?',
  takeaway: 'Residual connections turn many attention and MLP updates into one evolving representation.',
  limitation: 'The lab uses an illustrative trace; the current Bonsai runtime does not expose hidden states, and logit-lens projections can be misleading.',
  bridge: 'The final residual state is unembedded into logits, which become next-token probabilities.',
  hookNotes: 'Connect the lab to the book’s Wikipedia example: one row changes from the embedding of “very” toward a continuation such as “important”.',
  mechanismNotes: 'Keep attention and MLP as updates to the same stream. Do not describe layers as independent voters.',
  exerciseNotes: 'Ask participants to predict whether the leader will move monotonically before they scrub.',
  debriefNotes: 'Contrast internal token representations here with the separate sentence embeddings used for retrieval.',
};
