import { careers, getCareer, makeInitialProgress, type Activity, type LearningProfile, type UserProfile } from './skillSyncData'
import { SupabaseStore } from './supabaseStore'

const USERS_KEY = 'skillsync.users.v1'
const SESSION_KEY = 'skillsync.session.v1'

function readUsers(): UserProfile[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as UserProfile[]
  } catch {
    return []
  }
}

function writeUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function saveLocalUser(user: UserProfile) {
  const users = readUsers()
  const exists = users.some((candidate) => candidate.userId === user.userId)
  writeUsers(exists ? users.map((candidate) => candidate.userId === user.userId ? user : candidate) : [...users, user])
}

async function syncUser(user: UserProfile) {
  saveLocalUser(user)
  try {
    await SupabaseStore.upsertUser(user)
  } catch (error) {
    console.warn('SkillSync Supabase user sync skipped:', error)
  }
}

async function syncVideos() {
  try {
    await SupabaseStore.seedYouTubeVideos()
  } catch (error) {
    console.warn('SkillSync Supabase video sync skipped:', error)
  }
}

export async function hashPassword(password: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function newSalt() {
  return crypto.getRandomValues(new Uint32Array(4)).join('-')
}

export const SkillSyncAPI = {
  async getSession() {
    const userId = localStorage.getItem(SESSION_KEY)
    if (!userId) return null
    await syncVideos()
    const remoteUser = await SupabaseStore.findUser(userId)
    if (remoteUser) {
      saveLocalUser(remoteUser)
      return remoteUser
    }
    return readUsers().find((user) => user.userId === userId) || null
  },

  async signUp(input: Pick<UserProfile, 'fullName' | 'email' | 'userId' | 'college' | 'department' | 'academicYear'> & { password: string }) {
    const users = readUsers()
    const remoteExisting = await SupabaseStore.findUser(input.userId)
    if (remoteExisting || users.some((user) => user.userId.toLowerCase() === input.userId.toLowerCase() || user.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error('An account with this User ID or email already exists.')
    }
    const salt = newSalt()
    const defaultCareer = careers[0]
    const user: UserProfile = {
      id: crypto.randomUUID(),
      fullName: input.fullName,
      email: input.email,
      userId: input.userId,
      college: input.college,
      department: input.department,
      academicYear: input.academicYear,
      passwordSalt: salt,
      passwordHash: await hashPassword(input.password, salt),
      skills: [],
      selectedCareerId: defaultCareer.id,
      stageProgress: { [defaultCareer.id]: makeInitialProgress(defaultCareer) },
      xp: 0,
      streak: 1,
      activities: [],
      createdAt: new Date().toISOString()
    }
    await syncVideos()
    await syncUser(user)
    localStorage.setItem(SESSION_KEY, user.userId)
    return user
  },

  async login(userId: string, password: string) {
    const users = readUsers()
    let user = users.find((candidate) => candidate.userId.toLowerCase() === userId.toLowerCase())
    if (!user) {
      const remoteUser = await SupabaseStore.findUser(userId)
      if (remoteUser) {
        user = remoteUser
        saveLocalUser(remoteUser)
      }
    }
    if (!user) {
      const error = new Error('ACCOUNT_NOT_FOUND')
      error.name = 'ACCOUNT_NOT_FOUND'
      throw error
    }
    const hashed = await hashPassword(password, user.passwordSalt)
    if (hashed !== user.passwordHash) throw new Error('Invalid password. Please try again.')
    await syncVideos()
    await syncUser(user)
    try {
      await SupabaseStore.recordLogin(user)
    } catch (error) {
      console.warn('SkillSync Supabase login event skipped:', error)
    }
    localStorage.setItem(SESSION_KEY, user.userId)
    return user
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY)
  },

  async updateUser(user: UserProfile) {
    await syncUser(user)
    return user
  },

  async setCareer(user: UserProfile, careerId: string) {
    const career = getCareer(careerId)
    const next: UserProfile = {
      ...user,
      selectedCareerId: careerId,
      stageProgress: {
        ...user.stageProgress,
        [careerId]: user.stageProgress[careerId] || makeInitialProgress(career)
      }
    }
    return this.updateUser(next)
  },

  async saveSkills(user: UserProfile, skills: string[], resumeFileName?: string) {
    const uniqueSkills = Array.from(new Set(skills.map((skill) => skill.trim()).filter(Boolean)))
    const next = { ...user, skills: uniqueSkills, resumeFileName }
    return this.updateUser(next)
  },

  async saveLearningProfile(user: UserProfile, profile: LearningProfile, careerId: string, skills: string[]) {
    const career = getCareer(careerId)
    const next: UserProfile = {
      ...user,
      selectedCareerId: careerId,
      skills: Array.from(new Set(skills.map((skill) => skill.trim()).filter(Boolean))),
      learningProfile: profile,
      stageProgress: {
        ...user.stageProgress,
        [careerId]: user.stageProgress[careerId] || makeInitialProgress(career)
      }
    }
    return this.updateUser(next)
  },

  async saveVideoDone(user: UserProfile, careerId: string, stageId: string, videoTitle: string) {
    const career = getCareer(careerId)
    const current = user.stageProgress[careerId] || makeInitialProgress(career)
    const previous = current[stageId] || { status: 'available' as const, progress: 0 }
    const nextCareerProgress: Record<string, import('./skillSyncData').StageProgress> = {
      ...current,
      [stageId]: { ...previous, status: previous.status === 'locked' ? 'available' : previous.status, videoCompleted: true, progress: Math.max(previous.progress, 35) }
    }
    const activity: Activity = { id: crypto.randomUUID(), type: 'video', text: `Watched ${videoTitle}`, at: new Date().toISOString() }
    const next: UserProfile = { ...user, stageProgress: { ...user.stageProgress, [careerId]: nextCareerProgress }, activities: [activity, ...user.activities].slice(0, 20) }
    return this.updateUser(next)
  },

  async saveReview(user: UserProfile, careerId: string, stageId: string, review: NonNullable<import('./skillSyncData').StageProgress['review']>) {
    const career = getCareer(careerId)
    const current = user.stageProgress[careerId] || makeInitialProgress(career)
    const previous = current[stageId] || { status: 'available' as const, progress: 0 }
    const nextCareerProgress: Record<string, import('./skillSyncData').StageProgress> = { ...current, [stageId]: { ...previous, review } }
    return this.updateUser({ ...user, stageProgress: { ...user.stageProgress, [careerId]: nextCareerProgress } })
  },

  async saveStage(user: UserProfile, careerId: string, stageId: string, progress: number, quizScore?: number) {
    const career = getCareer(careerId)
    const current = user.stageProgress[careerId] || makeInitialProgress(career)
    const stageIndex = career.roadmap.findIndex((stage) => stage.id === stageId)
    const completed = progress >= 100 && (quizScore ?? 0) >= 67
    const previous = current[stageId] || { status: 'available' as const, progress: 0 }
    const nextCareerProgress: Record<string, import('./skillSyncData').StageProgress> = { ...current, [stageId]: { ...previous, status: completed ? 'completed' : 'in-progress', progress, quizScore } }
    if (completed && career.roadmap[stageIndex + 1]) {
      const nextStageId = career.roadmap[stageIndex + 1].id
      if (nextCareerProgress[nextStageId]?.status === 'locked') nextCareerProgress[nextStageId] = { ...nextCareerProgress[nextStageId], status: 'available' }
    }
    const earnedXp = completed ? career.roadmap[stageIndex]?.xp || 0 : 0
    const activity: Activity = { id: crypto.randomUUID(), type: 'quiz', text: `Solved ${career.roadmap[stageIndex]?.title || 'stage'} quiz${quizScore !== undefined ? ` (${quizScore}%)` : ''}`, at: new Date().toISOString() }
    const next: UserProfile = {
      ...user,
      xp: user.xp + earnedXp,
      stageProgress: { ...user.stageProgress, [careerId]: nextCareerProgress },
      activities: [activity, ...user.activities].slice(0, 20)
    }
    return this.updateUser(next)
  }
}
