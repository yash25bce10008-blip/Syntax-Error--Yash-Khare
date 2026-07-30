import supabase from './db-client.js';
import { cors, requireUser } from './lib/session.js';

async function getRow(userId, stageId) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('stage_id', stageId)
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

    /* ------------------ toggle one resource complete/incomplete ------------------ */
    if (req.method === 'PUT') {
      const { stageId, slug, done } = req.body || {};
      if (!stageId || !slug) return res.status(400).json({ error: 'stageId and slug are required' });

      const row = await getRow(user.id, stageId);
      if (!row) return res.status(404).json({ error: 'Progress row not found' });

      const set = new Set(Array.isArray(row.completed_resources) ? row.completed_resources : []);
      if (done) set.add(slug);
      else set.delete(slug);
      const next = Array.from(set);

      const { error } = await supabase.from('user_progress').update({ completed_resources: next }).eq('id', row.id);
      if (error) throw error;

      const { data: resources } = await supabase.from('resources').select('slug').eq('stage_id', stageId);
      const pct = resources && resources.length
        ? Math.round((resources.filter((r) => next.includes(r.slug)).length / resources.length) * 100)
        : 0;

      return res.status(200).json({ stageId, completed_resources: next, progress: pct });
    }

    if (req.method === 'POST') {
      const { stageId, score, total, action } = req.body || {};
      if (!stageId) return res.status(400).json({ error: 'stageId is required' });

      const { data: stage, error: sErr } = await supabase
        .from('stages')
        .select('*')
        .eq('id', stageId)
        .single();
      if (sErr) throw sErr;

      /* ------------------------------ log an attempt ------------------------------ */
      if (action === 'attempt') {
        const { error } = await supabase.from('user_attempts').insert({
          user_id: user.id,
          stage_id: stageId,
          score: score ?? 0,
          total: total ?? 0,
          passed: (score ?? 0) >= Math.ceil((total ?? 3) * 0.66),
        });
        if (error) throw error;
        return res.status(201).json({ ok: true });
      }

      /* --------------------- claim XP + unlock the next stage --------------------- */
      const row = await getRow(user.id, stageId);
      if (!row) return res.status(404).json({ error: 'Progress row not found' });

      const { data: resources } = await supabase.from('resources').select('slug').eq('stage_id', stageId);
      const alreadyDone = row.status === 'completed';

      const { error: upErr } = await supabase
        .from('user_progress')
        .update({
          status: 'completed',
          completed_resources: (resources || []).map((r) => r.slug),
        })
        .eq('id', row.id);
      if (upErr) throw upErr;

      const { data: nextStage } = await supabase
        .from('stages')
        .select('*')
        .eq('role_id', stage.role_id)
        .eq('position', stage.position + 1)
        .maybeSingle();

      if (nextStage) {
        const nextRow = await getRow(user.id, nextStage.id);
        if (nextRow && nextRow.status === 'locked') {
          await supabase.from('user_progress').update({ status: 'in-progress' }).eq('id', nextRow.id);
        }
      }

      let awarded = 0;
      if (!alreadyDone) {
        awarded = stage.xp || 0;
        const xp = (user.xp || 0) + awarded;
        await supabase
          .from('app_users')
          .update({ xp, level: 1 + Math.floor(xp / 1000) })
          .eq('id', user.id);
      }

      return res.status(200).json({
        ok: true,
        unlocked: nextStage ? nextStage.short_title : null,
        xp: awarded,
      });
    }

    /* ------------------------- reset this user's roadmap ------------------------- */
    if (req.method === 'DELETE') {
      const { roleId } = req.body || {};
      if (!roleId) return res.status(400).json({ error: 'roleId is required' });

      const { data: stages, error } = await supabase
        .from('stages')
        .select('*')
        .eq('role_id', roleId)
        .order('position', { ascending: true });
      if (error) throw error;

      // Reset means true zero: stage 1 unlocked and in-progress, rest locked.
      for (const s of stages) {
        const row = await getRow(user.id, s.id);
        const patch = {
          status: s.position === 1 ? 'in-progress' : 'locked',
          completed_resources: [],
        };
        if (row) await supabase.from('user_progress').update(patch).eq('id', row.id);
        else await supabase.from('user_progress').insert({ user_id: user.id, stage_id: s.id, ...patch });
      }

      // Claw back XP that came from the stages being reset.
      const { data: rows } = await supabase
        .from('user_progress')
        .select('stage_id, status')
        .eq('user_id', user.id);
      const completedIds = new Set(
        (rows || []).filter((r) => r.status === 'completed').map((r) => r.stage_id),
      );
      const { data: allStages } = await supabase.from('stages').select('id, xp');
      const xp = (allStages || [])
        .filter((s) => completedIds.has(s.id))
        .reduce((a, s) => a + (s.xp || 0), 0);
      await supabase
        .from('app_users')
        .update({ xp, level: 1 + Math.floor(xp / 1000) })
        .eq('id', user.id);

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
