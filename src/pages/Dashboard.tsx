import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Sidebar, { type View } from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Overview from '../components/Overview';
import Analyzer from '../components/Analyzer';
import Levels from '../components/Levels';
import Roadmap from '../components/Roadmap';
import StageDrawer from '../components/StageDrawer';
import { Button, ToastStack, useToasts } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { api, ApiError } from '../lib/api';
import type {
  CatalogSkill,
  EducationLevel,
  FoundationSkill,
  GapAnalysis,
  Role,
  Stage,
} from '../lib/types';

const TITLES: Record<View, { sub: string }> = {
  dashboard: { sub: "Here's what's happening with your career path today." },
  analyzer: { sub: 'Measure the exact distance between where you are and where you want to be.' },
  roadmap: { sub: 'Work through each stage, pass the quiz, then claim your XP.' },
  levels: { sub: 'Confirm what you already know so your roadmap stays accurate.' },
};

export default function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const { toasts, push, dismiss } = useToasts();

  const [view, setView] = useState<View>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [skills, setSkills] = useState<CatalogSkill[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [foundationSkills, setFoundationSkills] = useState<FoundationSkill[]>([]);

  const [roleId, setRoleId] = useState<number>(user?.target_role_id ?? 1);
  const [education, setEducationState] = useState<string | null>(null);
  const [knownBaseline, setKnownBaseline] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);

  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [openStage, setOpenStage] = useState<Stage | null>(null);

  const guard = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return true;
      }
      return false;
    },
    [logout],
  );

  const loadRoadmap = useCallback(
    async (id: number) => {
      setRoadmapLoading(true);
      try {
        const { stages: s } = await api.roadmap(id);
        setStages(s);
        return s;
      } catch (e) {
        if (!guard(e)) push('Could not load roadmap', (e as Error).message, 'error');
        return [];
      } finally {
        setRoadmapLoading(false);
      }
    },
    [guard], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const boot = useCallback(async () => {
    setBooting(true);
    setBootError(null);
    try {
      const data = await api.bootstrap();
      setRoles(data.roles);
      setSkills(data.skills);
      setEducationLevels(data.educationLevels);
      setEducationState(data.education);
      setFoundationSkills(data.foundationSkills);

      const lvl = data.educationLevels.find((l) => l.slug === data.education);
      setKnownBaseline(data.knownBaseline ?? lvl?.baseline_skills ?? []);
      setUser(data.profile);

      const initial = data.profile?.target_role_id ?? data.roles[0]?.id ?? 1;
      setRoleId(initial);
      await loadRoadmap(initial);
    } catch (e) {
      if (!guard(e)) setBootError((e as Error).message);
    } finally {
      setBooting(false);
    }
  }, [loadRoadmap, guard, setUser]);

  useEffect(() => {
    boot();
  }, [boot]);

  const firstRole = useRef(true);
  useEffect(() => {
    if (booting) return;
    if (firstRole.current) {
      firstRole.current = false;
      return;
    }
    setAnalysis(null);
    loadRoadmap(roleId);
  }, [roleId, booting, loadRoadmap]);

  useEffect(() => {
    if (!openStage) return;
    const fresh = stages.find((s) => s.id === openStage.id);
    if (fresh && fresh !== openStage) setOpenStage(fresh);
  }, [stages]); // eslint-disable-line react-hooks/exhaustive-deps

  /* -------------------------------- actions -------------------------------- */

  const persistBaseline = useCallback(
    (slug: string, known: string[]) => {
      api.saveEducation(slug, known).catch((e) => {
        if (!guard(e)) push('Could not save your answers', (e as Error).message, 'error');
      });
    },
    [guard], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const setEducation = (slug: string) => {
    const lvl = educationLevels.find((l) => l.slug === slug);
    const defaults = lvl?.baseline_skills ?? [];
    setEducationState(slug);
    setKnownBaseline(defaults);
    setAnalysis(null);
    setAnalyzeError(null);
    persistBaseline(slug, defaults);
  };

  const toggleBaseline = (name: string) => {
    if (!education) return;
    const next = knownBaseline.includes(name)
      ? knownBaseline.filter((s) => s !== name)
      : [...knownBaseline, name];
    setKnownBaseline(next);
    setAnalysis(null);
    persistBaseline(education, next);
  };

  const setAllBaseline = (all: boolean) => {
    if (!education) return;
    const lvl = educationLevels.find((l) => l.slug === education);
    const next = all ? (lvl?.baseline_skills ?? []) : [];
    setKnownBaseline(next);
    setAnalysis(null);
    persistBaseline(education, next);
  };

  const handleGenerate = async () => {
    if (!education) {
      setAnalyzeError('Select your current education level first.');
      return;
    }
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await api.analyze(roleId, education, knownBaseline, selected);
      setAnalysis(result);
      const parts: string[] = [];
      if (result.foundationGaps.length) parts.push(`${result.foundationGaps.length} foundation topics`);
      if (result.missing.length) parts.push(`${result.missing.length} role skills`);
      push(
        `${result.readinessPct}% ready for ${result.role.title}`,
        parts.length
          ? `${parts.join(' + ')} to learn · about ${result.totalYears} years to role-ready.`
          : 'You already meet every requirement.',
        'success',
      );
    } catch (e) {
      if (!guard(e)) setAnalyzeError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleResource = async (stageId: number, slug: string, done: boolean) => {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s;
        const set = new Set(s.completed_resources);
        if (done) set.add(slug);
        else set.delete(slug);
        const next = Array.from(set);
        return {
          ...s,
          completed_resources: next,
          progress: s.resources.length
            ? Math.round((s.resources.filter((r) => next.includes(r.slug)).length / s.resources.length) * 100)
            : 0,
        };
      }),
    );
    try {
      await api.toggleResource(stageId, slug, done);
    } catch (e) {
      if (!guard(e)) {
        push('Could not save progress', (e as Error).message, 'error');
        loadRoadmap(roleId);
      }
    }
  };

  const handleAttempt = async (stageId: number, score: number, total: number) => {
    try {
      await api.logAttempt(stageId, score, total);
    } catch (e) {
      if (!guard(e)) push('Could not log attempt', (e as Error).message, 'error');
    }
  };

  const handleClaim = async (stage: Stage) => {
    try {
      const res = await api.claimStage(stage.id);
      const [profile, fresh] = await Promise.all([api.profile(), loadRoadmap(roleId)]);
      setUser(profile);
      const updated = fresh.find((s) => s.id === stage.id);
      if (updated) setOpenStage(updated);
      push(
        res.xp > 0 ? `+${res.xp} XP claimed` : 'Stage already completed',
        res.unlocked ? `Unlocked: ${res.unlocked}` : 'You finished the full roadmap.',
        'success',
      );
    } catch (e) {
      if (!guard(e)) push('Could not claim XP', (e as Error).message, 'error');
    }
  };

  const handleReset = async () => {
    try {
      await api.resetRoadmap(roleId);
      await loadRoadmap(roleId);
      setOpenStage(null);
      push('Progress reset', 'All stages restored to their starting state.', 'info');
    } catch (e) {
      if (!guard(e)) push('Reset failed', (e as Error).message, 'error');
    }
  };

  const role = useMemo(() => roles.find((r) => r.id === roleId), [roles, roleId]);
  const firstName = (user?.name || '').split(' ')[0] || user?.user_id || 'there';

  const notifications = useMemo(() => {
    const out: string[] = [];
    const active = stages.find((s) => s.status === 'in-progress');
    if (active) out.push(`"${active.short_title}" is in progress — ${active.progress}% done.`);
    if (analysis?.foundationGaps.length)
      out.push(`${analysis.foundationGaps.length} foundation topics were added to Stage 0.`);
    if (!education) out.push('Set your current education level to get an accurate roadmap.');
    if (user && user.streak >= 7) out.push(`${user.streak}-day streak — keep it going!`);
    return out;
  }, [stages, analysis, education, user]);

  if (bootError) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="card max-w-md p-7 text-center">
          <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full bg-bad-tint">
            <AlertTriangle size={19} className="text-bad" />
          </span>
          <h2 className="text-[17px] font-extrabold text-ink">Couldn't load your workspace</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-body">{bootError}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button onClick={boot}>
              <RefreshCw size={14} /> Try again
            </Button>
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        profile={user}
        view={view}
        setView={setView}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="lg:pl-[264px]">
        <Topbar
          greeting={view === 'dashboard' ? `Hello, ${firstName}!` : TITLE_MAP[view]}
          subtitle={TITLES[view].sub}
          stages={stages}
          onOpenMenu={() => setMenuOpen(true)}
          onJump={setView}
          onOpenStage={setOpenStage}
          notifications={notifications}
        />

        <main className="px-5 pb-10 pt-6 sm:px-8">
          {view === 'dashboard' && (
            <Overview
              profile={user}
              role={role}
              stages={stages}
              analysis={analysis}
              loading={booting || roadmapLoading}
              setView={setView}
              onOpenStage={setOpenStage}
            />
          )}

          {view === 'analyzer' && (
            <Analyzer
              roles={roles}
              skills={skills}
              educationLevels={educationLevels}
              foundationSkills={foundationSkills}
              roleId={roleId}
              setRoleId={setRoleId}
              education={education}
              setEducation={setEducation}
              knownBaseline={knownBaseline}
              toggleBaseline={toggleBaseline}
              setAllBaseline={setAllBaseline}
              selected={selected}
              setSelected={setSelected}
              analysis={analysis}
              loading={analyzing}
              error={analyzeError}
              onGenerate={handleGenerate}
              onViewRoadmap={() => setView('roadmap')}
            />
          )}

          {view === 'levels' && (
            <Levels
              educationLevels={educationLevels}
              foundationSkills={foundationSkills}
              education={education}
              setEducation={setEducation}
              knownBaseline={knownBaseline}
              toggleBaseline={toggleBaseline}
              setAllBaseline={setAllBaseline}
            />
          )}

          {view === 'roadmap' && (
            <Roadmap
              stages={stages}
              loading={roadmapLoading}
              analysis={analysis}
              onOpen={setOpenStage}
              onReset={handleReset}
            />
          )}
        </main>
      </div>

      <StageDrawer
        stage={openStage}
        onClose={() => setOpenStage(null)}
        onToggleResource={handleToggleResource}
        onClaim={handleClaim}
        onAttempt={handleAttempt}
      />

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

const TITLE_MAP: Record<View, string> = {
  dashboard: 'Dashboard',
  analyzer: 'Skill Gap Analyzer',
  roadmap: 'Your Roadmap',
  levels: 'My Level',
};
