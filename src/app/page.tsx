"use client";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  CheckCircle2, Circle, ArrowRight, Play, Book, Code2, 
  Sparkles, BrainCircuit, Target, Trophy, Check, Briefcase, 
  MonitorPlay, Zap, Calendar, Infinity, LogOut,
  LayoutDashboard, BarChart2, Clock, Users, CheckSquare, Settings, HelpCircle, Download, Search, Bell, Map, Loader2, ChevronRight, GraduationCap,
  Sun, Moon
} from 'lucide-react';

type Career = { id: string; slug: string; title: string; description: string; emoji: string; tagline: string };
type StackChoice = { id: string; name: string; icon: string; description: string; pros: string[]; cons: string[]; tags: string[] };
type RoadmapTopic = {
  id: string; slug: string; canonical_name: string; description: string;
  category_name: string; category_slug: string; display_order: number; order_index: number;
};
type TopicResource = {
  id: string; canonical_name: string; description: string;
  yt_playlist_url: string | null; yt_playlist_title: string | null; thumbnail_url: string | null;
  docs_url: string | null; github_url: string | null; practice_url: string | null;
};
type QuizQuestion = { q: string; options: Record<string, string>; answer: string; explanation: string };

const STACK_OPTIONS: Record<string, StackChoice[]> = {
  'backend-developer': [
    {
      id: 'python-backend', name: 'Python', icon: '🐍',
      description: 'Django & FastAPI — great for web APIs, automation, and ML-integrated backends',
      pros: ['Easiest syntax to learn', 'Huge library ecosystem (ML, data, web)', 'Most in-demand for AI/ML companies'],
      cons: ['Slower than compiled languages', 'GIL limits true multi-threading'],
      tags: ['Python', 'Django', 'FastAPI', 'SQL'],
    },
    {
      id: 'nodejs-backend', name: 'Node.js', icon: '🟢',
      description: 'Express & Fastify — JavaScript on the server, same language as frontend',
      pros: ['Same language as frontend (JS)', 'Blazing fast I/O for real-time apps', 'Massive npm ecosystem'],
      cons: ['Callback-heavy for complex logic', 'Not ideal for CPU-intensive tasks'],
      tags: ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
    },
    {
      id: 'java-backend', name: 'Java', icon: '☕',
      description: 'Spring Boot — enterprise-grade, used by banks, MNCs, and large-scale systems',
      pros: ['Industry standard for enterprise', 'Strong typing = fewer bugs', 'Best performance at scale'],
      cons: ['Verbose and boilerplate-heavy', 'Steeper learning curve than Python/JS'],
      tags: ['Java', 'Spring Boot', 'SQL', 'Microservices'],
    },
    {
      id: 'go-backend', name: 'Go (Golang)', icon: '🔵',
      description: 'Modern, compiled language used by Docker, Kubernetes, and cloud-native systems',
      pros: ['Extremely fast (compiled)', 'Built-in concurrency (goroutines)', 'Used by top tech companies'],
      cons: ['Smaller community than Python/JS', 'Less beginner-friendly'],
      tags: ['Go', 'REST APIs', 'Docker', 'Cloud'],
    },
  ],
  'full-stack-developer': [
    {
      id: 'mern', name: 'MERN Stack', icon: '⚛️',
      description: 'MongoDB + Express + React + Node.js — most popular full-stack combo',
      pros: ['JavaScript end-to-end', 'Highest job demand', 'Huge community & resources'],
      cons: ['MongoDB not ideal for complex relations', 'Context switching between FE/BE mindset'],
      tags: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    },
    {
      id: 'react-java', name: 'React + Java', icon: '☕⚛️',
      description: 'React frontend with Spring Boot backend — enterprise standard used by banks, MNCs, and large companies',
      pros: ['Spring Boot is enterprise industry standard', 'Strongly typed — fewer bugs in production', 'High-paying enterprise jobs (TCS, Infosys, MNCs)'],
      cons: ['Java is more verbose than JS/Python', 'Steeper learning curve — longer path to job-readiness'],
      tags: ['React', 'Java', 'Spring Boot', 'PostgreSQL', 'REST APIs'],
    },
    {
      id: 'nextjs-fullstack', name: 'Next.js Full Stack', icon: '▲',
      description: 'React SSR + API routes in one — production-ready from day one, used by Vercel, TikTok, Twitch',
      pros: ['One framework for frontend + backend', 'SEO-friendly SSR/SSG', 'Vercel deployment in minutes'],
      cons: ['Opinionated — less flexibility', 'Complex data fetching patterns'],
      tags: ['Next.js', 'React', 'TypeScript', 'PostgreSQL'],
    },
    {
      id: 'react-python', name: 'React + Python', icon: '🐍⚛️',
      description: 'React frontend with Django/FastAPI backend — great for data-heavy and ML-integrated applications',
      pros: ['Best of both worlds', 'Python for ML/data integration', 'Clean API separation'],
      cons: ['Two languages to master', 'More setup required'],
      tags: ['React', 'Python', 'FastAPI', 'PostgreSQL'],
    },
    {
      id: 'angular-java', name: 'Angular + Java', icon: '🔴☕',
      description: 'Angular frontend + Spring Boot backend — enterprise-grade stack used by banks and large organizations',
      pros: ['Full enterprise standard stack', 'TypeScript + Java both strongly typed', 'Very high-paying corporate jobs'],
      cons: ['Both are complex frameworks — hardest to learn', 'Slower development compared to JS stacks'],
      tags: ['Angular', 'TypeScript', 'Java', 'Spring Boot', 'SQL'],
    },
    {
      id: 'vue-node', name: 'Vue + Node.js', icon: '💚',
      description: 'Vue.js for UI with Node.js backend — gentler learning curve, great for SPAs and startups',
      pros: ['Vue is easiest frontend framework', 'Progressive adoption', 'Clean state management'],
      cons: ['Smaller job market than React', 'Less enterprise adoption'],
      tags: ['Vue.js', 'Node.js', 'Express', 'MySQL'],
    },
  ],
  'frontend-developer': [
    {
      id: 'react-fe', name: 'React', icon: '⚛️',
      description: 'Most in-demand frontend library — used by Meta, Airbnb, Netflix, Uber',
      pros: ['#1 job demand globally', 'Component-based = reusable code', 'React Native for mobile too'],
      cons: ['Not a full framework — needs extra libraries', 'Frequent updates'],
      tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    },
    {
      id: 'vue-fe', name: 'Vue.js', icon: '💚',
      description: 'Progressive framework — easier to pick up, great documentation, growing fast',
      pros: ['Easiest to learn of the three', 'Excellent official documentation', 'Flexible & lightweight'],
      cons: ['Smaller job market than React', 'Less ecosystem compared to React'],
      tags: ['Vue.js', 'Nuxt.js', 'TypeScript', 'Pinia'],
    },
    {
      id: 'angular-fe', name: 'Angular', icon: '🔴',
      description: 'Full framework by Google — enterprise-grade, TypeScript-first, all-in-one',
      pros: ['Complete framework — no extra libraries', 'TypeScript built-in from start', 'Strong in enterprise jobs'],
      cons: ['Steep learning curve', 'Verbose and complex architecture'],
      tags: ['Angular', 'TypeScript', 'RxJS', 'NgRx'],
    },
    {
      id: 'svelte-fe', name: 'Svelte', icon: '🔥',
      description: 'Cutting-edge compiler — no virtual DOM, smallest bundle size, future of frontend',
      pros: ['Fastest performance (no virtual DOM)', 'Minimal boilerplate code', 'SvelteKit = full-stack ready'],
      cons: ['Smallest job market currently', 'Less community resources'],
      tags: ['Svelte', 'SvelteKit', 'TypeScript'],
    },
  ],
  'data-scientist': [
    {
      id: 'ml-engineer', name: 'ML Engineer', icon: '🤖',
      description: 'Build, train, and deploy machine learning models in production',
      pros: ['Highest salary in data field', 'Work on cutting-edge AI', 'Build real products with ML'],
      cons: ['Needs strong math (linear algebra, stats)', 'Longer path to job-readiness'],
      tags: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Docker'],
    },
    {
      id: 'data-analyst', name: 'Data Analyst', icon: '📊',
      description: 'Extract business insights from data using SQL, Python, and visualization tools',
      pros: ['Fastest path to employment', 'High demand in every industry', 'Less math than ML Engineering'],
      cons: ['Less technical depth', 'Can plateau without growing into ML/Engineering'],
      tags: ['Python', 'SQL', 'Pandas', 'Tableau', 'Power BI'],
    },
    {
      id: 'data-engineer', name: 'Data Engineer', icon: '🔧',
      description: 'Build data pipelines, warehouses, and ETL systems that power analytics teams',
      pros: ['Very high salary', 'Strong demand in big tech & startups', 'More engineering, less math'],
      cons: ['Requires knowledge of cloud infra', 'Abstract work — less visible impact'],
      tags: ['Python', 'SQL', 'Spark', 'Airflow', 'Kafka', 'AWS'],
    },
    {
      id: 'nlp-engineer', name: 'NLP / AI Engineer', icon: '💬',
      description: 'Build LLM-powered apps, chatbots, and language AI systems',
      pros: ['Hottest field in AI (2024-2026)', 'Work with LLMs & transformers', 'Huge market demand'],
      cons: ['Rapidly changing tools', 'Needs solid ML fundamentals first'],
      tags: ['Python', 'HuggingFace', 'LangChain', 'PyTorch', 'OpenAI API'],
    },
  ],
};

