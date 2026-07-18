import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { guidedTokenize } from './tokenization';
import { resetTokenizerCacheForTests, tokenizeWithBonsai } from './bonsaiTokenizer';

afterEach(() => {
  vi.unstubAllGlobals();
  resetTokenizerCacheForTests();
});

describe('tokenization', () => {
  test('keeps guided tokenization deterministic, lossless, and visibly illustrative', () => {
    const result = guidedTokenize('Tokenization works!');

    expect(result.modelLabel).toContain('not Bonsai');
    expect(result.pieces.map(({ text }) => text).join('')).toBe('Tokenization works!');
    expect(result.pieces.map(({ id }) => id)).toEqual(guidedTokenize('Tokenization works!').pieces.map(({ id }) => id));
    expect(result.pieces.length).toBeGreaterThan(3);
  });

  test('counts Unicode characters separately from UTF-8 bytes', () => {
    const polish = guidedTokenize('żółć').pieces.flatMap(({ text, characterCount, byteCount }) =>
      text.includes('ż') ? [{ characterCount, byteCount }] : []);

    expect(polish).toHaveLength(1);
    expect(polish[0].byteCount).toBeGreaterThan(polish[0].characterCount);
  });

  test('loads the pinned Bonsai base tokenizer and returns exact Qwen IDs', async () => {
    const assetRoot = resolve(process.cwd(), 'public/learning-models/bonsai-tokenizer');
    const assets: Record<string, unknown> = {
      'tokenizer.json': JSON.parse(await readFile(resolve(assetRoot, 'tokenizer.json'), 'utf8')),
      'tokenizer_config.json': JSON.parse(await readFile(resolve(assetRoot, 'tokenizer_config.json'), 'utf8')),
      'manifest.json': JSON.parse(await readFile(resolve(assetRoot, 'manifest.json'), 'utf8')),
    };
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
      ok: true,
      json: async () => {
        const segments = url.split('/');
        return assets[segments[segments.length - 1] ?? ''];
      },
    })));

    const result = await tokenizeWithBonsai('Tokenization turns text into pieces.');

    expect(result.pieces.map(({ id }) => id)).toEqual([3214, 1954, 10263, 1414, 1083, 9378, 13]);
    expect(result.pieces.map(({ text }) => text).join('')).toBe('Tokenization turns text into pieces.');
    expect(result.manifest.revision).toHaveLength(40);
  });
});
