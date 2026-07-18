import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const targetRoot = process.cwd();
const sourceRoot = resolve(process.env.AI_LAB_SOURCE_ROOT || '../vite-react-frontend');
const sourceFeature = resolve(sourceRoot, 'src/features/learning');
const targetFeature = resolve(targetRoot, 'src/features/learning');

const intentionalFeatureDifferences = new Set([
  'LearningLayout.tsx',
  'LearningHomePage.test.tsx',
  'LearningHomePage.tsx',
  'TrainingGuidePage.test.tsx',
  'TrainingGuidePage.tsx',
  'bonsaiTokenizer.ts',
  'learningCatalog.ts',
  'trainingGuides/buildTrainingGuide.test.ts',
  'trainingGuides/buildTrainingGuide.ts',
  'trainingSlides/narratives/agentNarratives.ts',
]);

const standaloneAdditions = new Set([
  'CourseMaterialsPage.test.tsx',
  'CourseMaterialsPage.tsx',
  'contentInventory.test.ts',
]);

async function filesBelow(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesBelow(root, path) : [relative(root, path)];
  }));
  return nested.flat().sort();
}

async function sha(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

function fail(label, values) {
  if (!values.length) return;
  throw new Error(`${label}:\n- ${values.join('\n- ')}`);
}

const sourceFiles = await filesBelow(sourceFeature);
const targetFiles = await filesBelow(targetFeature);
const missing = difference(sourceFiles, targetFiles);
const unexpectedAdditions = difference(targetFiles, sourceFiles).filter((file) => !standaloneAdditions.has(file));
fail('Source learning files missing from standalone repository', missing);
fail('Unregistered standalone feature additions', unexpectedAdditions);

const changed = [];
for (const file of sourceFiles) {
  if (intentionalFeatureDifferences.has(file)) continue;
  if (await sha(resolve(sourceFeature, file)) !== await sha(resolve(targetFeature, file))) changed.push(file);
}
fail('Unexpected content differences from extraction source', changed);

const exactSupportFiles = [
  ['src/components/ui/badge.tsx', 'src/components/ui/badge.tsx'],
  ['src/components/ui/button.tsx', 'src/components/ui/button.tsx'],
  ['src/components/ui/button-variants.ts', 'src/components/ui/button-variants.ts'],
  ['src/lib/utils.ts', 'src/lib/utils.ts'],
  ['src/lib/ollamaDefaults.ts', 'src/lib/ollamaDefaults.ts'],
  ['src/types/ollama.ts', 'src/types/ollama.ts'],
  ['scripts/fetch-bonsai-tokenizer.mjs', 'fetch-bonsai-tokenizer.mjs'],
];

const changedSupport = [];
for (const [source, target] of exactSupportFiles) {
  if (await sha(resolve(sourceRoot, source)) !== await sha(resolve(targetRoot, target))) changedSupport.push(`${source} -> ${target}`);
}
fail('Unexpected support-file differences', changedSupport);

const sourceAssets = await filesBelow(resolve(sourceRoot, 'public/learning-models'));
const targetAssets = await filesBelow(resolve(targetRoot, 'public/learning-models'));
fail('Learning assets missing from standalone repository', difference(sourceAssets, targetAssets));
const changedAssets = [];
for (const asset of sourceAssets) {
  if (await sha(resolve(sourceRoot, 'public/learning-models', asset)) !== await sha(resolve(targetRoot, 'public/learning-models', asset))) changedAssets.push(asset);
}
fail('Learning assets changed during extraction', changedAssets);

const tests = targetFiles.filter((file) => /\.(test|spec)\.[jt]sx?$/.test(file));
const pages = targetFiles.filter((file) => /Page\.tsx$/.test(file));
const sourceTests = sourceFiles.filter((file) => /\.(test|spec)\.[jt]sx?$/.test(file));
if (tests.length < sourceTests.length) throw new Error(`Expected at least ${sourceTests.length} learning tests, found ${tests.length}`);

const report = {
  extractionSource: sourceRoot,
  sourceFeatureFiles: sourceFiles.length,
  standaloneFeatureFiles: targetFiles.length,
  sourceLearningTests: sourceTests.length,
  standaloneLearningTests: tests.length,
  standalonePageComponents: pages.length,
  pinnedLearningAssets: sourceAssets.length,
  intentionalFeatureDifferences: intentionalFeatureDifferences.size,
  standaloneFeatureAdditions: standaloneAdditions.size,
  status: 'complete',
};

console.log(JSON.stringify(report, null, 2));
