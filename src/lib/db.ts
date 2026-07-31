import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'career_pipeline',
  user: 'postgres',
  password: 'abcd@1234',
});

export default pool;
