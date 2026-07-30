import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ClipboardList,
  Clock,
  Flame,
  Lock,
  MoreVertical,
  Zap,
} from 'lucide-react';
import { Badge, Bar, Button, Donut, PanelHead, Skeleton } from './ui';
import type { GapAnalysis, Profile, Role, Stage } from '../lib/types';
import type { View } from './Sidebar';

const STAT_ICON = {
  clipboard: ClipboardList,
  check: CheckCircle2,
  clock: Clock,
  flame: Flame,
};

export default function Overview({
  profile,
  role,
  stages,
  analysis,
  loading,
  setView,
  onOpenStage,
}: {
  profile: Profile | null;
  role?: Role;
  stages: Stage[];
  analysis: GapAnalysis | null;
  loading: boolean;
  setView: (v: View) => void;
  onOpenStage: (s: Stage) => void;
}) {
  const done = stages.filter((s) => s.status === 'completed').length;
  const active = stages.filter((s) => s.status === 'in-progress').length;
  const locked = stages.filter((s) => s.status === 'locked').length;
  const totalRes = stages.reduce((a, s) => a + s.resources.length, 0);
  const doneRes = stages.reduce((a, s) => a + s.completed_resources.length, 0);

  const stats: {
    label: string;
    value: number;
    icon: keyof typeof STAT_ICON;
    delta: string;
    dir: 'up' | 'down' | 'flat';
  }[] = [
    {
      label: 'Total Stages',
      value: stages.length,
      icon: 'clipboard' as const,
      delta: `${totalRes} resources`,
      dir: 'flat' as const,
    },
    {
      label: 'Completed',
      value: done,
      icon: 'check' as const,
      delta: stages.length ? `${Math.round((done / stages.length) * 100)}% of roadmap` : 'No data',
      dir: 'up' as const,
    },
    {
      label: 'In Progress',
      value: active,
      icon: 'clock' as const,
      delta: `${doneRes}/${totalRes} resources done`,
      dir: doneRes > 0 ? ('up' as const) : ('flat' as const),
    },
    {
      label: 'Day Streak',
      value: profile?.streak ?? 0,
      icon: 'flame' as const,
      delta: `Level ${profile?.level ?? 1} · ${(profile?.xp ?? 0).toLocaleString()} XP`,
      dir: 'up' as const,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[132px]" />)
          : stats.map((s) => {
              const Icon = STAT_ICON[s.icon];
              return (
                <div key={s.label} className="card p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-tint">
                      <Icon size={18} className="text-amber-deep" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-body">{s.label}</p>
                      <p className="mt-0.5 text-[30px] font-extrabold leading-none tracking-tight text-ink">
                        {s.value}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 text-[12px] text-body">
                    {s.dir === 'up' && <ArrowUp size={12} className="text-good" />}
                    {s.dir === 'down' && <ArrowDown size={12} className="text-bad" />}
                    <span className={s.dir === 'flat' ? 'text-mute' : 'font-semibold text-ink'}>{s.delta}</span>
                  </p>
                </div>
              );
            })}
      </div>

      {/* Middle row */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* Stage list */}
        <div className="card">
          <PanelHead title="My Stages" action="View All" onAction={() => setView('roadmap')} />
          {loading ? (
            <div className="space-y-3 p-5">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : stages.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-body">
              No roadmap loaded yet. Run the skill gap analyzer to build one.
            </p>
          ) : (
            <div>
              {stages.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => onOpenStage(s)}
                  className={`flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-tint ${
                    i < stages.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${
                      s.status === 'completed'
                        ? 'border-amber bg-amber'
                        : s.status === 'in-progress'
                          ? 'border-amber'
                          : 'border-line-2'
                    }`}
                  >
                    {s.status === 'completed' && (
                      <CheckCircle2 size={11} strokeWidth={3.5} className="text-ink" />
                    )}
                    {s.status === 'locked' && <Lock size={9} className="text-mute" />}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[14px] font-semibold ${
                        s.status === 'completed' ? 'text-mute line-through' : 'text-ink'
                      }`}
                    >
                      {s.short_title}
                    </span>
                  </span>

                  <span className="hidden shrink-0 sm:block">
                    <Badge tone={s.status === 'completed' ? 'good' : s.status === 'in-progress' ? 'amber' : 'neutral'}>
                      {s.tags[0] ?? 'Skill'}
                    </Badge>
                  </span>

                  <span className="hidden w-20 shrink-0 text-right text-[12.5px] text-mute sm:block">
                    {s.status === 'in-progress' ? `${s.progress}%` : s.hours}
                  </span>

                  <MoreVertical size={15} className="shrink-0 text-mute" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Readiness */}
        <div className="card">
          <PanelHead title="Readiness" action="Analyze" onAction={() => setView('analyzer')} />
          <div className="p-5">
            {!analysis ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-tint">
                  <Zap size={19} className="text-amber-deep" />
                </span>
                <p className="max-w-[240px] text-[13px] leading-relaxed text-body">
                  Run the skill gap analyzer to see how close you are to{' '}
                  {role ? role.title : 'your target role'}.
                </p>
                <Button size="sm" onClick={() => setView('analyzer')}>
                  Calculate gap
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-[42px] font-extrabold leading-none tracking-tight text-ink">
                    {analysis.readinessPct}%
                  </p>
                  <p className="mt-1.5 text-[12.5px] text-body">ready for {analysis.role.title}</p>
                </div>

                <div className="mt-5 space-y-3.5">
                  {[
                    { label: 'Education', pct: analysis.educationPct, tone: 'ink' as const },
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

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
                  {[
                    { k: `${analysis.foundationWeeks}w`, v: 'Foundations' },
                    { k: `${analysis.skillWeeks}w`, v: 'Role skills' },
                    { k: `~${analysis.totalYears}y`, v: 'To ready' },
                  ].map((x) => (
                    <div key={x.v}>
                      <p className="text-[16px] font-extrabold text-ink">{x.k}</p>
                      <p className="mt-0.5 text-[10.5px] font-semibold text-mute">{x.v}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* Donut */}
        <div className="card">
          <PanelHead title="Stage Overview" />
          <div className="flex flex-col items-center gap-7 p-5 sm:flex-row sm:gap-9">
            {loading ? (
              <Skeleton className="h-[168px] w-[168px] rounded-full" />
            ) : (
              <Donut
                total={stages.length}
                label="Stages"
                segments={[
                  { value: done, color: '#FBC02D' },
                  { value: active, color: '#FDE49A' },
                  { value: locked, color: '#F0EDE1' },
                ]}
              />
            )}
            <div className="w-full flex-1 space-y-3">
              {[
                { label: 'Completed', n: done, color: '#FBC02D' },
                { label: 'In Progress', n: active, color: '#FDE49A' },
                { label: 'Locked', n: locked, color: '#E5E0CE' },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-3 border-b border-line pb-3 last:border-0">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
                  <span className="flex-1 text-[13.5px] font-semibold text-ink">{r.label}</span>
                  <span className="text-[13.5px] font-extrabold text-ink">{r.n}</span>
                  <span className="w-11 text-right text-[12.5px] text-mute">
                    {stages.length ? Math.round((r.n / stages.length) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next up */}
        <div className="card">
          <PanelHead title="What's Next" />
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {analysis && analysis.foundationGaps.length > 0 && (
                  <div>
                    <p className="mb-2.5 text-[11.5px] font-extrabold uppercase tracking-wide text-mute">
                      Foundations first
                    </p>
                    {analysis.foundationGaps.slice(0, 3).map((f) => (
                      <div key={f.name} className="flex items-center gap-3 py-2">
                        <span className="w-[62px] shrink-0 text-[12.5px] font-semibold text-body">
                          {f.weeks} weeks
                        </span>
                        <span className="h-2 w-2 shrink-0 rounded-full bg-warn" />
                        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">
                          {f.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <p className="mb-2.5 text-[11.5px] font-extrabold uppercase tracking-wide text-mute">
                    Active stages
                  </p>
                  {stages.filter((s) => s.status !== 'completed').length === 0 ? (
                    <p className="text-[13px] text-body">Every stage is complete. Pick a new target role.</p>
                  ) : (
                    stages
                      .filter((s) => s.status !== 'completed')
                      .slice(0, 4)
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onOpenStage(s)}
                          className="flex w-full items-center gap-3 py-2 text-left transition-colors hover:bg-tint"
                        >
                          <span className="w-[62px] shrink-0 text-[12.5px] font-semibold text-body">
                            {s.xp} XP
                          </span>
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: s.status === 'in-progress' ? '#FBC02D' : '#E5E0CE' }}
                          />
                          <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">
                            {s.short_title}
                          </span>
                        </button>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
