import supabase from './db-client.js';
import { cors, requireUser } from './lib/session.js';

/**
 * Every user starts from zero: stage 1 is unlocked and in-progress, every
 * later stage is locked, and nothing is pre-completed. Progress is only ever
 * earned through /api/progress, never granted at creation time.
 */
function initialStatus(stage) {
  return stage.position === 1 ? 'in-progress' : 'locked';
}

/** Ensure this user has a progress row for every stage of the role. */
async function ensureProgress(userId, stages) {
  const ids = stages.map((s) => s.id);
  const { data: existing, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .in('stage_id', ids);
  if (error) throw error;

  const have = new Set((existing || []).map((p) => p.stage_id));
  const missing = stages.filter((s) => !have.has(s.id));

  if (missing.length) {
    const rows = missing.map((s) => ({
      user_id: userId,
      stage_id: s.id,
      status: initialStatus(s),
      completed_resources: [],
    }));
    const { data: created, error: insErr } = await supabase.from('user_progress').insert(rows).select();
    if (insErr) throw insErr;
    return [...(existing || []), ...(created || [])];
  }
  return existing || [];
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = await requireUser(req, res);
    if (!user) return;

    const roleId = parseInt(req.query.roleId, 10);
    if (!roleId) return res.status(400).json({ error: 'roleId is required' });

    const { data: stages, error: stageErr } = await supabase
      .from('stages')
      .select('*')
      .eq('role_id', roleId)
      .order('position', { ascending: true });
    if (stageErr) throw stageErr;
    if (!stages || !stages.length) return res.status(200).json({ stages: [] });

    const ids = stages.map((s) => s.id);
    const [progress, resRes, quizRes] = await Promise.all([
      ensureProgress(user.id, stages),
      supabase.from('resources').select('*').in('stage_id', ids).order('position', { ascending: true }),
      supabase.from('quiz_questions').select('*').in('stage_id', ids).order('position', { ascending: true }),
    ]);
    if (resRes.error) throw resRes.error;
    if (quizRes.error) throw quizRes.error;

    const merged = stages.map((s) => {
      const p = progress.find((x) => x.stage_id === s.id);
      const done = Array.isArray(p?.completed_resources) ? p.completed_resources : [];
      const resources = (resRes.data || []).filter((r) => r.stage_id === s.id);
      const progressPct = resources.length
        ? Math.round((resources.filter((r) => done.includes(r.slug)).length / resources.length) * 100)
        : 0;
      return {
        id: s.id,
        role_id: s.role_id,
        position: s.position,
        title: s.title,
        short_title: s.short_title,
        subtitle: s.subtitle,
        xp: s.xp,
        hours: s.hours,
        difficulty: s.difficulty,
        tags: s.tags || [],
        status: p?.status || 'locked',
        completed_resources: done,
        progress: progressPct,
        resources,
        quiz: (quizRes.data || []).filter((q) => q.stage_id === s.id),
      };
    });

    return res.status(200).json({ stages: merged });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
