/**
 * DB Seeder — populates career_pipeline with proper careers,
 * broad learning topics, and uses YouTube API to find the best playlist per topic.
 * 
 * Run: node db/seed.mjs
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

// Load .env.local manually
const envContent = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../.env.local'), 'utf8');
const env = Object.fromEntries(
  envContent.split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('=').map(s => s.trim()))
);
const YT_KEY = env.YOUTUBE_API_KEY;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// ─── Roadmap Data ─────────────────────────────────────────────────────────────
// Each career has categories, each category has topics.
// Topics are BROAD (e.g. "JavaScript", not "Array.prototype.reduce")
const CAREERS = [
  {
    slug: 'full-stack-developer',
    name: 'Full Stack Developer',
    description: 'Build complete web applications from frontend to backend',
    emoji: '🌐',
    tagline: 'Master both UI and server-side development',
    categories: [
      {
        slug: 'foundations',
        name: 'Web Foundations',
        display_order: 1,
        topics: [
          { slug: 'html-css', name: 'HTML & CSS', description: 'Structure and style web pages', duration: '2-3 weeks', ytQuery: 'HTML CSS full course beginners 2024', docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML', githubUrl: 'https://github.com/search?q=html+css+projects+beginners&sort=stars', practiceUrl: 'https://frontendmentor.io' },
          { slug: 'javascript', name: 'JavaScript', description: 'Make websites interactive with JS', duration: '4-6 weeks', ytQuery: 'JavaScript full course beginners 2024', docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', githubUrl: 'https://github.com/search?q=javascript+projects+beginners&sort=stars', practiceUrl: 'https://javascript30.com' },
          { slug: 'git-github', name: 'Git & GitHub', description: 'Version control your code and collaborate', duration: '1 week', ytQuery: 'Git GitHub complete course 2024', docsUrl: 'https://git-scm.com/doc', githubUrl: 'https://github.com/git-guides', practiceUrl: 'https://learngitbranching.js.org' },
        ]
      },
      {
        slug: 'frontend',
        name: 'Frontend Frameworks',
        display_order: 2,
        topics: [
          { slug: 'react', name: 'React.js', description: 'Build reusable UI components with React', duration: '4-5 weeks', ytQuery: 'React JS full course 2024 beginners', docsUrl: 'https://react.dev', githubUrl: 'https://github.com/search?q=react+projects+2024&sort=stars', practiceUrl: 'https://frontendmentor.io' },
          { slug: 'angular', name: 'Angular', description: 'Enterprise frontend framework', duration: '5 weeks', ytQuery: 'Angular 17 full course beginners 2024', docsUrl: 'https://angular.dev', githubUrl: 'https://github.com/search?q=angular+projects+2024&sort=stars', practiceUrl: 'https://frontendmentor.io' },
          { slug: 'vue', name: 'Vue.js', description: 'Progressive JavaScript framework', duration: '3 weeks', ytQuery: 'Vue 3 full course 2024', docsUrl: 'https://vuejs.org', githubUrl: 'https://github.com/search?q=vue+projects+2024&sort=stars', practiceUrl: 'https://frontendmentor.io' },
          { slug: 'typescript', name: 'TypeScript', description: 'Add types to JavaScript for safer code', duration: '2-3 weeks', ytQuery: 'TypeScript full course beginners 2024', docsUrl: 'https://www.typescriptlang.org/docs/', githubUrl: 'https://github.com/search?q=typescript+starter&sort=stars', practiceUrl: 'https://www.typescriptlang.org/play' },
          { slug: 'nextjs', name: 'Next.js', description: 'Full-stack React framework for production apps', duration: '3-4 weeks', ytQuery: 'Next.js 14 full course 2024', docsUrl: 'https://nextjs.org/docs', githubUrl: 'https://github.com/vercel/next.js', practiceUrl: 'https://vercel.com' },
        ]
      },
      {
        slug: 'backend',
        name: 'Backend Technologies',
        display_order: 3,
        topics: [
          { slug: 'nodejs-express', name: 'Node.js & Express', description: 'Build REST APIs with Node.js', duration: '3-4 weeks', ytQuery: 'Node.js Express REST API full course 2024', docsUrl: 'https://nodejs.org/en/docs', githubUrl: 'https://github.com/search?q=node+express+api+starter&sort=stars', practiceUrl: 'https://www.postman.com' },
          { slug: 'java-core', name: 'Java Core', description: 'Object-oriented programming with Java', duration: '4 weeks', ytQuery: 'Java programming full course 2024', docsUrl: 'https://docs.oracle.com/en/java/', githubUrl: 'https://github.com/search?q=java+projects&sort=stars', practiceUrl: 'https://leetcode.com' },
          { slug: 'spring-boot', name: 'Spring Boot', description: 'Build enterprise Java applications', duration: '4 weeks', ytQuery: 'Spring Boot full course 2024', docsUrl: 'https://spring.io/projects/spring-boot', githubUrl: 'https://github.com/search?q=spring+boot+api&sort=stars', practiceUrl: 'https://www.postman.com' },
          { slug: 'python-backend', name: 'Python (Django/FastAPI)', description: 'Python backend web frameworks', duration: '4 weeks', ytQuery: 'FastAPI Django full course 2024', docsUrl: 'https://fastapi.tiangolo.com/', githubUrl: 'https://github.com/search?q=fastapi+django+api&sort=stars', practiceUrl: 'https://www.postman.com' },
        ]
      },
      {
        slug: 'databases',
        name: 'Databases & ORMs',
        display_order: 4,
        topics: [
          { slug: 'postgresql', name: 'SQL & PostgreSQL', description: 'Store and query data with relational databases', duration: '2-3 weeks', ytQuery: 'PostgreSQL full course beginners 2024', docsUrl: 'https://www.postgresql.org/docs/', githubUrl: 'https://github.com/search?q=postgresql+tutorial&sort=stars', practiceUrl: 'https://sqlzoo.net' },
          { slug: 'mongodb', name: 'MongoDB', description: 'NoSQL document database', duration: '2 weeks', ytQuery: 'MongoDB complete course 2024', docsUrl: 'https://www.mongodb.com/docs/', githubUrl: 'https://github.com/search?q=mongodb+nodejs+2024&sort=stars', practiceUrl: 'https://www.mongodb.com/try' },
          { slug: 'hibernate-jpa', name: 'JPA & Hibernate', description: 'Java ORM for database mapping', duration: '2 weeks', ytQuery: 'Spring Data JPA Hibernate course 2024', docsUrl: 'https://hibernate.org/orm/', githubUrl: 'https://github.com/search?q=hibernate+jpa+examples&sort=stars', practiceUrl: 'https://sqlzoo.net' },
        ]
      },
      {
        slug: 'deployment',
        name: 'Deployment & DevOps',
        display_order: 5,
        topics: [
          { slug: 'auth-security', name: 'Authentication & Security', description: 'JWT, OAuth2, and securing your APIs', duration: '1-2 weeks', ytQuery: 'JWT authentication Node.js Spring Boot 2024', docsUrl: 'https://jwt.io/introduction', githubUrl: 'https://github.com/search?q=jwt+auth+nodejs&sort=stars', practiceUrl: 'https://owasp.org' },
          { slug: 'docker', name: 'Docker', description: 'Containerize your apps for consistent deployments', duration: '1-2 weeks', ytQuery: 'Docker full course beginners 2024', docsUrl: 'https://docs.docker.com', githubUrl: 'https://github.com/search?q=docker+compose+starter&sort=stars', practiceUrl: 'https://labs.play-with-docker.com' },
          { slug: 'cloud-deploy', name: 'Cloud Deployment', description: 'Deploy to AWS, GCP or Vercel', duration: '1-2 weeks', ytQuery: 'deploy web app AWS beginners 2024', docsUrl: 'https://docs.aws.amazon.com', githubUrl: 'https://github.com/search?q=aws+deployment+nodejs&sort=stars', practiceUrl: 'https://vercel.com' },
        ]
      },
    ]
  },
  {
    slug: 'frontend-developer',
    name: 'Frontend Developer',
    description: 'Craft stunning, responsive UIs with modern frameworks',
    emoji: '🎨',
    tagline: 'Master React, CSS, and modern UI development',
    categories: [
      { slug: 'html-css-deep', name: 'HTML & CSS Mastery', display_order: 1, topics: [
        { slug: 'html-css-fe', name: 'HTML & CSS', description: 'Structure and style web pages beautifully', duration: '2-3 weeks', ytQuery: 'HTML CSS full course 2024', docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML', githubUrl: 'https://github.com/search?q=html+css+projects&sort=stars', practiceUrl: 'https://frontendmentor.io' },
        { slug: 'css-advanced', name: 'CSS Advanced (Flexbox & Grid)', description: 'Build complex responsive layouts', duration: '1-2 weeks', ytQuery: 'CSS Flexbox Grid complete guide 2024', docsUrl: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', githubUrl: 'https://github.com/search?q=css+grid+projects&sort=stars', practiceUrl: 'https://cssgridgarden.com' },
      ]},
      { slug: 'js-ecosystem', name: 'JavaScript Ecosystem', display_order: 2, topics: [
        { slug: 'js-fe', name: 'JavaScript', description: 'Core JS — ES6+, async, DOM manipulation', duration: '4-5 weeks', ytQuery: 'JavaScript full course ES6 2024', docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', githubUrl: 'https://github.com/search?q=vanilla+javascript+projects&sort=stars', practiceUrl: 'https://javascript30.com' },
        { slug: 'ts-fe', name: 'TypeScript', description: 'Type-safe JavaScript for large apps', duration: '2 weeks', ytQuery: 'TypeScript course beginners 2024', docsUrl: 'https://www.typescriptlang.org/docs/', githubUrl: 'https://github.com/search?q=typescript+starter&sort=stars', practiceUrl: 'https://www.typescriptlang.org/play' },
      ]},
      { slug: 'react-ecosystem', name: 'Framework Ecosystem (React/Angular/Vue)', display_order: 3, topics: [
        { slug: 'react-fe', name: 'React.js', description: 'Component-based UI development', duration: '4-5 weeks', ytQuery: 'React JS complete course 2024', docsUrl: 'https://react.dev', githubUrl: 'https://github.com/search?q=react+projects&sort=stars', practiceUrl: 'https://frontendmentor.io' },
        { slug: 'angular-fe', name: 'Angular', description: 'Robust framework for enterprise UIs', duration: '4-5 weeks', ytQuery: 'Angular complete course 2024', docsUrl: 'https://angular.dev', githubUrl: 'https://github.com/search?q=angular+projects&sort=stars', practiceUrl: 'https://frontendmentor.io' },
        { slug: 'vue-fe', name: 'Vue.js', description: 'Approachable, performant JavaScript framework', duration: '3-4 weeks', ytQuery: 'Vue.js 3 complete course 2024', docsUrl: 'https://vuejs.org', githubUrl: 'https://github.com/search?q=vue+projects&sort=stars', practiceUrl: 'https://frontendmentor.io' },
        { slug: 'nextjs-fe', name: 'Next.js', description: 'Production React apps with SSR and routing', duration: '2-3 weeks', ytQuery: 'Next.js tutorial beginners 2024', docsUrl: 'https://nextjs.org/docs', githubUrl: 'https://github.com/vercel/next.js', practiceUrl: 'https://vercel.com' },
      ]},
    ]
  },
  {
    slug: 'backend-developer',
    name: 'Backend Developer',
    description: 'Design APIs, databases and server-side architecture',
    emoji: '⚙️',
    tagline: 'Build scalable APIs and data systems',
    categories: [
      { slug: 'prog-lang-be', name: 'Programming Language', display_order: 1, topics: [
        { slug: 'python-be', name: 'Python', description: 'Versatile language for backend and scripting', duration: '3-4 weeks', ytQuery: 'Python full course 2024 beginners', docsUrl: 'https://docs.python.org/3/', githubUrl: 'https://github.com/search?q=python+projects+2024&sort=stars', practiceUrl: 'https://leetcode.com' },
        { slug: 'nodejs-be', name: 'Node.js', description: 'JavaScript on the server', duration: '3-4 weeks', ytQuery: 'Node.js full course 2024 beginners', docsUrl: 'https://nodejs.org/en/docs', githubUrl: 'https://github.com/search?q=nodejs+backend+2024&sort=stars', practiceUrl: 'https://exercism.org' },
        { slug: 'java-be', name: 'Java', description: 'Robust, object-oriented language for enterprise backends', duration: '4-5 weeks', ytQuery: 'Java programming full course 2024', docsUrl: 'https://docs.oracle.com/en/java/', githubUrl: 'https://github.com/search?q=java+backend+projects&sort=stars', practiceUrl: 'https://leetcode.com' },
        { slug: 'go-be', name: 'Go (Golang)', description: 'Fast, concurrent language for modern APIs', duration: '3-4 weeks', ytQuery: 'Golang full course 2024', docsUrl: 'https://go.dev/doc/', githubUrl: 'https://github.com/search?q=go+backend+projects&sort=stars', practiceUrl: 'https://gobyexample.com' },
      ]},
      { slug: 'frameworks-be', name: 'Backend Frameworks', display_order: 2, topics: [
        { slug: 'spring-boot-be', name: 'Spring Boot (Java)', description: 'Enterprise backend framework for Java', duration: '4 weeks', ytQuery: 'Spring Boot complete course 2024', docsUrl: 'https://spring.io/projects/spring-boot', githubUrl: 'https://github.com/search?q=spring+boot+api&sort=stars', practiceUrl: 'https://www.postman.com' },
        { slug: 'django-fastapi-be', name: 'Django / FastAPI (Python)', description: 'Python frameworks for fast API development', duration: '3-4 weeks', ytQuery: 'FastAPI Django Python backend course 2024', docsUrl: 'https://fastapi.tiangolo.com/', githubUrl: 'https://github.com/search?q=fastapi+api&sort=stars', practiceUrl: 'https://www.postman.com' },
        { slug: 'express-be', name: 'Express.js (Node.js)', description: 'Minimalist web framework for Node.js', duration: '2 weeks', ytQuery: 'Express.js REST API tutorial 2024', docsUrl: 'https://expressjs.com', githubUrl: 'https://github.com/search?q=express+api&sort=stars', practiceUrl: 'https://www.postman.com' },
      ]},
      { slug: 'apis', name: 'API Development', display_order: 3, topics: [
        { slug: 'rest-api', name: 'REST API Design', description: 'Build clean RESTful APIs', duration: '2-3 weeks', ytQuery: 'REST API tutorial Node.js Express 2024', docsUrl: 'https://restfulapi.net', githubUrl: 'https://github.com/search?q=rest+api+nodejs+express&sort=stars', practiceUrl: 'https://www.postman.com' },
        { slug: 'graphql', name: 'GraphQL', description: 'Flexible query language for APIs', duration: '2 weeks', ytQuery: 'GraphQL full course 2024', docsUrl: 'https://graphql.org/learn/', githubUrl: 'https://github.com/search?q=graphql+server+2024&sort=stars', practiceUrl: 'https://studio.apollographql.com' },
      ]},
      { slug: 'databases-be', name: 'Databases', display_order: 4, topics: [
        { slug: 'sql-be', name: 'SQL & PostgreSQL', description: 'Relational databases fundamentals', duration: '3 weeks', ytQuery: 'SQL PostgreSQL full course 2024', docsUrl: 'https://www.postgresql.org/docs/', githubUrl: 'https://github.com/search?q=postgresql+tutorial&sort=stars', practiceUrl: 'https://sqlzoo.net' },
        { slug: 'mongodb', name: 'MongoDB', description: 'NoSQL document database', duration: '2 weeks', ytQuery: 'MongoDB complete course 2024', docsUrl: 'https://www.mongodb.com/docs/', githubUrl: 'https://github.com/search?q=mongodb+nodejs+2024&sort=stars', practiceUrl: 'https://www.mongodb.com/try' },
        { slug: 'redis-be', name: 'Redis & Caching', description: 'In-memory caching and queues', duration: '1 week', ytQuery: 'Redis complete guide 2024', docsUrl: 'https://redis.io/docs/', githubUrl: 'https://github.com/search?q=redis+nodejs&sort=stars', practiceUrl: 'https://try.redis.io' },
      ]},
    ]
  },
  {
    slug: 'data-scientist',
    name: 'Data Scientist',
    description: 'Extract insights from data and build ML models',
    emoji: '📊',
    tagline: 'Python, ML, and data-driven decision making',
    categories: [
      { slug: 'python-ds', name: 'Python for Data Science', display_order: 1, topics: [
        { slug: 'python-ds-core', name: 'Python Core', description: 'Python fundamentals for data work', duration: '3 weeks', ytQuery: 'Python full course data science 2024', docsUrl: 'https://docs.python.org/3/', githubUrl: 'https://github.com/search?q=python+data+science+projects&sort=stars', practiceUrl: 'https://kaggle.com' },
        { slug: 'numpy-pandas', name: 'NumPy & Pandas', description: 'Data manipulation and analysis', duration: '2 weeks', ytQuery: 'NumPy Pandas complete course 2024', docsUrl: 'https://pandas.pydata.org/docs/', githubUrl: 'https://github.com/search?q=pandas+numpy+tutorial&sort=stars', practiceUrl: 'https://kaggle.com/learn' },
      ]},
      { slug: 'visualization', name: 'Data Visualization', display_order: 2, topics: [
        { slug: 'matplotlib-seaborn', name: 'Matplotlib & Seaborn', description: 'Chart and plot your data', duration: '1-2 weeks', ytQuery: 'Matplotlib Seaborn data visualization Python 2024', docsUrl: 'https://matplotlib.org/stable/tutorials/', githubUrl: 'https://github.com/search?q=matplotlib+seaborn+tutorial&sort=stars', practiceUrl: 'https://kaggle.com' },
      ]},
      { slug: 'ml', name: 'Machine Learning', display_order: 3, topics: [
        { slug: 'ml-core', name: 'Machine Learning with Scikit-learn', description: 'Classification, regression, clustering', duration: '4-5 weeks', ytQuery: 'Machine learning scikit-learn full course 2024', docsUrl: 'https://scikit-learn.org/stable/', githubUrl: 'https://github.com/search?q=scikit-learn+projects&sort=stars', practiceUrl: 'https://kaggle.com/competitions' },
        { slug: 'deep-learning', name: 'Deep Learning with PyTorch', description: 'Neural networks and deep learning', duration: '4-5 weeks', ytQuery: 'PyTorch deep learning full course 2024', docsUrl: 'https://pytorch.org/docs/', githubUrl: 'https://github.com/search?q=pytorch+deep+learning&sort=stars', practiceUrl: 'https://fast.ai' },
      ]},
    ]
  },
];

// ─── YouTube search helper ─────────────────────────────────────────────────────
async function searchYouTubePlaylist(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=playlist&maxResults=1&relevanceLanguage=en&key=${YT_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.items && data.items.length > 0) {
    const item = data.items[0];
    return {
      url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || '',
    };
  }
  return null;
}

// ─── Main seeder ──────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting DB seed...\n');

  for (const career of CAREERS) {
    // Upsert career
    const careerRes = await pool.query(`
      INSERT INTO career (id, slug, name, description, emoji, tagline, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET name=$2, description=$3, emoji=$4, tagline=$5, updated_at=NOW()
      RETURNING id
    `, [career.slug, career.name, career.description, career.emoji, career.tagline]);
    const careerId = careerRes.rows[0].id;
    console.log(`✅ Career: ${career.name} (${careerId})`);

    for (const cat of career.categories) {
      // Upsert category
      const catRes = await pool.query(`
        INSERT INTO category (id, career_id, slug, name, display_order)
        VALUES (gen_random_uuid(), $1, $2, $3, $4)
        ON CONFLICT (career_id, slug) DO UPDATE SET name=$3, display_order=$4
        RETURNING id
      `, [careerId, cat.slug, cat.name, cat.display_order]);
      const catId = catRes.rows[0].id;
      console.log(`  📁 Category: ${cat.name}`);

      for (let i = 0; i < cat.topics.length; i++) {
        const t = cat.topics[i];

        // Search YouTube for best playlist
        console.log(`    🔍 Searching YouTube: "${t.ytQuery}"`);
        let ytUrl = null, ytTitle = null, ytThumb = null;
        try {
          const yt = await searchYouTubePlaylist(t.ytQuery);
          if (yt) { ytUrl = yt.url; ytTitle = yt.title; ytThumb = yt.thumbnail; }
          // Rate limit: 1 request per second
          await new Promise(r => setTimeout(r, 1200));
        } catch (e) {
          console.warn('    ⚠️  YouTube API error:', e.message);
        }

        // Upsert topic
        await pool.query(`
          INSERT INTO topic (id, career_id, category_id, slug, canonical_name, description, topic_type, order_index, is_optional,
            yt_playlist_url, yt_playlist_title, docs_url, github_url, practice_url, thumbnail_url, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'skill', $6, false, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          ON CONFLICT (career_id, slug) DO UPDATE SET 
            canonical_name=$4, description=$5, yt_playlist_url=$7, yt_playlist_title=$8,
            docs_url=$9, github_url=$10, practice_url=$11, thumbnail_url=$12, updated_at=NOW()
        `, [careerId, catId, t.slug, t.name, t.description, i + 1, ytUrl, ytTitle, t.docsUrl, t.githubUrl, t.practiceUrl, ytThumb]);

        console.log(`    ✅ Topic: ${t.name} ${ytUrl ? '▶ ' + ytTitle?.slice(0,50) : '(no YT found)'}`);
      }
    }
    console.log('');
  }

  console.log('🎉 Seed complete!');
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
