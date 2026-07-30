import { careers, getCareer, makeInitialProgress, type Activity, type UserProfile } from './skillSyncData'

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
    return readUsers().find((user) => user.userId === userId) || null
  },

  async signUp(input: Pick<UserProfile, 'fullName' | 'email' | 'userId' | 'college' | 'department' | 'academicYear'> & { password: string }) {
    const users = readUsers()
    if (users.some((user) => user.userId.toLowerCase() === input.userId.toLowerCase() || user.email.toLowerCase() === input.email.toLowerCase())) {
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
      activities: [{ id: crypto.randomUUID(), type: 'career', text: `Started ${defaultCareer.title} path`, at: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    }
    writeUsers([...users, user])
    localStorage.setItem(SESSION_KEY, user.userId)
    return user
  },

  async login(userId: string, password: string) {
    const users = readUsers()
    const user = users.find((candidate) => candidate.userId.toLowerCase() === userId.toLowerCase())
    if (!user) {
      const error = new Error('ACCOUNT_NOT_FOUND')
      error.name = 'ACCOUNT_NOT_FOUND'
      throw error
    }
    const hashed = await hashPassword(password, user.passwordSalt)
    if (hashed !== user.passwordHash) throw new Error('Invalid password. Please try again.')
    localStorage.setItem(SESSION_KEY, user.userId)
    return user
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY)
  },

  async updateUser(user: UserProfile) {
    const users = readUsers()
    const next = users.map((candidate) => candidate.userId === user.userId ? user : candidate)
    writeUsers(next)
    return user
  },

  async setCareer(user: UserProfile, careerId: string) {
    const career = getCareer(careerId)
    const activity: Activity = { id: crypto.randomUUID(), type: 'career', text: `Selected ${career.title} as career goal`, at: new Date().toISOString() }
    const next: UserProfile = {
      ...user,
      selectedCareerId: careerId,
      stageProgress: {
        ...user.stageProgress,
        [careerId]: user.stageProgress[careerId] || makeInitialProgress(career)
      },
      activities: [activity, ...user.activities].slice(0, 20)
    }
    return this.updateUser(next)
  },

  async saveSkills(user: UserProfile, skills: string[], resumeFileName?: string) {
    const uniqueSkills = Array.from(new Set(skills.map((skill) => skill.trim()).filter(Boolean)))
    const activity: Activity = { id: crypto.randomUUID(), type: resumeFileName ? 'resume' : 'skill', text: resumeFileName ? `Uploaded resume ${resumeFileName}` : 'Updated skill profile', at: new Date().toISOString() }
    const next = { ...user, skills: uniqueSkills, resumeFileName, activities: [activity, ...user.activities].slice(0, 20) }
    return this.updateUser(next)
  },

  async saveStage(user: UserProfile, careerId: string, stageId: string, progress: number, quizScore?: number) {
    const career = getCareer(careerId)
    const current = user.stageProgress[careerId] || makeInitialProgress(career)
    const stageIndex = career.roadmap.findIndex((stage) => stage.id === stageId)
    const completed = progress >= 100 && (quizScore ?? 0) >= 67
    const nextCareerProgress: Record<string, import('./skillSyncData').StageProgress> = { ...current, [stageId]: { status: completed ? 'completed' : 'in-progress', progress, quizScore } }
    if (completed && career.roadmap[stageIndex + 1]) {
      const nextStageId = career.roadmap[stageIndex + 1].id
      if (nextCareerProgress[nextStageId]?.status === 'locked') nextCareerProgress[nextStageId] = { ...nextCareerProgress[nextStageId], status: 'available' }
    }
    const earnedXp = completed ? career.roadmap[stageIndex]?.xp || 0 : 0
    const activity: Activity = { id: crypto.randomUUID(), type: 'quiz', text: `Saved ${career.roadmap[stageIndex]?.title || 'stage'} score${quizScore !== undefined ? ` (${quizScore}%)` : ''}`, at: new Date().toISOString() }
    const next: UserProfile = {
      ...user,
      xp: user.xp + earnedXp,
      stageProgress: { ...user.stageProgress, [careerId]: nextCareerProgress },
      activities: [activity, ...user.activities].slice(0, 20)
    }
    return this.updateUser(next)
  }
}
