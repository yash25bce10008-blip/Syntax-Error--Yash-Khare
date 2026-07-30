import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Menu,
  PlayCircle,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Trophy,
  Upload,
  User,
  X
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { SkillSyncAPI } from './lib/localApi'
import { buildDatabaseTables, videoForStage } from './lib/databaseTables'
import {
  calculateGap,
  careers,
  getCareer,
  searchEverything,
  skillDictionary,
  type CareerRole,
  type LearningProfile,
  type RoadmapStage,
  type UserProfile
} from './lib/skillSyncData'

type View = 'dashboard' | 'careers' | 'roadmap' | 'skills' | 'database'
type AuthView = 'login' | 'signup'

const nav = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'careers' as View, label: 'Career Engine', icon: BriefcaseBusiness },
  { id: 'roadmap' as View, label: 'Roadmap', icon: Target },
  { id: 'skills' as View, label: 'Resume & Skills', icon: FileText },
  { id: 'database' as View, label: 'Database', icon: BarChart3 }
]

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'SS'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function AuthScreen({ onAuthed }: { onAuthed: (user: UserProfile) => void }) {
  const [mode, setMode] = useState<AuthView>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [login, setLogin] = useState({ username: '', password: '' })
  const [signup, setSignup] = useState({ username: '', password: '', college: '', course: '' })

  async function submitLogin(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!login.username.trim() || !login.password) {
      setError('Enter both username and password.')
      return
    }
    setLoading(true)
    try {
      const user = await SkillSyncAPI.login(login.username.trim(), login.password)
      onAuthed(user)
    } catch (err) {
      if (err instanceof Error && err.name === 'ACCOUNT_NOT_FOUND') {
        setMode('signup')
        setSignup((current) => ({ ...current, username: login.username.trim() }))
        setError('No account exists for that username. Create one to continue.')
      } else {
        setError(err instanceof Error ? err.message : 'Unable to sign in.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function submitSignup(event: FormEvent) {
    event.preventDefault()
    setError('')
    const required = Object.values(signup).every((value) => value.trim().length > 0)
    if (!required) {
      setError('Complete every field to create your secure SkillSync profile.')
      return
    }
    if (signup.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const username = signup.username.trim()
      const user = await SkillSyncAPI.signUp({
        fullName: username,
        email: `${username.toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'student'}@skillsync.local`,
        userId: username,
        college: signup.college.trim(),
        department: signup.course.trim(),
        academicYear: 'Active',
        password: signup.password
      })
      onAuthed(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#b8d7d4] px-4 py-6 text-slate-950 md:px-8 md:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-[#e8f0eb]/80 shadow-[0_24px_80px_rgba(20,68,75,0.18)] backdrop-blur-sm lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden border-r border-white/70 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm">
                <Brain size={22} />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">SkillSync AI</p>
                <p className="text-sm text-teal-800">AI Career & Skill Pathfinder</p>
              </div>
            </div>
            <div className="mt-16 max-w-lg">
              <p className="text-sm font-semibold text-teal-700">Career intelligence workspace</p>
              <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-[-0.04em]">A calm, data-driven path from skills to dream roles.</h1>
              <p className="mt-5 text-base leading-7 text-slate-600">Protected accounts, dynamic career roadmaps, resume skill extraction and quiz-gated progress in one premium SaaS dashboard.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[['55+', 'Career roles'], ['12', 'Stages per path'], ['Secure', 'Session persistence']].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/80 bg-white/35 p-5 shadow-sm">
                <p className="text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/70 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-700">{mode === 'login' ? 'Welcome back' : 'Create workspace'}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{mode === 'login' ? 'Sign in' : 'Sign up'}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><Lock size={20} /></div>
            </div>

            {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {mode === 'login' ? (
              <form className="space-y-4" onSubmit={submitLogin}>
                <Field label="Username" value={login.username} onChange={(value) => setLogin({ ...login, username: value })} placeholder="your-username" />
                <PasswordField label="Password" value={login.password} show={showPassword} setShow={setShowPassword} onChange={(value) => setLogin({ ...login, password: value })} />
                <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                  {loading && <Loader2 className="animate-spin" size={16} />} Continue to dashboard
                </button>
                <p className="text-center text-sm text-slate-500">New to SkillSync? <button type="button" onClick={() => { setMode('signup'); setError('') }} className="font-semibold text-teal-700 hover:text-teal-900">Create an account</button></p>
              </form>
            ) : (
              <form className="space-y-3" onSubmit={submitSignup}>
                <Field label="Username" value={signup.username} onChange={(value) => setSignup({ ...signup, username: value })} placeholder="your-username" />
                <PasswordField label="Password" value={signup.password} show={showPassword} setShow={setShowPassword} onChange={(value) => setSignup({ ...signup, password: value })} />
                <Field label="College Name" value={signup.college} onChange={(value) => setSignup({ ...signup, college: value })} placeholder="Your college" />
                <Field label="Course" value={signup.course} onChange={(value) => setSignup({ ...signup, course: value })} placeholder="Computer Science" />
                <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                  {loading && <Loader2 className="animate-spin" size={16} />} Create secure profile
                </button>
                <p className="text-center text-sm text-slate-500">Already have an account? <button type="button" onClick={() => { setMode('login'); setError('') }} className="font-semibold text-teal-700 hover:text-teal-900">Sign in</button></p>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10" /></label>
}

function PasswordField({ label, value, onChange, show, setShow }: { label: string; value: string; onChange: (value: string) => void; show: boolean; setShow: (value: boolean) => void }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<span className="relative mt-1.5 block"><input type={show ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} placeholder="••••••••" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10" /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
}

function AppShell({ user, setUser }: { user: UserProfile; setUser: (user: UserProfile | null) => void }) {
  const [view, setView] = useState<View>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [drawerStage, setDrawerStage] = useState<RoadmapStage | null>(null)
  const career = getCareer(user.selectedCareerId)
  const searchResults = useMemo(() => searchEverything(query, user.selectedCareerId), [query, user.selectedCareerId])

  async function logout() {
    await SkillSyncAPI.logout()
    setUser(null)
  }

  if (!user.learningProfile?.completed) {
    return <OnboardingFlow user={user} setUser={setUser} onLogout={logout} />
  }

  return (
    <main className="min-h-screen bg-[#b8d7d4] p-3 text-slate-950 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[1.75rem] border border-white/70 bg-[#e8f0eb]/82 shadow-[0_24px_80px_rgba(20,68,75,0.18)] sm:min-h-[calc(100vh-3rem)]">
        <aside className={cn('fixed inset-y-3 left-3 z-40 w-72 rounded-[1.5rem] border border-white/70 bg-[#e8f0eb] p-5 shadow-2xl transition lg:static lg:block lg:rounded-none lg:border-y-0 lg:border-l-0 lg:bg-transparent lg:shadow-none', sidebarOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-white"><Brain size={20} /></div><span className="text-lg font-semibold tracking-tight">SkillSync</span></div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 hover:bg-white/70 lg:hidden"><X size={18} /></button>
          </div>
          <nav className="mt-10 space-y-2">
            {nav.map((item) => <button key={item.id} onClick={() => { setView(item.id); setSidebarOpen(false) }} className={cn('flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition', view === item.id ? 'bg-teal-700 text-white shadow-[0_12px_24px_rgba(15,118,110,0.22)]' : 'text-teal-900 hover:bg-white/55')}><item.icon size={18} />{item.label}</button>)}
          </nav>
          <div className="my-8 h-px bg-white/80" />
          <div className="space-y-2 text-sm text-teal-900">
            <MiniLink icon={BookOpen} label="Resources" />
            <MiniLink icon={CalendarDays} label="Study Plan" />
            <MiniLink icon={Settings} label="Preferences" />
          </div>
          <div className="mt-auto pt-10">
            <div className="rounded-3xl border border-white/75 bg-white/35 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Current goal</p>
              <p className="mt-2 font-semibold">{career.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{career.timeline} guided path</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 border-l border-white/60">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/65 bg-[#e8f0eb]/90 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
            <button onClick={() => setSidebarOpen(true)} className="rounded-2xl p-2 hover:bg-white/70 lg:hidden"><Menu size={20} /></button>
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-700" size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Global search" placeholder="Search careers, skills, stages and resources" className="w-full rounded-2xl border border-white/70 bg-white/45 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-teal-700 focus:bg-white/80 focus:ring-4 focus:ring-teal-700/10" />
              <AnimatePresence>{query && <SearchPanel results={searchResults} onCareer={(id) => { const role = careers.find((c) => c.id === id); if (role) SkillSyncAPI.setCareer(user, role.id).then(setUser); setQuery('') }} />}</AnimatePresence>
            </div>
            <button className="hidden rounded-2xl p-3 text-teal-800 hover:bg-white/60 sm:block"><Sparkles size={18} /></button>
            <div className="hidden items-center gap-3 sm:flex"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">{initials(user.fullName)}</div><div><p className="text-sm font-semibold">{user.fullName}</p><p className="text-xs text-slate-500">{user.department}</p></div></div>
            <button onClick={logout} className="rounded-2xl p-3 text-slate-500 transition hover:bg-white/70 hover:text-red-600" aria-label="Logout"><LogOut size={18} /></button>
          </header>

          <div className="p-4 md:p-6 lg:p-8">
            {view === 'dashboard' && <Dashboard user={user} career={career} setView={setView} onStage={setDrawerStage} />}
            {view === 'careers' && <CareerEngine user={user} setUser={setUser} setView={setView} />}
            {view === 'roadmap' && <RoadmapView user={user} career={career} onStage={setDrawerStage} />}
            {view === 'skills' && <SkillsView user={user} setUser={setUser} career={career} />}
            {view === 'database' && <DatabaseView user={user} />}
          </div>
        </section>
      </div>
      <AnimatePresence>{drawerStage && <StageDrawer stage={drawerStage} career={career} user={user} setUser={setUser} onClose={() => setDrawerStage(null)} />}</AnimatePresence>
    </main>
  )
}

function OnboardingFlow({ user, setUser, onLogout }: { user: UserProfile; setUser: (user: UserProfile) => void; onLogout: () => void }) {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState(user.selectedCareerId || careers[0].id)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user.skills)
  const [pace, setPace] = useState<LearningProfile['pace']>('balanced')
  const [learningStyle, setLearningStyle] = useState<LearningProfile['learningStyle']>('coding')
  const [practicePreference, setPracticePreference] = useState<LearningProfile['practicePreference']>('projects')
  const [weeklyHours, setWeeklyHours] = useState(6)
  const [confidence, setConfidence] = useState<LearningProfile['confidence']>('beginner')
  const [goalReason, setGoalReason] = useState('I want an internship-ready portfolio and guided projects.')
  const [saving, setSaving] = useState(false)
  const selectedCareer = getCareer(goal)
  const recommended = recommendCareers(`${goalReason} ${user.department} ${selectedSkills.join(' ')}`)
  const suggestedSkills = ['Python', 'HTML', 'CSS', 'JavaScript', 'SQL', 'React', 'Git', 'Machine Learning', 'Statistics', 'Excel', 'Java', 'C++', 'APIs', 'Figma', 'Linux', 'Docker']
  const goalOptions = ['I want an internship-ready portfolio and guided projects.', 'I want to crack placements with coding practice.', 'I want strong fundamentals before advanced topics.', 'I want to build real products and learn by doing.']
  const parsedSkills = selectedSkills
  const skills = selectedSkills.join(', ')

  function setSkills(value: string) {
    setSelectedSkills(value.split(',').map((skill) => skill.trim()).filter(Boolean))
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((current) => current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill])
  }

  async function finish() {
    setSaving(true)
    const profile: LearningProfile = {
      completed: true,
      currentSkills: selectedSkills,
      desiredRole: selectedCareer.title,
      pace,
      learningStyle,
      practicePreference,
      weeklyHours,
      confidence,
      goalReason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = await SkillSyncAPI.saveLearningProfile(user, profile, selectedCareer.id, selectedSkills)
    setUser(updated)
    setSaving(false)
  }

  return <main className="min-h-screen bg-[#b8d7d4] p-3 text-slate-950 sm:p-6"><div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/70 bg-[#e8f0eb]/85 shadow-[0_24px_80px_rgba(20,68,75,0.18)] lg:grid-cols-[.85fr_1.15fr]"><section className="border-b border-white/70 p-6 lg:border-b-0 lg:border-r lg:p-10"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white"><Brain size={22} /></div><div><p className="font-semibold">SkillSync AI</p><p className="text-sm text-slate-500">Student ID builder</p></div></div><button onClick={onLogout} className="rounded-2xl p-3 text-slate-500 hover:bg-white/60"><LogOut size={18} /></button></div><div className="mt-12"><p className="text-sm font-semibold text-teal-700">Not another premade roadmap</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">First we understand you. Then we build your path.</h1><p className="mt-4 leading-7 text-slate-600">Your student profile captures what you know, what you want to become, how you prefer learning and how much time you can invest. SkillSync uses that profile to personalize topics, resources, pace, projects and reviews.</p></div><div className="mt-10 space-y-3">{['Profile questions', 'Career fit', 'Personalized path', 'Resource mix', 'Review feedback loop'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/35 p-3"><div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold', step >= index ? 'bg-teal-700 text-white' : 'bg-white text-slate-400')}>{index + 1}</div><span className="font-semibold text-sm">{item}</span></div>)}</div></section><section className="p-5 sm:p-8 lg:p-10"><div className="mb-6 flex items-center justify-between"><p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Step {step + 1} of 4</p><div className="h-2 w-40 overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div></div>{step === 0 && <Card><h2 className="text-2xl font-semibold tracking-tight">What do you know today?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Add skills separated by commas. This becomes your baseline, not a decoration.</p><textarea value={skills} onChange={(event) => setSkills(event.target.value)} className="mt-5 min-h-36 w-full rounded-2xl border border-white/80 bg-white/60 p-4 text-sm outline-none focus:border-teal-700" placeholder="Python, HTML, SQL, basic DSA" /><div className="mt-4 flex flex-wrap gap-2">{parsedSkills.map((skill) => <Pill key={skill}>{skill}</Pill>)}</div></Card>}{step === 1 && <Card><h2 className="text-2xl font-semibold tracking-tight">What do you want to become?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Pick a target. Recommendations are inferred from your course, skills and goal statement.</p><textarea value={goalReason} onChange={(event) => setGoalReason(event.target.value)} className="mt-5 min-h-24 w-full rounded-2xl border border-white/80 bg-white/60 p-4 text-sm outline-none focus:border-teal-700" /><div className="mt-5 grid gap-3 md:grid-cols-2">{recommended.map((career) => <button key={career.id} onClick={() => setGoal(career.id)} className={cn('rounded-2xl border p-4 text-left transition', goal === career.id ? 'border-teal-700 bg-teal-50' : 'border-white/70 bg-white/40 hover:bg-white/70')}><p className="font-semibold">{career.title}</p><p className="mt-1 text-xs font-semibold text-teal-700">{career.category}</p><p className="mt-2 text-sm leading-5 text-slate-600">{career.summary}</p></button>)}</div></Card>}{step === 2 && <Card><h2 className="text-2xl font-semibold tracking-tight">How should SkillSync teach you?</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><ChoiceGroup label="Learning pace" value={pace} setValue={setPace} options={[['slow', 'Slow & guided'], ['balanced', 'Balanced'], ['fast', 'Fast track']]} /><ChoiceGroup label="Preferred material" value={learningStyle} setValue={setLearningStyle} options={[['visual', 'Videos / visual'], ['theory', 'Theory first'], ['coding', 'Coding exercises'], ['project', 'Projects']]} /><ChoiceGroup label="Practice style" value={practicePreference} setValue={setPracticePreference} options={[['quizzes', 'Quizzes'], ['coding', 'Coding questions'], ['projects', 'Build projects'], ['reading', 'Reading notes']]} /><ChoiceGroup label="Current confidence" value={confidence} setValue={setConfidence} options={[['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']]} /></div><label className="mt-5 block text-sm font-semibold text-slate-700">Hours per week: {weeklyHours}<input type="range" min="2" max="25" value={weeklyHours} onChange={(event) => setWeeklyHours(Number(event.target.value))} className="mt-3 w-full accent-teal-700" /></label></Card>}{step === 3 && <Card><h2 className="text-2xl font-semibold tracking-tight">Your personalized student ID</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><MetricMini label="Goal" value={selectedCareer.title} /><MetricMini label="Pace" value={pace} /><MetricMini label="Style" value={learningStyle} /><MetricMini label="Weekly time" value={`${weeklyHours} hrs`} /></div><div className="mt-5 rounded-3xl bg-teal-700 p-5 text-white"><p className="text-sm font-semibold text-teal-100">Generated plan logic</p><p className="mt-2 leading-7">Your roadmap will prioritize {parsedSkills.length ? 'gaps after your known skills' : 'foundations first'}, use more {learningStyle} resources, include {practicePreference} checkpoints and estimate duration using your {weeklyHours} hours/week pace.</p></div></Card>}<div className="mt-6 flex justify-between"><button disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))} className="rounded-2xl bg-white/60 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-40">Back</button>{step < 3 ? <button onClick={() => setStep(step + 1)} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Continue</button> : <button onClick={finish} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60">{saving && <Loader2 size={16} className="animate-spin" />} Create my personalized path</button>}</div></section></div></main>
}

function ChoiceGroup<T extends string>({ label, value, setValue, options }: { label: string; value: T; setValue: (value: T) => void; options: Array<[T, string]> }) {
  return <div><p className="mb-2 text-sm font-semibold text-slate-700">{label}</p><div className="space-y-2">{options.map(([id, text]) => <button key={id} onClick={() => setValue(id)} className={cn('w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition', value === id ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-white/80 bg-white/45 text-slate-600 hover:bg-white')}>{text}</button>)}</div></div>
}

function recommendCareers(signal: string) {
  const q = signal.toLowerCase()
  const scored = careers.map((career) => ({ career, score: `${career.title} ${career.category} ${career.skills.join(' ')} ${career.technologies.join(' ')}`.toLowerCase().split(' ').filter((word) => q.includes(word.toLowerCase())).length }))
  return scored.sort((a, b) => b.score - a.score).slice(0, 4).map((item) => item.career)
}

function MiniLink({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition hover:bg-white/55"><Icon size={17} />{label}</button>
}

function SearchPanel({ results, onCareer }: { results: Array<{ type: string; title: string; description: string; id: string }>; onCareer: (id: string) => void }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
    {results.length === 0 ? <div className="p-5 text-sm text-slate-500">No matching careers, skills or resources. Try a broader term.</div> : results.map((result) => <button key={`${result.type}-${result.id}`} onClick={() => result.type === 'Career' && onCareer(result.id)} className="flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition last:border-0 hover:bg-slate-50"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">{result.type}</span><span><span className="block text-sm font-semibold">{result.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{result.description}</span></span></button>)}
  </motion.div>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-[1.55rem] border border-white/75 bg-white/45 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]', className)}>{children}</div>
}

function Dashboard({ user, career, setView, onStage }: { user: UserProfile; career: CareerRole; setView: (view: View) => void; onStage: (stage: RoadmapStage) => void }) {
  const gap = calculateGap(user.skills, career)
  const progress = user.stageProgress[career.id] || {}
  const completed = career.roadmap.filter((stage) => progress[stage.id]?.status === 'completed').length
  const nextStage = career.roadmap.find((stage) => progress[stage.id]?.status === 'available' || progress[stage.id]?.status === 'in-progress') || career.roadmap[0]
  const roadmapPercent = Math.round((completed / career.roadmap.length) * 100)
  const hasLearningProgress = Object.values(progress).some((stage) => stage.status === 'completed' || stage.status === 'in-progress' || stage.progress > 0 || stage.quizScore !== undefined)
  const isNewUser = !hasLearningProgress && user.skills.length === 0 && user.xp === 0

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><p className="font-semibold text-teal-700">Welcome back, {user.fullName.split(' ')[0]} 👋</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Dashboard</h1></div>
      <button onClick={() => setView('careers')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Explore careers <ArrowRight size={16} /></button>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      {isNewUser ? <Card className="min-h-44"><div className="flex items-center justify-between"><h2 className="font-semibold">Get Started</h2><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">New profile</span></div><div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center"><div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-teal-700 shadow-sm"><GraduationCap size={32} /></div><div className="flex-1"><p className="text-xl font-semibold tracking-tight">Set up your learning path</p><p className="mt-2 text-sm leading-6 text-slate-600">Choose a career goal and add your current skills first. Your personalized roadmap, recommendations and progress will appear after you start.</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => setView('careers')} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">Choose career</button><button onClick={() => setView('skills')} className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-white">Add skills</button></div></div></div></Card> : <Card className="min-h-44"><div className="flex items-center justify-between"><h2 className="font-semibold">Continue Learning</h2><button onClick={() => setView('roadmap')} className="text-sm font-semibold text-teal-700">Open roadmap</button></div><div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center"><div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-teal-700 shadow-sm"><PlayCircle size={32} /></div><div className="flex-1"><p className="text-xl font-semibold tracking-tight">{nextStage.title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{nextStage.description}</p><button onClick={() => onStage(nextStage)} className="mt-4 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">Resume stage</button></div></div></Card>}
      <Card className="min-h-44"><div className="flex items-center justify-between"><h2 className="font-semibold">Current Career Goal</h2><span className="text-sm font-semibold text-teal-700">{career.category}</span></div><p className="mt-5 text-3xl font-semibold tracking-tight">{career.title}</p><p className="mt-3 text-sm leading-6 text-slate-600">{career.overview}</p><div className="mt-5 flex flex-wrap gap-2">{career.technologies.slice(0, 5).map((tech) => <span key={tech} className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">{tech}</span>)}</div></Card>
    </div>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Target} label="Skill Match" value={`${gap.percent}%`} accent="bg-violet-100 text-violet-700" />
      <Metric icon={Trophy} label="XP Earned" value={String(user.xp)} accent="bg-amber-100 text-amber-700" />
      <Metric icon={Activity} label="Learning Streak" value={`${user.streak} day`} accent="bg-teal-100 text-teal-700" />
      <Metric icon={Clock3} label="Est. Gap Time" value={gap.estimatedDuration} accent="bg-rose-100 text-rose-700" />
    </div>

    <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
      <Card><div className="flex items-center justify-between"><h2 className="font-semibold">Skill Gap Summary</h2><span className="text-sm text-slate-500">{gap.matched.length}/{career.skills.length} skills</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-teal-700" style={{ width: `${gap.percent}%` }} /></div><div className="mt-5 grid gap-4 md:grid-cols-2"><div><p className="text-sm font-semibold text-slate-500">Already matched</p><div className="mt-3 flex flex-wrap gap-2">{gap.matched.length ? gap.matched.map((skill) => <Pill key={skill}>{skill}</Pill>) : <p className="text-sm text-slate-500">Upload your resume or add skills to populate matches.</p>}</div></div><div><p className="text-sm font-semibold text-slate-500">Priority recommendations</p><div className="mt-3 flex flex-wrap gap-2">{gap.priority.map((skill) => <Pill key={skill} muted>{skill}</Pill>)}</div></div></div></Card>
      <Card><div className="flex items-center justify-between"><h2 className="font-semibold">Roadmap Progress</h2><span className="text-sm font-semibold text-teal-700">{roadmapPercent}%</span></div><div className="mt-6 space-y-4">{career.roadmap.slice(0, 5).map((stage) => <button key={stage.id} onClick={() => onStage(stage)} className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-white/55"><StatusDot status={progress[stage.id]?.status || 'locked'} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{stage.title}</span><span className="text-xs text-slate-500">{stage.duration} · {stage.xp} XP</span></span><ChevronRight size={16} className="text-slate-400" /></button>)}</div></Card>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <Card><h2 className="font-semibold">Recent Activity</h2><div className="mt-5 space-y-3">{user.activities.length ? user.activities.slice(0, 6).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/45 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Activity size={16} /></div><div><p className="text-sm font-semibold">{item.text}</p><p className="text-xs text-slate-500">{formatDate(item.at)}</p></div></div>) : <EmptyState text="Your saved learning activity will appear here." />}</div></Card>
      <Card><h2 className="font-semibold">Learning Statistics</h2><div className="mt-5 grid grid-cols-3 gap-3">{[['Completed', completed], ['Unlocked', Object.values(progress).filter((p) => p.status !== 'locked').length], ['Quizzes', Object.values(progress).filter((p) => p.quizScore !== undefined).length]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/50 p-4 text-center"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p></div>)}</div><div className="mt-5 rounded-3xl bg-teal-700 p-5 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Next milestone</p><p className="mt-2 text-xl font-semibold">{isNewUser ? 'Choose a career and add your first skills' : `Complete ${nextStage.title}`}</p></div></Card>
    </div>
  </div>
}

function Metric({ icon: Icon, label, value, accent }: { icon: typeof Target; label: string; value: string; accent: string }) {
  return <Card><div className="flex items-center gap-4"><div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', accent)}><Icon size={20} /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p></div></div></Card>
}

function Pill({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return <span className={cn('rounded-full px-3 py-1.5 text-xs font-semibold', muted ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700')}>{children}</span>
}

function StatusDot({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 className="text-teal-700" size={20} />
  if (status === 'locked') return <Lock className="text-slate-400" size={18} />
  return <Circle className="fill-white text-teal-700" size={18} />
}

function CareerEngine({ user, setUser, setView }: { user: UserProfile; setUser: (user: UserProfile) => void; setView: (view: View) => void }) {
  const [term, setTerm] = useState('')
  const [category, setCategory] = useState('All')
  const selected = getCareer(user.selectedCareerId)
  const categories = ['All', ...Array.from(new Set(careers.map((career) => career.category)))]
  const filtered = careers.filter((career) => (category === 'All' || career.category === category) && `${career.title} ${career.category} ${career.skills.join(' ')}`.toLowerCase().includes(term.toLowerCase()))
  const gap = calculateGap(user.skills, selected)

  async function choose(role: CareerRole) {
    const updated = await SkillSyncAPI.setCareer(user, role.id)
    setUser(updated)
    setView('roadmap')
  }

  return <div className="space-y-6">
    <Title eyebrow="Career Engine" title="Select from 50+ structured career roles" subtitle="Each role loads its own overview, skills, technologies, roadmap stages, resources, certifications and quizzes from the data layer." />
    <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
      <Card className="p-4"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-700" size={17} /><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search roles or skills" className="w-full rounded-2xl border border-white/80 bg-white/60 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-700" /></div><div className="mt-4 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={cn('whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition', category === item ? 'bg-slate-950 text-white' : 'bg-white/60 text-slate-600 hover:bg-white')}>{item}</button>)}</div><div className="mt-4 max-h-[620px] space-y-2 overflow-auto pr-1">{filtered.length ? filtered.map((role) => <button key={role.id} onClick={() => choose(role)} className={cn('w-full rounded-2xl border p-4 text-left transition', role.id === selected.id ? 'border-teal-700 bg-teal-50/70' : 'border-white/70 bg-white/35 hover:bg-white/65')}><div className="flex items-center justify-between gap-3"><p className="font-semibold">{role.title}</p><ChevronRight size={16} className="text-slate-400" /></div><p className="mt-1 text-xs font-semibold text-teal-700">{role.category}</p><p className="mt-2 text-sm leading-5 text-slate-600">{role.summary}</p></button>) : <EmptyState text="No careers found. The role library is searchable and extendable from data." />}</div></Card>
      <div className="space-y-5"><Card><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="text-sm font-semibold text-teal-700">Selected path</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{selected.title}</h2><p className="mt-3 leading-7 text-slate-600">{selected.overview}</p></div><div className="rounded-2xl bg-white/60 p-4 text-center"><p className="text-2xl font-semibold">{gap.percent}%</p><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Skill fit</p></div></div></Card><div className="grid gap-5 md:grid-cols-2"><InfoList title="Required Skills" items={selected.skills} /><InfoList title="Technologies" items={selected.technologies} /><InfoList title="Certifications" items={selected.certifications} /><InfoList title="Timeline & signal" items={[selected.timeline, selected.marketSignal, `Priority: ${gap.priority.join(', ') || 'Keep advancing'}`]} /></div></div>
    </div>
  </div>
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return <Card><h3 className="font-semibold">{title}</h3><div className="mt-4 flex flex-wrap gap-2">{items.map((item) => <Pill key={item} muted={title !== 'Required Skills'}>{item}</Pill>)}</div></Card>
}

function RoadmapView({ user, career, onStage }: { user: UserProfile; career: CareerRole; onStage: (stage: RoadmapStage) => void }) {
  const progress = user.stageProgress[career.id] || {}
  return <div className="space-y-6"><Title eyebrow="Roadmap" title={`${career.title} learning path`} subtitle="Quiz-gated stages unlock sequentially. Every card is generated from career-specific roadmap data." /><div className="grid gap-4 lg:grid-cols-2">{career.roadmap.map((stage, index) => { const state = progress[stage.id] || { status: 'locked', progress: 0 }; const locked = state.status === 'locked'; return <button key={stage.id} disabled={locked} onClick={() => onStage(stage)} className={cn('group rounded-[1.55rem] border p-5 text-left shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition', locked ? 'cursor-not-allowed border-white/60 bg-white/25 opacity-70' : 'border-white/75 bg-white/45 hover:-translate-y-0.5 hover:bg-white/70')}><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 font-semibold text-teal-700">{index + 1}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold tracking-tight">{stage.title}</h3><StatusDot status={state.status} /></div><p className="mt-2 text-sm leading-6 text-slate-600">{stage.description}</p><div className="mt-4 flex flex-wrap gap-2"><Pill>{stage.difficulty}</Pill><Pill muted>{stage.duration}</Pill><Pill muted>{stage.xp} XP</Pill></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-teal-700" style={{ width: `${state.progress}%` }} /></div></div></div></button> })}</div></div>
}

function SkillsView({ user, setUser, career }: { user: UserProfile; setUser: (user: UserProfile) => void; career: CareerRole }) {
  const [manual, setManual] = useState('')
  const [processing, setProcessing] = useState(false)
  const gap = calculateGap(user.skills, career)

  async function upload(file?: File) {
    if (!file) return
    setProcessing(true)
    try {
      const text = await file.text().catch(() => '')
      const source = `${file.name} ${text}`.toLowerCase()
      const extracted = skillDictionary.filter((skill) => source.includes(skill.toLowerCase())).slice(0, 18)
      const fallback = extracted.length ? extracted : career.skills.slice(0, 2)
      const updated = await SkillSyncAPI.saveSkills(user, [...user.skills, ...fallback], file.name)
      setUser(updated)
    } finally {
      setProcessing(false)
    }
  }

  async function addManual() {
    const skills = manual.split(',').map((skill) => skill.trim()).filter(Boolean)
    if (!skills.length) return
    const updated = await SkillSyncAPI.saveSkills(user, [...user.skills, ...skills])
    setUser(updated)
    setManual('')
  }

  async function removeSkill(skill: string) {
    const updated = await SkillSyncAPI.saveSkills(user, user.skills.filter((item) => item !== skill), user.resumeFileName)
    setUser(updated)
  }

  return <div className="space-y-6"><Title eyebrow="Resume & Skills" title="Build a living skill profile" subtitle="Upload a PDF resume or add skills manually. Extracted skills are saved to the local data layer and compared against your selected career." /><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><Card><label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-teal-700/35 bg-white/35 p-6 text-center transition hover:bg-white/60"><Upload className="text-teal-700" size={32} /><p className="mt-4 font-semibold">Upload PDF resume</p><p className="mt-2 text-sm leading-6 text-slate-500">SkillSync scans readable text and filename signals to populate your profile.</p><input type="file" accept="application/pdf" onChange={(event) => upload(event.target.files?.[0])} className="sr-only" /></label>{processing && <p className="mt-4 flex items-center gap-2 text-sm text-teal-700"><Loader2 className="animate-spin" size={16} /> Extracting skills...</p>}<div className="mt-5"><label className="text-sm font-semibold text-slate-700">Manual skill entry</label><div className="mt-2 flex gap-2"><input value={manual} onChange={(event) => setManual(event.target.value)} placeholder="React, SQL, Python" className="min-w-0 flex-1 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-sm outline-none focus:border-teal-700" /><button onClick={addManual} className="rounded-2xl bg-slate-950 px-4 text-white transition hover:bg-slate-800"><Plus size={18} /></button></div></div></Card><Card><div className="flex items-center justify-between"><h2 className="font-semibold">Your Skills</h2><span className="text-sm text-slate-500">{user.skills.length} saved</span></div><div className="mt-4 flex flex-wrap gap-2">{user.skills.length ? user.skills.map((skill) => <button key={skill} onClick={() => removeSkill(skill)} className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700">{skill} ×</button>) : <EmptyState text="No skills saved yet. Upload a resume or add skills manually." />}</div>{user.resumeFileName && <p className="mt-4 text-sm text-slate-500">Latest resume: <span className="font-semibold text-slate-700">{user.resumeFileName}</span></p>}</Card></div><Card><h2 className="font-semibold">Personalized Recommendations</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-white/50 p-4"><p className="text-sm text-slate-500">Skill match</p><p className="mt-1 text-3xl font-semibold">{gap.percent}%</p></div><div className="rounded-2xl bg-white/50 p-4"><p className="text-sm text-slate-500">Estimated learning</p><p className="mt-1 text-3xl font-semibold">{gap.estimatedDuration}</p></div><div className="rounded-2xl bg-white/50 p-4"><p className="text-sm text-slate-500">Top priority</p><p className="mt-1 text-xl font-semibold">{gap.priority[0] || 'Portfolio polish'}</p></div></div><div className="mt-5 flex flex-wrap gap-2">{gap.missing.map((skill) => <Pill key={skill} muted>{skill}</Pill>)}</div></Card></div>
}

function DatabaseView({ user }: { user: UserProfile }) {
  const tables = buildDatabaseTables([user])
  const [active, setActive] = useState(tables[3].name)
  const table = tables.find((item) => item.name === active) || tables[0]

  return <div className="space-y-6"><Title eyebrow="Database" title="Structured SkillSync tables" subtitle="A database-style view of the records used by the app: auth users, roles, stages, topic resources, quiz questions and attempts. Video links are stored per topic instead of reusing one generic course." /><div className="grid gap-5 xl:grid-cols-[260px_1fr]"><Card className="p-3"><div className="space-y-1">{tables.map((item) => <button key={item.name} onClick={() => setActive(item.name)} className={cn('flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition', active === item.name ? 'bg-teal-700 text-white' : 'hover:bg-white/60')}><span>{item.name}</span><span className={cn('rounded-full px-2 py-0.5 text-xs', active === item.name ? 'bg-white/20' : 'bg-white/70 text-slate-500')}>{item.rows.length}</span></button>)}</div></Card><Card className="overflow-hidden p-0"><div className="flex items-center justify-between border-b border-white/70 p-5"><div><h2 className="text-xl font-semibold">{table.name}</h2><p className="mt-1 text-sm text-slate-500">{table.description}</p></div><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-teal-700">{table.rows.length} rows</span></div><div className="overflow-auto"><table className="min-w-full border-collapse text-sm"><thead><tr className="bg-white/45 text-left text-xs uppercase tracking-[0.12em] text-slate-500">{table.columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-white/80 px-4 py-3 font-bold">{column}</th>)}</tr></thead><tbody>{table.rows.slice(0, 80).map((row, index) => <tr key={index} className="border-b border-white/60 transition hover:bg-white/40">{table.columns.map((column) => <td key={column} className="max-w-[360px] truncate whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700">{String(row[column] ?? '')}</td>)}</tr>)}</tbody></table></div></Card></div></div>
}

const curatedVideos = [
  { id: 'rfscVS0vtbw', title: 'Python Full Course', tags: ['python', 'ai', 'data', 'machine learning', 'automation', 'backend'] },
  { id: 'i_LwzRVP7bg', title: 'Machine Learning for Everybody', tags: ['machine learning', 'ai', 'statistics', 'model', 'data scientist'] },
  { id: 'aircAruvnKk', title: 'Neural Networks Explained', tags: ['deep learning', 'neural', 'computer vision', 'nlp', 'ai research'] },
  { id: 'HXV3zeQKqGY', title: 'SQL Full Course', tags: ['sql', 'database', 'analyst', 'data', 'business'] },
  { id: 'G3e-cpL7ofc', title: 'HTML & CSS Full Course', tags: ['html', 'css', 'frontend', 'ui', 'web'] },
  { id: 'PkZNo7MFNFg', title: 'JavaScript Full Course', tags: ['javascript', 'frontend', 'full stack', 'web'] },
  { id: 'SqcY0GlETPk', title: 'React Tutorial for Beginners', tags: ['react', 'frontend', 'full stack', 'mobile ui'] },
  { id: 'Oe421EPjeBE', title: 'Node.js and Express Full Course', tags: ['node', 'backend', 'api', 'full stack'] },
  { id: 'RBSGKlAvoiM', title: 'Data Structures & Algorithms', tags: ['algorithms', 'interview', 'software', 'engineering'] },
  { id: '3c-iBn73dDE', title: 'Docker and Kubernetes Course', tags: ['docker', 'kubernetes', 'devops', 'cloud', 'mlops', 'platform'] },
  { id: 'Wf2eSG3owoA', title: 'Git and GitHub for Beginners', tags: ['github', 'git', 'collaboration', 'documentation'] },
  { id: 'FTFaQWZBqQ8', title: 'Product Management Fundamentals', tags: ['product', 'roadmapping', 'metrics', 'research'] }
]

function getCuratedVideo(career: CareerRole, stage: RoadmapStage) {
  return videoForStage(career, stage)
}

function youtubeWatchUrl(career: CareerRole, stage: RoadmapStage) {
  return `https://www.youtube.com/watch?v=${getCuratedVideo(career, stage).id}`
}

function youtubeEmbedUrl(career: CareerRole, stage: RoadmapStage) {
  return `https://www.youtube.com/embed/${getCuratedVideo(career, stage).id}`
}

function StageDrawer({ stage, career, user, setUser, onClose }: { stage: RoadmapStage; career: CareerRole; user: UserProfile; setUser: (user: UserProfile) => void; onClose: () => void }) {
  const saved = user.stageProgress[career.id]?.[stage.id]
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [score, setScore] = useState<number | null>(saved?.quizScore ?? null)
  const [showReview, setShowReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(saved?.review?.rating || 5)
  const [difficultyFeedback, setDifficultyFeedback] = useState(saved?.review?.difficultyFeedback || 'just-right')
  const [paceFeedback, setPaceFeedback] = useState(saved?.review?.paceFeedback || 'balanced')
  const complete = Object.keys(answers).length === stage.quiz.length
  const video = getCuratedVideo(career, stage)

  async function submitQuiz() {
    const correct = stage.quiz.filter((q, index) => answers[index] === q.answer).length
    const percent = Math.round((correct / stage.quiz.length) * 100)
    setScore(percent)
    const updated = await SkillSyncAPI.saveStage(user, career.id, stage.id, percent >= 67 ? 100 : 65, percent)
    setUser(updated)
  }

  async function markVideoDone() {
    const updated = await SkillSyncAPI.saveVideoDone(user, career.id, stage.id, video.title)
    setUser(updated)
    setShowReview(true)
  }

  async function saveReview() {
    const updated = await SkillSyncAPI.saveReview(user, career.id, stage.id, { rating: reviewRating, difficultyFeedback, paceFeedback, comment: `${video.title} review`, at: new Date().toISOString() })
    setUser(updated)
    setShowReview(false)
  }

  function retakeQuiz() {
    setAnswers({})
    setScore(null)
  }

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/25" onClick={onClose}><motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }} onClick={(event) => event.stopPropagation()} className="ml-auto h-full w-full max-w-2xl overflow-auto bg-[#eef4f0] p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-teal-700">{career.title}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{stage.title}</h2><p className="mt-3 leading-7 text-slate-600">{stage.description}</p></div><button onClick={onClose} className="rounded-2xl p-2 hover:bg-white"><X size={20} /></button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><MetricMini label="Difficulty" value={stage.difficulty} /><MetricMini label="Time" value={stage.duration} /><MetricMini label="XP" value={`${stage.xp}`} /></div><Card className="mt-5"><h3 className="font-semibold">Prerequisites</h3><div className="mt-3 flex flex-wrap gap-2">{stage.prerequisites.map((item) => <Pill key={item}>{item}</Pill>)}</div></Card><Card className="mt-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Watch inside SkillSync</h3><a href={youtubeWatchUrl(career, stage)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-white">Open YouTube <ArrowRight size={13} /></a></div><p className="mt-2 text-sm leading-6 text-slate-600">Curated playable lesson: <span className="font-semibold text-slate-800">{video.title}</span>.</p><div className="mt-4 overflow-hidden rounded-2xl border border-white/80 bg-slate-950"><iframe title={video.title} src={youtubeEmbedUrl(career, stage)} className="aspect-video w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><button onClick={markVideoDone} className={cn('mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition', saved?.videoCompleted ? 'bg-teal-50 text-teal-700' : 'bg-teal-700 text-white hover:bg-teal-800')}>{saved?.videoCompleted ? 'Video marked as done' : 'Mark video as done'}</button>{showReview && <div className="mt-4 rounded-2xl bg-white/55 p-4"><p className="font-semibold">Quick review</p><div className="mt-3 flex gap-2">{[1,2,3,4,5].map((rating) => <button key={rating} onClick={() => setReviewRating(rating)} className={cn('h-9 w-9 rounded-full text-sm font-bold', reviewRating === rating ? 'bg-teal-700 text-white' : 'bg-white text-slate-500')}>{rating}</button>)}</div><div className="mt-3 grid gap-2 sm:grid-cols-2"><select value={difficultyFeedback} onChange={(event) => setDifficultyFeedback(event.target.value)} className="rounded-xl border border-white bg-white/80 px-3 py-2 text-sm"><option value="easy">Too easy</option><option value="just-right">Just right</option><option value="hard">Too hard</option></select><select value={paceFeedback} onChange={(event) => setPaceFeedback(event.target.value)} className="rounded-xl border border-white bg-white/80 px-3 py-2 text-sm"><option value="slow">Too slow</option><option value="balanced">Balanced</option><option value="fast">Too fast</option></select></div><button onClick={saveReview} className="mt-3 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save review</button></div>}</Card><Card className="mt-5"><h3 className="font-semibold">Learning resources</h3><div className="mt-4 space-y-2"><a href={youtubeWatchUrl(career, stage)} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-white/55 p-3 text-sm transition hover:bg-white"><span><span className="font-semibold">{video.title}</span><span className="ml-2 text-xs text-teal-700">YouTube</span></span><ArrowRight size={15} /></a>{stage.resources.filter((resource) => resource.type !== 'YouTube').map((resource) => <a key={`${resource.type}-${resource.title}`} href={resource.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-white/55 p-3 text-sm transition hover:bg-white"><span><span className="font-semibold">{resource.title}</span><span className="ml-2 text-xs text-teal-700">{resource.type}</span></span><ArrowRight size={15} /></a>)}</div></Card><Card className="mt-5"><div className="flex items-center justify-between"><h3 className="font-semibold">Interactive quiz</h3>{score !== null && <span className={cn('rounded-full px-3 py-1 text-xs font-bold', score >= 67 ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700')}>Score {score}%</span>}</div><div className="mt-5 space-y-5">{stage.quiz.map((question, index) => <div key={question.question} className="rounded-2xl bg-white/45 p-4"><p className="font-semibold">{index + 1}. {question.question}</p><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => { const selected = answers[index] === optionIndex; const reveal = score !== null; const correct = question.answer === optionIndex; return <button key={option} onClick={() => score === null && setAnswers({ ...answers, [index]: optionIndex })} className={cn('rounded-xl border px-3 py-2 text-left text-sm transition', selected ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white/60 hover:bg-white', reveal && correct && 'border-teal-700 bg-teal-50 text-teal-800', reveal && selected && !correct && 'border-red-300 bg-red-50 text-red-700')}>{option}</button> })}</div>{score !== null && <p className="mt-3 text-sm text-slate-600">{question.explanation}</p>}</div>)}</div><div className="mt-5 grid gap-2 sm:grid-cols-2"><button disabled={!complete || score !== null} onClick={submitQuiz} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">Save score</button><button onClick={retakeQuiz} className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-white">Retake quiz</button></div></Card></motion.aside></motion.div>
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/75 bg-white/45 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>
}

function Title({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <div><p className="font-semibold text-teal-700">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-5xl">{title}</h1><p className="mt-3 max-w-3xl leading-7 text-slate-600">{subtitle}</p></div>
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white/35 p-5 text-sm text-slate-500">{text}</div>
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    SkillSyncAPI.getSession().then((session) => {
      setUser(session)
      setBooting(false)
    })
  }, [])

  if (booting) return <main className="flex min-h-screen items-center justify-center bg-[#b8d7d4] text-teal-800"><Loader2 className="mr-3 animate-spin" /> Loading secure workspace...</main>
  if (!user) return <AuthScreen onAuthed={setUser} />
  return <AppShell user={user} setUser={setUser} />
}
