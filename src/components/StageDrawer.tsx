import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Play,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react';
import { Badge, Bar, Button } from './ui';
import type { Stage } from '../lib/types';

export default function StageDrawer({
  stage,
  onClose,
  onToggleResource,
  onClaim,
  onAttempt,
}: {
  stage: Stage | null;
  onClose: () => void;
  onToggleResource: (stageId: number, slug: string, done: boolean) => void;
  onClaim: (stage: Stage) => void;
  onAttempt: (stageId: number, score: number, total: number) => void;
}) {
  const [tab, setTab] = useState<'resources' | 'quiz'>('resources');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [seek, setSeek] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const stageId = stage?.id;

  useEffect(() => {
    if (!stage) return;
    setTab('resources');
    setAnswers({});
    setSubmitted(false);
    setClaimed(stage.status === 'completed');
    setActiveVideo(stage.resources.find((r) => r.kind === 'video')?.youtube_id ?? null);
    setSeek(0);
  }, [stageId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (stage) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [stage, onClose]);

  const score = useMemo(
    () => (stage ? stage.quiz.reduce((a, q) => a + (answers[q.id] === q.answer_index ? 1 : 0), 0) : 0),
    [answers, stage],
  );

  if (!stage) return null;

  const total = stage.quiz.length;
  const passMark = Math.ceil(total * 0.66);
  const passed = submitted && score >= passMark;
  const allAnswered = stage.quiz.every((q) => answers[q.id] !== undefined);

  const videos = stage.resources.filter((r) => r.kind === 'video');
  const reads = stage.resources.filter((r) => r.kind !== 'video');
  const current = videos.find((v) => v.youtube_id === activeVideo) ?? videos[0];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-ink/30" />

      <aside className="relative flex h-full w-full flex-col bg-page sm:w-[min(720px,94vw)]">
        {/* Header */}
        <div className="shrink-0 border-b border-line bg-card px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Stage {stage.position}</Badge>
                <Badge
                  tone={stage.status === 'completed' ? 'good' : stage.status === 'in-progress' ? 'amber' : 'neutral'}
                >
                  {stage.status === 'in-progress'
                    ? 'In progress'
                    : stage.status === 'completed'
                      ? 'Completed'
                      : 'Locked'}
                </Badge>
                <span className="flex items-center gap-1.5 text-[12px] text-mute">
                  <Clock size={11} /> {stage.hours}
                </span>
                <span className="text-[12px] font-extrabold text-amber-deep">{stage.xp} XP</span>
              </div>
              <h2 className="mt-2.5 text-[18px] font-extrabold leading-tight tracking-tight text-ink sm:text-[21px]">
                {stage.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-mute transition-colors hover:bg-tint hover:text-ink"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Bar value={stage.progress} tone={stage.status === 'completed' ? 'good' : 'amber'} />
            <span className="shrink-0 text-[12.5px] font-extrabold text-ink">{stage.progress}%</span>
          </div>

          <div className="mt-4 flex gap-6 border-b border-line">
            {(
              [
                { id: 'resources', label: 'Resources' },
                { id: 'quiz', label: `Quiz (${total})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 px-0.5 pb-2.5 text-[13.5px] font-bold transition-colors ${
                  tab === t.id ? 'border-amber text-ink' : 'border-transparent text-mute hover:text-body'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {stage.status === 'locked' && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-line bg-card p-4">
              <Lock size={15} className="mt-0.5 shrink-0 text-mute" />
              <p className="text-[12.5px] leading-relaxed text-body">
                Complete Stage {stage.position - 1} and pass its quiz to unlock this stage and its {stage.xp} XP.
              </p>
            </div>
          )}

          {tab === 'resources' ? (
            <div className="space-y-5">
              {current && (
                <div className="card overflow-hidden">
                  <div className="relative aspect-video w-full bg-ink">
                    <iframe
                      key={`${current.youtube_id}-${seek}`}
                      src={`https://www.youtube.com/embed/${current.youtube_id}?start=${seek}&rel=0&modestbranding=1`}
                      title={current.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-extrabold text-ink">{current.title}</p>
                        <p className="mt-0.5 text-[12px] text-mute">
                          {current.channel} · {current.duration}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={stage.completed_resources.includes(current.slug) ? 'primary' : 'secondary'}
                        onClick={() =>
                          onToggleResource(
                            stage.id,
                            current.slug,
                            !stage.completed_resources.includes(current.slug),
                          )
                        }
                      >
                        {stage.completed_resources.includes(current.slug) ? (
                          <>
                            <Check size={12} strokeWidth={3} /> Done
                          </>
                        ) : (
                          'Mark done'
                        )}
                      </Button>
                    </div>

                    {current.timestamps && current.timestamps.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-[11.5px] font-extrabold uppercase tracking-wide text-mute">
                          Chapters
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {current.timestamps.map((ts) => (
                            <button
                              key={ts.label}
                              onClick={() => setSeek(ts.seconds)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                                seek === ts.seconds
                                  ? 'border-amber bg-amber text-ink'
                                  : 'border-line-2 bg-card text-body hover:bg-tint hover:text-ink'
                              }`}
                            >
                              <Play size={10} />
                              <span className="font-bold">{ts.at}</span>
                              {ts.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {videos.length > 1 && (
                <div>
                  <p className="mb-2 text-[11.5px] font-extrabold uppercase tracking-wide text-mute">More videos</p>
                  <div className="space-y-2">
                    {videos
                      .filter((v) => v.youtube_id !== current?.youtube_id)
                      .map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setActiveVideo(v.youtube_id);
                            setSeek(0);
                          }}
                          className="card flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:border-amber/50"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-tint">
                            <Play size={14} className="text-amber-deep" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-bold text-ink">{v.title}</span>
                            <span className="block truncate text-[11.5px] text-mute">
                              {v.channel} · {v.duration}
                            </span>
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-[11.5px] font-extrabold uppercase tracking-wide text-mute">
                  Articles &amp; docs
                </p>
                <div className="space-y-2">
                  {reads.map((r) => {
                    const done = stage.completed_resources.includes(r.slug);
                    return (
                      <div key={r.id} className="card flex items-center gap-3 p-3.5">
                        <button
                          onClick={() => onToggleResource(stage.id, r.slug, !done)}
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                            done ? 'border-amber bg-amber text-ink' : 'border-line-2 hover:border-amber'
                          }`}
                          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {done && <Check size={11} strokeWidth={3} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-[13px] font-bold ${done ? 'text-mute line-through' : 'text-ink'}`}
                          >
                            {r.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11.5px] text-mute">
                            {r.channel} · {r.read_time}
                          </p>
                        </div>
                        <a
                          href={r.url ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-lg p-2 text-mute transition-colors hover:bg-tint hover:text-amber-deep"
                          aria-label={`Open ${r.title}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card p-4">
                <p className="text-[13.5px] font-extrabold text-ink">Verify your knowledge</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-body">
                  Score {passMark} of {total} or better to claim {stage.xp} XP and unlock the next stage.
                </p>
              </div>

              {stage.quiz.map((q, qi) => {
                const picked = answers[q.id];
                return (
                  <div key={q.id} className="card p-4">
                    <p className="mb-3 text-[13.5px] font-bold leading-snug text-ink">
                      <span className="mr-2 text-mute">{qi + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const isPicked = picked === oi;
                        const isCorrect = oi === q.answer_index;
                        let cls = 'border-line-2 bg-card text-body hover:bg-tint hover:text-ink';
                        if (submitted) {
                          if (isCorrect) cls = 'border-good bg-good-tint text-ink';
                          else if (isPicked) cls = 'border-bad bg-bad-tint text-ink';
                          else cls = 'border-line bg-card text-mute';
                        } else if (isPicked) {
                          cls = 'border-amber bg-amber-tint text-ink';
                        }
                        return (
                          <button
                            key={oi}
                            disabled={submitted}
                            onClick={() => setAnswers((p) => ({ ...p, [q.id]: oi }))}
                            className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition-colors ${cls}`}
                          >
                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded border border-current/30 text-[10.5px] font-extrabold">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {submitted && isCorrect && <CheckCircle2 size={15} className="shrink-0 text-good" />}
                            {submitted && isPicked && !isCorrect && (
                              <XCircle size={15} className="shrink-0 text-bad" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && (
                      <p className="mt-3 rounded-xl bg-tint px-3 py-2.5 text-[12px] leading-relaxed text-body">
                        <span className="font-bold text-ink">Why: </span>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}

              {!submitted ? (
                <Button
                  full
                  disabled={!allAnswered}
                  onClick={() => {
                    setSubmitted(true);
                    onAttempt(stage.id, score, total);
                  }}
                >
                  {allAnswered ? 'Submit answers' : `Answer all ${total} questions`}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`flex items-center gap-3 rounded-2xl border p-4 ${
                      passed ? 'border-good/30 bg-good-tint' : 'border-bad/25 bg-bad-tint'
                    }`}
                  >
                    {passed ? (
                      <CheckCircle2 size={19} className="shrink-0 text-good" />
                    ) : (
                      <XCircle size={19} className="shrink-0 text-bad" />
                    )}
                    <div>
                      <p className={`text-[13.5px] font-extrabold ${passed ? 'text-good' : 'text-bad'}`}>
                        {passed ? 'Passed' : 'Not passed yet'}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-body">
                        You scored {score}/{total}.{' '}
                        {passed ? 'Claim your XP below.' : `You need ${passMark}/${total}.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAnswers({});
                        setSubmitted(false);
                      }}
                    >
                      <RefreshCw size={13} /> Retake
                    </Button>
                    {passed && (
                      <Button
                        full
                        disabled={claimed}
                        onClick={() => {
                          onClaim(stage);
                          setClaimed(true);
                        }}
                      >
                        {claimed ? (
                          <>
                            <Check size={14} strokeWidth={3} /> {stage.xp} XP claimed
                          </>
                        ) : (
                          <>
                            Claim {stage.xp} XP &amp; unlock next <ArrowRight size={14} />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
