import supabase from '../db-client.js';

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    user_id: u.user_id,
    name: u.name,
    dept: u.dept,
    campus: u.campus,
    xp: u.xp,
    level: u.level,
    streak: u.streak,
    initials: u.initials,
    target_role_id: u.target_role_id,
  };
}

/** Resolve the signed-in user from the Authorization header, or null. */
export async function getUser(req) {
  const raw = req.headers.authorization || '';
  const token = raw.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const { data: session, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('token', token)
    .maybeSingle();
  if (error || !session) return null;

  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
    await supabase.from('user_sessions').delete().eq('token', token);
    return null;
  }

  const { data: user } = await supabase.from('app_users').select('*').eq('id', session.user_id).maybeSingle();
  return user || null;
}

/** Guard helper: returns the user or writes a 401 and returns null. */
export async function requireUser(req, res) {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: 'Please sign in to continue.' });
    return null;
  }
  return user;
}

export default function handler(_req, res) {
  cors(res);
  res.status(404).json({ error: 'Not found' });
}
