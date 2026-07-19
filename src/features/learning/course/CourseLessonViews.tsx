import { BookOpen, FlaskConical, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LearningCheckpoint } from '../LearningCheckpoint';
import { CourseLessonActivity } from './CourseLessonActivity';
import { CourseLessonNotes } from './CourseLessonNotes';
import type { LlmCourseLesson } from './llmCourseCatalog';

function RepresentationContract({ lesson }: { lesson: LlmCourseLesson }) {
  return (
    <div className="grid gap-4 border-b border-stone-300 pb-6 text-sm md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center" data-testid="course-representation-contract">
      <div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">Input</p><p className="mt-2 font-semibold text-slate-950">{lesson.inputRepresentation}</p></div>
      <span className="hidden text-slate-300 md:block">→</span>
      <div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-sky-700">Operation</p><p className="mt-2 font-semibold text-slate-950">{lesson.operation}</p></div>
      <span className="hidden text-slate-300 md:block">→</span>
      <div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">Output</p><p className="mt-2 font-semibold text-slate-950">{lesson.outputRepresentation}</p></div>
    </div>
  );
}

export function CourseLearnView({ lesson, onComplete }: { lesson: LlmCourseLesson; onComplete: () => void }) {
  return (
    <div className="space-y-10 learning-enter" data-testid="course-view-learn">
      <RepresentationContract lesson={lesson} />
      <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-stone-200 pb-5 text-xs font-semibold" aria-label="Lesson materials">
        <a href="#lesson-experiment" className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-700"><FlaskConical className="h-3.5 w-3.5" /> Experiment</a>
        <a href="#lesson-theory" className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-700"><BookOpen className="h-3.5 w-3.5" /> Complete theory</a>
        {lesson.slide ? <Link to={`/learn/how-llm-works/slides?slide=${lesson.slide}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-700"><Presentation className="h-3.5 w-3.5" /> Presenter slides</Link> : null}
      </nav>
      <div id="lesson-experiment" className="scroll-mt-20"><CourseLessonActivity lesson={lesson} /></div>
      <div id="lesson-theory" className="scroll-mt-20"><CourseLessonNotes lesson={lesson} /></div>
      <LearningCheckpoint id={`course-${lesson.id}`} eyebrow="Check your understanding" {...lesson.checkpoint} onCorrect={onComplete} compact />
      <p className="border-l-2 border-sky-500 pl-5 text-sm leading-7 text-slate-600" data-testid="course-forward-bridge"><span className="font-semibold text-slate-900">Next:</span> {lesson.bridgeForward}</p>
    </div>
  );
}
