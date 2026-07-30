import supabase from './db-client.js';
import { cors, requireUser } from './lib/session.js';

const norm = (s) => String(s).trim().toLowerCase();

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('user_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: false })
        .limit(5);
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { roleId, educationSlug, knownBaseline, known } = req.body || {};
    if (!roleId) return res.status(400).json({ error: 'Select a target role.' });
    if (!educationSlug) return res.status(400).json({ error: 'Select your current education level.' });

    const [roleRes, eduRes, reqRes, foundRes] = await Promise.all([
      supabase.from('roles').select('*').eq('id', roleId).single(),
      supabase.from('education_levels').select('*').eq('slug', educationSlug).maybeSingle(),
      supabase.from('role_requirements').select('*').eq('role_id', roleId).maybeSingle(),
      supabase.from('foundation_skills').select('*').order('position', { ascending: true }),
    ]);
    if (roleRes.error) throw roleRes.error;
    if (eduRes.error) throw eduRes.error;
    if (reqRes.error) throw reqRes.error;
    if (foundRes.error) throw foundRes.error;

    const role = roleRes.data;
    const edu = eduRes.data;
    if (!edu) return res.status(400).json({ error: 'Unknown education level.' });

    const entryTier = reqRes.data?.entry_tier ?? 4;
    const entryLabel = reqRes.data?.entry_label ?? 'Undergraduate degree or equivalent portfolio';

    /* -------------------- baseline: what the user confirmed -------------------- */
    const baseline = Array.isArray(edu.baseline_skills) ? edu.baseline_skills : [];
    // Absent an explicit answer, assume the level's full baseline is known.
    const confirmed = Array.isArray(knownBaseline)
      ? baseline.filter((b) => knownBaseline.some((k) => norm(k) === norm(b)))
      : baseline.slice();
    const unconfirmed = baseline.filter((b) => !confirmed.some((c) => norm(c) === norm(b)));

    const extra = Array.isArray(known) ? known : [];
    const effective = Array.from(
      new Set([...confirmed, ...extra].map((s) => String(s).trim()).filter(Boolean)),
    );
    const effectiveSet = new Set(effective.map(norm));

    /* ------------- foundation gaps: unchecked baseline -> learn first ------------- */
    const foundationCatalog = foundRes.data || [];
    const foundationGaps = unconfirmed.map((name) => {
      const meta = foundationCatalog.find((f) => norm(f.name) === norm(name));
      return {
        name,
        weeks: meta?.weeks ?? 2,
        blurb: meta?.blurb ?? `Build a working understanding of ${name} before moving on.`,
        resource_title: meta?.resource_title ?? null,
        resource_url: meta?.resource_url ?? null,
        position: meta?.position ?? 99,
      };
    });
    foundationGaps.sort((a, b) => a.position - b.position);
    const foundationWeeks = foundationGaps.reduce((a, f) => a + (f.weeks || 0), 0);

    /* ------------------------------ role skill gap ------------------------------ */
    const required = Array.isArray(role.required_skills) ? role.required_skills : [];
    const have = required.filter((r) => effectiveSet.has(norm(r.name)));
    const missing = required.filter((r) => !effectiveSet.has(norm(r.name)));

    const totalWeight = required.reduce((a, r) => a + (r.weight || 1), 0) || 1;
    const haveWeight = have.reduce((a, r) => a + (r.weight || 1), 0);
    const skillMatchPct = Math.round((haveWeight / totalWeight) * 100);

    /* ------------------------------- other axes ------------------------------- */
    const tierGap = Math.max(0, entryTier - (edu.tier ?? 1));
    const educationPct = Math.round((Math.min(edu.tier ?? 1, entryTier) / entryTier) * 100);
    const foundationPct = baseline.length
      ? Math.round((confirmed.length / baseline.length) * 100)
      : 100;

    // Education 30% / foundation 20% / role skills 50%.
    const readinessPct = Math.round(educationPct * 0.3 + foundationPct * 0.2 + skillMatchPct * 0.5);

    let verdict = 'ready';
    if (tierGap >= 3) verdict = 'early';
    else if (tierGap === 2) verdict = 'building';
    else if (tierGap === 1) verdict = 'approaching';

    /* -------------------------------- timeline -------------------------------- */
    const skillWeeks = missing.reduce((a, r) => a + (r.weeks || 2), 0);
    const foundationYears = Number(edu.foundation_years ?? 0);
    const studyWeeks = skillWeeks + foundationWeeks;
    const studyYears = Math.round((studyWeeks / 52) * 10) / 10;
    const totalYears =
      Math.round((foundationYears + Math.max(0, studyYears - foundationYears * 0.5)) * 10) / 10;

    const nextSteps = Array.isArray(edu.next_steps) ? edu.next_steps : [];

    const { data: saved, error: insErr } = await supabase
      .from('user_analyses')
      .insert({
        user_id: user.id,
        role_id: roleId,
        role_title: role.title,
        known_skills: effective,
        missing_skills: [...foundationGaps.map((f) => f.name), ...missing.map((m) => m.name)],
        match_pct: readinessPct,
        source: educationSlug,
      })
      .select()
      .single();
    if (insErr) throw insErr;

    await supabase.from('app_users').update({ target_role_id: roleId }).eq('id', user.id);

    return res.status(201).json({
      id: saved.id,
      role,
      education: {
        slug: edu.slug,
        label: edu.label,
        subtitle: edu.subtitle,
        tier: edu.tier,
        baseline,
        confirmed,
        nextSteps,
      },
      entryTier,
      entryLabel,
      tierGap,
      verdict,
      readinessPct,
      skillMatchPct,
      educationPct,
      foundationPct,
      have,
      missing,
      foundationGaps,
      foundationWeeks,
      skillWeeks,
      studyWeeks,
      foundationYears,
      totalYears,
      extras: extra.filter((k) => !required.some((r) => norm(r.name) === norm(k))),
    });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
