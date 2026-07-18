export type NumericMatrix = number[][];
export type MaskedMatrix = Array<Array<number | null>>;

export type AttentionExample = {
  id: 'subject' | 'position';
  label: string;
  description: string;
  tokens: string[];
  tokenEmbeddings: NumericMatrix;
  positionEmbeddings: NumericMatrix;
  wQuery: NumericMatrix;
  wKey: NumericMatrix;
  wValue: NumericMatrix;
};

export type AttentionTrace = {
  representations: NumericMatrix;
  queries: NumericMatrix;
  keys: NumericMatrix;
  values: NumericMatrix;
  rawScores: NumericMatrix;
  scaledScores: NumericMatrix;
  maskedScores: MaskedMatrix;
  attentionWeights: NumericMatrix;
  unmaskedAttentionWeights: NumericMatrix;
  outputs: NumericMatrix;
  unmaskedOutputs: NumericMatrix;
  keyDimension: number;
};

const TOKEN_EMBEDDINGS: NumericMatrix = [
  [0.2, 0.4],
  [1.3, 0],
  [0, 1.3],
  [0.5, 1.2],
];

const WEIGHT_QUERY: NumericMatrix = [
  [0.5, -1],
  [1, 0.8],
];

const WEIGHT_KEY: NumericMatrix = [
  [1, 0],
  [0, 1],
];

const WEIGHT_VALUE: NumericMatrix = [
  [0.6, 0.4],
  [-0.3, 0.8],
];

export const ATTENTION_EXAMPLES: AttentionExample[] = [
  {
    id: 'subject',
    label: 'Subject signal',
    description: 'The final query aligns most strongly with the earlier subject representation.',
    tokens: ['The', 'animal', 'was', 'tired'],
    tokenEmbeddings: TOKEN_EMBEDDINGS,
    positionEmbeddings: [
      [0, 0],
      [0.1, 0],
      [0.1, -0.1],
      [0.3, -0.2],
    ],
    wQuery: WEIGHT_QUERY,
    wKey: WEIGHT_KEY,
    wValue: WEIGHT_VALUE,
  },
  {
    id: 'position',
    label: 'Position intervention',
    description: 'An exaggerated positional change redirects the final query toward “was”.',
    tokens: ['The', 'animal', 'was', 'tired'],
    tokenEmbeddings: TOKEN_EMBEDDINGS,
    positionEmbeddings: [
      [0, 0],
      [0.1, 0],
      [1.5, -1.1],
      [0.3, -0.2],
    ],
    wQuery: WEIGHT_QUERY,
    wKey: WEIGHT_KEY,
    wValue: WEIGHT_VALUE,
  },
];

function matrixShape(matrix: NumericMatrix, name: string): [number, number] {
  if (!matrix.length || !matrix[0]?.length) throw new Error(`${name} must not be empty`);
  const columns = matrix[0].length;
  if (matrix.some((row) => row.length !== columns)) throw new Error(`${name} must be rectangular`);
  if (matrix.flat().some((value) => !Number.isFinite(value))) throw new Error(`${name} must contain finite values`);
  return [matrix.length, columns];
}

export function addMatrices(left: NumericMatrix, right: NumericMatrix): NumericMatrix {
  const [leftRows, leftColumns] = matrixShape(left, 'Left matrix');
  const [rightRows, rightColumns] = matrixShape(right, 'Right matrix');
  if (leftRows !== rightRows || leftColumns !== rightColumns) {
    throw new Error('Matrices must have the same shape for addition');
  }
  return left.map((row, rowIndex) => row.map((value, columnIndex) => value + right[rowIndex][columnIndex]));
}

export function transpose(matrix: NumericMatrix): NumericMatrix {
  const [rows, columns] = matrixShape(matrix, 'Matrix');
  return Array.from({ length: columns }, (_, column) =>
    Array.from({ length: rows }, (_, row) => matrix[row][column]),
  );
}

export function multiplyMatrices(left: NumericMatrix, right: NumericMatrix): NumericMatrix {
  const [leftRows, leftColumns] = matrixShape(left, 'Left matrix');
  const [rightRows, rightColumns] = matrixShape(right, 'Right matrix');
  if (leftColumns !== rightRows) throw new Error('Inner matrix dimensions must match');
  return Array.from({ length: leftRows }, (_, row) =>
    Array.from({ length: rightColumns }, (_, column) =>
      left[row].reduce((sum, value, index) => sum + value * right[index][column], 0),
    ),
  );
}

