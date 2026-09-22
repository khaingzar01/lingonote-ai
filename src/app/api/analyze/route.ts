import { NextRequest, NextResponse } from 'next/server';
import type { Lesson } from '@/types/lesson';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PROMPT = `You are a Korean-language textbook analysis assistant for a Myanmar (Burmese) speaking learner.
You will be given a photo of a page from a Korean textbook or workbook.
Read every piece of Korean text visible in the photo (dialogue, sentences, word lists, instructions — whatever is there).
Then produce a JSON object, and ONLY a JSON object (no markdown fences, no commentary, no explanation before or after), with this exact shape:

{
  "title": string,                 // a short Myanmar title for this page, e.g. "Korean သင်ခန်းစာ - ချိန်းဆိုချက်"
  "dialogue": [                    // every sentence/line found on the page, in order
    { "speaker": string, "korean": string, "myanmar": string }
  ],
  "vocabulary": [                  // 5-12 key vocabulary items worth learning from this page
    { "word": string, "pronunciation": string, "partOfSpeech": string, "meaningMyanmar": string }
  ],
  "grammar": [                     // 1-4 grammar points that appear on the page
    { "pattern": string, "meaningMyanmar": string, "exampleKorean": string, "exampleMyanmar": string }
  ]
}

Rules:
- "myanmar" fields must be natural, fluent Myanmar (Burmese) translations, not literal word-by-word.
- "speaker" can be "A", "B", or empty string if the text has no dialogue speakers (e.g. a vocabulary list or a single paragraph) — in that case still include each sentence as its own dialogue entry with speaker "".
- If the photo has no readable Korean text, return dialogue: [], vocabulary: [], grammar: [], and set title to "စာသား မတွေ့ပါ".
- Respond with raw JSON only, nothing else.`;

const GEMINI_MODEL = 'gemini-3.6-flash';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { imageBase64, mediaType } = body as { imageBase64?: string; mediaType?: string };

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: 'imageBase64 and mediaType are required.' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(mediaType)) {
      return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              {
                inline_data: {
                  mime_type: mediaType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
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

    let lesson: Lesson;
    try {
      lesson = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse AI JSON response.', raw }, { status: 502 });
    }

    return NextResponse.json({ lesson });
  } catch (err: any) {
    console.error('analyze route error', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
