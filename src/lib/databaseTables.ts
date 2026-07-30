import { careers, type CareerRole, type RoadmapStage, type UserProfile } from './skillSyncData'

export type DbTable = {
  name: string
  description: string
  columns: string[]
  rows: Array<Record<string, string | number>>
}

export const topicVideos = [
  { id: 'rfscVS0vtbw', title: 'Python Full Course', slug: 'python-foundations', tags: ['python', 'programming', 'automation'] },
  { id: 'kqtD5dpn9C8', title: 'Python for Beginners', slug: 'python-beginner', tags: ['python', 'foundation'] },
  { id: 'i_LwzRVP7bg', title: 'Machine Learning for Everybody', slug: 'ml-everybody', tags: ['machine learning', 'model', 'statistics'] },
  { id: 'GwIo3gDZCVQ', title: 'Machine Learning Full Course', slug: 'ml-full-course', tags: ['machine learning', 'data scientist'] },
  { id: 'aircAruvnKk', title: 'Neural Networks Explained', slug: 'neural-networks', tags: ['deep learning', 'neural'] },
  { id: 'd2kxUVwWWwU', title: 'PyTorch for Deep Learning', slug: 'pytorch-course', tags: ['pytorch', 'deep learning'] },
  { id: 'HXV3zeQKqGY', title: 'SQL Full Course', slug: 'sql-full-course', tags: ['sql', 'database'] },
  { id: '7S_tz1z_5bA', title: 'MySQL Tutorial', slug: 'mysql-tutorial', tags: ['mysql', 'database'] },
  { id: 'G3e-cpL7ofc', title: 'HTML & CSS Full Course', slug: 'html-css-course', tags: ['html', 'css', 'frontend'] },
  { id: 'PkZNo7MFNFg', title: 'JavaScript Full Course', slug: 'javascript-course', tags: ['javascript', 'frontend'] },
  { id: 'SqcY0GlETPk', title: 'React Tutorial for Beginners', slug: 'react-beginners', tags: ['react', 'frontend'] },
  { id: 'bMknfKXIFA8', title: 'React Full Course', slug: 'react-full-course', tags: ['react', 'full stack'] },
  { id: 'Oe421EPjeBE', title: 'Node.js and Express Full Course', slug: 'node-express', tags: ['node', 'backend', 'api'] },
  { id: 'RBSGKlAvoiM', title: 'Data Structures and Algorithms', slug: 'dsa-course', tags: ['algorithms', 'interview'] },
  { id: '3c-iBn73dDE', title: 'Docker and Kubernetes Course', slug: 'docker-kubernetes', tags: ['docker', 'kubernetes', 'devops'] },
  { id: 'Wf2eSG3owoA', title: 'Git and GitHub for Beginners', slug: 'git-github', tags: ['git', 'github'] },
  { id: 'FTFaQWZBqQ8', title: 'Product Management Fundamentals', slug: 'product-management', tags: ['product', 'roadmapping'] },
  { id: 'c9Wg6Cb_YlU', title: 'Figma UI Design Tutorial', slug: 'figma-ui', tags: ['figma', 'ui', 'ux'] },
  { id: 'inWWhr5tnEA', title: 'Cyber Security Full Course', slug: 'cybersecurity-course', tags: ['security', 'cybersecurity'] },
  { id: '2LaAJq1lB1Q', title: 'AWS Cloud Practitioner Course', slug: 'aws-cloud', tags: ['aws', 'cloud'] },
  { id: '9pZ2xmsSDdo', title: 'Kubernetes Crash Course', slug: 'kubernetes-crash', tags: ['kubernetes', 'platform'] },
  { id: 'SLB_c_ayRMo', title: 'Data Analysis with Python', slug: 'data-analysis-python', tags: ['data', 'pandas', 'analytics'] },
  { id: 'ua-CiDNNj30', title: 'Power BI Tutorial', slug: 'power-bi', tags: ['power bi', 'dashboard'] },
  { id: 'jGwO_UgTS7I', title: 'Statistics for Data Science', slug: 'statistics-data-science', tags: ['statistics', 'data'] }
]

const topicVideoRules: Array<{ keywords: string[]; slug: string }> = [
  { keywords: ['machine learning', 'model evaluation', 'feature engineering', 'scikit-learn', 'model'], slug: 'ml-everybody' },
  { keywords: ['statistics', 'probability', 'metrics'], slug: 'statistics-data-science' },
  { keywords: ['deep learning', 'neural', 'transformers', 'nlp'], slug: 'neural-networks' },
  { keywords: ['pytorch', 'tensorflow', 'jax'], slug: 'pytorch-course' },
  { keywords: ['sql', 'data modeling', 'analytics'], slug: 'sql-full-course' },
  { keywords: ['mysql', 'postgresql', 'database'], slug: 'mysql-tutorial' },
  { keywords: ['html', 'css', 'accessibility'], slug: 'html-css-course' },
  { keywords: ['javascript', 'typescript'], slug: 'javascript-course' },
  { keywords: ['react', 'frontend', 'state management'], slug: 'react-beginners' },
  { keywords: ['node', 'express', 'api', 'backend'], slug: 'node-express' },
  { keywords: ['algorithms', 'interview', 'dsa', 'data structures'], slug: 'dsa-course' },
  { keywords: ['docker', 'kubernetes', 'devops', 'mlops', 'containers', 'platform'], slug: 'docker-kubernetes' },
  { keywords: ['git', 'github', 'collaboration'], slug: 'git-github' },
  { keywords: ['product', 'roadmapping', 'user research'], slug: 'product-management' },
  { keywords: ['figma', 'ui', 'ux', 'design'], slug: 'figma-ui' },
  { keywords: ['security', 'cybersecurity', 'threat', 'siem'], slug: 'cybersecurity-course' },
  { keywords: ['aws', 'cloud', 'sagemaker'], slug: 'aws-cloud' },
  { keywords: ['power bi', 'dashboard', 'tableau'], slug: 'power-bi' },
  { keywords: ['pandas', 'data analysis', 'data cleaning', 'excel'], slug: 'data-analysis-python' },
  { keywords: ['python', 'automation', 'programming'], slug: 'python-beginner' }
]

