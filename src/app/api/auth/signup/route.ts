import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    if (username.length < 3) return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    
    const existing = await pool.query('SELECT id FROM student WHERE username = $1', [username]);
    if (existing.rows.length > 0) return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO student (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hash]
    );
    return NextResponse.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
