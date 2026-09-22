import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const GEMINI_MODEL = 'gemini-3.6-flash';

const SYSTEM = `You are a friendly, patient Korean conversation partner helping a Myanmar (Burmese) speaking learner practice spoken Korean.
The learner will send you what they said in Korean (transcribed from speech, may contain small recognition errors).
Reply with a JSON object only, no markdown, in this exact shape:
{
  "koreanReply": string,       // your natural, short (1-2 sentence) reply in Korean, continuing the conversation
  "myanmarMeaning": string,    // Myanmar translation of your koreanReply
  "feedbackMyanmar": string    // one short, encouraging sentence in Myanmar about the learner's Korean (grammar/word choice), or a gentle correction if there was a clear mistake; empty string if there is nothing to note
}
Keep the conversation casual and appropriate for a beginner-to-intermediate learner. Vary the topic naturally (daily life, plans, food, hobbies, etc.) if the learner doesn't lead.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const body = await req.json();
    const { history, message } = body as { history?: { role: string; text: string }[]; message?: string };

    if (!message) {
      return NextResponse.json({ error: 'message is required.' }, { status: 400 });
    }

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM }] },
      ...(history || [])
        .filter((h) => h.text)
        .map((h) => ({
          role: h.role === 'ai' ? 'model' : 'user',
          parts: [{ text: h.text }]
        })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.6,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error', geminiRes.status, errText);
      return NextResponse.json(
        { error: `Gemini API error (${geminiRes.status}). ${errText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const geminiJson = await geminiRes.json();
    const raw: string = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI response did not contain valid JSON.', raw }, { status: 502 });
    }

    let reply: { koreanReply: string; myanmarMeaning: string; feedbackMyanmar: string };
    try {
      reply = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse AI JSON response.', raw }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('speak route error', err);
    return NextResponse.json({ error: err?.message || 'Unexpected server error.' }, { status: 500 });
  }
}