export function videoForStage(career: CareerRole, stage: RoadmapStage) {
  const topic = (stage.title.split(':').pop() || stage.title).trim().toLowerCase()
  const stageContext = `${stage.title} ${stage.description}`.toLowerCase()
  const careerContext = `${career.title} ${career.category}`.toLowerCase()

  const exactRule = topicVideoRules.find((rule) => rule.keywords.some((keyword) => topic.includes(keyword)))
  const contextRule = topicVideoRules.find((rule) => rule.keywords.some((keyword) => stageContext.includes(keyword)))
  const careerRule = topicVideoRules.find((rule) => rule.keywords.some((keyword) => careerContext.includes(keyword)))
  const slug = exactRule?.slug || contextRule?.slug || careerRule?.slug || 'git-github'
  return topicVideos.find((video) => video.slug === slug) || topicVideos[0]
}

export function buildDatabaseTables(users: UserProfile[]): DbTable[] {
  const roles = careers.slice(0, 12).map((career, index) => ({ id: index + 1, role_id: career.id, title: career.title, category: career.category, skills_count: career.skills.length }))
  const stages = careers.slice(0, 6).flatMap((career) => career.roadmap.slice(0, 4).map((stage, index) => ({ id: `${career.id}-${index + 1}`, role_id: career.id, stage_id: stage.id, title: stage.title, difficulty: stage.difficulty, xp: stage.xp })))
  const resources = careers.slice(0, 6).flatMap((career) => career.roadmap.slice(0, 4).flatMap((stage, stageIndex) => {
    const video = videoForStage(career, stage)
    return [
      { id: `${stage.id}-video`, stage_id: stage.id, position: 1, slug: video.slug, kind: 'video', title: video.title, url: `https://www.youtube.com/watch?v=${video.id}` },
      ...stage.resources.filter((resource) => resource.type !== 'YouTube').slice(0, 3).map((resource, index) => ({ id: `${stage.id}-${index + 2}`, stage_id: stage.id, position: index + 2, slug: `${stage.id}-${resource.type.toLowerCase().replaceAll(' ', '-')}`, kind: resource.type.toLowerCase(), title: resource.title, url: resource.url }))
    ]
  }))
  const quizQuestions = careers.slice(0, 6).flatMap((career) => career.roadmap.slice(0, 4).flatMap((stage) => stage.quiz.map((quiz, index) => ({ id: `${stage.id}-q${index + 1}`, stage_id: stage.id, question: quiz.question, answer_index: quiz.answer, options_count: quiz.options.length }))))
  const authUsers = users.map((user, index) => ({ id: index + 1, user_id: user.userId, password_hash: `${user.passwordHash.slice(0, 18)}...`, salt: `${user.passwordSalt.slice(0, 10)}...`, college: user.college, course: user.department }))
  const quizAttempts = users.flatMap((user) => Object.entries(user.stageProgress).flatMap(([careerId, stagesById]) => Object.entries(stagesById).filter(([, progress]) => progress.quizScore !== undefined).map(([stageId, progress]) => ({ id: `${user.userId}-${stageId}`, user_id: user.userId, career_id: careerId, stage_id: stageId, score: progress.quizScore || 0, status: progress.status }))))

  return [
    { name: 'auth_users', description: 'Student login records with hashed passwords.', columns: ['id', 'user_id', 'password_hash', 'salt', 'college', 'course'], rows: authUsers },
    { name: 'roles', description: 'Career roles available to the personalization engine.', columns: ['id', 'role_id', 'title', 'category', 'skills_count'], rows: roles },
    { name: 'stages', description: 'Topic/stage records connected to each role.', columns: ['id', 'role_id', 'stage_id', 'title', 'difficulty', 'xp'], rows: stages },
    { name: 'resources', description: 'Topic-wise content. Each stage gets a different stored video/resource.', columns: ['id', 'stage_id', 'position', 'slug', 'kind', 'title', 'url'], rows: resources },
    { name: 'quiz_questions', description: 'All MCQ quiz questions are stored separately by stage.', columns: ['id', 'stage_id', 'question', 'answer_index', 'options_count'], rows: quizQuestions },
    { name: 'quiz_attempts', description: 'Student quiz scores and stage completion history.', columns: ['id', 'user_id', 'career_id', 'stage_id', 'score', 'status'], rows: quizAttempts }
  ]
}
