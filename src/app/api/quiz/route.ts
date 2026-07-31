import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function askGemini(prompt: string): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let url = `${GEMINI_URL}?key=${GEMINI_KEY}`;
  
  const res = await fetch(url, {
    method: 'POST', headers,
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function POST(req: Request) {
  try {
    const { topicId, topicName, studentId, answers } = await req.json();
    
    // If answers provided → save result
    if (answers && studentId) {
      const score = answers.filter((a: any) => a.correct).length;
      await pool.query(
        'INSERT INTO quiz_attempt (student_id, topic_id, score, total, answers) VALUES ($1, $2, $3, 5, $4)',
        [studentId, topicId, score, JSON.stringify(answers)]
      );
      return NextResponse.json({ success: true, score, total: 5 });
    }
    
    // Otherwise → generate quiz
    const prompt = `Generate a 5-question multiple choice quiz about: "${topicName}"

Rules:
- Each question tests practical understanding, not definitions
- 4 options per question (a, b, c, d)
- Mark the correct answer
- Keep questions concise

Return ONLY valid JSON:
{
  "questions": [
    {
      "q": "What does...",
      "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
      "answer": "a",
      "explanation": "Because..."
    }
  ]
}`;
    
    const text = await askGemini(prompt);
    const clean = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const quiz = JSON.parse(clean);
    return NextResponse.json(quiz);
  } catch (err) {
    console.error('Quiz error:', err);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
