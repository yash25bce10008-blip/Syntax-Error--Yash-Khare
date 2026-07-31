-- ============================================================
-- PathForge DB Migration: Add proper resource columns to topics
-- Run this on the career_pipeline database
-- ============================================================

-- Add resource columns directly to topic table
ALTER TABLE topic 
  ADD COLUMN IF NOT EXISTS yt_playlist_url TEXT,
  ADD COLUMN IF NOT EXISTS yt_playlist_title TEXT,
  ADD COLUMN IF NOT EXISTS docs_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS practice_url TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add a student_review table for future improvement loop
CREATE TABLE IF NOT EXISTS student_review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topic(id) ON DELETE CASCADE,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  resource_type VARCHAR(20), -- 'youtube', 'docs', 'github', 'practice'
  helpful BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add display_name to career (cleaner than 'name' for UI)
ALTER TABLE career
  ADD COLUMN IF NOT EXISTS emoji VARCHAR(10),
  ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Update existing careers with emoji + tagline
UPDATE career SET emoji = '🌐', tagline = 'Build complete web apps, front to back' WHERE slug = 'full-stack-developer';
UPDATE career SET emoji = '⚙️', tagline = 'APIs, databases and server architecture' WHERE slug = 'backend-developer';
UPDATE career SET emoji = '🐍', tagline = 'Data, automation and scripting with Python' WHERE name = 'Python Developer';
UPDATE career SET emoji = '🟢', tagline = 'Server-side JavaScript and API development' WHERE name = 'Node.js Developer';

-- Insert new careers  
INSERT INTO career (id, slug, name, description, emoji, tagline, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'frontend-developer', 'Frontend Developer', 'Craft beautiful, responsive UIs', '🎨', 'React, CSS, and modern UI development', NOW(), NOW()),
  (gen_random_uuid(), 'data-scientist', 'Data Scientist', 'Extract insights from data using ML', '📊', 'Python, ML models, and data analysis', NOW(), NOW()),
  (gen_random_uuid(), 'devops-engineer', 'DevOps Engineer', 'Automate deployments and cloud infrastructure', '🔧', 'Docker, Kubernetes, CI/CD and cloud', NOW(), NOW()),
  (gen_random_uuid(), 'mobile-developer', 'Mobile Developer', 'Build iOS and Android applications', '📱', 'React Native, Flutter and native APIs', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- View current topic categories per career for reference
SELECT c_career.name as career, cat.name as category, COUNT(t.id) as topic_count
FROM career c_career
JOIN category cat ON cat.career_id = c_career.id
JOIN topic t ON t.category_id = cat.id
GROUP BY c_career.name, cat.name
ORDER BY c_career.name, cat.name;
