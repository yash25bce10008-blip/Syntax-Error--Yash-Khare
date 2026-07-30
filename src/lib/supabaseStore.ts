import { careers, type UserProfile } from './skillSyncData'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const configured = Boolean(supabaseUrl && supabaseAnonKey)

function endpoint(table: string, query = '') {
  return `${supabaseUrl}/rest/v1/${table}${query}`
}

function headers(extra: Record<string, string> = {}) {
  return {
    apikey: supabaseAnonKey || '',
    Authorization: `Bearer ${supabaseAnonKey || ''}`,
    'Content-Type': 'application/json',
    ...extra
  }
}

type DbUser = {
  id: string
  full_name: string
  email: string
  user_id: string
  college: string
  department: string
  academic_year: string
  password_hash: string
  password_salt: string
  skills: string[]
  selected_career_id: string
  stage_progress: UserProfile['stageProgress']
  xp: number
  streak: number
  activities: UserProfile['activities']
  learning_profile?: UserProfile['learningProfile']
  resume_file_name?: string
  created_at: string
}

function toDbUser(user: UserProfile): DbUser {
  return {
    id: user.id,
    full_name: user.fullName,
    email: user.email,
    user_id: user.userId,
    college: user.college,
    department: user.department,
    academic_year: user.academicYear,
    password_hash: user.passwordHash,
    password_salt: user.passwordSalt,
    skills: user.skills,
    selected_career_id: user.selectedCareerId,
    stage_progress: user.stageProgress,
    xp: user.xp,
    streak: user.streak,
    activities: user.activities,
    learning_profile: user.learningProfile,
    resume_file_name: user.resumeFileName,
    created_at: user.createdAt
  }
}

function fromDbUser(row: DbUser): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    userId: row.user_id,
    college: row.college,
    department: row.department,
    academicYear: row.academic_year,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    skills: row.skills || [],
    selectedCareerId: row.selected_career_id,
    stageProgress: row.stage_progress || {},
    xp: row.xp || 0,
    streak: row.streak || 1,
    activities: row.activities || [],
    learningProfile: row.learning_profile,
    resumeFileName: row.resume_file_name,
    createdAt: row.created_at
  }
}

function videoIdFromUrl(url: string) {
  return new URL(url).searchParams.get('v') || url.split('/').pop() || 'video'
}

export const SupabaseStore = {
  isConfigured: configured,

  async upsertUser(user: UserProfile) {
    if (!configured) return null
    const response = await fetch(endpoint('skillsync_users', '?on_conflict=user_id'), {
      method: 'POST',
      headers: headers({ Prefer: 'resolution=merge-duplicates' }),
      body: JSON.stringify({ ...toDbUser(user), updated_at: new Date().toISOString() })
    })
    if (!response.ok) throw new Error(`Supabase user sync failed: ${response.status}`)
    return user
  },

  async findUser(userId: string) {
    if (!configured) return null
    const response = await fetch(endpoint('skillsync_users', `?user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`), { headers: headers() })
    if (!response.ok) return null
    const rows = await response.json() as DbUser[]
    return rows[0] ? fromDbUser(rows[0]) : null
  },

  async recordLogin(user: UserProfile) {
    if (!configured) return
    await fetch(endpoint('skillsync_users', `?user_id=eq.${encodeURIComponent(user.userId)}`), {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    })
    await fetch(endpoint('skillsync_login_events'), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ user_id: user.userId })
    })
  },

  async seedYouTubeVideos() {
    if (!configured) return
    const rows = careers.flatMap((career) => career.roadmap.map((stage, stageIndex) => {
      const video = stage.resources.find((resource) => resource.type === 'YouTube')
      const videoUrl = video?.url || 'https://www.youtube.com/watch?v=rfscVS0vtbw'
      const id = videoIdFromUrl(videoUrl)
      return {
        id: `${career.id}-${stage.id}`,
        career_id: career.id,
        career_title: career.title,
        stage_id: stage.id,
        stage_title: stage.title,
        video_title: video?.title || `${career.title} lesson`,
        video_url: videoUrl,
        embed_url: `https://www.youtube.com/embed/${id}`,
        tags: [career.category, career.title, ...career.skills.slice(0, 3)]
      }
    }))
    const topicRows = careers.flatMap((career) => career.roadmap.map((stage, stageIndex) => ({
      id: `${career.id}-${stage.id}-topic`,
      career_id: career.id,
      stage_id: stage.id,
      topic_title: stage.title,
      topic_order: stageIndex + 1,
      difficulty: stage.difficulty,
      outcomes: [stage.description, `Build evidence for ${career.title}`, `Practice with ${career.technologies.slice(0, 2).join(' and ')}`],
      prerequisite_topics: stage.prerequisites
    })))
    const resourceRows = careers.flatMap((career) => career.roadmap.flatMap((stage) => stage.resources.map((resource, resourceIndex) => ({
      id: `${career.id}-${stage.id}-${resource.type.toLowerCase().replaceAll(' ', '-')}-${resourceIndex}`,
      topic_id: `${career.id}-${stage.id}-topic`,
      resource_type: resource.type,
      title: resource.title,
      url: resource.url,
      provider: resource.type === 'YouTube' ? 'YouTube' : resource.type === 'GitHub' ? 'GitHub' : 'Web',
      learning_style: resource.type === 'YouTube' ? 'visual' : resource.type === 'Practice' ? 'coding' : resource.type === 'Official Docs' ? 'theory' : 'balanced',
      estimated_minutes: resource.type === 'YouTube' ? 90 : resource.type === 'Practice' ? 60 : 35,
      quality_score: 4.6,
      metadata: { career: career.title, stage: stage.title, difficulty: stage.difficulty }
    }))))
    for (let index = 0; index < rows.length; index += 200) {
      const chunk = rows.slice(index, index + 200)
      const response = await fetch(endpoint('skillsync_youtube_videos', '?on_conflict=id'), {
        method: 'POST',
        headers: headers({ Prefer: 'resolution=merge-duplicates' }),
        body: JSON.stringify(chunk)
      })
      if (!response.ok) throw new Error(`Supabase video sync failed: ${response.status}`)
    }
    for (let index = 0; index < topicRows.length; index += 200) {
      const response = await fetch(endpoint('skillsync_learning_topics', '?on_conflict=id'), {
        method: 'POST',
        headers: headers({ Prefer: 'resolution=merge-duplicates' }),
        body: JSON.stringify(topicRows.slice(index, index + 200))
      })
      if (!response.ok) throw new Error(`Supabase topic sync failed: ${response.status}`)
    }
    for (let index = 0; index < resourceRows.length; index += 200) {
      const response = await fetch(endpoint('skillsync_content_resources', '?on_conflict=id'), {
        method: 'POST',
        headers: headers({ Prefer: 'resolution=merge-duplicates' }),
        body: JSON.stringify(resourceRows.slice(index, index + 200))
      })
      if (!response.ok) throw new Error(`Supabase resource sync failed: ${response.status}`)
    }
  }
}
