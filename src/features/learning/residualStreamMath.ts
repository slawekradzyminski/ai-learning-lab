export type ResidualCandidate = { token: string; probability: number };

export type ResidualLayer = {
  layer: number;
  stage: string;
  update: string;
  interpretation: string;
  candidates: ResidualCandidate[];
  vector: number[];
};

const candidatePath: ResidualCandidate[][] = [
  [{ token: 'very', probability: 0.62 }, { token: 'much', probability: 0.12 }, { token: 'well', probability: 0.08 }],
  [{ token: 'often', probability: 0.26 }, { token: 'very', probability: 0.22 }, { token: 'important', probability: 0.12 }],
  [{ token: 'important', probability: 0.31 }, { token: 'good', probability: 0.18 }, { token: 'often', probability: 0.14 }],
  [{ token: 'important', probability: 0.43 }, { token: 'high', probability: 0.19 }, { token: 'questionable', probability: 0.09 }],
  [{ token: 'high', probability: 0.38 }, { token: 'important', probability: 0.35 }, { token: 'good', probability: 0.11 }],
  [{ token: 'important', probability: 0.54 }, { token: 'high', probability: 0.21 }, { token: 'questionable', probability: 0.08 }],
  [{ token: 'important', probability: 0.71 }, { token: 'high', probability: 0.12 }, { token: 'questionable', probability: 0.05 }],
];

function makeVector(layer: number): number[] {
  return Array.from({ length: 48 }, (_, index) => {
    const wave = Math.sin((index + 1) * 0.83 + layer * 0.71);
    const signal = Math.cos((index % 8) * 0.64 - layer * 0.47);
    const emphasis = index === 11 + layer || index === 37 - layer ? 1.35 : 0;
    return Number((wave * 0.72 + signal * 0.43 + emphasis).toFixed(3));
  });
}

const layerCopy = [
  ['Token embedding', 'Vocabulary lookup', 'The last row still mostly represents the input token “very”.'],
  ['Block 1', 'Attention adds context', 'The representation begins incorporating “reliability” and “Wikipedia”.'],
  ['Block 2', 'MLP adds features', 'Candidate words move as learned features are added to the stream.'],
  ['Block 3', 'Attention routes evidence', 'The subject and phrasing increasingly constrain the continuation.'],
  ['Block 4', 'MLP reshapes evidence', 'Intermediate probes can wobble; layers do not vote independently.'],
  ['Block 5', 'Late refinement', 'The leading continuation stabilizes as the final state approaches.'],
  ['Final norm', 'Unembedding + softmax', 'The final row is mapped to one score for every vocabulary token.'],
] as const;

export const RESIDUAL_PROMPT_TOKENS = ['The', 'reliability', 'of', 'Wikipedia', 'is', 'very'];

export const RESIDUAL_LAYERS: ResidualLayer[] = layerCopy.map(([stage, update, interpretation], layer) => ({
  layer,
  stage,
  update,
  interpretation,
  candidates: candidatePath[layer],
  vector: makeVector(layer),
}));

export function residualLayerAt(index: number): ResidualLayer {
  const safeIndex = Math.min(Math.max(Math.trunc(index), 0), RESIDUAL_LAYERS.length - 1);
  return RESIDUAL_LAYERS[safeIndex];
}
