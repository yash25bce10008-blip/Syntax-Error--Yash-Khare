-- SkillSync AI Supabase schema
-- Run this once in Supabase SQL Editor, then set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.

create table if not exists public.skillsync_users (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  user_id text not null unique,
  college text not null,
  department text not null,
  academic_year text not null,
  password_hash text not null,
  password_salt text not null,
  skills jsonb not null default '[]'::jsonb,
  selected_career_id text not null,
  stage_progress jsonb not null default '{}'::jsonb,
  learning_profile jsonb,
  xp integer not null default 0,
  streak integer not null default 1,
  activities jsonb not null default '[]'::jsonb,
  resume_file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.skillsync_youtube_videos (
  id text primary key,
  career_id text not null,
  career_title text not null,
  stage_id text not null,
  stage_title text not null,
  video_title text not null,
  video_url text not null,
  embed_url text not null,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.skillsync_learning_topics (
  id text primary key,
  career_id text not null,
  stage_id text not null,
  topic_title text not null,
  topic_order integer not null,
  difficulty text not null,
  outcomes jsonb not null default '[]'::jsonb,
  prerequisite_topics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.skillsync_content_resources (
  id text primary key,
  topic_id text not null references public.skillsync_learning_topics(id) on delete cascade,
  resource_type text not null,
  title text not null,
  url text not null,
  provider text,
  learning_style text not null default 'balanced',
  estimated_minutes integer not null default 30,
  quality_score numeric not null default 4.5,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.skillsync_student_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  career_id text not null,
  stage_id text not null,
  topic_id text,
  resource_id text,
  rating integer not null check (rating between 1 and 5),
  difficulty_feedback text,
  pace_feedback text,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.skillsync_personalized_plans (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  career_id text not null,
  learning_profile jsonb not null,
  recommended_stage_order jsonb not null,
  recommendation_reason jsonb not null default '{}'::jsonb,
  model_provider text not null default 'rules_engine_v1',
  created_at timestamptz not null default now()
);

create table if not exists public.skillsync_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  logged_in_at timestamptz not null default now(),
  provider text not null default 'skillsync_password'
);

alter table public.skillsync_users enable row level security;
alter table public.skillsync_youtube_videos enable row level security;
alter table public.skillsync_login_events enable row level security;
alter table public.skillsync_learning_topics enable row level security;
alter table public.skillsync_content_resources enable row level security;
alter table public.skillsync_student_reviews enable row level security;
alter table public.skillsync_personalized_plans enable row level security;

-- Demo-friendly policies for this client-only prototype. For production, replace with Supabase Auth user-scoped RLS.
drop policy if exists "skillsync users demo read" on public.skillsync_users;
create policy "skillsync users demo read" on public.skillsync_users for select using (true);

drop policy if exists "skillsync users demo insert" on public.skillsync_users;
create policy "skillsync users demo insert" on public.skillsync_users for insert with check (true);

drop policy if exists "skillsync users demo update" on public.skillsync_users;
create policy "skillsync users demo update" on public.skillsync_users for update using (true) with check (true);

drop policy if exists "skillsync videos demo read" on public.skillsync_youtube_videos;
create policy "skillsync videos demo read" on public.skillsync_youtube_videos for select using (true);

drop policy if exists "skillsync videos demo insert" on public.skillsync_youtube_videos;
create policy "skillsync videos demo insert" on public.skillsync_youtube_videos for insert with check (true);

drop policy if exists "skillsync videos demo update" on public.skillsync_youtube_videos;
create policy "skillsync videos demo update" on public.skillsync_youtube_videos for update using (true) with check (true);

drop policy if exists "skillsync logins demo insert" on public.skillsync_login_events;
create policy "skillsync logins demo insert" on public.skillsync_login_events for insert with check (true);

drop policy if exists "skillsync topics demo read" on public.skillsync_learning_topics;
create policy "skillsync topics demo read" on public.skillsync_learning_topics for select using (true);
drop policy if exists "skillsync topics demo insert" on public.skillsync_learning_topics;
create policy "skillsync topics demo insert" on public.skillsync_learning_topics for insert with check (true);

drop policy if exists "skillsync resources demo read" on public.skillsync_content_resources;
create policy "skillsync resources demo read" on public.skillsync_content_resources for select using (true);
drop policy if exists "skillsync resources demo insert" on public.skillsync_content_resources;
create policy "skillsync resources demo insert" on public.skillsync_content_resources for insert with check (true);

drop policy if exists "skillsync reviews demo read" on public.skillsync_student_reviews;
create policy "skillsync reviews demo read" on public.skillsync_student_reviews for select using (true);
drop policy if exists "skillsync reviews demo insert" on public.skillsync_student_reviews;
create policy "skillsync reviews demo insert" on public.skillsync_student_reviews for insert with check (true);

drop policy if exists "skillsync plans demo read" on public.skillsync_personalized_plans;
create policy "skillsync plans demo read" on public.skillsync_personalized_plans for select using (true);
drop policy if exists "skillsync plans demo insert" on public.skillsync_personalized_plans;
create policy "skillsync plans demo insert" on public.skillsync_personalized_plans for insert with check (true);
