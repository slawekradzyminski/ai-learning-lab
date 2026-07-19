export type EmbeddingPoint = { x: number; y: number };
export type EmbeddingPoint3d = EmbeddingPoint & { z: number };

function dot(left: number[], right: number[]): number {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function magnitude(vector: number[]): number {
  return Math.sqrt(dot(vector, vector));
}

export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length === 0 || left.length !== right.length) throw new Error('Embedding dimensions must match');
  const denominator = magnitude(left) * magnitude(right);
  return denominator === 0 ? 0 : dot(left, right) / denominator;
}

export function cosineSimilarityMatrix(vectors: number[][]): number[][] {
  return vectors.map((left) => vectors.map((right) => cosineSimilarity(left, right)));
}

function multiply(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) => dot(row, vector));
}

function normalize(vector: number[]): number[] {
  const length = magnitude(vector);
  return length > 1e-12 ? vector.map((value) => value / length) : vector.map(() => 0);
}

function powerIteration(matrix: number[][], seedOffset: number): { vector: number[]; value: number } {
  let vector = normalize(matrix.map((_, index) => 1 + ((index + seedOffset) % 3)));
  for (let iteration = 0; iteration < 80; iteration += 1) {
    const next = normalize(multiply(matrix, vector));
    if (magnitude(next) < 1e-12) break;
    vector = next;
  }
  return { vector, value: Math.max(0, dot(vector, multiply(matrix, vector))) };
}

function deflate(matrix: number[][], eigenvector: number[], eigenvalue: number): number[][] {
  return matrix.map((row, rowIndex) => row.map((value, columnIndex) =>
    value - eigenvalue * eigenvector[rowIndex] * eigenvector[columnIndex]));
}

export function projectEmbeddings2d(vectors: number[][]): EmbeddingPoint[] {
  if (vectors.length < 2) throw new Error('At least two embeddings are required');
  const dimensions = vectors[0]?.length ?? 0;
  if (!dimensions || vectors.some((vector) => vector.length !== dimensions)) {
    throw new Error('Embedding dimensions must match');
  }

  const means = Array.from({ length: dimensions }, (_, dimension) =>
    vectors.reduce((sum, vector) => sum + vector[dimension], 0) / vectors.length);
  const centered = vectors.map((vector) => vector.map((value, dimension) => value - means[dimension]));
  const gram = centered.map((left) => centered.map((right) => dot(left, right)));
  const first = powerIteration(gram, 0);
  const second = powerIteration(deflate(gram, first.vector, first.value), 1);
  const rawPoints = vectors.map((_, index) => ({
    x: first.vector[index] * Math.sqrt(first.value),
    y: second.vector[index] * Math.sqrt(second.value),
  }));
  const xScale = Math.max(...rawPoints.map(({ x }) => Math.abs(x)), 1e-9);
  const yScale = Math.max(...rawPoints.map(({ y }) => Math.abs(y)), 1e-9);
  return rawPoints.map(({ x, y }) => ({ x: x / xScale, y: y / yScale }));
}

export function projectEmbeddings3d(vectors: number[][]): EmbeddingPoint3d[] {
  if (vectors.length < 2) throw new Error('At least two embeddings are required');
  const dimensions = vectors[0]?.length ?? 0;
  if (!dimensions || vectors.some((vector) => vector.length !== dimensions)) {
    throw new Error('Embedding dimensions must match');
  }

  const means = Array.from({ length: dimensions }, (_, dimension) =>
    vectors.reduce((sum, vector) => sum + vector[dimension], 0) / vectors.length);
  const centered = vectors.map((vector) => vector.map((value, dimension) => value - means[dimension]));
  let gram = centered.map((left) => centered.map((right) => dot(left, right)));
  const components = [0, 1, 2].map((seedOffset) => {
    const component = powerIteration(gram, seedOffset);
    gram = deflate(gram, component.vector, component.value);
    return component;
  });
  const rawPoints = vectors.map((_, index) => ({
    x: components[0].vector[index] * Math.sqrt(components[0].value),
    y: components[1].vector[index] * Math.sqrt(components[1].value),
    z: components[2].vector[index] * Math.sqrt(components[2].value),
  }));
  const scale = Math.max(...rawPoints.flatMap(({ x, y, z }) => [Math.abs(x), Math.abs(y), Math.abs(z)]), 1e-9);
  return rawPoints.map(({ x, y, z }) => ({ x: x / scale, y: y / scale, z: z / scale }));
}

export const GUIDED_EMBEDDING_INPUTS = [
  'A puppy is playing outside.',
  'A dog runs through the park.',
  'The database migration failed.',
  'A schema update broke production.',
  'Fresh coffee helps me focus.',
  'An espresso starts the morning.',
  'A good book opens another world.',
  'The novel kept me reading all night.',
];

export const GUIDED_EMBEDDING_VECTORS = [
  [0.92, 0.72, 0.08, 0.12, 0.03, 0.05, 0.04, 0.02],
  [0.86, 0.78, 0.12, 0.08, 0.04, 0.02, 0.05, 0.03],
  [0.05, 0.10, 0.91, 0.76, 0.04, 0.06, 0.02, 0.05],
  [0.08, 0.14, 0.84, 0.82, 0.03, 0.04, 0.05, 0.02],
  [0.03, 0.06, 0.04, 0.02, 0.90, 0.75, 0.08, 0.04],
  [0.05, 0.03, 0.02, 0.05, 0.84, 0.82, 0.04, 0.07],
  [0.04, 0.05, 0.03, 0.05, 0.08, 0.04, 0.92, 0.74],
  [0.02, 0.04, 0.05, 0.03, 0.04, 0.07, 0.86, 0.81],
];
