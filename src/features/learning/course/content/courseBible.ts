import { LLM_COURSE_PROMPT, LLM_COURSE_TARGET } from '../courseScenario';

export const LLM_COURSE_BIBLE = {
  audience: 'A technically curious learner who knows basic algebra but has not studied transformers.',
  centralQuestion: 'How does a decoder-only language model predict one more token, and how does training improve that prediction?',
  scenario: {
    prompt: LLM_COURSE_PROMPT,
    target: LLM_COURSE_TARGET,
  },
  architecture: 'Decoder-only, causal, pre-normalization transformer unless a lesson explicitly compares another design.',
  representationQuestions: [
    'What representation enters?',
    'What operation changes it?',
    'What representation leaves?',
  ],
  inferencePipeline: [
    'text',
    'token pieces and token IDs',
    'initial token states',
    'contextual token states',
    'vocabulary logits',
    'next-token distribution',
    'selected token',
    'append and repeat with cached keys and values',
  ],
  provenance: {
    glassBox: 'Exact deterministic calculation from values displayed by the educational miniature.',
    live: 'Externally observable result returned by an identified tokenizer or model runtime.',
    schematic: 'A conceptual picture that explains structure but is not measured model state.',
  },
  boundaries: [
    'Never attribute educational embeddings, attention weights, or residual states to Bonsai.',
    'Keep token embeddings, contextual token states, and sentence/retrieval embeddings distinct.',
    'Keep inference-time activations separate from training-time parameter updates.',
    'Treat attention as information routing, not as a transcript of reasoning.',
  ],
} as const;
