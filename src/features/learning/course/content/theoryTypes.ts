export type CourseTheorySource = {
  label: string;
  url: string;
  note: string;
};

export type CourseTheoryDiagram = {
  id: string;
  title: string;
  caption: string;
  alt: string;
  chart: string;
  kind: 'pipeline' | 'mechanism' | 'shape' | 'comparison';
  provenance: 'exact educational calculation' | 'illustrative schematic' | 'live behavioral output';
};

export type CourseTheorySection = {
  id: string;
  eyebrow: string;
  heading: string;
  body: string;
  diagramIds?: string[];
};

export type CourseTheoryExercise = {
  id: string;
  kind: 'predict' | 'calculate' | 'trace' | 'debug' | 'transfer';
  prompt: string;
  answer: string;
};

export type CourseTheoryChapter = {
  question: string;
  estimatedMinutes: number;
  prerequisites: string[];
  objectives: string[];
  sections: CourseTheorySection[];
  diagrams: CourseTheoryDiagram[];
  misconceptions: Array<{ claim: string; whyPlausible: string; correction: string; diagnostic: string }>;
  exercises: CourseTheoryExercise[];
  glossary: Array<{ term: string; definition: string }>;
};

export type CourseTheory = {
  heading: string;
  takeaway: string;
  explanation: string;
  whyItMatters: string;
  misconception: { claim: string; correction: string };
  tryThis: string;
  mathNote?: string;
  diagram?: { chart: string; alt: string };
  sources: CourseTheorySource[];
  chapter?: CourseTheoryChapter;
};
