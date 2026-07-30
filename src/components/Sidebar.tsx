import { ChevronDown, Crown, GraduationCap, LayoutDashboard, ListChecks, LogOut, Route, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Profile } from '../lib/types';

export type View = 'dashboard' | 'analyzer' | 'roadmap' | 'levels';

const NAV: { id: View; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'analyzer', label: 'Skill Gap', Icon: ListChecks },
  { id: 'roadmap', label: 'Roadmap', Icon: Route },
  { id: 'levels', label: 'My Level', Icon: GraduationCap },
];

export default function Sidebar({
  profile,
  view,
  setView,
  open,
  onClose,
}: {
  profile: Profile | null;
  view: View;
  setView: (v: View) => void;
  open: boolean;
  onClose: () => void;
}) {
  const { logout } = useAuth();
  const [menu, setMenu] = useState(false);

  return (
    <>
      {/* Mobile scrim */}
      {open && <div onClick={onClose} className="fixed inset-0 z-[95] bg-ink/30 lg:hidden" />}

      <aside
        className={`fixed inset-y-0 left-0 z-[96] flex w-[264px] flex-col border-r border-line bg-rail transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-amber">
              <Sparkles size={16} className="text-ink" strokeWidth={2.6} />
            </span>
            <span className="text-[17px] font-extrabold tracking-tight text-ink">SkillSync</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-mute transition-colors hover:bg-tint hover:text-ink lg:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="space-y-1 px-3">
          {NAV.map((n) => {
            const on = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => {
                  setView(n.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[14px] font-bold transition-colors ${
                  on ? 'bg-amber text-ink' : 'text-body hover:bg-tint hover:text-ink'
                }`}
              >
                <n.Icon size={17} strokeWidth={on ? 2.5 : 2} />
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Upsell card */}
        <div className="mt-auto px-4 pb-4">
          <div className="rounded-2xl border border-amber/25 bg-amber-tint p-4">
            <Crown size={18} className="text-amber-deep" />
            <p className="mt-2 text-[14px] font-extrabold text-ink">Keep your streak</p>
            <p className="mt-1 text-[12px] leading-relaxed text-body">
              Clear one stage a week to stay on track for your target role.
            </p>
            <button
              onClick={() => {
                setView('roadmap');
                onClose();
              }}
              className="mt-3 w-full rounded-xl bg-ink px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-[#2C2C27]"
            >
              Open roadmap
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="relative border-t border-line px-4 py-4">
          <button
            onClick={() => setMenu((v) => !v)}
            className="flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-colors hover:bg-tint"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-extrabold text-white">
              {profile?.initials ?? '··'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-bold text-ink">{profile?.name ?? '—'}</span>
              <span className="block truncate text-[11.5px] text-mute">@{profile?.user_id ?? ''}</span>
            </span>
            <ChevronDown size={14} className={`shrink-0 text-mute transition-transform ${menu ? 'rotate-180' : ''}`} />
          </button>

          {menu && (
            <div className="absolute bottom-[68px] left-4 right-4 overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-[0_16px_40px_-12px_rgba(26,26,23,0.28)]">
              <div className="px-3 py-2.5">
                <p className="text-[12px] text-mute">{profile?.dept}</p>
                <p className="mt-0.5 text-[12px] text-mute">{profile?.campus}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold text-bad transition-colors hover:bg-bad-tint"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
