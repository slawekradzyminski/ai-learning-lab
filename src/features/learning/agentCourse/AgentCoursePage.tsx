import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { AGENT_COURSE_LESSONS, getAgentCourseLesson, getAgentCourseRoute, type AgentCourseLessonId } from './agentCourseCatalog';
import { AgentCourseLessonView } from './AgentCourseLessonView';
import { AgentCourseLessonMenu } from './AgentCourseLessonMenu';
import { clearAgentCourseProgress, completeAgentLesson, readCompletedAgentLessons } from './agentCourseProgress';
import { AGENT_COURSE_SCENARIO } from './content/agentCourseBible';

export function AgentCoursePage() {
  const { lessonId } = useParams();
  const location = useLocation();
  const lesson = getAgentCourseLesson(lessonId);
  const [completedIds, setCompletedIds] = useState<AgentCourseLessonId[]>(readCompletedAgentLessons);
  const lessonTitleRef = useRef<HTMLHeadingElement>(null);
  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const currentIndex = lesson ? AGENT_COURSE_LESSONS.findIndex(({ id }) => id === lesson.id) : -1;
  const previous = currentIndex > 0 ? AGENT_COURSE_LESSONS[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? AGENT_COURSE_LESSONS[currentIndex + 1] : undefined;

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame?.(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
      return;
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    window.scrollTo?.({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    lessonTitleRef.current?.focus({ preventScroll: true });
  }, [lesson?.id, location.hash]);

  if (!lesson) return <Navigate to={getAgentCourseRoute(AGENT_COURSE_LESSONS[0].id)} replace />;

  return (
    <div className="space-y-8 pb-10" data-testid="agent-course-page">
      <header className="learning-enter border-b border-stone-300 pb-10 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/learn" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-950"><ArrowLeft className="h-3.5 w-3.5" /> AI Learning Lab</Link>
          <AgentCourseLessonMenu lesson={lesson} completed={completed} />
        </div>
        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Agent lesson {String(currentIndex + 1).padStart(2, '0')} · {lesson.shortTitle}</p>
        <h1 ref={lessonTitleRef} tabIndex={-1} className="mt-4 max-w-5xl text-4xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 outline-none md:text-6xl" data-testid="agent-course-lesson-title">{lesson.question}</h1>
        <p className="mt-8 max-w-4xl border-l border-stone-300 pl-5 font-mono text-sm leading-7 text-slate-500">{AGENT_COURSE_SCENARIO.userGoal}</p>
      </header>

      <AgentCourseLessonView lesson={lesson} onComplete={() => setCompletedIds(completeAgentLesson(lesson.id))} />

      <footer className="border-t border-stone-300 pt-8">
        <div className="grid grid-cols-2 gap-4">
          {previous ? <Link to={getAgentCourseRoute(previous.id)} className="group justify-self-start"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"><ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" /> Previous</span><span className="mt-2 block text-sm font-semibold text-slate-950">{previous.shortTitle}</span></Link> : <span />}
          {next ? <Link to={getAgentCourseRoute(next.id)} className="group justify-self-end text-right" data-testid="agent-course-next"><span className="flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Next lesson <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span><span className="mt-2 block text-base font-semibold text-slate-950">{next.shortTitle}</span></Link> : <Link to="/learn#how-ai-agent-works" className="group justify-self-end text-right" data-testid="agent-course-finish"><span className="flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Course complete <Check className="h-3.5 w-3.5" /></span><span className="mt-2 block text-sm font-semibold text-slate-950">Review another path</span></Link>}
        </div>
        <div className="mt-7 flex justify-center"><button type="button" onClick={() => { clearAgentCourseProgress(); setCompletedIds([]); }} className="inline-flex min-h-10 items-center gap-2 px-3 text-xs font-semibold text-slate-400 hover:text-slate-700"><RotateCcw className="h-3.5 w-3.5" /> Reset course progress</button></div>
      </footer>
    </div>
  );
}
