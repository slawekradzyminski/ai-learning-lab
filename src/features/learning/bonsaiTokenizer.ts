import { Tokenizer } from '@huggingface/tokenizers';
import { makeTokenPiece, type TokenizationResult, type TokenizerManifest } from './tokenization';

const TOKENIZER_ROOT = `${import.meta.env.BASE_URL}learning-models/bonsai-tokenizer`.replace(/\/$/, '');
let bonsaiTokenizerPromise: Promise<{ tokenizer: Tokenizer; manifest: TokenizerManifest }> | null = null;

async function loadJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load tokenizer asset: ${response.status}`);
  return response.json() as Promise<T>;
}

export function loadBonsaiTokenizer() {
  if (!bonsaiTokenizerPromise) {
    bonsaiTokenizerPromise = Promise.all([
      loadJson<Record<string, unknown>>(`${TOKENIZER_ROOT}/tokenizer.json`),
      loadJson<Record<string, unknown>>(`${TOKENIZER_ROOT}/tokenizer_config.json`),
      loadJson<TokenizerManifest>(`${TOKENIZER_ROOT}/manifest.json`),
    ]).then(([tokenizerJson, tokenizerConfig, manifest]) => ({
      tokenizer: new Tokenizer(tokenizerJson, tokenizerConfig),
      manifest,
    })).catch((error) => {
      bonsaiTokenizerPromise = null;
      throw error;
    });
  }
  return bonsaiTokenizerPromise;
}

export async function tokenizeWithBonsai(text: string): Promise<TokenizationResult & { manifest: TokenizerManifest }> {
  const { tokenizer, manifest } = await loadBonsaiTokenizer();
  const encoding = tokenizer.encode(text, { add_special_tokens: false });
  const pieces = encoding.ids.map((id, index) => {
    const rawToken = encoding.tokens[index] ?? tokenizer.id_to_token(id) ?? '';
    const decoded = tokenizer.decode([id], { skip_special_tokens: false });
    return makeTokenPiece(id, rawToken, decoded);
  });
  return {
    source: 'bonsai-tokenizer',
    sourceLabel: 'Qwen3.6 tokenizer used by Bonsai 27B',
    modelLabel: `Pinned ${manifest.modelId} · ${manifest.revision.slice(0, 8)}`,
    pieces,
    manifest,
  };
}

export function resetTokenizerCacheForTests() {
  bonsaiTokenizerPromise = null;
}
