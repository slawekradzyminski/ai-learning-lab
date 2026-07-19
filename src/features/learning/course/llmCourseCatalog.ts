import type { LearningLabId } from '../learningCatalog';
import { LESSON_THEORY, type CourseTheory } from './content/lessonTheory';

export type LlmCourseLessonId =
  | 'prediction-goal'
  | 'tokenization'
  | 'token-embeddings'
  | 'transformer-block'
  | 'attention'
  | 'residual-stream'
  | 'language-model-head'
  | 'generation-cache'
  | 'learning'
  | 'capstone';

export type CourseCheckpoint = {
  question: string;
  choices: Array<{ value: string; label: string }>;
  correctValue: string;
  explanation: string;
};

export type LlmCourseLesson = {
  id: LlmCourseLessonId;
  stage: string;
  shortTitle: string;
  title: string;
  question: string;
  inputRepresentation: string;
  operation: string;
  outputRepresentation: string;
  educational: CourseTheory;
  activity: 'prediction' | 'lab' | 'token-embeddings' | 'transformer-block' | 'training' | 'capstone';
  labId?: LearningLabId;
  checkpoint: CourseCheckpoint;
  bridgeForward: string;
  slide?: number;
};

export const LLM_PIPELINE_STAGES = [
  { id: 'goal', label: 'Prediction' },
  { id: 'tokens', label: 'Token IDs' },
  { id: 'vectors', label: 'Vectors' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'context', label: 'Context' },
  { id: 'state', label: 'Residual state' },
  { id: 'distribution', label: 'Distribution' },
  { id: 'repeat', label: 'Repeat' },
  { id: 'learn', label: 'Learn' },
] as const;

