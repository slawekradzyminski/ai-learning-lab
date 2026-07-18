import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODEL_ID = 'Qwen/Qwen3.6-27B';
const REVISION = '6a9e13bd6fc8f0983b9b99948120bc37f49c13e9';
const FILES = ['tokenizer.json', 'tokenizer_config.json'];
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(scriptDirectory, '../public/learning-models/bonsai-tokenizer');

await mkdir(outputDirectory, { recursive: true });

const manifest = {
  modelId: MODEL_ID,
  revision: REVISION,
  relationship: 'Tokenizer source for the Qwen 3.6 base architecture used by Bonsai 27B',
  files: {},
};

for (const filename of FILES) {
  const sourceUrl = `https://huggingface.co/${MODEL_ID}/resolve/${REVISION}/${filename}`;
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download ${filename}: ${response.status} ${response.statusText}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(resolve(outputDirectory, filename), bytes);
  manifest.files[filename] = {
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    sourceUrl,
  };
}

await writeFile(
  resolve(outputDirectory, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`Fetched ${FILES.length} tokenizer files for ${MODEL_ID}@${REVISION}`);
