import { useMemo } from 'react';
import {
  Check,
  ChevronRight,
  Clock,
  Flag,
  Lock,
  RotateCcw,
  Rocket,
  Server,
  Trophy,
  Code2,
  Cloud,
  GitBranch,
  Database,
  Star,
  FlaskConical,
  Sprout,
} from 'lucide-react';
import { Bar, Button, Skeleton } from './ui';
import type { GapAnalysis, Stage } from '../lib/types';

/* Icon per stage position, cycling for longer roadmaps. */
const ICONS = [Flag, Code2, Server, Database, GitBranch, Cloud, FlaskConical, Rocket, Star];

const STATUS = {
  completed: {
    label: 'Completed',
    node: 'bg-mint text-white',
    ring: 'ring-mint/25',
    card: 'border-mint/40',
    text: 'text-[#0F7A54]',
    Icon: Check,
  },
  'in-progress': {
    label: 'In progress',
    node: 'bg-amber text-white',
    ring: 'ring-amber/30',
    card: 'border-amber/50',
    text: 'text-[#9A6B04]',
    Icon: Clock,
  },
  locked: {
    label: 'Locked',
    node: 'bg-line text-mute',
    ring: 'ring-line',
    card: 'border-line',
    text: 'text-mute',
    Icon: Lock,
  },
};

