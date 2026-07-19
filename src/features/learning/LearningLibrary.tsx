import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LEARNING_SECTIONS, getSectionLabs, getSectionTracks } from './learningCatalog';

export function LearningLibrary() {
  return (
    <details className="group border-y border-stone-300" data-testid="learning-library">
      <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left marker:content-none" data-testid="learning-library-toggle">
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Explore by topic</span>
          <span className="mt-1 block text-lg font-semibold text-slate-950">Open any interactive lab</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-90" />
      </summary>

      <div className="learning-reveal border-t border-stone-200 pb-10 pt-8">
        {LEARNING_SECTIONS.map((section) => {
          const labs = getSectionLabs(section.id);
          const tracks = getSectionTracks(section.id);
          return (
            <section key={section.id} className="border-b border-stone-200 py-9 last:border-b-0" data-testid={`learning-section-${section.id}`}>
              <div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{section.label}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{section.title}</h2>
                </div>
              </div>

              <div className="mt-8 grid gap-x-12 gap-y-8 lg:grid-cols-3">
                {tracks.map((track) => (
                  <div key={track.id} data-testid={`learning-track-${track.id}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{track.title}</p>
                    <div className="mt-3 divide-y divide-stone-200 border-t border-stone-200">
                      {labs.filter((lab) => lab.track === track.id).map((lab) => (
                        <Link key={lab.id} to={lab.route} className="group flex items-center justify-between gap-4 py-3 text-sm font-semibold text-slate-700 hover:text-sky-700" data-testid={`learning-path-${lab.id}`}>
                          <span>{lab.shortTitle}</span><ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </details>
  );
}
