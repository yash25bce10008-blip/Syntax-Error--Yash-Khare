import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

/* ------------------------------- Toasts ------------------------------- */

export interface ToastItem {
  id: number;
  title: string;
  body?: string;
  tone?: 'success' | 'error' | 'info';
}

const toneCfg = {
  success: { Icon: CheckCircle2, color: 'text-good' },
  error: { Icon: AlertCircle, color: 'text-bad' },
  info: { Icon: Info, color: 'text-amber-deep' },
};

export function ToastStack({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: number) => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((t) => {
        const { Icon, color } = toneCfg[t.tone || 'info'];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-[0_10px_30px_-10px_rgba(26,26,23,0.2)]"
          >
            <Icon size={17} className={`mt-0.5 shrink-0 ${color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold leading-tight text-ink">{t.title}</p>
              {t.body && <p className="mt-1 text-[12.5px] leading-relaxed text-body">{t.body}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-1 text-mute transition-colors hover:bg-tint hover:text-ink"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const push = (title: string, body?: string, tone: ToastItem['tone'] = 'info') => {
    const id = ++idRef.current;
    setToasts((p) => [...p.slice(-2), { id, title, body, tone }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  };
  const dismiss = (id: number) => setToasts((p) => p.filter((t) => t.id !== id));
  return { toasts, push, dismiss };
}

/* -------------------------------- Buttons -------------------------------- */

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'soft' | 'dark' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  full?: boolean;
  className?: string;
};

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled,
  full,
  className = '',
}: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45';
  const sizes = { sm: 'px-3.5 py-2 text-[12.5px]', md: 'px-5 py-2.5 text-[13.5px]' };
  const variants = {
    primary: 'bg-amber text-ink hover:bg-amber-hi',
    secondary: 'border border-line-2 bg-card text-ink hover:bg-tint',
    soft: 'bg-amber-tint text-amber-deep hover:bg-amber-tint-2',
    dark: 'bg-ink text-white hover:bg-[#2C2C27]',
    ghost: 'text-body hover:bg-tint hover:text-ink',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

/* --------------------------------- Field --------------------------------- */

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[13px] font-bold text-ink">{label}</span>}
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12px] text-bad">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12px] text-mute">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  'w-full rounded-xl border border-line-2 bg-card px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-mute focus:border-amber';

export const inputErrorClass =
  'w-full rounded-xl border border-bad bg-card px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-mute';

/* -------------------------------- Progress -------------------------------- */

export function Bar({
  value,
  tone = 'amber',
}: {
  value: number;
  tone?: 'amber' | 'good' | 'warn' | 'ink';
}) {
  const colors = { amber: 'bg-amber', good: 'bg-good', warn: 'bg-warn', ink: 'bg-ink' };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${colors[tone]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ------------------------------- Donut chart ------------------------------- */

export function Donut({
  segments,
  total,
  label,
  size = 168,
}: {
  segments: { value: number; color: string }[];
  total: number;
  label: string;
  size?: number;
}) {
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const sum = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#F0EDE1" strokeWidth={stroke} fill="none" />
        {segments.map((s, i) => {
          const len = (s.value / sum) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[27px] font-extrabold leading-none tracking-tight text-ink">{total}</span>
        <span className="mt-0.5 text-[11.5px] font-semibold text-mute">{label}</span>
      </div>
    </div>
  );
}

/* --------------------------------- Modal --------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-line bg-card p-5 shadow-[0_24px_60px_-16px_rgba(26,26,23,0.35)] sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-[17px] font-extrabold tracking-tight text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-mute transition-colors hover:bg-tint hover:text-ink"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------- Skeleton ------------------------------- */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-line ${className}`} />;
}

/* --------------------------------- Badge --------------------------------- */

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'amber' | 'good' | 'warn' | 'bad' | 'info';
}) {
  const tones = {
    neutral: 'bg-tint text-body',
    amber: 'bg-amber-tint text-amber-deep',
    good: 'bg-good-tint text-good',
    warn: 'bg-warn-tint text-warn',
    bad: 'bg-bad-tint text-bad',
    info: 'bg-info-tint text-info',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* -------------------------------- Panel head -------------------------------- */

export function PanelHead({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
      <h2 className="text-[17px] font-extrabold tracking-tight text-ink">{title}</h2>
      {action && (
        <Button variant="soft" size="sm" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}
