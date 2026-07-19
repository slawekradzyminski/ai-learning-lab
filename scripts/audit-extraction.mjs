import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const targetRoot = process.cwd();
const targetFeature = resolve(targetRoot, 'src/features/learning');
const extractionBaseline = 'a8bd642';
const featurePrefix = 'src/features/learning/';

const intentionalFeatureDifferences = new Set([
  'AgentEvalsLabPage.test.tsx',
  'AgentLoopLabPage.test.tsx',
  'AgentLoopLabPage.tsx',
  'LearningLayout.tsx',
  'LearningLayout.test.tsx',
  'LearningHomePage.test.tsx',
  'LearningHomePage.tsx',
  'TrainingGuidePage.test.tsx',
  'TrainingGuidePage.tsx',
  'AttentionLabPage.test.tsx',
  'AttentionLabPage.tsx',
  'BackpropagationLabPage.test.tsx',
  'BackpropagationLabPage.tsx',
  'DepthLabPage.test.tsx',
  'DepthLabPage.tsx',
  'EmbeddingsLabPage.test.tsx',
  'EmbeddingsLabPage.tsx',
  'GradientDescentLabPage.test.tsx',
  'GradientDescentLabPage.tsx',
  'KvCacheLabPage.tsx',
  'LearningCheckpoint.test.tsx',
  'LearningCheckpoint.tsx',
  'NextTokenLabPage.test.tsx',
  'NextTokenLabPage.tsx',
  'ResidualStreamLabPage.test.tsx',
  'ResidualStreamLabPage.tsx',
  'TokenizationLabPage.test.tsx',
  'TokenizationLabPage.tsx',
  'ToolBoundariesLabPage.test.tsx',
  'tokenization.test.ts',
  'TrainingSlidesPage.test.tsx',
  'attentionMath.test.ts',
  'attentionMath.ts',
  'agentEvaluation.ts',
  'agentHarnessMath.ts',
  'embeddingMath.test.ts',
  'embeddingMath.ts',
  'bonsaiTokenizer.ts',
  'learningCatalog.ts',
  'learningMath.ts',
  'hookLifecycle.ts',
  'memoryPlacement.ts',
  'residualStreamMath.test.ts',
  'residualStreamMath.ts',
  'subagentSimulation.ts',
  'trainingGuides/buildTrainingGuide.test.ts',
  'trainingGuides/buildTrainingGuide.ts',
  'trainingGuides/MermaidDiagram.tsx',
  'trainingSlides/narratives/agentNarratives.ts',
  'trainingSlides/narratives/languageNarratives.ts',
  'trainingSlides/narratives/residualNarrative.ts',
]);