const COMMON_TOPICS = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular',
  'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Git',
  'REST APIs', 'GraphQL', 'Linux', 'DSA', 'System Design', 'C/C++',
  'React Native', 'Flutter', 'Machine Learning', 'PyTorch', 'Pandas', 'NumPy',
];

const LEARNING_STYLES = [
  { id: 'video', label: 'Video Courses', desc: 'I learn best by watching', icon: MonitorPlay },
  { id: 'docs', label: 'Documentation', desc: 'I prefer reading official docs', icon: Book },
  { id: 'project', label: 'Project-based', desc: 'I learn by building things', icon: Code2 },
  { id: 'mixed', label: 'Mixed', desc: 'A combination of methods', icon: Zap },
];

const DEADLINE_OPTIONS = [
  { weeks: 1, label: '1 week', icon: Zap, note: 'Crash courses only' },
  { weeks: 2, label: '2 weeks', icon: Sparkles, note: 'Fast-track' },
  { weeks: 4, label: '1 month', icon: Calendar, note: 'Focused pace' },
  { weeks: 8, label: '2 months', icon: Target, note: 'Balanced' },
  { weeks: 12, label: '3 months', icon: Book, note: 'Full courses' },
  { weeks: 0, label: 'No deadline', icon: Infinity, note: 'Own pace' },
];

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const itemAnim: any = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const [activeView, setActiveView] = useState<'dashboard' | 'roadmap' | 'settings'>('dashboard');

  const [step, setStep] = useState<1|2|3|4|5>(1);
  const [careers, setCareers] = useState<Career[]>([]);

  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedStack, setSelectedStack] = useState<StackChoice | null>(null);
  const [knownTopics, setKnownTopics] = useState<Set<string>>(new Set());
  const [customTopic, setCustomTopic] = useState('');
  const [learningStyle, setLearningStyle] = useState('mixed');
  const [deadlineWeeks, setDeadlineWeeks] = useState(4);

  const [roadmap, setRoadmap] = useState<RoadmapTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  const [activeTopic, setActiveTopic] = useState<RoadmapTopic | null>(null);
  const [activeResource, setActiveResource] = useState<TopicResource | null>(null);
  const [loadingResource, setLoadingResource] = useState(false);
  const [progress, setProgress] = useState<Record<string, 'todo'|'in_progress'|'done'>>({});

  const [quiz, setQuiz] = useState<QuizQuestion[]|null>(null);
  const [quizTopic, setQuizTopic] = useState<RoadmapTopic|null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number,string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // QOTD state
  const [qotd, setQotd] = useState<any>(null);
  const [qotdSelected, setQotdSelected] = useState<string|null>(null);
  const [qotdLoading, setQotdLoading] = useState(false);

  useEffect(() => {
    fetch('/api/careers').then(r => r.json()).then(d => setCareers(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    const sid = (session?.user as any)?.id;
    if (!sid) return;

    if (allProfiles.length === 0) {
      fetch(`/api/student/roadmap?studentId=${sid}`).then(r => r.json()).then(data => {
        if (data.roadmaps && data.roadmaps.length > 0) {
          setAllProfiles(data.roadmaps);
          const dbRecord = data.roadmap; // The latest one
          loadProfile(dbRecord);
        }
      });
    }

    if (roadmap.length > 0) {
      fetch(`/api/progress?studentId=${sid}`).then(r => r.json()).then(d => {
        const map: Record<string, any> = {};
        d.progress?.forEach((p: any) => { map[p.topic_id] = p.status; });
        setProgress(map);
      });
    }
    
    // Fetch QOTD
    if (!qotd && activeView === 'dashboard') {
      fetch(`/api/qotd?studentId=${sid}&career=${selectedCareer?.title || 'Computer Science'}`)
        .then(r => r.json())
        .then(d => setQotd(d));
    }
  }, [session, roadmap.length, step, activeView]);

  const loadProfile = (dbRecord: any) => {
    setSelectedCareer({ id: dbRecord.career_id, title: dbRecord.career_title } as Career);
    if (dbRecord.stack_choice) setSelectedStack(dbRecord.stack_choice);
    if (dbRecord.known_topics) setKnownTopics(new Set(dbRecord.known_topics));
    if (dbRecord.deadline_weeks !== undefined) setDeadlineWeeks(dbRecord.deadline_weeks);
    setRoadmap(dbRecord.roadmap_data || []);
    setStep(5);
  };

  const stackOptions = selectedCareer ? (STACK_OPTIONS[selectedCareer.slug] || []) : [];

  const toggleTopic = (t: string) => {
    const s = new Set(knownTopics); s.has(t) ? s.delete(t) : s.add(t); setKnownTopics(s);
  };
  const addCustom = () => {
    if (!customTopic.trim()) return;
    const s = new Set(knownTopics); s.add(customTopic.trim()); setKnownTopics(s); setCustomTopic('');
  };

  const generateRoadmap = async () => {
    if (!selectedCareer) return;
    setLoading(true);
    const msgs = [
      `🤖 Gemini is analyzing your ${selectedStack?.name} profile...`,
      `⏱️ Planning for your deadline...`,
      `✨ Removing what you already know...`,
      `🎯 Picking resources for your pace!`,
    ];
    let i = 0; setLoadingMsg(msgs[0]);
    const iv = setInterval(() => { i = (i+1)%msgs.length; setLoadingMsg(msgs[i]); }, 1800);
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerId: selectedCareer.id,
          knownTopics: Array.from(knownTopics),
          stackChoice: selectedStack ? { id: selectedStack.id, name: selectedStack.name, tags: selectedStack.tags } : null,
          learningStyle, deadlineWeeks,
        }),
      });
      const data = await res.json();
      const newRoadmap = data.roadmap || [];
      setRoadmap(newRoadmap);
      setProgress({}); setActiveTopic(null); setStep(5);

      const sid = (session?.user as any)?.id;
      if (sid) {
        const pRes = await fetch('/api/student/roadmap', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: sid,
            careerId: selectedCareer.id,
            careerTitle: selectedCareer.title,
            knownTopics: Array.from(knownTopics),
            deadlineWeeks,
            stackChoice: selectedStack ? { id: selectedStack.id, name: selectedStack.name, tags: selectedStack.tags } : null,
            roadmapData: newRoadmap
          })
        });
        const pData = await pRes.json();
        if (pData.saved) {
           setAllProfiles([pData.saved, ...allProfiles]);
        }
      }
    } catch (e) { console.error(e); }
    finally { clearInterval(iv); setLoading(false); }
  };

  const viewResources = async (topic: any) => {
    setActiveTopic(topic); setActiveResource(null); setLoadingResource(true);
    setQuiz(null); setQuizSubmitted(false); setQuizAnswers({});

    if (topic.yt_playlist_url || topic.docs_url || topic.github_url || topic.practice_url) {
      setTimeout(() => {
        setActiveResource({
          id: topic.id,
          canonical_name: topic.canonical_name,
          description: topic.description,
          yt_playlist_url: topic.yt_playlist_url,
          yt_playlist_title: topic.yt_playlist_title,
          thumbnail_url: topic.thumbnail_url,
          docs_url: topic.docs_url,
          github_url: topic.github_url,
          practice_url: topic.practice_url,
        });
        setLoadingResource(false);
      }, 400);
      return;
    }

    try {
      const res = await fetch(`/api/topics/${topic.id}/resources?deadlineWeeks=${deadlineWeeks}`);
      const data = await res.json();
      setActiveResource(data.topic || null);
    } catch (e) { console.error(e); }
    finally { setLoadingResource(false); }
  };

  const markDone = async (topicId: string) => {
    const newStatus = progress[topicId] === 'done' ? 'todo' : 'done';
    setProgress(p => ({ ...p, [topicId]: newStatus }));
    const sid = (session?.user as any)?.id;
    if (sid) await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid, topicId, status: newStatus }) });
    if (newStatus === 'done' && activeTopic?.id === topicId) openQuiz(activeTopic);
  };

  const openQuiz = async (topic: RoadmapTopic) => {
    setQuizTopic(topic); setLoadingQuiz(true); setQuiz(null); setQuizSubmitted(false); setQuizAnswers({});
    try {
      const res = await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topicId: topic.id, topicName: topic.canonical_name }) });
      const data = await res.json();
      setQuiz(data.questions || null);
    } catch (e) { console.error(e); }
    finally { setLoadingQuiz(false); }
  };

  const submitQuiz = async () => {
    if (!quiz || !quizTopic) return;
    const answers = quiz.map((q, i) => ({ q: q.q, chosen: quizAnswers[i], correct: quizAnswers[i] === q.answer, answer: q.answer }));
    setQuizSubmitted(true);
    const sid = (session?.user as any)?.id;
    if (sid) await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid, topicId: quizTopic.id, answers }) });
  };
  
  const submitQotd = async () => {
    if (!qotd || !qotdSelected) return;
    setQotdLoading(true);
    const sid = (session?.user as any)?.id;
    const isCorrect = qotdSelected === qotd.question.answer;
    if (sid && isCorrect) {
      await fetch('/api/qotd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid, questionId: qotd.id, isCorrect }) });
      setQotd({ ...qotd, solved: true });
    } else if (!isCorrect) {
      alert('Incorrect! Read the explanation or try again tomorrow.');
    }
    setQotdLoading(false);
  }

  const grouped = roadmap.reduce((acc, t) => {
    const key = t.category_slug;
    if (!acc[key]) acc[key] = { name: t.category_name, topics: [] };
    acc[key].topics.push(t);
    return acc;
  }, {} as Record<string, { name: string; topics: RoadmapTopic[] }>);

  const doneCount = roadmap.filter(t => progress[t.id] === 'done').length;
  const pct = roadmap.length > 0 ? Math.round((doneCount / roadmap.length) * 100) : 0;
  const isTight = deadlineWeeks > 0 && deadlineWeeks <= 4;

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-sans flex flex-col md:flex-row transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col hidden md:flex shrink-0 h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">Path Finder</span>
        </div>
        
        <div className="px-4 py-2 flex-1 flex flex-col">
          <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-3 px-3 tracking-[0.2em] uppercase">Main Menu</div>
          <nav className="space-y-1.5">
            <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeView === 'dashboard' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}`}>
              <LayoutDashboard className="w-4 h-4"/> Dashboard
            </button>
            <button onClick={() => setActiveView('roadmap')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeView === 'roadmap' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}`}>
              <Map className="w-4 h-4"/> Roadmap Mgmt
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors">
              <BarChart2 className="w-4 h-4"/> Analytics
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors">
              <Users className="w-4 h-4"/> Student
            </button>
          </nav>
          
          <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-8 mb-3 px-3 tracking-[0.2em] uppercase">Settings</div>
          <nav className="space-y-1.5">
            <button onClick={() => setActiveView('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeView === 'settings' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}`}>
              <Settings className="w-4 h-4"/> Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors">
              <HelpCircle className="w-4 h-4"/> Help & Support
            </button>
          </nav>

          {/* BOTTOM PROFILE/LOGOUT */}
          <div className="mt-auto mb-4 border-t border-gray-100 dark:border-slate-800 pt-4 px-2">
             {session ? (
               <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold text-sm transition-colors"><LogOut className="w-4 h-4"/> Sign out</button>
             ) : (
               <button onClick={() => router.push('/auth')} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 font-semibold text-sm transition-colors">Login / Sign up</button>
             )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* HEADER */}
        <header className="h-20 bg-[#F8F9FB] dark:bg-slate-950 flex items-center justify-between px-8 shrink-0 z-10 transition-colors">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-full border border-gray-200 dark:border-slate-800 w-96 shadow-sm transition-colors">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-0" />
          </div>
          <div className="flex items-center gap-5">
            <button className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"><Bell className="w-4 h-4"/></button>
            <div className="flex items-center gap-3 ml-2 border-l border-gray-200 dark:border-slate-800 pl-6">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden shadow-sm flex items-center justify-center border border-gray-200 dark:border-slate-600">
                 <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e5e7eb" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-extrabold text-gray-900 dark:text-white">{session?.user?.name || 'Guest'}</div>
                <div className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Student</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-8 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* VIEW: DASHBOARD */}
            {activeView === 'dashboard' && (
              <motion.div key="dashboard-view" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto space-y-6">
                 <div className="mb-8">
                   <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Welcome back, {session?.user?.name || 'Guest'}!</h1>
                   <p className="text-gray-500 dark:text-slate-400 font-medium mt-1">Here is a quick overview of your learning journey today.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* STATS */}
                   <div className="col-span-1 md:col-span-1 space-y-6">
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800">
                         <div className="flex items-center gap-4 mb-2">
                           <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400"><Briefcase className="w-6 h-6"/></div>
                           <div>
                             <div className="text-3xl font-black text-gray-900 dark:text-white">{allProfiles.length}</div>
                             <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Active Paths</div>
                           </div>
                         </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800">
                         <div className="flex items-center gap-4 mb-2">
                           <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400"><CheckCircle2 className="w-6 h-6"/></div>
                           <div>
                             <div className="text-3xl font-black text-gray-900 dark:text-white">{doneCount}</div>
                             <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Topics Completed</div>
                           </div>
                         </div>
                      </div>
                   </div>
                   
                   {/* QOTD */}
                   <div className="col-span-1 md:col-span-2">
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                           <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500"/> Question of the Day</h2>
                           <span className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-lg">{selectedCareer?.title || 'Computer Science'}</span>
                        </div>
                        
                        {!qotd ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500"/>
                            <p className="font-medium text-sm">Generating today's challenge...</p>
                          </div>
                        ) : qotd.error || !qotd.question ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-3">
                            <p className="font-medium text-sm">Failed to load today's challenge. Please try again later.</p>
                          </div>
                        ) : qotd.solved ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-green-50 dark:bg-green-500/5 rounded-2xl border border-green-100 dark:border-green-900/30">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4"><Trophy className="w-8 h-8"/></div>
                            <h3 className="text-xl font-black text-green-800 dark:text-green-400 mb-2">Nailed it!</h3>
                            <p className="text-green-600 dark:text-green-500/80 font-medium max-w-sm">You've solved today's question. Come back tomorrow for a new challenge!</p>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">{qotd.question.q}</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                               {Object.entries(qotd.question.options).map(([k, v]) => (
                                 <button key={k} onClick={() => setQotdSelected(k)} className={`p-4 text-left rounded-xl border text-sm font-medium transition-colors ${qotdSelected === k ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-sm' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}`}>
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md mr-3 text-[10px] font-bold border ${qotdSelected === k ? 'border-transparent bg-white dark:bg-purple-900' : 'border-gray-300 dark:border-slate-600'}`}>{k.toUpperCase()}</span>
                                    {v as string}
                                 </button>
                               ))}
                             </div>
                             <div className="mt-auto flex justify-end">
                               <button onClick={submitQotd} disabled={!qotdSelected || qotdLoading} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-colors flex items-center gap-2">
                                  {qotdLoading && <Loader2 className="w-4 h-4 animate-spin"/>} Submit Answer
                               </button>
                             </div>
                          </div>
                        )}
                      </div>
                   </div>
                 </div>
              </motion.div>
            )}

            {/* VIEW: SETTINGS */}
            {activeView === 'settings' && (
              <motion.div key="settings-view" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto space-y-6">
                <div className="mb-8">
                   <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Settings & Profiles</h1>
                   <p className="text-gray-500 dark:text-slate-400 font-medium mt-1">Manage your learning paths and application preferences.</p>
                </div>

                {/* THEME TOGGLE */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800 mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Appearance</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Toggle between dark and light mode.</p>
                  </div>
                  <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button onClick={() => setTheme('light')} className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition-colors ${theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}>
                      <Sun className="w-4 h-4"/> Light
                    </button>
                    <button onClick={() => setTheme('dark')} className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition-colors ${theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-300'}`}>
                      <Moon className="w-4 h-4"/> Dark
                    </button>
                  </div>
                </div>

                {/* MULTIPLE PROFILES */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-xl">Your Learning Profiles</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Switch between different career paths you are currently tracking.</p>
                    </div>
                    <button onClick={() => { setStep(1); setRoadmap([]); setActiveView('roadmap'); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center gap-2">
                       + Add New Profile
                    </button>
                  </div>

                  <div className="space-y-4">
                    {allProfiles.length === 0 ? (
                      <div className="text-center p-8 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl text-gray-400 dark:text-slate-500 font-medium">
                        You have not created any learning paths yet.
                      </div>
                    ) : (
                      allProfiles.map((prof, idx) => {
                        const isActive = selectedCareer?.id === prof.career_id;
                        return (
                          <div key={idx} className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${isActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isActive ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                 {prof.career_title?.includes('Backend') ? '🐍' : prof.career_title?.includes('Data') ? '📊' : '⚛️'}
                               </div>
                               <div>
                                 <h4 className={`font-bold text-lg ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>{prof.career_title}</h4>
                                 <div className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                                   <span>{prof.roadmap_data?.length || 0} Topics</span>
                                   <span>•</span>
                                   <span>{prof.deadline_weeks > 0 ? `${prof.deadline_weeks} weeks` : 'No deadline'}</span>
                                 </div>
                               </div>
                            </div>
                            <button disabled={isActive} onClick={() => { loadProfile(prof); setActiveView('roadmap'); }} className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md cursor-default' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
                              {isActive ? 'Active' : 'Switch'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </motion.div>
            )}
            
            {/* VIEW: ROADMAP WIZARD (Steps 1-4) */}
            {activeView === 'roadmap' && step < 5 && (
              <motion.div key="wizard" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto mt-4">
                
                {/* WIZARD HEADER */}
                <div className="mb-10 text-center">
                   <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Your Custom Path</h1>
                   <p className="text-gray-500 dark:text-slate-400 font-medium">Follow the steps to configure your personalized curriculum.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800 p-8 md:p-12">
                  
                  {/* STEP INDICATOR */}
                  <div className="flex items-center justify-center mb-10 gap-2">
                    {[1,2,3,4].map(s => (
                      <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? 'bg-blue-600 text-white shadow-md' : step > s ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                          {step > s ? <Check className="w-4 h-4"/> : s}
                        </div>
                        {s < 4 && <div className={`w-8 h-1 rounded-full ${step > s ? 'bg-green-100 dark:bg-green-500/20' : 'bg-gray-100 dark:bg-slate-800'}`} />}
                      </div>
                    ))}
                  </div>

                  {/* STEP 1 */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-8">Select your target career</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {careers.map(c => (
                          <button key={c.id} onClick={() => { setSelectedCareer(c); setStep(2); }}
                            className="text-left p-6 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 hover:shadow-md transition-all group flex items-start gap-5">
                            <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm border border-gray-100 dark:border-slate-700">{c.emoji}</div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">{c.title}</h3>
                              <p className="text-gray-500 dark:text-slate-400 text-sm">{c.tagline}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && selectedCareer && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setStep(1)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300"><ArrowRight className="w-5 h-5 rotate-180"/></button>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Choose your Tech Stack</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {stackOptions.map(stack => (
                          <button key={stack.id} onClick={() => { setSelectedStack(stack); setStep(3); }}
                            className="text-left p-6 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
                            
                            {(stack.id === 'mern' || stack.id === 'python-backend' || stack.id === 'react-fe') && (
                              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">Popular</div>
                            )}

                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-slate-700 group-hover:scale-110 transition-transform">{stack.icon}</div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stack.name}</h3>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {stack.tags.slice(0,3).map(t => <span key={t} className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[10px] font-bold border border-gray-200 dark:border-slate-700">{t}</span>)}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-5 leading-relaxed flex-1">{stack.description}</p>
                            
                            <div className="space-y-3 mb-5 p-4 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700">
                              <div className="space-y-1.5">
                                {stack.pros.slice(0,2).map((p, idx) => <div key={idx} className="flex items-start gap-2 text-xs text-green-600 dark:text-green-400 font-semibold"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 opacity-80"/><span>{p}</span></div>)}
                              </div>
                              <div className="space-y-1.5">
                                {stack.cons.slice(0,1).map((c, idx) => <div key={idx} className="flex items-start gap-2 text-xs text-orange-500 dark:text-orange-400 font-semibold"><Target className="w-4 h-4 shrink-0 mt-0.5 opacity-80"/><span>{c}</span></div>)}
                              </div>
                            </div>
                            
                            <div className="mt-auto flex items-center justify-between text-sm font-bold text-blue-600 dark:text-blue-400">
                              Select Stack <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setStep(2)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300"><ArrowRight className="w-5 h-5 rotate-180"/></button>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">What do you already know?</h2>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                        <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                          {[...COMMON_TOPICS, ...(selectedStack?.tags || [])].filter((v,i,a) => a.indexOf(v)===i).map(t => (
                            <button key={t} onClick={() => toggleTopic(t)}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${knownTopics.has(t)
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105'
                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm'}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                          <input value={customTopic} onChange={e => setCustomTopic(e.target.value)} onKeyDown={e => e.key==='Enter' && addCustom()}
                            placeholder="Add a custom topic..." className="flex-1 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all shadow-sm" />
                          <button onClick={addCustom} className="px-6 py-2.5 bg-gray-800 dark:bg-slate-700 hover:bg-gray-900 dark:hover:bg-slate-600 rounded-xl text-sm font-bold text-white transition-colors shadow-sm">Add</button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-8">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                          {knownTopics.size > 0 ? <><CheckCircle2 className="w-4 h-4"/> {knownTopics.size} skipped</> : <span className="text-gray-500 dark:text-slate-400">Starting from scratch</span>}
                        </div>
                        <button onClick={() => setStep(4)} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 rounded-xl font-bold text-white transition-all flex items-center gap-2 hover:scale-105">
                          Next Step <ArrowRight className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 mb-2">
                        <button onClick={() => setStep(3)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300"><ArrowRight className="w-5 h-5 rotate-180"/></button>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Final Details</h2>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wider">Target Deadline</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {DEADLINE_OPTIONS.map(d => (
                            <button key={d.weeks} onClick={() => setDeadlineWeeks(d.weeks)}
                              className={`p-4 rounded-2xl border text-center transition-all ${deadlineWeeks === d.weeks
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-md scale-[1.02]'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 shadow-sm'}`}>
                              <d.icon className={`w-6 h-6 mx-auto mb-2 ${deadlineWeeks === d.weeks ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-slate-500'}`} />
                              <div className={`font-bold text-sm mb-1 ${deadlineWeeks === d.weeks ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-slate-300'}`}>{d.label}</div>
                              <div className="text-gray-500 dark:text-slate-400 text-xs">{d.note}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wider">Learning Preference</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {LEARNING_STYLES.map(s => (
                            <button key={s.id} onClick={() => setLearningStyle(s.id)}
                              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${learningStyle === s.id 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-md scale-[1.02]' 
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 shadow-sm'}`}>
                              <s.icon className={`w-6 h-6 ${learningStyle === s.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`} />
                              <div>
                                <div className={`font-bold text-sm mb-0.5 ${learningStyle === s.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-slate-300'}`}>{s.label}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">{s.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button onClick={generateRoadmap} disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none rounded-2xl font-black text-white text-lg transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 mt-4">
                        {loading ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-base font-semibold">{loadingMsg}</span></>
                        ) : (
                          <><Sparkles className="w-5 h-5"/> Generate My Custom Roadmap</>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* VIEW: ROADMAP DASHBOARD (Step 5) */}
            {activeView === 'roadmap' && step === 5 && (
              <motion.div key="roadmap-dash" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto space-y-6">
                
                {/* TOP SUMMARY CARD (matches image) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Roadmap</h2>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm shadow-blue-500/30 transition-colors"><Download className="w-4 h-4"/> Download</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm overflow-hidden flex items-center justify-center">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e5e7eb" alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">{session?.user?.name || 'Guest Student'}</h3>
                        <div className="text-sm font-semibold text-gray-500 dark:text-slate-400">{selectedStack?.name || selectedCareer?.title} Path</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 text-sm">
                      <div>
                        <div className="text-gray-400 dark:text-slate-500 font-semibold mb-1">Deadline</div>
                        <div className="font-bold text-gray-800 dark:text-gray-200">{deadlineWeeks > 0 ? `${deadlineWeeks} Weeks` : 'None'}</div>
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY BOXES */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/50 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><Book className="w-5 h-5"/></div>
                      <div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{roadmap.length}</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Topics</div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-500/10 rounded-2xl p-5 border border-green-100 dark:border-green-900/50 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400"><CheckCircle2 className="w-5 h-5"/></div>
                      <div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{doneCount}</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Completed</div>
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-500/10 rounded-2xl p-5 border border-orange-100 dark:border-orange-900/50 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400"><Target className="w-5 h-5"/></div>
                      <div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{roadmap.length - doneCount}</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Remaining</div>
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-500/10 rounded-2xl p-5 border border-purple-100 dark:border-purple-900/50 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400"><Trophy className="w-5 h-5"/></div>
                      <div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{pct}%</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Progress</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM SPLIT VIEW */}
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* LEFT: TIMELINE */}
                  <div className="flex-1 lg:w-2/3">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800 h-full min-h-[500px]">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Learning Timeline</h2>
                        <span className="text-xs font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">{doneCount} / {roadmap.length}</span>
                      </div>
                      
                      <div className="space-y-8">
                        {Object.values(grouped).map((group, gi) => (
                          <div key={gi} className="relative">
                            <div className="flex items-center gap-3 mb-4 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md py-2 z-10">
                              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-sm font-black text-blue-600 dark:text-blue-400">{gi + 1}</div>
                              <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-wide">{group.name}</h3>
                              <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800"></div>
                            </div>
                            
                            <div className="space-y-3 pl-4 sm:pl-11 relative">
                              <div className="absolute left-[19px] sm:left-[47px] top-4 bottom-4 w-px bg-gray-100 dark:bg-slate-800" />
                              
                              {group.topics.map((t, ti) => {
                                const isDone = progress[t.id] === 'done';
                                const isActive = activeTopic?.id === t.id;
                                return (
                                  <motion.button key={t.id} variants={itemAnim} onClick={() => viewResources(t)}
                                    className={`relative w-full flex items-center gap-4 text-left p-4 rounded-2xl border transition-all duration-200 group overflow-hidden
                                      ${isActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm scale-[1.01] z-10' 
                                      : isDone ? 'border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-500/5' 
                                      : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm'}`}>
                                    
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 dark:bg-blue-500" />}

                                    <div className={`relative z-10 w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-all
                                      ${isDone ? 'bg-green-500 text-white shadow-green-500/20' 
                                      : isActive ? 'bg-blue-600 text-white shadow-blue-500/30' 
                                      : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 group-hover:bg-gray-50 dark:group-hover:bg-slate-800 group-hover:text-gray-600 dark:group-hover:text-gray-400'}`}>
                                      {isDone ? <Check className="w-5 h-5"/> : ti + 1}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 z-10">
                                      <div className={`font-bold text-base mb-0.5 transition-colors ${isDone ? 'text-green-700/80 dark:text-green-500/80 line-through' : isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{t.canonical_name}</div>
                                      <div className={`text-sm truncate ${isDone ? 'text-green-600/60 dark:text-green-500/60' : isActive ? 'text-blue-600/80 dark:text-blue-400/80' : 'text-gray-500 dark:text-slate-400'}`}>{t.description}</div>
                                    </div>
                                    
                                    <ChevronRight className={`w-5 h-5 shrink-0 transition-all z-10 ${isActive ? 'text-blue-600 dark:text-blue-400 translate-x-1' : 'text-gray-300 dark:text-slate-600 group-hover:text-gray-400 dark:group-hover:text-slate-500'}`} />
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: RESOURCES & QUIZ (Matching layout's right column) */}
                  <div className="w-full lg:w-1/3 shrink-0 space-y-6">
                    
                    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800 sticky top-4">
                      
                      {!activeTopic && !loadingResource && (
                         <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                           <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center mb-4"><Play className="w-6 h-6 text-gray-300 dark:text-slate-600"/></div>
                           <p className="font-semibold">Select a topic to view resources</p>
                         </div>
                      )}

                      {loadingResource && (
                         <div className="p-12 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-4">
                           <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                           <p className="font-semibold text-sm">Loading resources...</p>
                         </div>
                      )}

                      {activeResource && activeTopic && !quiz && !loadingResource && (
                        <>
                          <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-500/5">
                            <h4 className="font-black text-gray-900 dark:text-white text-xl">{activeResource.canonical_name}</h4>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">{activeResource.description}</p>
                            {isTight && <span className="inline-block mt-3 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 rounded-lg"><Zap className="w-3 h-3 inline mr-1 -mt-0.5"/> Crash Course</span>}
                          </div>
                          
                          <div className="p-6 space-y-5">
                            {activeResource.yt_playlist_url && (
                              <a href={activeResource.yt_playlist_url} target="_blank" rel="noreferrer" className="block relative rounded-2xl overflow-hidden group shadow-sm border border-gray-100 dark:border-slate-800">
                                <img src={activeResource.thumbnail_url || `https://img.youtube.com/vi/${activeResource.yt_playlist_url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`} alt="thumbnail" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent p-4 flex flex-col justify-end">
                                  <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold mb-1.5 uppercase tracking-wide">
                                    <MonitorPlay className="w-3.5 h-3.5" /> {isTight ? 'Best One-Shot Video' : 'Top Playlist'}
                                  </div>
                                  <div className="text-white text-sm font-bold leading-snug line-clamp-2">{activeResource.yt_playlist_title}</div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-30 transition-opacity bg-black/30 backdrop-blur-sm">
                                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg"><Play className="w-5 h-5 ml-1"/></div>
                                </div>
                              </a>
                            )}
                            
                            <div className="flex gap-3">
                              {activeResource.docs_url && <a href={activeResource.docs_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"><Book className="w-4 h-4"/> Docs</a>}
                              {activeResource.github_url && <a href={activeResource.github_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"><Code2 className="w-4 h-4"/> Repo</a>}
                            </div>
                            
                            <div className="pt-5 border-t border-gray-100 dark:border-slate-800 space-y-3">
                              <button onClick={() => markDone(activeTopic.id)}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${progress[activeTopic.id] === 'done'
                                  ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-500 group'
                                  : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'}`}>
                                {progress[activeTopic.id] === 'done' ? <><CheckCircle2 className="w-5 h-5 group-hover:hidden"/><span className="group-hover:hidden">Completed</span><span className="hidden group-hover:block">Undo Completion</span></> : <><CheckCircle2 className="w-5 h-5"/> Mark as Done</>}
                              </button>
                              <button onClick={() => openQuiz(activeTopic)}
                                className="w-full py-3.5 rounded-xl font-bold text-sm border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2 shadow-sm">
                                <BrainCircuit className="w-5 h-5" /> Test Your Knowledge
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {(quiz || loadingQuiz) && quizTopic && (
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-purple-50 dark:bg-purple-500/10 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400"/> AI Quiz Mode</h4>
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">{quizTopic.canonical_name}</p>
                            </div>
                            <button onClick={() => { setQuiz(null); setQuizSubmitted(false); }} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 transition-colors">✕</button>
                          </div>
                          
                          {loadingQuiz ? (
                            <div className="p-10 flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 text-sm gap-4">
                              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                              <span className="font-semibold">Generating questions...</span>
                            </div>
                          ) : quiz && (
                            <div className="p-6">
                              <div className="space-y-8">
                                {quiz.map((q, i) => (
                                  <div key={i}>
                                    <h5 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex gap-2"><span className="text-purple-600 dark:text-purple-400">{i+1}.</span> {q.q}</h5>
                                    <div className="space-y-2 pl-5">
                                      {Object.entries(q.options).map(([key, val]) => {
                                        const isSelected = quizAnswers[i] === key;
                                        const isCorrect = key === q.answer;
                                        let btnClass = "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300";
                                        if (isSelected) btnClass = "border-purple-500 bg-purple-50 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 font-medium";
                                        if (quizSubmitted) {
                                          if (isCorrect) btnClass = "border-green-500 bg-green-50 dark:bg-green-500/20 text-green-800 dark:text-green-300 font-bold";
                                          else if (isSelected) btnClass = "border-red-300 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300";
                                          else btnClass = "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 opacity-50";
                                        }
                                        return (
                                          <button key={key} disabled={quizSubmitted} onClick={() => setQuizAnswers(p => ({ ...p, [i]: key }))}
                                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 shadow-sm ${btnClass}`}>
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${isSelected||(quizSubmitted&&isCorrect) ? 'border-transparent bg-white dark:bg-slate-900 shadow-sm' : 'border-gray-200 dark:border-slate-600'}`}>{key.toUpperCase()}</div>
                                            {val}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {quizSubmitted && (
                                      <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-3 pl-5">
                                        <div className={`p-3 rounded-xl text-xs font-semibold ${quizAnswers[i] === q.answer ? 'bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/50' : 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50'}`}>
                                          {q.explanation}
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {!quizSubmitted ? (
                                <button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < quiz.length}
                                  className="w-full mt-8 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:shadow-none text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex justify-center items-center gap-2">
                                  Submit Answers
                                </button>
                              ) : (
                                <div className="mt-8 text-center bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
                                  <div className="font-black text-2xl text-gray-900 dark:text-white mb-1">{Object.keys(quizAnswers).filter(k => quizAnswers[Number(k)] === quiz[Number(k)].answer).length} / {quiz.length}</div>
                                  <div className="text-gray-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Final Score</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
