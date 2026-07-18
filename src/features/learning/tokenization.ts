export type TokenPiece = {
  id: number;
  rawToken: string;
  text: string;
  display: string;
  characterCount: number;
  byteCount: number;
};

export type TokenizationResult = {
  source: 'guided' | 'bonsai-tokenizer';
  sourceLabel: string;
  modelLabel: string;
  pieces: TokenPiece[];
};

export type TokenizerManifest = {
  modelId: string;
  revision: string;
  relationship: string;
  files: Record<string, { bytes: number; sha256: string; sourceUrl: string }>;
};

function stableTeachingId(token: string): number {
  let hash = 2166136261;
  for (const character of token) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return 1000 + (hash >>> 0) % 30000;
}

function displayToken(text: string): string {
  if (!text) return '∅';
  return text.split(' ').join('·').split('\n').join('↵').split('\t').join('⇥');
}

export function makeTokenPiece(id: number, rawToken: string, text: string): TokenPiece {
  return {
    id,
    rawToken,
    text,
    display: displayToken(text),
    characterCount: [...text].length,
    byteCount: new TextEncoder().encode(text).length,
  };
}

function splitTeachingWord(word: string): string[] {
  const characters = [...word];
  if (characters.length <= 6) return [word];
  const firstBoundary = Math.min(4, characters.length - 3);
  return [characters.slice(0, firstBoundary).join(''), characters.slice(firstBoundary).join('')];
}

export function guidedTokenize(text: string): TokenizationResult {
  const coarsePieces = text.match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) ?? [];
  const tokens = coarsePieces.flatMap((piece) => /[\p{L}\p{N}_]/u.test(piece[0] ?? '') ? splitTeachingWord(piece) : [piece]);
  return {
    source: 'guided',
    sourceLabel: 'Guided teaching tokenizer',
    modelLabel: 'Illustrative subword rules—not Bonsai output',
    pieces: tokens.map((token) => makeTokenPiece(stableTeachingId(token), token, token)),
  };
}
