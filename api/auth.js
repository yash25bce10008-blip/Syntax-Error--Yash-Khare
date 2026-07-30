import crypto from 'node:crypto';
import supabase from './db-client.js';
import { cors, getUser, publicUser } from './lib/session.js';

const SESSION_DAYS = 30;
const ID_RE = /^[a-zA-Z0-9._-]{3,24}$/;

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password, salt, expected) {
  const actual = hashPassword(password, salt);
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  const { error } = await supabase.from('user_sessions').insert({
    token,
    user_id: userId,
    expires_at: expires,
  });
  if (error) throw error;
  return { token, expires_at: expires };
}

function initialsFrom(name, fallback) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return String(fallback || 'US').slice(0, 2).toUpperCase();
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // Session restore on page load
    if (req.method === 'GET') {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'No active session' });
      return res.status(200).json({ user: publicUser(user) });
    }

    if (req.method === 'DELETE') {
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
      if (token) await supabase.from('user_sessions').delete().eq('token', token);
      return res.status(200).json({ ok: true });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { action, userId, password, name, dept, campus } = req.body || {};
    const uid = String(userId || '').trim().toLowerCase();

    if (action === 'check') {
      if (!uid) return res.status(400).json({ error: 'Enter a user ID.' });
      const { data } = await supabase.from('app_users').select('id').eq('user_id', uid).maybeSingle();
      return res.status(200).json({ exists: !!data });
    }

    if (!uid) return res.status(400).json({ error: 'User ID is required.' });
    if (!password) return res.status(400).json({ error: 'Password is required.' });

    /* ------------------------------- SIGN UP ------------------------------- */
    if (action === 'signup') {
      if (!ID_RE.test(uid)) {
        return res.status(400).json({
          error: 'User ID must be 3–24 characters, letters/numbers/._- only.',
        });
      }
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const { data: existing } = await supabase
        .from('app_users')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();
      if (existing) {
        return res.status(409).json({ error: 'That user ID is already taken. Try signing in instead.' });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const displayName = String(name || '').trim() || uid;

      const { data: created, error: insErr } = await supabase
        .from('app_users')
        .insert({
          user_id: uid,
          password_hash: hashPassword(password, salt),
          salt,
          name: displayName,
          dept: String(dept || '').trim() || 'Computer Science Dept',
          campus: String(campus || '').trim() || 'XYZ Institute of Technology',
          xp: 0,
          level: 1,
          streak: 1,
          initials: initialsFrom(displayName, uid),
          target_role_id: 1,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      const session = await createSession(created.id);
      return res.status(201).json({ user: publicUser(created), ...session });
    }

    /* -------------------------------- LOGIN -------------------------------- */
    if (action === 'login') {
      const { data: user } = await supabase.from('app_users').select('*').eq('user_id', uid).maybeSingle();

      if (!user) {
        return res.status(404).json({
          error: 'No account found for that user ID. Please sign up first.',
          code: 'NO_ACCOUNT',
        });
      }
      if (!verifyPassword(password, user.salt, user.password_hash)) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      const session = await createSession(user.id);
      return res.status(200).json({ user: publicUser(user), ...session });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: err.message });
  }
}
