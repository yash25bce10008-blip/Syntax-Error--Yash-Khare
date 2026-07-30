export interface RequiredSkill {
  name: string;
  weight: number;
  weeks: number;
  category: string;
}

export interface Role {
  id: number;
  title: string;
  subtitle: string;
  demand: string;
  salary: string;
  openings: number;
  required_skills: RequiredSkill[];
}

export interface CatalogSkill {
  id: number;
  name: string;
  category: string;
  resume_default: boolean;
}

export interface EducationLevel {
  id: number;
  slug: string;
  label: string;
  subtitle: string;
  tier: number;
  baseline_skills: string[];
  next_steps: string[];
  foundation_years: number;
}

export interface Profile {
  id: number;
  user_id: string;
  name: string;
  dept: string;
  campus: string;
  xp: number;
  level: number;
  streak: number;
  initials: string;
  target_role_id: number;
}

export interface Resource {
  id: number;
  stage_id: number;
  position: number;
  slug: string;
  kind: 'video' | 'article' | 'doc';
  title: string;
  channel: string;
  youtube_id: string | null;
  url: string | null;
  duration: string | null;
  read_time: string | null;
  timestamps: { label: string; at: string; seconds: number }[] | null;
}

export interface QuizQuestion {
  id: number;
  stage_id: number;
  position: number;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface Stage {
  id: number;
  role_id: number;
  position: number;
  title: string;
  short_title: string;
  subtitle: string;
  status: 'completed' | 'in-progress' | 'locked';
  xp: number;
  hours: string;
  difficulty: string;
  tags: string[];
  completed_resources: string[];
  progress: number;
  resources: Resource[];
  quiz: QuizQuestion[];
}

export interface FoundationSkill {
  id: number;
  name: string;
  position: number;
  weeks: number;
  blurb: string;
  resource_title: string | null;
  resource_url: string | null;
}

export interface FoundationGap {
  name: string;
  weeks: number;
  blurb: string;
  resource_title: string | null;
  resource_url: string | null;
  position: number;
}

export type Verdict = 'early' | 'building' | 'approaching' | 'ready';

export interface GapAnalysis {
  id: number;
  role: Role;
  education: {
    slug: string;
    label: string;
    subtitle: string;
    tier: number;
    baseline: string[];
    confirmed: string[];
    nextSteps: string[];
  };
  entryTier: number;
  entryLabel: string;
  tierGap: number;
  verdict: Verdict;
  readinessPct: number;
  skillMatchPct: number;
  educationPct: number;
  foundationPct: number;
  have: RequiredSkill[];
  missing: RequiredSkill[];
  foundationGaps: FoundationGap[];
  foundationWeeks: number;
  skillWeeks: number;
  studyWeeks: number;
  foundationYears: number;
  totalYears: number;
  extras: string[];
}
