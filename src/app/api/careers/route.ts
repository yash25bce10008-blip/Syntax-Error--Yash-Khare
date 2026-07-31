import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT id, slug, name AS title, description, emoji, tagline
      FROM career
      WHERE slug IN ('full-stack-developer','frontend-developer','backend-developer','data-scientist')
      ORDER BY name ASC
    `);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error fetching careers:', err);
    return NextResponse.json({ error: 'Failed to fetch careers' }, { status: 500 });
  }
}