export default function Roadmap({
  stages,
  loading,
  analysis,
  onOpen,
  onReset,
}: {
  stages: Stage[];
  loading: boolean;
  analysis: GapAnalysis | null;
  onOpen: (s: Stage) => void;
  onReset: () => void;
}) {
  const roleTitle = analysis?.role.title ?? 'Career';
  const foundationGaps = analysis?.foundationGaps ?? [];
  const counts = useMemo(() => {
    const c = { completed: 0, 'in-progress': 0, locked: 0 };
    stages.forEach((s) => {
      c[s.status] = (c[s.status] ?? 0) + 1;
    });
    return c;
  }, [stages]);

  const overall = useMemo(() => {
    if (!stages.length) return 0;
    // Average of per-stage progress, with completed stages counting as 100.
    const total = stages.reduce((a, s) => a + (s.status === 'completed' ? 100 : s.progress), 0);
    return Math.round(total / stages.length);
  }, [stages]);

  const nextStage = useMemo(
    () => stages.find((s) => s.status === 'in-progress') || stages.find((s) => s.status === 'locked'),
    [stages],
  );

  return (
    <section id="roadmap" className="mesh-soft px-4 py-8 sm:px-7 sm:py-12">
      {/* Head */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[23px] font-extrabold leading-tight tracking-tight text-ink sm:text-[28px]">
              {roleTitle} Roadmap
            </h2>
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber">
              <Star size={12} fill="currentColor" className="text-white" />
            </span>
          </div>
          <p className="mt-1.5 text-[14px] text-body">
            Step-by-step journey to become job-ready. Complete each stage to unlock the next.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onReset}>
          <RotateCcw size={13} /> Reset progress
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <Skeleton className="h-[520px]" />
          <div className="space-y-4">
            <Skeleton className="h-56" />
            <Skeleton className="h-44" />
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* ------------------------------ Tree ------------------------------ */}
          <div className="rounded-[22px] border border-line bg-card p-5 sm:p-7">
            <div className="relative mx-auto max-w-xl">
              {/* Stage 0 — foundation topics the user marked as not yet known */}
              {foundationGaps.length > 0 && (
                <div className="relative">
                  <div className="relative z-10 w-full rounded-2xl border-2 border-amber/50 bg-amber-tint p-4 pt-7 text-center sm:p-5 sm:pt-8">
                    <span className="absolute -top-5 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-amber text-white ring-4 ring-card">
                      <Sprout size={17} strokeWidth={2.5} />
                    </span>
                    <p className="text-[15px] font-extrabold tracking-tight text-ink">
                      0. Foundations first
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-body">
                      You marked these as not yet known, so clear them before Stage 1.
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      {foundationGaps.map((f) => (
                        <span
                          key={f.name}
                          className="rounded-full border border-amber/30 bg-white/80 px-2.5 py-1 text-[11.5px] font-bold text-[#9A6B04]"
                        >
                          {f.name} · {f.weeks}w
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 border-t border-amber/25 pt-3 text-[11.5px] font-bold text-[#9A6B04]">
                      {analysis?.foundationWeeks}w of prep before the role roadmap
                    </div>
                  </div>

                  <div className="relative flex h-14 items-center justify-center">
                    <span className="absolute inset-y-0 w-[3px] rounded-full bg-line" />
                    <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-2 rounded-full bg-line-2" />
                    <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-4 -translate-y-1/2 rounded-full bg-line-2" />
                  </div>
                </div>
              )}

              {stages.map((s, i) => {
                const st = STATUS[s.status] ?? STATUS.locked;
                const Icon = ICONS[i % ICONS.length];
                const isLast = i === stages.length - 1;
                const nextDone = stages[i + 1]?.status === 'completed';

                return (
                  <div key={s.id} className="relative">
                    <button
                      onClick={() => onOpen(s)}
                      className={`relative z-10 w-full rounded-2xl border-2 bg-card p-4 pt-7 text-center transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(91,79,233,0.32)] sm:p-5 sm:pt-8 ${st.card}`}
                    >
                      {/* Node badge straddling the top edge */}
                      <span
                        className={`absolute -top-5 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full ring-4 ring-card ${st.node}`}
                      >
                        <Icon size={17} strokeWidth={2.5} />
                      </span>

                      <p className="text-[15px] font-extrabold tracking-tight text-ink">
                        {s.position}. {s.short_title}
                      </p>
                      <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-body">
                        {s.subtitle}
                      </p>

                      {/* Status line */}
                      <div className="mt-3">
                        {s.status === 'completed' ? (
                          <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold ${st.text}`}>
                            <span className="grid h-4 w-4 place-items-center rounded-full bg-mint">
                              <Check size={9} strokeWidth={4} className="text-white" />
                            </span>
                            Completed
                          </span>
                        ) : s.status === 'locked' ? (
                          <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold ${st.text}`}>
                            <Lock size={11} /> Locked
                          </span>
                        ) : (
                          <div className="mx-auto flex max-w-[240px] items-center gap-2.5">
                            <Bar value={s.progress} tone="amber" />
                            <span className="shrink-0 text-[12px] font-extrabold text-[#9A6B04]">
                              {s.progress}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Meta footer */}
                      <div className="mt-3 flex items-center justify-center gap-4 border-t border-line pt-3 text-[11.5px]">
                        <span className="flex items-center gap-1.5 text-mute">
                          <Clock size={11} /> {s.hours}
                        </span>
                        <span className="font-extrabold text-indigo">+{s.xp} XP</span>
                        {s.tags[0] && (
                          <span className="hidden rounded-md bg-tint px-2 py-0.5 font-medium text-body sm:inline">
                            {s.tags[0]}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Trunk connector between stages */}
                    {!isLast && (
                      <div className="relative flex h-14 items-center justify-center">
                        <span
                          className={`absolute inset-y-0 w-[3px] rounded-full ${
                            nextDone ? 'bg-mint' : s.status === 'completed' ? 'bg-mint/45' : 'bg-line'
                          }`}
                        />
                        {/* Leaf accents, echoing the reference's branch styling */}
                        <span
                          className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-2 rounded-full ${
                            nextDone ? 'bg-mint/60' : 'bg-line-2'
                          }`}
                        />
                        <span
                          className={`absolute left-1/2 top-1/2 h-2 w-2 -translate-x-4 -translate-y-1/2 rounded-full ${
                            nextDone ? 'bg-mint/40' : 'bg-line-2'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quote strip, as in the reference */}
            <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-line bg-tint px-5 py-4 text-center">
              <p className="text-[13px] font-semibold italic leading-relaxed text-body">
                “The best way to predict the future is to create it.”
              </p>
              <p className="mt-1 text-[11.5px] text-mute">— Peter Drucker</p>
            </div>
          </div>

          {/* ----------------------------- Sidebar ----------------------------- */}
          <div className="space-y-4">
            {/* Overall progress ring */}
            <div className="rounded-[22px] border border-line bg-card p-5">
              <p className="text-[13.5px] font-extrabold tracking-tight text-ink">Overall Progress</p>

              <div className="mx-auto my-5 grid h-[150px] w-[150px] place-items-center">
                <svg width="150" height="150" className="-rotate-90">
                  <circle cx="75" cy="75" r="62" stroke="#E9E7F2" strokeWidth="14" fill="none" />
                  <circle
                    cx="75"
                    cy="75"
                    r="62"
                    stroke="#5B4FE9"
                    strokeWidth="14"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={2 * Math.PI * 62 * (1 - overall / 100)}
                    style={{ transition: 'stroke-dashoffset 700ms ease' }}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-[30px] font-extrabold leading-none tracking-tight text-ink">
                    {overall}
                    <span className="text-[18px]">%</span>
                  </p>
                  <p className="mt-1 text-[11.5px] font-semibold text-mute">Completed</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[19px] font-extrabold tracking-tight text-ink">
                  {counts.completed} / {stages.length}
                </p>
                <p className="mt-0.5 text-[11.5px] text-mute">Stages completed</p>
              </div>

              {nextStage && (
                <button
                  onClick={() => onOpen(nextStage)}
                  className="mt-4 flex w-full items-center justify-between gap-2 rounded-full bg-indigo px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-indigo-hi"
                >
                  Continue learning <ChevronRight size={15} />
                </button>
              )}
            </div>

            {/* Breakdown */}
            <div className="rounded-[22px] border border-line bg-card p-5">
              <p className="mb-3 text-[13.5px] font-extrabold tracking-tight text-ink">Progress Overview</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Completed', n: counts.completed, dot: 'bg-mint', Icon: Check },
                  { label: 'In progress', n: counts['in-progress'], dot: 'bg-amber', Icon: Clock },
                  { label: 'Locked', n: counts.locked, dot: 'bg-line-2', Icon: Lock },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5">
                      <span className={`grid h-5 w-5 place-items-center rounded-full ${row.dot}`}>
                        <row.Icon
                          size={10}
                          strokeWidth={3}
                          className={row.label === 'Locked' ? 'text-mute' : 'text-white'}
                        />
                      </span>
                      <span className="text-[13px] text-body">{row.label}</span>
                    </span>
                    <span className="text-[13px] font-extrabold text-ink">{row.n}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[13px] font-bold text-ink">Total stages</span>
                <span className="text-[13px] font-extrabold text-ink">{stages.length}</span>
              </div>
            </div>

            {/* Upcoming milestone */}
            {nextStage && (
              <div className="rounded-[22px] border border-line bg-card p-5">
                <p className="mb-3 text-[13.5px] font-extrabold tracking-tight text-ink">Upcoming Milestone</p>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-tint">
                    <Trophy size={17} className="text-amber" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold leading-snug text-ink">
                      Complete {nextStage.short_title}
                    </p>
                    <p className="mt-0.5 text-[12px] font-extrabold text-[#0F7A54]">+ {nextStage.xp} XP</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2.5">
                  <Bar value={nextStage.progress} tone="amber" />
                  <span className="shrink-0 text-[11.5px] font-bold text-body">{nextStage.progress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
