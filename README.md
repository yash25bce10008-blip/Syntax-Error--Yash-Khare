Path Finder: Personalized AI Learning Platform
Path Finder is an AI-powered personalized learning platform designed to help students and developers map out their custom career paths. By leveraging the Google Gemini API, Path Finder builds a tailor-made curriculum, skipping topics you already know, recommending the best YouTube resources, and testing your knowledge with interactive AI quizzes.

✨ Features
Custom Career Roadmaps: Choose your target career (e.g., Full Stack, Backend, Data Science) and tech stack, and Path Finder generates a structured timeline of topics.
Adaptive Curriculum: Tell the app what you already know, and it will automatically skip those topics to save you time.
Curated Resources: Instantly access top-rated YouTube playlists, official documentation, and GitHub repositories for every topic on your roadmap.
AI-Powered Quizzes: Test your knowledge on any topic with dynamic, multiple-choice quizzes generated on-the-fly by Gemini 2.0 Flash.
Question of the Day: A daily interactive challenge based on your active career path to keep you engaged.
Multi-Profile Management: Track your progress across multiple career paths simultaneously.
Beautiful UI: Modern glassmorphism design with seamless Dark/Light mode toggling, built with Tailwind CSS and Framer Motion.
🛠️ Tech Stack
Frontend: Next.js (App Router), React, Tailwind CSS, Framer Motion, Lucide Icons.
Backend: Next.js API Routes, Node.js.
Database: PostgreSQL (using the pg package for connection pooling).
Authentication: NextAuth.js (Custom Credentials Provider).
AI Integration: Google Gemini API (gemini-2.0-flash).
🚀 How It Works
Authentication: Users sign up or log in securely. Passwords are encrypted using bcryptjs and session tokens are managed via JWT.
Onboarding Wizard: New users go through a beautiful 4-step wizard to select their career, tech stack, current knowledge base, and target deadline.
AI Generation: The backend sends the user's constraints to the Gemini API, which returns a highly structured, JSON-formatted curriculum.
Data Persistence: The generated roadmap, daily questions, and user progress are stored relationally in PostgreSQL.
Interactive Dashboard: Users interact with their roadmap, mark topics as complete, take quizzes, and answer the Question of the Day. Progress is saved in real-time.
💻 Getting Started (Local Development)
Follow these steps to run the Path Finder platform on your local machine.

Prerequisites
Node.js (v18 or higher)
PostgreSQL installed and running locally.
A Google Gemini API Key.
1. Clone the repository
bash


git clone https://github.com/your-username/Path Finder.git
cd Path Finder
2. Install Dependencies
bash


npm install
3. Setup PostgreSQL Database
Log into your PostgreSQL instance and create a database (e.g., career_pipeline). Run the following SQL queries to initialize the required tables:

sql


CREATE TABLE IF NOT EXISTS student (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS student_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topic(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, topic_id)
);
CREATE TABLE IF NOT EXISTS student_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
  career_id UUID NOT NULL REFERENCES career(id) ON DELETE CASCADE,
  career_title VARCHAR(255),
  known_topics JSONB DEFAULT '[]',
  deadline_weeks INTEGER,
  stack_choice JSONB,
  roadmap_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS quiz_attempt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topic(id) ON DELETE CASCADE,
  score SMALLINT,
  total SMALLINT DEFAULT 5,
  answers JSONB,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS daily_question (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_str VARCHAR(10) UNIQUE NOT NULL,
  question JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS student_daily_question (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES daily_question(id) ON DELETE CASCADE,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, question_id)
);
(Note: The topic and career tables are assumed to exist in your database schema from the initial data seeding).

4. Configure Environment Variables
Create a .env.local file in the root directory and add the following:

env


# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
# NextAuth Configuration
NEXTAUTH_SECRET=your_super_secret_string
NEXTAUTH_URL=http://localhost:3000
5. Run the Application
bash


npm run dev
Open http://localhost:3000 in your browser to see the app in action!

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for any bugs or feature requests.