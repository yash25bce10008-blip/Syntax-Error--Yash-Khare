import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { rows } = await pool.query(`
      SELECT 
        id, canonical_name, description,
        yt_playlist_url, yt_playlist_title, thumbnail_url,
        docs_url, github_url, practice_url
      FROM topic
      WHERE id = $1
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({ topic: rows[0] });
  } catch (err) {
    console.error('Error fetching topic resources:', err);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
