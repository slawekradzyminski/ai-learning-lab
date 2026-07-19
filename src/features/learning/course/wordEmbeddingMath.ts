import { cosineSimilarity, projectEmbeddings3d, type EmbeddingPoint3d } from '../embeddingMath';
import type { GloveWord } from './gloveWordEmbeddings';

export type WordScore = { index: number; score: number };

function percentile(values: number[], fraction: number) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * fraction))] || 1;
}

export function projectWordSpace(vectors: number[][]): EmbeddingPoint3d[] {
  const points = projectEmbeddings3d(vectors);
  const scales = {
    x: percentile(points.map(({ x }) => Math.abs(x)), 0.9),
    y: percentile(points.map(({ y }) => Math.abs(y)), 0.9),
    z: percentile(points.map(({ z }) => Math.abs(z)), 0.9),
  };
  const spread = (value: number, scale: number) => Math.max(-1.18, Math.min(1.18, value / scale));
  return points.map(({ x, y, z }) => ({ x: spread(x, scales.x), y: spread(y, scales.y), z: spread(z, scales.z) }));
}

function add(left: number[], right: number[]) {
  return left.map((value, index) => value + right[index]);
}

function subtract(left: number[], right: number[]) {
  return left.map((value, index) => value - right[index]);
}

function vectorFor(rows: GloveWord[], word: string) {
  const row = rows.find((candidate) => candidate.word === word);
  if (!row) throw new Error(`Unknown word: ${word}`);
  return row.vector;
}

export function nearestWords(rows: GloveWord[], vector: number[], excluded: string[] = [], limit = 10): WordScore[] {
  const blocked = new Set(excluded);
  return rows
    .map((row, index) => ({ index, score: cosineSimilarity(vector, row.vector) }))
    .filter(({ index }) => !blocked.has(rows[index].word))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function solveAnalogy(rows: GloveWord[], a: string, b: string, c: string, limit = 5) {
  const target = add(subtract(vectorFor(rows, b), vectorFor(rows, a)), vectorFor(rows, c));
  return { target, matches: nearestWords(rows, target, [a, b, c], limit) };
}

export function findOddOneOut(rows: GloveWord[], words: string[]) {
  const scores = words.map((word, index) => {
    const vector = vectorFor(rows, word);
    const peers = words.filter((_, peerIndex) => peerIndex !== index);
    const average = peers.reduce((sum, peer) => sum + cosineSimilarity(vector, vectorFor(rows, peer)), 0) / peers.length;
    return { word, score: average };
  });
  return { scores, odd: [...scores].sort((left, right) => left.score - right.score)[0] };
}

export function rankSemanticAxis(rows: GloveWord[], from: string, to: string, limit = 7) {
  const direction = subtract(vectorFor(rows, to), vectorFor(rows, from));
  const ranked = rows
    .map((row, index) => ({ index, score: cosineSimilarity(row.vector, direction) }))
    .sort((left, right) => left.score - right.score);
  return { low: ranked.slice(0, limit), high: ranked.slice(-limit).reverse() };
}
