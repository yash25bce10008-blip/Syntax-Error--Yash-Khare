import type {
  CatalogSkill,
  EducationLevel,
  FoundationSkill,
  GapAnalysis,
  Profile,
  Role,
  Stage,
} from './types';

const TOKEN_KEY = 'skillsync.token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* storage unavailable */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    let code: string | undefined;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
      if (body?.code) code = body.code;
    } catch {
      /* non-JSON body */
    }
    throw new ApiError(msg, res.status, code);
  }
  return res.json() as Promise<T>;
}

export interface Bootstrap {
  profile: Profile;
  roles: Role[];
  skills: CatalogSkill[];
  educationLevels: EducationLevel[];
  education: string | null;
  knownBaseline: string[] | null;
  foundationSkills: FoundationSkill[];
}

export interface AuthResult {
  user: Profile;
  token: string;
  expires_at: string;
}

export const api = {
  /* auth */
  restore: () => req<{ user: Profile }>('/api/auth'),
  checkId: (userId: string) =>
    req<{ exists: boolean }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'check', userId }),
    }),
  login: (userId: string, password: string) =>
    req<AuthResult>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', userId, password }),
    }),
  signup: (payload: { userId: string; password: string; name: string; dept: string; campus: string }) =>
    req<AuthResult>('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'signup', ...payload }) }),
  logout: () => req<{ ok: boolean }>('/api/auth', { method: 'DELETE' }),

  /* data */
  bootstrap: () => req<Bootstrap>('/api/bootstrap'),
  saveEducation: (slug: string, knownBaseline?: string[]) =>
    req<{ selected: string; knownBaseline: string[] }>('/api/education', {
      method: 'PUT',
      body: JSON.stringify({ slug, knownBaseline }),
    }),
  roadmap: (roleId: number) => req<{ stages: Stage[] }>(`/api/roadmap?roleId=${roleId}`),
  analyze: (roleId: number, educationSlug: string, knownBaseline: string[], known: string[]) =>
    req<GapAnalysis>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ roleId, educationSlug, knownBaseline, known }),
    }),
  toggleResource: (stageId: number, slug: string, done: boolean) =>
    req<{ progress: number }>('/api/progress', { method: 'PUT', body: JSON.stringify({ stageId, slug, done }) }),
  logAttempt: (stageId: number, score: number, total: number) =>
    req<{ ok: boolean }>('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ stageId, score, total, action: 'attempt' }),
    }),
  claimStage: (stageId: number) =>
    req<{ ok: boolean; unlocked: string | null; xp: number }>('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ stageId, action: 'claim' }),
    }),
  resetRoadmap: (roleId: number) =>
    req<{ ok: boolean }>('/api/progress', { method: 'DELETE', body: JSON.stringify({ roleId }) }),
  profile: () => req<Profile>('/api/profile'),
  updateProfile: (patch: Partial<Profile>) =>
    req<Profile>('/api/profile', { method: 'PUT', body: JSON.stringify(patch) }),
};
