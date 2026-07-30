export type Difficulty = 'Foundation' | 'Intermediate' | 'Advanced'
export type StageStatus = 'locked' | 'available' | 'in-progress' | 'completed'

export type Resource = {
  type: 'YouTube' | 'Official Docs' | 'Article' | 'GitHub' | 'Practice'
  title: string
  url: string
}

export type QuizQuestion = {
  question: string
  options: string[]
  answer: number
  explanation: string
}

export type RoadmapStage = {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  duration: string
  xp: number
  prerequisites: string[]
  resources: Resource[]
  quiz: QuizQuestion[]
}

export type CareerRole = {
  id: string
  title: string
  category: string
  summary: string
  overview: string
  skills: string[]
  technologies: string[]
  certifications: string[]
  timeline: string
  marketSignal: string
  roadmap: RoadmapStage[]
}

export type StageProgress = {
  status: StageStatus
  progress: number
  quizScore?: number
}

export type Activity = {
  id: string
  text: string
  at: string
  type: 'career' | 'skill' | 'quiz' | 'roadmap' | 'resume'
}

export type UserProfile = {
  id: string
  fullName: string
  email: string
  userId: string
  college: string
  department: string
  academicYear: string
  passwordHash: string
  passwordSalt: string
  skills: string[]
  selectedCareerId: string
  stageProgress: Record<string, Record<string, StageProgress>>
  xp: number
  streak: number
  activities: Activity[]
  resumeFileName?: string
  createdAt: string
}

