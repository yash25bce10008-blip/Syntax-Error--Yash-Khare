import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { studentId, topicId, status } = await req.json();
    if (!studentId || !topicId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    
    await pool.query(`
      INSERT INTO student_topic_progress (student_id, topic_id, status, completed_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, topic_id) DO UPDATE 
        SET status = $3, completed_at = $4
    `, [studentId, topicId, status, status === 'done' ? new Date() : null]);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Progress error:', err);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  if (!studentId) return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
  
  const { rows } = await pool.query(
    'SELECT topic_id, status, completed_at FROM student_topic_progress WHERE student_id = $1',
    [studentId]
  );
  return NextResponse.json({ progress: rows });
}
