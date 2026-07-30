import { useEffect, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Sparkles, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, ApiError } from '../lib/api';
import { Button, Field, inputClass, inputErrorClass } from '../components/ui';

const CAMPUSES = [
  'XYZ Institute of Technology',
  'Northgate University',
  'Silverline College of Engineering',
];

const DEPTS = [
  'Computer Science Dept',
  'Information Technology Dept',
  'Electronics & Communication Dept',
  'Mechanical Engineering Dept',
];

type Mode = 'login' | 'signup';

export default function Login() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>('login');

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [dept, setDept] = useState(DEPTS[0]);
  const [campus, setCampus] = useState(CAMPUSES[0]);

  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormError(null);
    setErrors({});
  }, [mode]);

  const validate = () => {
    const e: Record<string, string> = {};
    const uid = userId.trim();

    if (!uid) e.userId = 'User ID is required.';
    else if (mode === 'signup' && !/^[a-zA-Z0-9._-]{3,24}$/.test(uid))
      e.userId = '3–24 characters. Letters, numbers, dot, underscore or hyphen.';

    if (!password) e.password = 'Password is required.';
    else if (mode === 'signup' && password.length < 6) e.password = 'Use at least 6 characters.';

    if (mode === 'signup') {
      if (!name.trim()) e.name = 'Tell us your name.';
      if (confirm !== password) e.confirm = 'Passwords do not match.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    setNotice(null);
    if (!validate()) return;

    setBusy(true);
    try {
      if (mode === 'login') {
        await login(userId.trim(), password);
      } else {
        await signup({ userId: userId.trim(), password, name: name.trim(), dept, campus });
      }
    } catch (err) {
      const e = err as ApiError;
      if (e.code === 'NO_ACCOUNT' || e.status === 404) {
        setMode('signup');
        setNotice(`No account exists for “${userId.trim()}”. Create one below — we kept your user ID.`);
        setPassword('');
        setConfirm('');
      } else {
        setFormError(e.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const checkExists = async () => {
    const uid = userId.trim();
    if (mode !== 'login' || !uid) return;
    try {
      const { exists } = await api.checkId(uid);
      setNotice(exists ? null : `No account found for “${uid}”. You can sign up instead.`);
    } catch {
      /* non-blocking */
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-page lg:flex-row">
      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-amber">
              <Sparkles size={16} className="text-ink" strokeWidth={2.6} />
            </span>
            <span className="text-[17px] font-extrabold tracking-tight text-ink">SkillSync</span>
          </div>

          <h1 className="text-[28px] font-extrabold leading-[1.14] tracking-tight text-ink sm:text-[34px]">
            {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
          </h1>
          <p className="mt-2.5 text-[14px] leading-relaxed text-body">
            {mode === 'login'
              ? 'Sign in to pick up your roadmap exactly where you left off.'
              : 'Set a user ID and password. Your roadmap, XP and progress save automatically.'}
          </p>

          {notice && (
            <div className="mt-5 rounded-xl bg-amber-tint px-3.5 py-3 text-[13px] leading-relaxed text-amber-deep">
              {notice}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field
              label="User ID"
              error={errors.userId}
              hint={mode === 'signup' ? 'This is what you sign in with.' : undefined}
            >
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onBlur={checkExists}
                  autoComplete="username"
                  placeholder="alex.mercer"
                  className={`${errors.userId ? inputErrorClass : inputClass} pl-10`}
                />
              </div>
            </Field>

            {mode === 'signup' && (
              <Field label="Full name" error={errors.name}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Alex Mercer"
                  className={errors.name ? inputErrorClass : inputClass}
                />
              </Field>
            )}

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  className={`${errors.password ? inputErrorClass : inputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-mute transition-colors hover:text-ink"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            {mode === 'signup' && (
              <>
                <Field label="Confirm password" error={errors.confirm}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={errors.confirm ? inputErrorClass : inputClass}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Department">
                    <select value={dept} onChange={(e) => setDept(e.target.value)} className={inputClass}>
                      {DEPTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Campus">
                    <select value={campus} onChange={(e) => setCampus(e.target.value)} className={inputClass}>
                      {CAMPUSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </>
            )}

            {formError && (
              <div className="rounded-xl bg-bad-tint px-3.5 py-3 text-[13px] text-bad">{formError}</div>
            )}

            <Button type="submit" full disabled={busy}>
              {busy ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13.5px] text-body">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setNotice(null);
              }}
              className="font-extrabold text-amber-deep underline-offset-2 hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="mt-6 text-center text-[12px] text-mute">Sessions stay active for 30 days on this device.</p>
        </div>
      </div>

      {/* Art panel */}
      <div className="cream-wash hidden border-l border-line lg:flex lg:w-[46%] lg:items-center lg:justify-center lg:p-10">
        <div className="w-full max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-tint px-3 py-1.5 text-[11.5px] font-extrabold uppercase tracking-wide text-amber-deep">
            The AI Career Pathfinder
          </span>
          <h2 className="mt-4 text-[30px] font-extrabold leading-[1.16] tracking-tight text-ink">
            Bridge your skill gap to any career path.
          </h2>
          <p className="mt-3.5 text-[14px] leading-relaxed text-body">
            Tell us your education level, tick off what you actually know, and get a stage-by-stage roadmap that
            starts exactly where you are.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Pick from below 10th through undergraduate',
              'Confirm each assumed skill — untick what you have not learnt',
              'Unticked topics become Stage 0 foundations',
              'Quizzes unlock each stage and award XP',
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-xl border border-line bg-card p-3.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber">
                  <Check size={11} strokeWidth={3.5} className="text-ink" />
                </span>
                <span className="text-[13px] leading-relaxed text-body">{t}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6">
            {[
              { k: '4', v: 'Career tracks' },
              { k: '16', v: 'Skill stages' },
              { k: '48', v: 'Quiz questions' },
            ].map((s) => (
              <div key={s.v}>
                <p className="text-[22px] font-extrabold tracking-tight text-ink">{s.k}</p>
                <p className="mt-0.5 text-[11.5px] text-mute">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