export const LLM_COURSE_LESSONS: LlmCourseLesson[] = [
  {
    id: 'prediction-goal', stage: 'goal', shortTitle: 'The destination',
    educational: LESSON_THEORY['prediction-goal'],
    title: 'A language model predicts a distribution, not a sentence.',
    question: 'What should follow “The animal did not cross the street because it was too …”?',
    inputRepresentation: 'An unfinished sequence of text', operation: 'Score every possible next token', outputRepresentation: 'A probability distribution over the vocabulary',
    activity: 'prediction',
    checkpoint: { question: 'What does one forward pass produce?', choices: [{ value: 'sentence', label: 'A complete sentence' }, { value: 'distribution', label: 'One next-token distribution' }, { value: 'truth', label: 'A calibrated truth score' }], correctValue: 'distribution', explanation: 'One forward pass produces scores for the next token. Generation appends one choice and repeats the process.' },
    bridgeForward: 'To make that prediction, the model must first turn the visible sentence into its own discrete alphabet.',
    slide: 1,
  },
  {
    id: 'tokenization', stage: 'tokens', shortTitle: 'Text becomes tokens', title: 'The sentence becomes pieces and vocabulary IDs.',
    educational: LESSON_THEORY.tokenization,
    question: 'What exact sequence reaches the neural network?', inputRepresentation: 'Unicode text', operation: 'Normalize, segment, and look up vocabulary entries', outputRepresentation: 'Ordered token IDs',
    activity: 'lab', labId: 'tokenization',
    checkpoint: { question: 'What does token ID 42 tell us by itself?', choices: [{ value: 'meaning', label: 'Its semantic meaning' }, { value: 'address', label: 'Which vocabulary row to look up' }, { value: 'distance', label: 'How close it is to token 43' }], correctValue: 'address', explanation: 'An ID is a categorical lookup address. Numeric distance between IDs has no semantic meaning.' },
    bridgeForward: 'IDs are still only addresses. The next step looks up a learned vector for each address and adds position.', slide: 3,
  },
  {
    id: 'token-embeddings', stage: 'vectors', shortTitle: 'IDs become vectors', title: 'A lookup row and a position create the initial token state.',
    educational: LESSON_THEORY['token-embeddings'],
    question: 'How can a categorical ID become something a neural network can transform?', inputRepresentation: 'Token ID + position index', operation: 'Embedding-table lookup + positional signal', outputRepresentation: 'One initial vector per token position',
    activity: 'token-embeddings',
    checkpoint: { question: 'Which vector is intended for semantic document retrieval?', choices: [{ value: 'token', label: 'A raw token embedding row' }, { value: 'context', label: 'An intermediate contextual token state' }, { value: 'sentence', label: 'A sentence embedding trained for similarity' }], correctValue: 'sentence', explanation: 'Token rows and contextual states belong inside the generator. Sentence embeddings are separately trained outputs for similarity and retrieval.' },
    bridgeForward: 'A transformer block repeatedly changes these position-specific states with two different jobs.',
  },
  {
    id: 'transformer-block', stage: 'blocks', shortTitle: 'Two jobs per block', title: 'Attention communicates; the MLP computes locally.',
    educational: LESSON_THEORY['transformer-block'],
    question: 'What changes a token state inside one transformer block?', inputRepresentation: 'A matrix of contextual token states', operation: 'Attention update, residual add, MLP update, residual add', outputRepresentation: 'Updated token states with the same shape',
    activity: 'transformer-block',
    checkpoint: { question: 'Which sublayer directly mixes information between token positions?', choices: [{ value: 'attention', label: 'Self-attention' }, { value: 'mlp', label: 'The position-wise MLP' }, { value: 'residual', label: 'Residual addition itself' }], correctValue: 'attention', explanation: 'Attention mixes value vectors across positions. The MLP operates on each position separately; residual addition preserves and accumulates updates.' },
    bridgeForward: 'Now isolate the communication job and calculate exactly where one position reads from.',
  },
  {
    id: 'attention', stage: 'context', shortTitle: 'Attention gathers context', title: 'One position asks where to read and what to gather.',
    educational: LESSON_THEORY.attention,
    question: 'Which earlier positions should “too” consult before the model predicts the next token?', inputRepresentation: 'Current token-state matrix', operation: 'Project Q/K/V, compare, mask, softmax, mix values', outputRepresentation: 'A contextual update for every position',
    activity: 'lab', labId: 'attention',
    checkpoint: { question: 'What does one attention row sum to after softmax?', choices: [{ value: 'zero', label: '0' }, { value: 'one', label: '1' }, { value: 'dimension', label: 'The head dimension' }], correctValue: 'one', explanation: 'Softmax produces non-negative mixture weights that sum to one across the allowed source positions.' },
    bridgeForward: 'The attention output is not the final answer. It is added to the shared residual stream, followed by more block updates.', slide: 7,
  },
  {
    id: 'residual-stream', stage: 'state', shortTitle: 'Evidence accumulates', title: 'The residual stream carries every position through depth.',
    educational: LESSON_THEORY['residual-stream'],
    question: 'Where do attention and MLP updates go after each sublayer?', inputRepresentation: 'Current residual token states', operation: 'Add attention and MLP updates across many blocks', outputRepresentation: 'Final contextual state at the last position',
    activity: 'lab', labId: 'residual-stream',
    checkpoint: { question: 'What persists between transformer blocks?', choices: [{ value: 'probabilities', label: 'The final probability distribution' }, { value: 'stream', label: 'The updated token-state matrix' }, { value: 'queries', label: 'Every old query tensor' }], correctValue: 'stream', explanation: 'Each block receives the updated residual stream. Vocabulary probabilities are produced only after the final normalization and output projection.' },
    bridgeForward: 'The final state at “too” is ready to be compared with every vocabulary token.', slide: 11,
  },
  {
    id: 'language-model-head', stage: 'distribution', shortTitle: 'The model makes a choice', title: 'Unembedding turns the final state into vocabulary scores.',
    educational: LESSON_THEORY['language-model-head'],
    question: 'How does the final state become “tired” and its alternatives?', inputRepresentation: 'Final state at the last prompt position', operation: 'Normalize, unembed, apply temperature and softmax, decode', outputRepresentation: 'One chosen next token plus its distribution',
    activity: 'lab', labId: 'next-token',
    checkpoint: { question: 'For fixed logits and positive temperature, what can temperature change?', choices: [{ value: 'rank', label: 'Only token ranking' }, { value: 'certainty', label: 'Distribution concentration, not ranking' }, { value: 'knowledge', label: 'The model’s stored knowledge' }], correctValue: 'certainty', explanation: 'Dividing all logits by a positive temperature preserves their ordering while changing how concentrated softmax becomes.' },
    bridgeForward: 'After one token is appended, the same forward pass repeats—and reuse becomes a systems problem.', slide: 15,
  },
  {
    id: 'generation-cache', stage: 'repeat', shortTitle: 'Generation repeats', title: 'The next step reuses earlier keys and values.',
    educational: LESSON_THEORY['generation-cache'],
    question: 'What can the model retain when the chosen token extends the sequence?', inputRepresentation: 'Earlier K/V tensors + one new token state', operation: 'Append the new K/V rows and compute only the new query', outputRepresentation: 'A longer cache and the next distribution',
    activity: 'lab', labId: 'kv-cache',
    checkpoint: { question: 'Why are old keys and values cached?', choices: [{ value: 'weights', label: 'They become learned model weights' }, { value: 'reuse', label: 'Future queries need to read earlier positions' }, { value: 'memory', label: 'They store semantic long-term memory' }], correctValue: 'reuse', explanation: 'Each new query attends over earlier keys and values. The cache is request-scoped inference state, not learned or long-term memory.' },
    bridgeForward: 'Inference now makes sense end to end. The remaining question is how training made “tired” receive a high score.', slide: 19,
  },
  {
    id: 'learning', stage: 'learn', shortTitle: 'The error travels backward', title: 'Training raises useful probabilities by changing parameters.',
    educational: LESSON_THEORY.learning,
    question: 'What happens when the observed next token is “tired” but its probability is low?', inputRepresentation: 'Predicted distribution + observed target token', operation: 'Cross-entropy, backpropagation, optimizer update', outputRepresentation: 'Slightly changed model parameters',
    activity: 'training',
    checkpoint: { question: 'What does backpropagation compute?', choices: [{ value: 'update', label: 'The final parameter update by itself' }, { value: 'gradients', label: 'Loss gradients for contributing parameters' }, { value: 'tokens', label: 'A better tokenizer vocabulary' }], correctValue: 'gradients', explanation: 'Backpropagation computes derivatives efficiently. An optimizer such as SGD or Adam uses those gradients to choose parameter updates.' },
    bridgeForward: 'The capstone asks you to explain which representation changes at every stage when the prompt changes.', slide: 29,
  },
  {
    id: 'capstone', stage: 'all', shortTitle: 'Explain the whole pass', title: 'Change one word and trace every consequence.',
    educational: LESSON_THEORY.capstone,
    question: 'If “animal” becomes “robot,” which stages change immediately?', inputRepresentation: 'A modified unfinished sentence', operation: 'Trace the complete representation pipeline', outputRepresentation: 'A defensible prediction about system behavior',
    activity: 'capstone',
    checkpoint: { question: 'Which component stays fixed during ordinary inference?', choices: [{ value: 'states', label: 'Contextual token states' }, { value: 'cache', label: 'The request KV cache' }, { value: 'weights', label: 'Learned model parameters' }], correctValue: 'weights', explanation: 'Prompt-dependent states, logits, and cache contents change. Learned parameters remain fixed unless a training update occurs.' },
    bridgeForward: 'Continue into semantic retrieval or neural-network foundations as separate mental models, or restart with a new prompt.',
  },
];

export function getLlmCourseLesson(id: string | undefined) {
  return LLM_COURSE_LESSONS.find((lesson) => lesson.id === id);
}

export function getLlmCourseRoute(id: LlmCourseLessonId) {
  return `/learn/how-llm-works/course/${id}`;
}
