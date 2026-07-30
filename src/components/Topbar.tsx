import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Menu, Plus, Search, X } from 'lucide-react';
import type { Stage } from '../lib/types';
import type { View } from './Sidebar';

export default function Topbar({
  greeting,
  subtitle,
  stages,
  onOpenMenu,
  onJump,
  onOpenStage,
  notifications,
}: {
  greeting: string;
  subtitle: string;
  stages: Stage[];
  onOpenMenu: () => void;
  onJump: (v: View) => void;
  onOpenStage: (s: Stage) => void;
  notifications: string[];
}) {
  const [q, setQ] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const [openBell, setOpenBell] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpenSearch(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setOpenBell(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const index = useMemo(() => {
    const views: { label: string; hint: string; view: View; stage?: Stage }[] = [
      { label: 'Dashboard', hint: 'Page', view: 'dashboard' },
      { label: 'Skill Gap Analyzer', hint: 'Page', view: 'analyzer' },
      { label: 'Roadmap', hint: 'Page', view: 'roadmap' },
      { label: 'My Level', hint: 'Page', view: 'levels' },
    ];
    const nodes = stages.map((s) => ({
      label: s.short_title,
      hint: `Stage ${s.position}`,
      view: 'roadmap' as View,
      stage: s,
    }));
    const tags = stages.flatMap((s) =>
      (s.tags || []).map((t) => ({ label: t, hint: `Stage ${s.position}`, view: 'roadmap' as View, stage: s })),
    );
    return [...views, ...nodes, ...tags];
  }, [stages]);

  const results = useMemo(() => {
    if (!q.trim()) return index.slice(0, 5);
    const t = q.toLowerCase();
    return index.filter((i) => i.label.toLowerCase().includes(t)).slice(0, 7);
  }, [q, index]);

  return (
    <div className="flex flex-col gap-5 px-5 pt-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
      {/* Greeting */}
      <div className="flex items-start gap-3">
        <button
          onClick={onOpenMenu}
          className="mt-1 rounded-xl border border-line-2 bg-card p-2 text-ink transition-colors hover:bg-tint lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={17} />
        </button>
        <div>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">
            {greeting} <span className="inline-block">👋</span>
          </h1>
          <p className="mt-1.5 text-[14px] text-body">{subtitle}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2.5">
        <div ref={searchRef} className="relative flex-1 lg:w-[300px] lg:flex-none">
          <div className="flex items-center gap-2.5 rounded-full border border-line-2 bg-card px-4 py-2.5 focus-within:border-amber">
            <Search size={15} className="shrink-0 text-mute" />
            <input
              value={q}
              onFocus={() => setOpenSearch(true)}
              onChange={(e) => {
                setQ(e.target.value);
                setOpenSearch(true);
              }}
              placeholder="Search anything..."
              className="w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-mute"
            />
            {q && (
              <button onClick={() => setQ('')} className="text-mute hover:text-ink" aria-label="Clear">
                <X size={13} />
              </button>
            )}
          </div>

          {openSearch && (
            <div className="absolute left-0 right-0 top-13 z-40 overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-[0_16px_40px_-12px_rgba(26,26,23,0.28)]">
              {results.length === 0 ? (
                <p className="px-3 py-4 text-center text-[12.5px] text-mute">No matches</p>
              ) : (
                results.map((r, i) => (
                  <button
                    key={`${r.label}-${i}`}
                    onClick={() => {
                      onJump(r.view);
                      if (r.stage) setTimeout(() => onOpenStage(r.stage!), 120);
                      setOpenSearch(false);
                      setQ('');
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-tint"
                  >
                    <span className="truncate text-[13px] text-ink">{r.label}</span>
                    <span className="shrink-0 text-[11px] text-mute">{r.hint}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bell */}
        <div ref={bellRef} className="relative shrink-0">
          <button
            onClick={() => setOpenBell((v) => !v)}
            className="relative grid h-11 w-11 place-items-center rounded-full border border-line-2 bg-card text-ink transition-colors hover:bg-tint"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {notifications.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-amber text-[10.5px] font-extrabold text-ink">
                {notifications.length}
              </span>
            )}
          </button>

          {openBell && (
            <div className="absolute right-0 top-13 z-40 w-72 overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-[0_16px_40px_-12px_rgba(26,26,23,0.28)]">
              <p className="px-3 py-2 text-[11.5px] font-extrabold uppercase tracking-wide text-mute">
                Notifications
              </p>
              {notifications.length === 0 ? (
                <p className="px-3 py-3 text-[12.5px] text-body">You're all caught up.</p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl px-3 py-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                    <p className="text-[12.5px] leading-relaxed text-body">{n}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => onJump('analyzer')}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber text-ink transition-colors hover:bg-amber-hi"
          aria-label="New analysis"
        >
          <Plus size={18} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}
