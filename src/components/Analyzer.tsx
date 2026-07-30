import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { CatalogSkill, EducationLevel, FoundationSkill, GapAnalysis, Role } from '../lib/types';
import { Badge, Bar, Button, Field, inputClass, PanelHead } from './ui';

const VERDICT = {
  early: { label: 'Early foundation stage', tone: 'bad' as const },
  building: { label: 'Building foundations', tone: 'warn' as const },
  approaching: { label: 'Approaching entry level', tone: 'info' as const },
  ready: { label: 'Meets entry requirement', tone: 'good' as const },
};

export default function Analyzer({
  roles,
  skills,
  educationLevels,
  foundationSkills,
  roleId,
  setRoleId,
  education,
  setEducation,
  knownBaseline,
  toggleBaseline,
  setAllBaseline,
  selected,
  setSelected,
  analysis,
  loading,
  error,
  onGenerate,
  onViewRoadmap,
}: {
  roles: Role[];
  skills: CatalogSkill[];
  educationLevels: EducationLevel[];
  foundationSkills: FoundationSkill[];
  roleId: number;
  setRoleId: (id: number) => void;
  education: string | null;
  setEducation: (slug: string) => void;
  knownBaseline: string[];
  toggleBaseline: (name: string) => void;
  setAllBaseline: (all: boolean) => void;
  selected: string[];
  setSelected: (s: string[]) => void;
  analysis: GapAnalysis | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onViewRoadmap: () => void;
}) {
  const [showExtras, setShowExtras] = useState(false);

  const role = roles.find((r) => r.id === roleId);
  const level = educationLevels.find((l) => l.slug === education);
  const baseline = level?.baseline_skills || [];

  const meta = useMemo(() => {
    const map: Record<string, FoundationSkill> = {};
    foundationSkills.forEach((f) => {
      map[f.name.toLowerCase()] = f;
    });
    return map;
  }, [foundationSkills]);

  const baseSet = useMemo(() => new Set(baseline.map((s) => s.toLowerCase())), [baseline]);
  const grouped = useMemo(() => {
    const map: Record<string, CatalogSkill[]> = {};
    skills
      .filter((s) => !baseSet.has(s.name.toLowerCase()))
      .forEach((s) => {
        (map[s.category] ||= []).push(s);
      });
    return map;
  }, [skills, baseSet]);

  const toggle = (name: string) =>
    setSelected(selected.includes(name) ? selected.filter((s) => s !== name) : [...selected, name]);

  const knownCount = knownBaseline.length;
  const gapCount = baseline.length - knownCount;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.05fr]">
      {/* ------------------------------- Inputs ------------------------------- */}
      <div className="card">
        <PanelHead title="Calculate your skill gap" />
        <div className="p-5">
          {/* Step 1 */}
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-amber text-[10.5px] font-extrabold text-ink">
              1
            </span>
            <p className="text-[13px] font-bold text-ink">Your current level</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {educationLevels.map((l) => {
              const on = education === l.slug;
              return (
                <button
                  key={l.slug}
                  onClick={() => setEducation(l.slug)}
                  className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors ${
                    on ? 'border-amber bg-amber-tint' : 'border-line-2 bg-card hover:bg-tint'
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border-2 p-0.5 ${
                      on ? 'border-amber bg-amber' : 'border-line-2'
                    }`}
                  >
                    {on && <Check size={10} strokeWidth={3.5} className="text-ink" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-bold text-ink">{l.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-mute">{l.subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Step 1b — baseline checklist */}
          {level && baseline.length > 0 && (
            <div className="mt-3 rounded-2xl border border-line-2 bg-tint p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-extrabold text-ink">Which of these do you know?</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-body">
                    Untick anything you haven't learnt — it joins Stage 0.
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => setAllBaseline(true)}
                    className="rounded-lg border border-line-2 bg-card px-2.5 py-1 text-[11px] font-bold text-body transition-colors hover:text-ink"
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAllBaseline(false)}
                    className="rounded-lg border border-line-2 bg-card px-2.5 py-1 text-[11px] font-bold text-body transition-colors hover:text-ink"
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {baseline.map((name) => {
                  const on = knownBaseline.includes(name);
                  const info = meta[name.toLowerCase()];
                  return (
                    <label
                      key={name}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 transition-colors ${
                        on ? 'border-line-2 bg-card' : 'border-warn/30 bg-warn-tint'
                      }`}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggleBaseline(name)} className="sr-only" />
                      <span
                        className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded border-2 p-0.5 transition-colors ${
                          on ? 'border-amber bg-amber' : 'border-line-2 bg-card'
                        }`}
                      >
                        {on && <Check size={10} strokeWidth={3.5} className="text-ink" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[12.5px] font-bold text-ink">{name}</span>
                          {!on && info && (
                            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-warn">
                              +{info.weeks}w
                            </span>
                          )}
                        </span>
                        {!on && info && (
                          <span className="mt-1 block text-[11.5px] leading-snug text-body">{info.blurb}</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-2.5 border-t border-line pt-3">
                <Bar value={baseline.length ? (knownCount / baseline.length) * 100 : 100} />
                <span className="shrink-0 text-[11.5px] font-extrabold text-ink">
                  {knownCount}/{baseline.length}
                </span>
              </div>
              {gapCount > 0 && (
                <p className="mt-2 text-[11.5px] font-semibold text-warn">
                  {gapCount} foundation {gapCount === 1 ? 'topic' : 'topics'} added before Stage 1.
                </p>
              )}
            </div>
          )}

          {/* Step 2 */}
          <div className="mb-2 mt-5 flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-amber text-[10.5px] font-extrabold text-ink">
              2
            </span>
            <p className="text-[13px] font-bold text-ink">Your target role</p>
          </div>
          <Field>
            <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} className={inputClass}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </Field>

          {role && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Badge tone="good">{role.demand}</Badge>
              <Badge tone="amber">{role.salary}</Badge>
              <Badge tone="info">{role.openings.toLocaleString()} openings</Badge>
            </div>
          )}

          {/* Step 3 */}
          <div className="mt-5">
            <button
              onClick={() => setShowExtras((v) => !v)}
              className="flex w-full items-center justify-between gap-2 py-1 text-left"
            >
              <span className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-line text-[10.5px] font-extrabold text-body">
                  3
                </span>
                <span className="text-[13px] font-bold text-ink">
                  Extra skills{' '}
                  <span className="font-medium text-mute">
                    (optional{selected.length ? ` · ${selected.length}` : ''})
                  </span>
                </span>
              </span>
              <ChevronRight
                size={15}
                className={`shrink-0 text-mute transition-transform ${showExtras ? 'rotate-90' : ''}`}
              />
            </button>

            {showExtras && (
              <div className="mt-3 max-h-[190px] space-y-3.5 overflow-y-auto pr-1">
                {Object.entries(grouped).map(([cat, list]) => (
                  <div key={cat}>
                    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-mute">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map((s) => {
                        const on = selected.includes(s.name);
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggle(s.name)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-bold transition-colors ${
                              on
                                ? 'border-amber bg-amber text-ink'
                                : 'border-line-2 bg-card text-body hover:bg-tint hover:text-ink'
                            }`}
                          >
                            {on ? <Check size={10} strokeWidth={3} /> : <Plus size={10} strokeWidth={3} />}
                            {s.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button onClick={onGenerate} disabled={!education || loading} full>
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Calculating…
                </>
              ) : (
                <>
                  Calculate skill gap <ArrowRight size={15} />
                </>
              )}
            </Button>
            {selected.length > 0 && (
              <Button variant="secondary" onClick={() => setSelected([])}>
                Clear
              </Button>
            )}
          </div>

          {!education && (
            <p className="mt-2 text-center text-[12px] text-mute">Select your current level to continue.</p>
          )}
          {error && (
            <p className="mt-2 rounded-xl bg-bad-tint px-3 py-2.5 text-[12.5px] text-bad">{error}</p>
          )}
        </div>
      </div>

      {/* ------------------------------- Result ------------------------------- */}
      <div className="card">
        <PanelHead title="Your result" />
        <div className="p-5">
          {loading ? (
            <div className="space-y-2.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-line" />
              ))}
            </div>
          ) : !analysis ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-tint">
                <TrendingUp size={19} className="text-amber-deep" />
              </span>
              <p className="max-w-[260px] text-[13px] leading-relaxed text-body">
                Pick your level, confirm what you know, then run the analysis.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-tint p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Badge tone={VERDICT[analysis.verdict].tone}>{VERDICT[analysis.verdict].label}</Badge>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-body">
                      <span className="font-bold text-ink">{analysis.education.label}</span> →{' '}
                      <span className="font-bold text-ink">{analysis.role.title}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[30px] font-extrabold leading-none tracking-tight text-ink">
                      {analysis.readinessPct}%
                    </p>
                    <p className="mt-1 text-[10.5px] font-bold uppercase tracking-wide text-mute">ready</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { label: 'Education level', pct: analysis.educationPct, tone: 'ink' as const },
                  { label: 'Foundations', pct: analysis.foundationPct, tone: 'amber' as const },
                  { label: 'Role skills', pct: analysis.skillMatchPct, tone: 'good' as const },
                ].map((a) => (
                  <div key={a.label}>
                    <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                      <span className="font-semibold text-body">{a.label}</span>
                      <span className="font-extrabold text-ink">{a.pct}%</span>
                    </div>
                    <Bar value={a.pct} tone={a.tone} />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-tint p-3.5">
                <Target size={14} className="mt-0.5 shrink-0 text-amber-deep" />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-mute">Typical entry bar</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-body">{analysis.entryLabel}</p>
                </div>
              </div>

              {analysis.foundationGaps.length > 0 && (
                <div className="mt-4 rounded-2xl border border-warn/25 bg-warn-tint p-4">
                  <p className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-warn">
                    <Sparkles size={13} /> Stage 0 · Foundations ({analysis.foundationWeeks}w)
                  </p>
                  <ol className="mt-3 space-y-2">
                    {analysis.foundationGaps.map((f, i) => (
                      <li key={f.name} className="rounded-xl bg-white p-3">
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-warn text-[10px] font-extrabold text-white">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[12.5px] font-extrabold text-ink">{f.name}</p>
                              <span className="text-[10.5px] font-bold text-warn">{f.weeks}w</span>
                            </div>
                            <p className="mt-1 text-[11.5px] leading-relaxed text-body">{f.blurb}</p>
                            {f.resource_url && (
                              <a
                                href={f.resource_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-amber-deep hover:underline"
                              >
                                {f.resource_title} <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[12.5px] font-extrabold text-good">
                    You have ({analysis.have.length})
                  </p>
                  <div className="space-y-1.5">
                    {analysis.have.length === 0 && (
                      <p className="text-[12px] leading-relaxed text-mute">
                        None of the role's skills yet — normal at this stage.
                      </p>
                    )}
                    {analysis.have.map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center gap-2 rounded-lg bg-good-tint px-2.5 py-1.5 text-[12.5px] text-ink"
                      >
                        <Check size={11} strokeWidth={3} className="shrink-0 text-good" />
                        <span className="truncate">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[12.5px] font-extrabold text-bad">
                    To learn ({analysis.missing.length})
                  </p>
                  <div className="space-y-1.5">
                    {analysis.missing.length === 0 && (
                      <p className="text-[12px] text-good">You meet every requirement.</p>
                    )}
                    {analysis.missing.map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between gap-2 rounded-lg bg-bad-tint px-2.5 py-1.5 text-[12.5px] text-ink"
                      >
                        <span className="truncate">{s.name}</span>
                        <span className="shrink-0 text-[11px] font-bold text-bad">{s.weeks}w</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { k: `${analysis.foundationWeeks}w`, v: 'Foundations' },
                  { k: `${analysis.skillWeeks}w`, v: 'Role skills' },
                  { k: `${analysis.foundationYears}y`, v: 'Schooling' },
                  { k: `~${analysis.totalYears}y`, v: 'To ready' },
                ].map((s) => (
                  <div key={s.v} className="rounded-xl bg-tint px-2 py-2.5 text-center">
                    <p className="text-[15px] font-extrabold tracking-tight text-ink">{s.k}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-mute">{s.v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-mute">
                  Do these next, in order
                </p>
                <ol className="space-y-2">
                  {analysis.education.nextSteps.map((step, i) => (
                    <li key={step} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-tint text-[10px] font-extrabold text-amber-deep">
                        {i + 1}
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-body">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {analysis.tierGap >= 2 && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-tint p-3.5">
                  <Lock size={14} className="mt-0.5 shrink-0 text-mute" />
                  <p className="text-[12px] leading-relaxed text-body">
                    The role roadmap targets entry level and above. Clear the foundations first.
                  </p>
                </div>
              )}

              <Button variant="secondary" full className="mt-4" onClick={onViewRoadmap}>
                {analysis.tierGap >= 2 ? 'Preview roadmap' : 'View roadmap'} <ArrowRight size={14} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
