import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });

    const { rows } = await pool.query(
      'SELECT * FROM student_roadmap WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );

    return NextResponse.json({ roadmaps: rows, roadmap: rows.length > 0 ? rows[0] : null });
  } catch (err) {
    console.error('Fetch roadmap error:', err);
    return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, careerId, careerTitle, knownTopics, deadlineWeeks, stackChoice, roadmapData } = body;
    
    if (!studentId || !careerId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });



    const { rows } = await pool.query(`
      INSERT INTO student_roadmap (student_id, career_id, career_title, known_topics, deadline_weeks, stack_choice, roadmap_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [studentId, careerId, careerTitle, knownTopics || [], deadlineWeeks, JSON.stringify(stackChoice || null), JSON.stringify(roadmapData || [])]);

    return NextResponse.json({ success: true, saved: rows[0] });
  } catch (err) {
    console.error('Save roadmap error:', err);
    return NextResponse.json({ error: 'Failed to save roadmap' }, { status: 500 });
  }
}