const roleSeeds = [
  ['ai-engineer', 'AI Engineer', 'Artificial Intelligence', ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Vector Databases', 'MLOps'], ['Python', 'PyTorch', 'TensorFlow', 'LangChain', 'Pinecone', 'Docker']],
  ['machine-learning-engineer', 'Machine Learning Engineer', 'Artificial Intelligence', ['Python', 'Statistics', 'Feature Engineering', 'Model Evaluation', 'Scikit-learn', 'MLOps'], ['Python', 'scikit-learn', 'MLflow', 'Kubeflow', 'Docker', 'AWS SageMaker']],
  ['data-scientist', 'Data Scientist', 'Data', ['Python', 'SQL', 'Statistics', 'Experimentation', 'Storytelling', 'Machine Learning'], ['Python', 'Pandas', 'Jupyter', 'Tableau', 'dbt', 'Snowflake']],
  ['data-analyst', 'Data Analyst', 'Data', ['SQL', 'Excel', 'Dashboards', 'Statistics', 'Data Cleaning', 'Business Metrics'], ['SQL', 'Power BI', 'Tableau', 'Excel', 'Looker', 'BigQuery']],
  ['business-analyst', 'Business Analyst', 'Business', ['Requirements', 'SQL', 'Process Mapping', 'Stakeholder Management', 'Documentation', 'Analytics'], ['Jira', 'Confluence', 'SQL', 'Miro', 'Tableau', 'Notion']],
  ['frontend-engineer', 'Frontend Engineer', 'Software Engineering', ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Accessibility'], ['React', 'TypeScript', 'Vite', 'Next.js', 'Tailwind CSS', 'Playwright']],
  ['backend-engineer', 'Backend Engineer', 'Software Engineering', ['APIs', 'Databases', 'System Design', 'Authentication', 'Testing', 'Cloud'], ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'GraphQL']],
  ['full-stack-engineer', 'Full Stack Engineer', 'Software Engineering', ['React', 'Node.js', 'Databases', 'API Design', 'Deployment', 'Testing'], ['React', 'Node.js', 'PostgreSQL', 'Vercel', 'Prisma', 'Docker']],
  ['devops-engineer', 'DevOps Engineer', 'Cloud', ['Linux', 'CI/CD', 'Containers', 'Cloud', 'Monitoring', 'Infrastructure as Code'], ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'AWS', 'Prometheus']],
  ['cloud-engineer', 'Cloud Engineer', 'Cloud', ['Networking', 'Linux', 'Cloud Security', 'Automation', 'Storage', 'Monitoring'], ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'CloudFormation']],
  ['cybersecurity-analyst', 'Cybersecurity Analyst', 'Security', ['Networking', 'Threat Modeling', 'SIEM', 'Incident Response', 'Linux', 'Risk'], ['Splunk', 'Wireshark', 'Nmap', 'Burp Suite', 'Kali Linux', 'Microsoft Sentinel']],
  ['security-engineer', 'Security Engineer', 'Security', ['Application Security', 'Cloud Security', 'Identity', 'Threat Modeling', 'Scripting', 'Compliance'], ['OWASP ZAP', 'Burp Suite', 'AWS IAM', 'Snyk', 'Semgrep', 'Vault']],
  ['product-manager', 'Product Manager', 'Product', ['User Research', 'Roadmapping', 'Metrics', 'Prioritization', 'Communication', 'Experimentation'], ['Linear', 'Figma', 'Amplitude', 'Notion', 'Jira', 'Mixpanel']],
  ['ux-designer', 'UX Designer', 'Design', ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Information Architecture', 'Design Systems'], ['Figma', 'FigJam', 'Maze', 'Notion', 'Miro', 'Framer']],
  ['ui-designer', 'UI Designer', 'Design', ['Visual Design', 'Typography', 'Color Systems', 'Components', 'Interaction Design', 'Accessibility'], ['Figma', 'Framer', 'Storybook', 'Webflow', 'Adobe Illustrator', 'Notion']],
  ['mobile-developer', 'Mobile Developer', 'Software Engineering', ['Mobile UI', 'State Management', 'APIs', 'Performance', 'Testing', 'App Stores'], ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Expo']],
  ['ios-developer', 'iOS Developer', 'Software Engineering', ['Swift', 'UIKit', 'SwiftUI', 'Networking', 'Persistence', 'App Store'], ['Swift', 'Xcode', 'SwiftUI', 'Combine', 'Core Data', 'TestFlight']],
  ['android-developer', 'Android Developer', 'Software Engineering', ['Kotlin', 'Compose', 'Android SDK', 'Networking', 'Persistence', 'Testing'], ['Kotlin', 'Android Studio', 'Jetpack Compose', 'Room', 'Firebase', 'Gradle']],
  ['qa-engineer', 'QA Automation Engineer', 'Software Engineering', ['Testing Strategy', 'Automation', 'API Testing', 'Bug Reporting', 'CI', 'Quality Metrics'], ['Playwright', 'Cypress', 'Postman', 'Jest', 'GitHub Actions', 'Selenium']],
  ['site-reliability-engineer', 'Site Reliability Engineer', 'Cloud', ['Reliability', 'Observability', 'Incident Response', 'Automation', 'Kubernetes', 'Capacity Planning'], ['Kubernetes', 'Prometheus', 'Grafana', 'Terraform', 'Go', 'PagerDuty']],
  ['database-administrator', 'Database Administrator', 'Data', ['SQL', 'Indexing', 'Backups', 'Replication', 'Security', 'Performance'], ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle', 'pgAdmin']],
  ['data-engineer', 'Data Engineer', 'Data', ['ETL', 'SQL', 'Distributed Systems', 'Data Modeling', 'Pipelines', 'Cloud'], ['Spark', 'Airflow', 'dbt', 'Snowflake', 'Kafka', 'BigQuery']],
  ['analytics-engineer', 'Analytics Engineer', 'Data', ['SQL', 'Data Modeling', 'dbt', 'Metrics Layers', 'Testing', 'Documentation'], ['dbt', 'Snowflake', 'BigQuery', 'Looker', 'Git', 'Hex']],
  ['prompt-engineer', 'Prompt Engineer', 'Artificial Intelligence', ['LLM Basics', 'Prompt Design', 'Evaluation', 'RAG', 'Automation', 'Safety'], ['OpenAI API', 'Claude', 'LangChain', 'LlamaIndex', 'Weights & Biases', 'Pinecone']],
  ['nlp-engineer', 'NLP Engineer', 'Artificial Intelligence', ['Text Processing', 'Transformers', 'Embeddings', 'Evaluation', 'Python', 'MLOps'], ['Hugging Face', 'spaCy', 'PyTorch', 'LangChain', 'FAISS', 'MLflow']],
  ['computer-vision-engineer', 'Computer Vision Engineer', 'Artificial Intelligence', ['Image Processing', 'Deep Learning', 'Object Detection', 'Data Labeling', 'Optimization', 'Deployment'], ['OpenCV', 'PyTorch', 'YOLO', 'TensorFlow', 'Roboflow', 'ONNX']],
  ['game-developer', 'Game Developer', 'Creative Technology', ['Game Loops', 'Physics', 'Rendering', 'C#', 'Level Design', 'Optimization'], ['Unity', 'Unreal Engine', 'C#', 'Blender', 'Godot', 'Git']],
  ['ar-vr-developer', 'AR/VR Developer', 'Creative Technology', ['3D Math', 'Interaction Design', 'Rendering', 'Unity', 'Performance', 'Spatial UX'], ['Unity', 'Unreal Engine', 'ARKit', 'ARCore', 'Blender', 'OpenXR']],
  ['blockchain-developer', 'Blockchain Developer', 'Web3', ['Solidity', 'Smart Contracts', 'Security', 'Web3 APIs', 'Cryptography', 'Testing'], ['Solidity', 'Hardhat', 'Foundry', 'Ethers.js', 'MetaMask', 'OpenZeppelin']],
  ['web3-product-manager', 'Web3 Product Manager', 'Web3', ['Token Design', 'Community', 'Roadmapping', 'Analytics', 'Compliance', 'User Research'], ['Dune', 'Notion', 'Figma', 'Discord', 'Snapshot', 'Linear']],
  ['technical-writer', 'Technical Writer', 'Content', ['Documentation', 'Information Architecture', 'API Writing', 'Editing', 'Examples', 'Developer Empathy'], ['Markdown', 'Docusaurus', 'GitBook', 'Notion', 'OpenAPI', 'GitHub']],
  ['developer-advocate', 'Developer Advocate', 'Content', ['Public Speaking', 'Demos', 'Technical Writing', 'Community', 'APIs', 'Feedback Loops'], ['GitHub', 'Discord', 'YouTube', 'Notion', 'Postman', 'OBS']],
  ['digital-marketer', 'Digital Marketer', 'Marketing', ['SEO', 'Content Strategy', 'Analytics', 'Paid Ads', 'Email', 'Conversion'], ['Google Analytics', 'Search Console', 'HubSpot', 'Semrush', 'Meta Ads', 'Mailchimp']],
  ['growth-manager', 'Growth Manager', 'Marketing', ['Funnels', 'Experimentation', 'Analytics', 'Lifecycle', 'Copywriting', 'Retention'], ['Amplitude', 'Mixpanel', 'HubSpot', 'Airtable', 'Customer.io', 'Webflow']],
  ['sales-engineer', 'Sales Engineer', 'Business', ['Discovery', 'Demos', 'Technical Architecture', 'Objection Handling', 'APIs', 'Communication'], ['Salesforce', 'Postman', 'Notion', 'Zoom', 'Loom', 'HubSpot']],
  ['solutions-architect', 'Solutions Architect', 'Cloud', ['Architecture', 'Cloud', 'Security', 'Cost Optimization', 'Stakeholder Management', 'Documentation'], ['AWS', 'Azure', 'Lucidchart', 'Terraform', 'Kubernetes', 'Confluence']],
  ['network-engineer', 'Network Engineer', 'Infrastructure', ['TCP/IP', 'Routing', 'Switching', 'Firewalls', 'Monitoring', 'Troubleshooting'], ['Cisco IOS', 'Wireshark', 'pfSense', 'SolarWinds', 'Nmap', 'Ansible']],
  ['robotics-engineer', 'Robotics Engineer', 'Hardware', ['Control Systems', 'ROS', 'Sensors', 'C++', 'Kinematics', 'Simulation'], ['ROS', 'Gazebo', 'C++', 'Python', 'Arduino', 'MATLAB']],
  ['embedded-engineer', 'Embedded Systems Engineer', 'Hardware', ['C', 'Microcontrollers', 'RTOS', 'Debugging', 'Electronics', 'Protocols'], ['C', 'STM32', 'Arduino', 'FreeRTOS', 'Oscilloscope', 'PlatformIO']],
  ['iot-engineer', 'IoT Engineer', 'Hardware', ['Sensors', 'Networking', 'MQTT', 'Cloud IoT', 'Security', 'Embedded'], ['MQTT', 'Raspberry Pi', 'AWS IoT', 'Arduino', 'Node-RED', 'InfluxDB']],
  ['bioinformatics-analyst', 'Bioinformatics Analyst', 'Science', ['Genomics', 'Python', 'R', 'Statistics', 'Pipelines', 'Visualization'], ['Python', 'R', 'Bioconductor', 'Nextflow', 'Galaxy', 'Jupyter']],
  ['fintech-analyst', 'FinTech Analyst', 'Finance', ['Financial Modeling', 'SQL', 'Risk', 'Payments', 'Analytics', 'Compliance'], ['Excel', 'SQL', 'Python', 'Tableau', 'Stripe', 'Bloomberg']],
  ['quant-analyst', 'Quantitative Analyst', 'Finance', ['Probability', 'Statistics', 'Python', 'Time Series', 'Optimization', 'Markets'], ['Python', 'R', 'NumPy', 'Pandas', 'MATLAB', 'Bloomberg']],
  ['technical-program-manager', 'Technical Program Manager', 'Product', ['Program Planning', 'Risk Management', 'System Thinking', 'Communication', 'Metrics', 'Execution'], ['Jira', 'Confluence', 'Linear', 'Sheets', 'Miro', 'Notion']],
  ['scrum-master', 'Scrum Master', 'Product', ['Agile', 'Facilitation', 'Coaching', 'Metrics', 'Stakeholder Management', 'Conflict Resolution'], ['Jira', 'Miro', 'Confluence', 'Linear', 'Retrium', 'Notion']],
  ['research-scientist-ai', 'AI Research Scientist', 'Artificial Intelligence', ['Research Methods', 'Deep Learning', 'Mathematics', 'Experimentation', 'Paper Reading', 'Python'], ['PyTorch', 'JAX', 'LaTeX', 'Weights & Biases', 'Hugging Face', 'arXiv']],
  ['mlops-engineer', 'MLOps Engineer', 'Artificial Intelligence', ['Model Serving', 'CI/CD', 'Monitoring', 'Data Pipelines', 'Containers', 'Cloud'], ['MLflow', 'Kubeflow', 'Docker', 'Kubernetes', 'SageMaker', 'Prometheus']],
  ['data-privacy-officer', 'Data Privacy Officer', 'Security', ['Privacy Law', 'Risk', 'Data Governance', 'Compliance', 'Audits', 'Communication'], ['OneTrust', 'Notion', 'Confluence', 'SQL', 'GRC Tools', 'Jira']],
  ['customer-success-manager', 'Customer Success Manager', 'Business', ['Onboarding', 'Product Knowledge', 'Communication', 'Renewals', 'Analytics', 'Escalation'], ['Salesforce', 'HubSpot', 'Gainsight', 'Notion', 'Zendesk', 'Looker']],
  ['no-code-automation-specialist', 'No-Code Automation Specialist', 'Operations', ['Workflow Design', 'APIs', 'Databases', 'Automation', 'Testing', 'Documentation'], ['Zapier', 'Make', 'Airtable', 'Notion', 'Webflow', 'Retool']],
  ['operations-analyst', 'Operations Analyst', 'Operations', ['Process Improvement', 'SQL', 'Dashboards', 'Forecasting', 'Documentation', 'Stakeholder Management'], ['Excel', 'SQL', 'Airtable', 'Tableau', 'Notion', 'Looker']],
  ['ecommerce-manager', 'E-commerce Manager', 'Business', ['Merchandising', 'Analytics', 'SEO', 'Conversion', 'Inventory', 'Customer Experience'], ['Shopify', 'Google Analytics', 'Klaviyo', 'Meta Ads', 'Hotjar', 'Excel']],
  ['content-strategist', 'Content Strategist', 'Content', ['Audience Research', 'Editorial Planning', 'SEO', 'Analytics', 'Brand Voice', 'Distribution'], ['Notion', 'Semrush', 'Google Analytics', 'Ahrefs', 'Figma', 'Webflow']],
  ['ai-product-manager', 'AI Product Manager', 'Product', ['AI Literacy', 'User Research', 'Evaluation Metrics', 'Roadmapping', 'Risk', 'Experimentation'], ['OpenAI API', 'Figma', 'Amplitude', 'Linear', 'Notion', 'LangSmith']],
  ['platform-engineer', 'Platform Engineer', 'Cloud', ['Internal Developer Platforms', 'Kubernetes', 'CI/CD', 'Observability', 'Security', 'Automation'], ['Kubernetes', 'Backstage', 'Terraform', 'Argo CD', 'Grafana', 'Vault']]
] as const

const stageTemplates = [
  ['Orientation & outcomes', 'Understand role expectations, real projects, hiring signals and portfolio benchmarks.'],
  ['Core fundamentals', 'Build the baseline concepts needed to reason clearly and learn efficiently.'],
  ['Tooling setup', 'Configure the professional workspace, repositories, docs and quality checklist.'],
  ['Applied foundations', 'Complete guided exercises that turn concepts into repeatable workflows.'],
  ['Data, users and context', 'Learn how to gather inputs, validate assumptions and define success metrics.'],
  ['System design patterns', 'Study common architecture, trade-offs, edge cases and operational constraints.'],
  ['Project sprint I', 'Ship a focused project demonstrating the first half of the role skill set.'],
  ['Advanced specialization', 'Go deeper into high-leverage techniques used by strong practitioners.'],
  ['Collaboration workflow', 'Practice reviews, documentation, stakeholder updates and maintainable handoffs.'],
  ['Project sprint II', 'Build a realistic capstone module with measurable quality standards.'],
  ['Interview readiness', 'Prepare stories, problem-solving drills, portfolio walkthroughs and role-specific cases.'],
  ['Certification & launch', 'Validate learning, publish portfolio artifacts and create a 30-day job search plan.']
] as const

function makeResources(roleTitle: string, tech: string[], skill: string): Resource[] {
  const q = encodeURIComponent(`${roleTitle} ${skill}`)
  const docs = tech[0]?.toLowerCase().replaceAll(' ', '') || 'docs'
  return [
    { type: 'YouTube', title: `${roleTitle} ${skill} masterclass`, url: `https://www.youtube.com/results?search_query=${q}` },
    { type: 'Official Docs', title: `${tech[0] || roleTitle} official documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(`${tech[0] || roleTitle} official documentation`)}` },
    { type: 'Article', title: `Practical guide to ${skill}`, url: `https://www.google.com/search?q=${q}+guide` },
    { type: 'GitHub', title: `${roleTitle} example repositories`, url: `https://github.com/search?q=${q}&type=repositories` },
    { type: 'Practice', title: `${skill} hands-on practice`, url: `https://www.google.com/search?q=${q}+practice+exercises` }
  ]
}

function makeRoadmap(id: string, title: string, skills: string[], technologies: string[]): RoadmapStage[] {
  return stageTemplates.map(([name, desc], index) => {
    const skill = skills[index % skills.length]
    const nextSkill = skills[(index + 1) % skills.length]
    const difficulty: Difficulty = index < 4 ? 'Foundation' : index < 9 ? 'Intermediate' : 'Advanced'
    return {
      id: `${id}-stage-${index + 1}`,
      title: `${name}: ${skill}`,
      description: `${desc} Focus on ${skill.toLowerCase()} for a ${title} path, using ${technologies[index % technologies.length]} where appropriate.`,
      difficulty,
      duration: `${index < 4 ? 4 + index : index < 9 ? 7 + index : 12 + index} days`,
      xp: 90 + index * 35,
      prerequisites: index === 0 ? ['Curiosity', 'Weekly study schedule'] : [skills[(index - 1) % skills.length], 'Completed previous stage quiz'],
      resources: makeResources(title, technologies, skill),
      quiz: [
        {
          question: `What is the main outcome of the ${name.toLowerCase()} stage for a ${title}?`,
          options: [`Memorize unrelated trivia`, `Apply ${skill} to role-specific work`, `Skip portfolio practice`, `Avoid feedback`],
          answer: 1,
          explanation: `This stage is designed to help you apply ${skill} in a realistic ${title} workflow.`
        },
        {
          question: `Which pairing best supports this stage?`,
          options: [`${technologies[index % technologies.length]} and ${skill}`, `Random tools only`, `No documentation`, `Only theory without practice`],
          answer: 0,
          explanation: `The roadmap connects tools and skills so your learning becomes demonstrable.`
        },
        {
          question: `When should you unlock the next ${title} stage?`,
          options: ['After saving progress and passing the quiz', 'Before reading resources', 'Without completing exercises', 'Only after changing careers'],
          answer: 0,
          explanation: 'SkillSync unlocks the next stage when your saved progress proves readiness.'
        }
      ]
    }
  })
}

export const careers: CareerRole[] = roleSeeds.map(([id, title, category, skills, technologies]) => ({
  id,
  title,
  category,
  summary: `${title} path with ${skills.slice(0, 3).join(', ')} and portfolio-ready milestones.`,
  overview: `${title}s combine ${skills.slice(0, 3).join(', ')} with disciplined execution to solve high-value problems. This path is generated from structured role data, so stages, resources and quizzes remain unique to the selected career.`,
  skills: [...skills],
  technologies: [...technologies],
  certifications: [`${title} Professional Certificate`, `${category} Foundations Credential`, `${technologies[0]} Practitioner Badge`],
  timeline: `${Math.max(10, skills.length * 3)}–${Math.max(18, skills.length * 5)} weeks`,
  marketSignal: `${category} teams value candidates who can show practical projects, clear documentation and measurable learning progress.`,
  roadmap: makeRoadmap(id, title, [...skills], [...technologies])
}))

export const skillDictionary = Array.from(new Set(careers.flatMap((career) => [...career.skills, ...career.technologies]))).sort()

export function getCareer(id: string) {
  return careers.find((career) => career.id === id) || careers[0]
}

export function makeInitialProgress(career: CareerRole): Record<string, StageProgress> {
  return career.roadmap.reduce<Record<string, StageProgress>>((acc, stage, index) => {
    acc[stage.id] = { status: index === 0 ? 'available' : 'locked', progress: 0 }
    return acc
  }, {})
}

export function calculateGap(userSkills: string[], career: CareerRole) {
  const normalized = new Set(userSkills.map((skill) => skill.toLowerCase()))
  const matched = career.skills.filter((skill) => normalized.has(skill.toLowerCase()))
  const missing = career.skills.filter((skill) => !normalized.has(skill.toLowerCase()))
  const percent = career.skills.length ? Math.round((matched.length / career.skills.length) * 100) : 0
  const priority = missing.slice(0, 3)
  const weeks = Math.max(2, missing.length * 2)
  return { matched, missing, percent, priority, estimatedDuration: `${weeks} weeks` }
}

export function searchEverything(query: string, careerId: string) {
  const activeCareer = getCareer(careerId)
  const q = query.trim().toLowerCase()
  if (!q) return []
  const results: Array<{ type: string; title: string; description: string; id: string }> = []
  careers.forEach((career) => {
    if (`${career.title} ${career.category} ${career.skills.join(' ')}`.toLowerCase().includes(q)) {
      results.push({ type: 'Career', title: career.title, description: career.summary, id: career.id })
    }
  })
  activeCareer.roadmap.forEach((stage) => {
    if (`${stage.title} ${stage.description} ${stage.resources.map((r) => r.title).join(' ')}`.toLowerCase().includes(q)) {
      results.push({ type: 'Roadmap', title: stage.title, description: stage.description, id: stage.id })
    }
  })
  skillDictionary.forEach((skill) => {
    if (skill.toLowerCase().includes(q)) results.push({ type: 'Skill', title: skill, description: 'Skill found in the structured SkillSync taxonomy.', id: skill })
  })
  return results.slice(0, 12)
}
