
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'career_pipeline',
  password: 'abcd@1234',
  port: 5432,
});

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_question (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date_str VARCHAR(10) UNIQUE NOT NULL, -- e.g. '2026-07-31'
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
    `);
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    pool.end();
  }
}
init();
