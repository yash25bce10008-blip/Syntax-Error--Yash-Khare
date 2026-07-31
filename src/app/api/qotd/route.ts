import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function askGemini(prompt: string): Promise<string> {
  const isAuthKey = GEMINI_KEY.startsWith('AQ.');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let url = GEMINI_URL;
  if (isAuthKey) { headers['Authorization'] = `Bearer ${GEMINI_KEY}`; }
  else { url += `?key=${GEMINI_KEY}`; }
  
  const res = await fetch(url, {
    method: 'POST', headers,
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 1024 } }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const career = searchParams.get('career') || 'Computer Science';
    
    // Get today's date string YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    let { rows } = await pool.query('SELECT * FROM daily_question WHERE date_str = $1', [today]);
    
    if (rows.length === 0) {
      // Generate question
      const prompt = `Generate a 1-question multiple choice "Question of the Day" about: "${career}"

Rules:
- Make it thought-provoking but solvable by a beginner/intermediate.
- 4 options per question (a, b, c, d)
- Mark the correct answer
- Keep it concise

Return ONLY valid JSON:
{
  "q": "What does...",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "answer": "a",
  "explanation": "Because..."
}`;
      
      let question;
      try {
        const text = await askGemini(prompt);
        const clean = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
        question = JSON.parse(clean);
      } catch (geminiErr) {
        console.warn('Gemini failed to generate QOTD, using fallback.');
        const fallbacks = [
          { q: "What does HTTP stand for?", options: { a: "HyperText Transfer Protocol", b: "Hyperlink Transfer Technology", c: "HyperText Transmission Process", d: "Hyper Transfer Text Protocol" }, answer: "a", explanation: "HTTP is the foundation of data communication for the World Wide Web." },
          { q: "Which data structure uses LIFO (Last In, First Out)?", options: { a: "Queue", b: "Stack", c: "Tree", d: "Graph" }, answer: "b", explanation: "A stack is a linear data structure that follows the LIFO principle. The last element added is the first one to be removed." },
          { q: "What is the time complexity of binary search on a sorted array?", options: { a: "O(n)", b: "O(1)", c: "O(log n)", d: "O(n^2)" }, answer: "c", explanation: "Binary search repeatedly divides the search interval in half, leading to a logarithmic time complexity." },
          { q: "In Git, what command is used to save your changes to the local repository?", options: { a: "git push", b: "git add", c: "git pull", d: "git commit" }, answer: "d", explanation: "git commit records the changes to the repository, whereas git push uploads them to a remote server." },
          { q: "Which HTTP method is typically used to update an existing resource completely?", options: { a: "POST", b: "PUT", c: "PATCH", d: "GET" }, answer: "b", explanation: "PUT is used to replace the entire resource, whereas PATCH is used for partial updates." }
        ];
        question = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
      
      await pool.query(
        'INSERT INTO daily_question (date_str, question) VALUES ($1, $2) ON CONFLICT (date_str) DO NOTHING',
        [today, JSON.stringify(question)]
      );
      
      // Re-fetch in case of race condition
      const fresh = await pool.query('SELECT * FROM daily_question WHERE date_str = $1', [today]);
      rows = fresh.rows;
    }
    
    const qotd = rows[0];
    let solved = false;
    
    if (studentId) {
      const sol = await pool.query(
        'SELECT 1 FROM student_daily_question WHERE student_id = $1 AND question_id = $2',
        [studentId, qotd.id]
      );
      solved = sol.rows.length > 0;
    }
    
    return NextResponse.json({ 
      id: qotd.id, 
      question: qotd.question, 
      solved 
    });
  } catch (err) {
    console.error('QOTD error:', err);
    return NextResponse.json({ error: 'Failed to fetch QOTD' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { studentId, questionId, isCorrect } = await req.json();
    if (!studentId || !questionId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    
    if (isCorrect) {
      await pool.query(
        'INSERT INTO student_daily_question (student_id, question_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [studentId, questionId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('QOTD save error:', err);
    return NextResponse.json({ error: 'Failed to save QOTD progress' }, { status: 500 });
  }
}
