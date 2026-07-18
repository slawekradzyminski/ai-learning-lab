import type { LabNarrative } from '../types';

export const semanticNarratives: LabNarrative[] = [
  {
    id: 'embeddings',
    chapter: 'Semantic systems · 1 of 1',
    hookTitle: 'Can two sentences be close even when they share no important words?',
    hookCopy: 'A sentence embedding compresses a whole input into one vector. Geometry can then support similarity and retrieval without asking a generator to produce text.',
    hookPrompt: 'Which is closer to “A puppy plays outside”: a paraphrase or a sentence sharing the word “outside”?',
    mechanismTitle: 'Meaning becomes a vector; cosine compares direction.',
    mechanismSteps: [
      { label: 'Encode', expression: 'e = encoder(text)', copy: 'One fixed-length vector represents the whole input.' },
      { label: 'Normalize', expression: 'ê = e / ‖e‖', copy: 'Length is removed so direction drives comparison.' },
      { label: 'Compare', expression: 'cos(a,b) = â · b̂', copy: 'Aligned vectors score near one; opposed vectors score lower.' },
      { label: 'Retrieve', expression: 'top-k(sim(query, items))', copy: 'Nearest vectors identify candidates for search or RAG.' },
    ],
    mechanismConclusion: 'Embeddings replace exact string matching with a learned semantic neighborhood.',
    exerciseTitle: 'Exercise 6 — map semantic similarity.',
    duration: '8–10 minutes',
    tasks: ['Predict which sentences will become nearest neighbors.', 'Inspect the guided 4D vectors and similarity matrix.', 'Run the live embedding model and compare whether the neighborhood changes.'],
    returnQuestion: 'Which pair surprised you most, and was the surprise lexical or semantic?',
    takeaway: 'Embedding geometry supports similarity, clustering, and retrieval.',
    limitation: 'Individual dimensions are not guaranteed human concepts, and these vectors are not hidden Bonsai activations.',
    bridge: 'Next we switch from inference representations to the mechanism that learns parameters.',
    hookNotes: 'Use one pair with vocabulary overlap but different meaning to challenge simple keyword matching.',
    mechanismNotes: 'Explain cosine with direction before formula detail. The guided 4D vectors make every multiplication inspectable.',
    exerciseNotes: 'Do not let a live-model failure silently fall back to guided data; provenance is part of the lesson.',
    debriefNotes: 'Ask what retrieval can supply to a generator and what it still cannot guarantee about the final answer.',
  },
];
