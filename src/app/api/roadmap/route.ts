import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const YT_KEY = process.env.YOUTUBE_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function askGemini(prompt: string): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let url = `${GEMINI_URL}?key=${GEMINI_KEY}`;

  const res = await fetch(url, {
    method: 'POST', headers,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.2, 
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      },
    }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Gemini ${res.status}: ${err}`); }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function searchYouTube(query: string): Promise<{ url: string; title: string; thumbnail: string } | null> {
  if (!YT_KEY) return null;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${YT_KEY}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;
    return {
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || '',
    };
  } catch { return null; }
}

async function searchYouTubePlaylist(query: string): Promise<{ url: string; title: string; thumbnail: string } | null> {
  if (!YT_KEY) return null;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&maxResults=1&q=${encodeURIComponent(query)}&key=${YT_KEY}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;
    return {
      url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || '',
    };
  } catch { return null; }
}

export async function POST(req: Request) {
  try {
    const { careerId, knownTopics, learningStyle, deadlineWeeks, stackChoice } = await req.json();
    const isTight = deadlineWeeks > 0 && deadlineWeeks <= 4;
    if (!careerId) return NextResponse.json({ error: 'Missing careerId' }, { status: 400 });

    // 1. Get career info
    const { rows: careerRows } = await pool.query('SELECT * FROM career WHERE id = $1', [careerId]);
    const career = careerRows[0];
    if (!career) return NextResponse.json({ error: 'Career not found' }, { status: 404 });

    // 2. Ask Gemini to generate a STACK-SPECIFIC ordered roadmap
    const knownStr = knownTopics?.length > 0 ? knownTopics.join(', ') : 'nothing';
    const stackName = stackChoice?.name || career.title;
    const stackTags = stackChoice?.tags?.join(', ') || '';
    const deadlineStr = deadlineWeeks === 0
      ? 'no deadline (full depth)'
      : isTight
        ? `${deadlineWeeks} week${deadlineWeeks > 1 ? 's' : ''} (tight — use crash courses, minimize topics)`
        : `${deadlineWeeks} weeks (balanced depth)`;

    const geminiPrompt = `You are a senior tech educator building a learning roadmap.

Career goal: ${stackName}
Tech stack: ${stackTags}
Student already knows: ${knownStr}
Deadline: ${deadlineStr}

Create a structured, ordered learning roadmap SPECIFICALLY for ${stackName}.
- Skip any topics the student already knows
- Focus ONLY on technologies in the stack: ${stackTags}
- ${isTight ? 'Keep it SHORT — max 8-10 topics, prioritize the most essential ones only' : 'Be comprehensive — include all important topics (12-18 topics)'}
- Group topics into logical phases (e.g., Foundations, Core Backend, Database, Deployment)
- Each topic should be a specific, searchable concept (e.g. "Java Spring Boot REST API" not just "Java")

Return ONLY valid JSON in this exact format (no explanation, no markdown):
{
  "phases": [
    {
      "name": "Phase Name",
      "slug": "phase-slug",
      "topics": [
        {
          "name": "Topic Name",
          "description": "One line description of what they will learn",
          "ytSearchQuery": "best YouTube search query to find a good tutorial/course for this topic"
        }
      ]
    }
  ]
}`;

    let phases: Array<{ name: string; slug: string; topics: Array<{ name: string; description: string; ytSearchQuery: string }> }> = [];

    try {
      const text = await askGemini(geminiPrompt);
      const clean = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const parsed = JSON.parse(clean);
      phases = parsed.phases || [];
    } catch (err) {
      console.warn('Gemini failed, using DB fallback:', err);
      // Fallback: use DB topics for this career
      const { rows } = await pool.query(`
        SELECT t.id, t.slug, t.canonical_name, t.description, t.order_index,
               c.name AS category_name, c.slug AS category_slug, c.display_order
        FROM topic t JOIN category c ON t.category_id = c.id
        WHERE t.career_id = $1 ORDER BY c.display_order, t.order_index
      `, [careerId]);

      const knownLower = (knownTopics || []).map((k: string) => k.toLowerCase());
      const filtered = rows.filter((t: any) => !knownLower.some((k: string) =>
        t.canonical_name.toLowerCase().includes(k) || t.slug.includes(k.replace(/[\s.]/g, ''))
      ));

      return NextResponse.json({
        career,
        roadmap: filtered.map((t: any) => ({ ...t, ytVideo: null, ytPlaylist: null })),
        deadlineWeeks, isTight,
      });
    }

    // 3. For each topic, check DB first, then optionally search YouTube
    const roadmap = [];
    for (const phase of phases) {
      for (const topic of phase.topics) {
        // Try to find a matching topic in DB (fuzzy match)
        const nameLower = topic.name.toLowerCase();
        const { rows: dbMatches } = await pool.query(`
          SELECT t.id, t.slug, t.canonical_name, t.description,
                 t.yt_playlist_url, t.yt_playlist_title, t.thumbnail_url,
                 t.docs_url, t.github_url, t.practice_url
          FROM topic t
          WHERE t.career_id = $1
            AND (
              LOWER(t.canonical_name) LIKE $2
              OR LOWER(t.slug) LIKE $3
            )
          LIMIT 1
        `, [careerId, `%${nameLower.split(' ')[0]}%`, `%${nameLower.split(' ')[0].replace(/\s/g, '-')}%`]);

        const dbTopic = dbMatches[0];

        // Search YouTube for this topic
        let ytVideo = null;
        let ytPlaylist = null;

        if (YT_KEY) {
          if (isTight) {
            // For tight deadlines: search for crash course / one-shot video
            ytVideo = await searchYouTube(`${topic.ytSearchQuery} crash course one shot 2024`);
          } else {
            // For relaxed deadlines: search for a full playlist
            ytPlaylist = await searchYouTubePlaylist(`${topic.ytSearchQuery} full course playlist 2024`);
            if (!ytPlaylist) {
              ytVideo = await searchYouTube(`${topic.ytSearchQuery} full tutorial 2024`);
            }
          }
        }

        roadmap.push({
          // Use DB id if found (so progress tracking works), else generate a slug-based id
          id: dbTopic?.id || `dynamic-${phase.slug}-${topic.name.toLowerCase().replace(/\s+/g, '-')}`,
          slug: topic.name.toLowerCase().replace(/\s+/g, '-'),
          canonical_name: topic.name,
          description: topic.description,
          category_name: phase.name,
          category_slug: phase.slug,
          // Resources: prefer DB, then fall back to fresh YT search
          yt_playlist_url: ytPlaylist?.url || ytVideo?.url || dbTopic?.yt_playlist_url || null,
          yt_playlist_title: ytPlaylist?.title || ytVideo?.title || dbTopic?.yt_playlist_title || null,
          thumbnail_url: ytPlaylist?.thumbnail || ytVideo?.thumbnail || dbTopic?.thumbnail_url || null,
          docs_url: dbTopic?.docs_url || null,
          github_url: dbTopic?.github_url || null,
          practice_url: dbTopic?.practice_url || null,
          isGenerated: !dbTopic, // flag so frontend knows it's AI-generated
        });
      }
    }

    return NextResponse.json({ career, roadmap, deadlineWeeks, isTight });

  } catch (err) {
    console.error('Roadmap error:', err);
    return NextResponse.json({ error: 'Failed to build roadmap' }, { status: 500 });
  }
}
