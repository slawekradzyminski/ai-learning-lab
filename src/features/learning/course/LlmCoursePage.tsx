import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { clearCourseProgress, completeLesson, readCompletedLessons } from './courseProgress';
import { CoursePipeline } from './CoursePipeline';
import { CourseLearnView } from './CourseLessonViews';
import { LLM_COURSE_PROMPT, LLM_COURSE_TARGET } from './courseScenario';
import { LLM_COURSE_LESSONS, getLlmCourseLesson, getLlmCourseRoute, type LlmCourseLessonId } from './llmCourseCatalog';

export function LlmCoursePage() {
  const { lessonId } = useParams();
  const location = useLocation();
  const lesson = getLlmCourseLesson(lessonId);
  const [completedIds, setCompletedIds] = useState<LlmCourseLessonId[]>(readCompletedLessons);

  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const currentIndex = lesson ? LLM_COURSE_LESSONS.findIndex(({ id }) => id === lesson.id) : -1;
  const previous = currentIndex > 0 ? LLM_COURSE_LESSONS[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? LLM_COURSE_LESSONS[currentIndex + 1] : undefined;

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame?.(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
      return;
    }
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }, [lesson?.id, location.hash]);

  if (!lesson) return <Navigate to={getLlmCourseRoute(LLM_COURSE_LESSONS[0].id)} replace />;

  const markComplete = () => setCompletedIds(completeLesson(lesson.id));

  return (
    <div className="space-y-8 pb-10" data-testid="llm-course-page">
      <header className="learning-enter border-b border-stone-300 pb-10 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/learn" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-950"><ArrowLeft className="h-3.5 w-3.5" /> AI Learning Lab</Link>
          <p className="text-xs font-semibold text-slate-500" data-testid="course-progress"><span className="font-mono text-sky-700">{completed.size}/{LLM_COURSE_LESSONS.length}</span> complete</p>
        </div>
        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Lesson {String(currentIndex + 1).padStart(2, '0')} · {lesson.shortTitle}</p>
        <h1 className="mt-4 max-w-5xl text-4xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 md:text-6xl" data-testid="course-lesson-title">{lesson.question}</h1>
        <p className="mt-8 max-w-3xl border-l border-stone-300 pl-5 font-mono text-sm leading-7 text-slate-500">{LLM_COURSE_PROMPT}<span className="text-sky-700">{currentIndex === 0 ? ' …' : LLM_COURSE_TARGET}</span></p>
      </header>

      <CoursePipeline lesson={lesson} completed={completed} />
      <CourseLearnView lesson={lesson} onComplete={markComplete} />

      <footer className="border-t border-stone-300 pt-8">
        <div className="grid grid-cols-2 gap-4">
          {previous ? <Link to={getLlmCourseRoute(previous.id)} className="group justify-self-start"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"><ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" /> Previous</span><span className="mt-2 block text-sm font-semibold text-slate-950">{previous.shortTitle}</span></Link> : <span />}
          {next ? <Link to={getLlmCourseRoute(next.id)} className="group justify-self-end text-right" data-testid="course-next"><span className="flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Next lesson <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span><span className="mt-2 block text-base font-semibold text-slate-950">{next.shortTitle}</span></Link> : <Link to="/learn#how-llm-works" className="group justify-self-end text-right" data-testid="course-finish"><span className="flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Course complete <Check className="h-3.5 w-3.5" /></span><span className="mt-2 block text-sm font-semibold text-slate-950">Choose an optional path</span></Link>}
        </div>
        <div className="mt-7 flex justify-center"><button type="button" onClick={() => { clearCourseProgress(); setCompletedIds([]); }} className="inline-flex min-h-10 items-center gap-2 px-3 text-xs font-semibold text-slate-400 hover:text-slate-700"><RotateCcw className="h-3.5 w-3.5" /> Reset course progress</button></div>
      </footer>
    </div>
  );
}
