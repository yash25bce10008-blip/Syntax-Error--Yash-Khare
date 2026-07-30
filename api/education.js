import supabase from './db-client.js';
import { cors, requireUser } from './lib/session.js';

async function readBaseline(userId) {
  const { data, error } = await supabase
    .from('user_baseline')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const [levelsRes, mineRes, baseRes, foundRes] = await Promise.all([
        supabase.from('education_levels').select('*').order('tier', { ascending: true }),
        supabase.from('user_education').select('*').eq('user_id', user.id).maybeSingle(),
        readBaseline(user.id),
        supabase.from('foundation_skills').select('*').order('position', { ascending: true }),
      ]);
      if (levelsRes.error) throw levelsRes.error;
      if (mineRes.error) throw mineRes.error;
      if (foundRes.error) throw foundRes.error;

      return res.status(200).json({
        levels: levelsRes.data || [],
        selected: mineRes.data?.slug || null,
        knownBaseline: Array.isArray(baseRes?.known_skills) ? baseRes.known_skills : null,
        foundationSkills: foundRes.data || [],
      });
    }

    if (req.method === 'PUT') {
      const { slug, knownBaseline } = req.body || {};
      if (!slug) return res.status(400).json({ error: 'Select your current education level.' });

      const { data: level, error: lvlErr } = await supabase
        .from('education_levels')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (lvlErr) throw lvlErr;
      if (!level) return res.status(400).json({ error: 'Unknown education level.' });

      const allowed = new Set((Array.isArray(level.baseline_skills) ? level.baseline_skills : []));
      // Default: assume the whole baseline is known until the user says otherwise.
      const known = Array.isArray(knownBaseline)
        ? knownBaseline.filter((s) => allowed.has(s))
        : Array.from(allowed);

      /* ------------------------------ save level ------------------------------ */
      const { data: existing } = await supabase
        .from('user_education')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_education')
          .update({ slug, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_education').insert({ user_id: user.id, slug });
        if (error) throw error;
      }

      /* -------------------------- save baseline answers -------------------------- */
      const prior = await readBaseline(user.id);
      if (prior) {
        const { error } = await supabase
          .from('user_baseline')
          .update({ level_slug: slug, known_skills: known, updated_at: new Date().toISOString() })
          .eq('id', prior.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_baseline')
          .insert({ user_id: user.id, level_slug: slug, known_skills: known });
        if (error) throw error;
      }

      return res.status(200).json({ selected: slug, knownBaseline: known });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
