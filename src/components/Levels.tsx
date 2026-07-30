import { Check, ExternalLink, GraduationCap, Info } from 'lucide-react';
import { Bar, PanelHead } from './ui';
import type { EducationLevel, FoundationSkill } from '../lib/types';

export default function Levels({
  educationLevels,
  foundationSkills,
  education,
  setEducation,
  knownBaseline,
  toggleBaseline,
  setAllBaseline,
}: {
  educationLevels: EducationLevel[];
  foundationSkills: FoundationSkill[];
  education: string | null;
  setEducation: (slug: string) => void;
  knownBaseline: string[];
  toggleBaseline: (name: string) => void;
  setAllBaseline: (all: boolean) => void;
}) {
  const level = educationLevels.find((l) => l.slug === education);
  const baseline = level?.baseline_skills || [];
  const known = knownBaseline.length;
  const gap = baseline.length - known;

  const meta = (name: string) => foundationSkills.find((f) => f.name.toLowerCase() === name.toLowerCase());

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
      {/* Level picker */}
      <div className="card">
        <PanelHead title="Your current level" />
        <div className="space-y-2.5 p-5">
          {educationLevels.map((l) => {
            const on = education === l.slug;
            return (
              <button
                key={l.slug}
                onClick={() => setEducation(l.slug)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  on ? 'border-amber bg-amber-tint' : 'border-line-2 bg-card hover:bg-tint'
                }`}
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                    on ? 'border-amber bg-amber' : 'border-line-2'
                  }`}
                >
                  {on && <Check size={11} strokeWidth={3.5} className="text-ink" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-extrabold text-ink">{l.label}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-body">{l.subtitle}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {l.baseline_skills.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-body">
                        {s}
                      </span>
                    ))}
                    {l.baseline_skills.length > 4 && (
                      <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-mute">
                        +{l.baseline_skills.length - 4}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Baseline checklist */}
      <div className="card">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-[17px] font-extrabold tracking-tight text-ink">What do you actually know?</h2>
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => setAllBaseline(true)}
              className="rounded-lg border border-line-2 bg-card px-2.5 py-1.5 text-[11.5px] font-bold text-body transition-colors hover:bg-tint hover:text-ink"
            >
              All
            </button>
            <button
              onClick={() => setAllBaseline(false)}
              className="rounded-lg border border-line-2 bg-card px-2.5 py-1.5 text-[11.5px] font-bold text-body transition-colors hover:bg-tint hover:text-ink"
            >
              None
            </button>
          </div>
        </div>

        <div className="p-5">
          {!level ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-tint">
                <GraduationCap size={19} className="text-amber-deep" />
              </span>
              <p className="max-w-[260px] text-[13px] leading-relaxed text-body">
                Pick your current level on the left, then confirm which topics you already know.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-[12.5px] leading-relaxed text-body">
                Untick anything you haven't learnt yet — it gets added to the front of your roadmap as a
                foundation topic.
              </p>

              <div className="space-y-2">
                {baseline.map((name) => {
                  const on = knownBaseline.includes(name);
                  const info = meta(name);
                  return (
                    <label
                      key={name}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors ${
                        on ? 'border-line-2 bg-tint' : 'border-warn/30 bg-warn-tint'
                      }`}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggleBaseline(name)} className="sr-only" />
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
                          on ? 'border-amber bg-amber' : 'border-line-2 bg-card'
                        }`}
                      >
                        {on && <Check size={11} strokeWidth={3.5} className="text-ink" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[13.5px] font-extrabold text-ink">{name}</span>
                          {!on && info && (
                            <span className="rounded-md bg-white px-2 py-0.5 text-[10.5px] font-bold text-warn">
                              +{info.weeks} weeks to learn
                            </span>
                          )}
                        </span>
                        {!on && info && (
                          <>
                            <span className="mt-1 block text-[12px] leading-relaxed text-body">{info.blurb}</span>
                            {info.resource_url && (
                              <a
                                href={info.resource_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-bold text-amber-deep hover:underline"
                              >
                                {info.resource_title} <ExternalLink size={10} />
                              </a>
                            )}
                          </>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-center gap-3">
                  <Bar value={baseline.length ? (known / baseline.length) * 100 : 100} />
                  <span className="shrink-0 text-[12.5px] font-extrabold text-ink">
                    {known}/{baseline.length}
                  </span>
                </div>
                {gap > 0 && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-warn-tint px-3 py-2.5 text-[12px] leading-relaxed text-warn">
                    <Info size={13} className="mt-0.5 shrink-0" />
                    {gap} foundation {gap === 1 ? 'topic' : 'topics'} will be added before Stage 1 of your
                    roadmap.
                  </p>
                )}
              </div>

              {level.next_steps.length > 0 && (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="mb-2.5 text-[11.5px] font-extrabold uppercase tracking-wide text-mute">
                    Recommended next steps
                  </p>
                  <ol className="space-y-2">
                    {level.next_steps.map((s, i) => (
                      <li key={s} className="flex items-start gap-2.5">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-tint text-[10.5px] font-extrabold text-amber-deep">
                          {i + 1}
                        </span>
                        <span className="text-[12.5px] leading-relaxed text-body">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