const standaloneAdditions = new Set([
  'agentCourse/AgentCourseActivity.tsx',
  'agentCourse/AgentCourseCapstoneActivity.tsx',
  'agentCourse/AgentCourseLessonNotes.tsx',
  'agentCourse/AgentCourseLessonView.tsx',
  'agentCourse/AgentCoursePage.test.tsx',
  'agentCourse/AgentCoursePage.tsx',
  'agentCourse/AgentCoursePipeline.tsx',
  'agentCourse/agentCourseCatalog.test.ts',
  'agentCourse/agentCourseCatalog.ts',
  'agentCourse/agentCourseChapterQuality.test.ts',
  'agentCourse/agentCourseProgress.test.ts',
  'agentCourse/agentCourseProgress.ts',
  'agentCourse/agentCourseTypes.ts',
  'agentCourse/content/agentCourseBible.ts',
  'agentCourse/content/agentLessonTheory.ts',
  'agentCourse/content/chapterLoaders.ts',
  'agentCourse/content/chapters/agentEvals.ts',
  'agentCourse/content/chapters/agentLoop.ts',
  'agentCourse/content/chapters/capstone.ts',
  'agentCourse/content/chapters/contextHarness.ts',
  'agentCourse/content/chapters/hooksLifecycle.ts',
  'agentCourse/content/chapters/memoryInstructions.ts',
  'agentCourse/content/chapters/subagents.ts',
  'agentCourse/content/chapters/toolBoundaries.ts',
  'CourseMaterialsPage.test.tsx',
  'CourseMaterialsPage.tsx',
  'EmbeddingSpace3D.tsx',
  'EmbeddingSpace3DLauncher.tsx',
  'Gpt2LiveAttention.tsx',
  'course/FocusedEmbeddingPlot.tsx',
  'course/Gpt2EmbeddingExplorer.test.tsx',
  'course/Gpt2EmbeddingExplorer.tsx',
  'course/Gpt2EmbeddingForest.tsx',
  'Gpt2LiveResidualStream.test.tsx',
  'Gpt2LiveResidualStream.tsx',
  'Gpt2VectorStrip.tsx',
  'EmbeddingVectorHeatmap.tsx',
  'embeddingSpaceCopy.ts',
  'gpt2TraceUi.ts',
  'LearningLibrary.tsx',
  'contentInventory.test.ts',
  'course/CapstoneActivity.tsx',
  'course/CourseChapterReader.test.tsx',
  'course/CourseChapterReader.tsx',
  'course/CourseLessonActivity.tsx',
  'course/CourseLessonNotes.tsx',
  'course/CourseLessonViews.tsx',
  'course/CoursePipeline.tsx',
  'course/LlmCoursePage.test.tsx',
  'course/LlmCoursePage.tsx',
  'course/PredictionActivity.tsx',
  'course/TokenEmbeddingActivity.tsx',
  'course/TrainingActivity.tsx',
  'course/TransformerBlockActivity.tsx',
  'course/WordEmbeddingCanvas.tsx',
  'course/WordEmbeddingExperiments.tsx',
  'course/WordEmbeddingExplorer.test.tsx',
  'course/WordEmbeddingExplorer.tsx',
  'course/WordEmbeddingExplorerLauncher.tsx',
  'course/WordEmbeddingVolume.tsx',
  'course/courseProgress.test.ts',
  'course/courseProgress.ts',
  'course/courseChapterQuality.test.ts',
  'course/courseScenario.ts',
  'course/gloveWordEmbeddings.ts',
  'course/content/lessonTheory.ts',
  'course/content/chapters/attention.ts',
  'course/content/chapters/capstone.ts',
  'course/content/chapters/generationCache.ts',
  'course/content/chapters/languageModelHead.ts',
  'course/content/chapters/learning.ts',
  'course/content/chapters/predictionGoal.ts',
  'course/content/chapters/residualStream.ts',
  'course/content/chapters/tokenization.ts',
  'course/content/chapters/tokenEmbeddings.ts',
  'course/content/chapters/transformerBlock.ts',
  'course/content/chapterLoaders.ts',
  'course/content/courseBible.ts',
  'course/content/theoryFoundations.ts',
  'course/content/theoryInference.ts',
  'course/content/theoryTypes.ts',
  'course/llmCourseCatalog.test.ts',
  'course/llmCourseCatalog.ts',
  'course/wordEmbeddingMath.test.ts',
  'course/wordEmbeddingMath.ts',
  'embeddingSpace3dGeometry.ts',
  'embeddingSpace3dGeometry.test.ts',
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

function gitFiles(prefix) {
  return execFileSync('git', ['ls-tree', '-r', '--name-only', extractionBaseline, '--', prefix], { cwd: targetRoot, encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);
}

function baselineSha(path) {
  const content = execFileSync('git', ['show', `${extractionBaseline}:${path}`], { cwd: targetRoot, maxBuffer: 20 * 1024 * 1024 });
  return createHash('sha256').update(content).digest('hex');
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

function fail(label, values) {
  if (!values.length) return;
  throw new Error(`${label}:\n- ${values.join('\n- ')}`);
}

const sourceFiles = gitFiles(featurePrefix).map((file) => file.slice(featurePrefix.length));
const targetFiles = await filesBelow(targetFeature);
const missing = difference(sourceFiles, targetFiles);
const unexpectedAdditions = difference(targetFiles, sourceFiles).filter((file) => !standaloneAdditions.has(file));
fail('Source learning files missing from standalone repository', missing);
fail('Unregistered standalone feature additions', unexpectedAdditions);

const changed = [];
for (const file of sourceFiles) {
  if (intentionalFeatureDifferences.has(file)) continue;
  if (baselineSha(`${featurePrefix}${file}`) !== await sha(resolve(targetFeature, file))) changed.push(file);
}
fail('Unexpected content differences from the immutable extraction baseline', changed);

const exactSupportFiles = [
  'src/components/ui/badge.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/button-variants.ts',
  'src/lib/utils.ts',
  'src/lib/ollamaDefaults.ts',
  'src/types/ollama.ts',
  'fetch-bonsai-tokenizer.mjs',
];

const changedSupport = [];
for (const path of exactSupportFiles) {
  if (baselineSha(path) !== await sha(resolve(targetRoot, path))) changedSupport.push(path);
}
fail('Unexpected support-file differences', changedSupport);

const assetPrefix = 'public/learning-models/';
const sourceAssets = gitFiles(assetPrefix).map((file) => file.slice(assetPrefix.length));
const targetAssets = await filesBelow(resolve(targetRoot, 'public/learning-models'));
fail('Learning assets missing from standalone repository', difference(sourceAssets, targetAssets));
const changedAssets = [];
for (const asset of sourceAssets) {
  if (baselineSha(`${assetPrefix}${asset}`) !== await sha(resolve(targetRoot, 'public/learning-models', asset))) changedAssets.push(asset);
}
fail('Learning assets changed during extraction', changedAssets);

const tests = targetFiles.filter((file) => /\.(test|spec)\.[jt]sx?$/.test(file));
const pages = targetFiles.filter((file) => /Page\.tsx$/.test(file));
const sourceTests = sourceFiles.filter((file) => /\.(test|spec)\.[jt]sx?$/.test(file));
if (tests.length < sourceTests.length) throw new Error(`Expected at least ${sourceTests.length} learning tests, found ${tests.length}`);

const report = {
  extractionBaseline,
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
