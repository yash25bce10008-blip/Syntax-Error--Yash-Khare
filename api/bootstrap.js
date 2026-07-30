import supabase from './db-client.js';
import { cors, publicUser, requireUser } from './lib/session.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = await requireUser(req, res);
    if (!user) return;

    const [rolesRes, skillsRes, eduRes, mineRes, baseRes, foundRes] = await Promise.all([
      supabase.from('roles').select('*').order('id', { ascending: true }),
      supabase.from('skills_catalog').select('*').order('id', { ascending: true }),
      supabase.from('education_levels').select('*').order('tier', { ascending: true }),
      supabase.from('user_education').select('slug').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_baseline').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('foundation_skills').select('*').order('position', { ascending: true }),
    ]);

    for (const r of [rolesRes, skillsRes, eduRes, mineRes, baseRes, foundRes]) {
      if (r.error) throw r.error;
    }

    const savedLevel = mineRes.data?.slug || null;
    const base = baseRes.data;
    // Only reuse saved baseline answers if they belong to the saved level.
    const knownBaseline =
      base && base.level_slug === savedLevel && Array.isArray(base.known_skills)
        ? base.known_skills
        : null;

    return res.status(200).json({
      profile: publicUser(user),
      roles: rolesRes.data || [],
      skills: skillsRes.data || [],
      educationLevels: eduRes.data || [],
      education: savedLevel,
      knownBaseline,
      foundationSkills: foundRes.data || [],
    });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
