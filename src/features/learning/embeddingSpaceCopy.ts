export type EmbeddingSpaceKind = 'semantic' | 'token';

export const EMBEDDING_SPACE_COPY = {
  semantic: {
    eyebrow: 'Optional spatial view',
    title: 'See semantic neighborhoods.',
    description: 'Open a rotatable projection of the vectors already on this page. The visualization code is downloaded only when you ask for it.',
    ariaLabel: 'Interactive three-dimensional projection of semantic embeddings',
    neighbors: 'Nearest meanings',
    note: 'The map is a 3D PCA projection. Neighbor scores still come from cosine similarity across every vector dimension.',
    qualifier: 'Projection, not the full vector',
  },
  token: {
    eyebrow: 'Word-token neighborhood',
    title: 'Explore words as learned coordinates.',
    description: 'These teaching tokens happen to be whole words. Real LLM vocabularies also contain subword pieces, punctuation, and bytes.',
    ariaLabel: 'Interactive three-dimensional projection of teaching token embeddings',
    neighbors: 'Nearest token vectors',
    note: 'This is a 3D PCA projection of the teaching table. It demonstrates the mechanism; it is not Bonsai’s private embedding weights.',
    qualifier: 'Teaching projection, not Bonsai weights',
  },
} as const;
