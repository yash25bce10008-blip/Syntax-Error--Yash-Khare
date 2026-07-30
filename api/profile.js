import supabase from './db-client.js';
import { cors, publicUser, requireUser } from './lib/session.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      return res.status(200).json(publicUser(user));
    }

    if (req.method === 'PUT') {
      const { campus, target_role_id, name, dept } = req.body || {};
      const patch = {};
      if (campus) patch.campus = String(campus).slice(0, 120);
      if (target_role_id) patch.target_role_id = target_role_id;
      if (name) patch.name = String(name).slice(0, 80);
      if (dept) patch.dept = String(dept).slice(0, 80);
      if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nothing to update' });

      const { data, error } = await supabase
        .from('app_users')
        .update(patch)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(publicUser(data));
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