export function scaleMatrix(matrix: NumericMatrix, scale: number): NumericMatrix {
  matrixShape(matrix, 'Matrix');
  if (!Number.isFinite(scale)) throw new Error('Scale must be finite');
  return matrix.map((row) => row.map((value) => value * scale));
}

export function applyCausalMask(scores: NumericMatrix): MaskedMatrix {
  const [rows, columns] = matrixShape(scores, 'Scores');
  if (rows !== columns) throw new Error('Causal attention scores must be square');
  return scores.map((row, rowIndex) => row.map((value, columnIndex) => columnIndex > rowIndex ? null : value));
}

function stableSoftmax(values: number[]): number[] {
  if (!values.length || values.some((value) => !Number.isFinite(value))) {
    throw new Error('Softmax requires finite values');
  }
  const maximum = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - maximum));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

export function softmaxRows(matrix: NumericMatrix): NumericMatrix {
  matrixShape(matrix, 'Matrix');
  return matrix.map(stableSoftmax);
}

export function softmaxMaskedRows(matrix: MaskedMatrix): NumericMatrix {
  if (!matrix.length || !matrix[0]?.length) throw new Error('Masked matrix must not be empty');
  const columns = matrix[0].length;
  if (matrix.some((row) => row.length !== columns)) throw new Error('Masked matrix must be rectangular');

  return matrix.map((row) => {
    const visibleValues = row.filter((value): value is number => value !== null);
    const visibleWeights = stableSoftmax(visibleValues);
    let visibleIndex = 0;
    return row.map((value) => value === null ? 0 : visibleWeights[visibleIndex++]);
  });
}

export function buildAttentionTrace(example: AttentionExample): AttentionTrace {
  if (example.tokens.length !== example.tokenEmbeddings.length
    || example.tokens.length !== example.positionEmbeddings.length) {
    throw new Error('Every token must have token and position representations');
  }
  const representations = addMatrices(example.tokenEmbeddings, example.positionEmbeddings);
  const queries = multiplyMatrices(representations, example.wQuery);
  const keys = multiplyMatrices(representations, example.wKey);
  const values = multiplyMatrices(representations, example.wValue);
  const keyDimension = keys[0].length;
  const rawScores = multiplyMatrices(queries, transpose(keys));
  const scaledScores = scaleMatrix(rawScores, 1 / Math.sqrt(keyDimension));
  const maskedScores = applyCausalMask(scaledScores);
  const attentionWeights = softmaxMaskedRows(maskedScores);
  const unmaskedAttentionWeights = softmaxRows(scaledScores);

  return {
    representations,
    queries,
    keys,
    values,
    rawScores,
    scaledScores,
    maskedScores,
    attentionWeights,
    unmaskedAttentionWeights,
    outputs: multiplyMatrices(attentionWeights, values),
    unmaskedOutputs: multiplyMatrices(unmaskedAttentionWeights, values),
    keyDimension,
  };
}

export function attentionContributions(
  trace: AttentionTrace,
  outputIndex: number,
  causal = true,
): Array<{ weight: number; value: number[]; weightedValue: number[] }> {
  const weights = causal ? trace.attentionWeights : trace.unmaskedAttentionWeights;
  if (!Number.isInteger(outputIndex) || outputIndex < 0 || outputIndex >= weights.length) {
    throw new Error('Output index is outside the attention sequence');
  }
  return weights[outputIndex].map((weight, index) => ({
    weight,
    value: trace.values[index],
    weightedValue: trace.values[index].map((value) => value * weight),
  }));
}

export function dominantAttentionIndex(trace: AttentionTrace, outputIndex: number, causal = true): number {
  const weights = causal ? trace.attentionWeights : trace.unmaskedAttentionWeights;
  if (!weights[outputIndex]) throw new Error('Output index is outside the attention sequence');
  return weights[outputIndex].reduce(
    (bestIndex, value, index, row) => value > row[bestIndex] ? index : bestIndex,
    0,
  );
}
