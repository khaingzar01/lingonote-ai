import { NextRequest, NextResponse } from 'next/server';
import type { Lesson } from '@/types/lesson';
import { getLanguage } from '@/lib/languages';

export const runtime = 'nodejs';
export const maxDuration = 60;

function buildPrompt(languageName: string): string {
  return `You are a ${languageName}-language textbook analysis assistant for a Myanmar (Burmese) speaking learner.
You will be given a photo of a page from a ${languageName} textbook or workbook.
Read every piece of ${languageName} text visible in the photo (dialogue, sentences, word lists, instructions — whatever is there).
Then produce a JSON object, and ONLY a JSON object (no markdown fences, no commentary, no explanation before or after), with this exact shape:

{
  "title": string,                 // a short Myanmar title for this page, e.g. "${languageName} သင်ခန်းစာ - ချိန်းဆိုချက်"
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

Notes on field names (kept the same regardless of language, for compatibility):
- "korean" inside "dialogue" holds the original ${languageName} sentence (not necessarily Korean — always the source-page language).
- "exampleKorean" inside "grammar" holds the original ${languageName} example sentence.
- "pronunciation" should be romanization/reading help appropriate for ${languageName} (e.g. Revised Romanization for Korean, romaji for Japanese, pinyin for Chinese, IPA/simple respelling for English, RTGS for Thai, standard Vietnamese spelling as-is).

Rules:
- "myanmar" fields must be natural, fluent Myanmar (Burmese) translations, not literal word-by-word.
- "speaker" can be "A", "B", or empty string if the text has no dialogue speakers (e.g. a vocabulary list or a single paragraph) — in that case still include each sentence as its own dialogue entry with speaker "".
- IMPORTANT — completeness: transcribe and translate EVERY sentence/line on the page into "dialogue", in the order they appear, even if there are many (10, 20, or more). Do not skip lines, do not summarize, and do not stop early to save space. If the page has multiple sections (e.g. a dialogue AND a separate word list), include all of them as dialogue entries.
- "vocabulary" and "grammar" are a curated subset (not everything) — pick the 5-12 most useful words and 1-4 most useful grammar points — but "dialogue" must be the FULL, complete transcription of the page.
- If the photo has no readable ${languageName} text, return dialogue: [], vocabulary: [], grammar: [], and set title to "စာသား မတွေ့ပါ".
- Respond with raw JSON only, nothing else.`;
}

// Try the primary model first; if Google's servers report "high demand" (503),
// fall back to a lighter model that tends to have more free-tier headroom
// instead of making the learner wait or fail outright. Kept to 2 candidates
// (not 3+) so both attempts together stay well inside the function's time
// limit — a Vercel timeout returns a plain-text page, not JSON, which is
// worse for the user than a clear "AI is busy" message.
const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
const PER_ATTEMPT_TIMEOUT_MS = 25_000;

async function callGemini(url: string, payload: unknown): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PER_ATTEMPT_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

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
    const { imageBase64, mediaType, language } = body as {
      imageBase64?: string;
      mediaType?: string;
      language?: string;
    };

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: 'imageBase64 and mediaType are required.' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(mediaType)) {
      return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 });
    }

    const langOption = getLanguage(language);
    const PROMPT = buildPrompt(langOption.englishName);

    let geminiRes: Response | null = null;
    let lastErrText = '';
    let lastStatus = 502;
    let sawOverload = false;

    const payload = {
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
        responseMimeType: 'application/json',
        // A full textbook page (long dialogue + vocab + grammar, in JSON) can
        // easily need several thousand tokens — a low default limit here was
        // silently truncating the response, which looked like "incomplete
        // translation" to the user even though nothing was actually wrong.
        maxOutputTokens: 8192
      }
    };

    // Try each model in order; a 503 ("model overloaded / high demand") or a
    // per-attempt timeout moves on to the next one instead of failing outright.
    for (const model of GEMINI_MODELS) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const res = await callGemini(geminiUrl, payload);

        if (res.ok) {
          geminiRes = res;
          break;
        }

        lastStatus = res.status;
        lastErrText = await res.text();
        console.error('Gemini API error', model, res.status, lastErrText);

        if (res.status === 503) {
          sawOverload = true;
          continue; // try next model
        }
        break; // some other error — no point trying the next model
      } catch (e: any) {
        // Aborted due to PER_ATTEMPT_TIMEOUT_MS, or a network hiccup.
        console.error('Gemini fetch failed', model, e?.message || e);
        sawOverload = true;
        lastErrText = e?.message || 'request timed out';
        continue;
      }
    }

    if (!geminiRes) {
      return NextResponse.json(
        {
          error: sawOverload
            ? 'AI Server အလွန်လူများနေလို့ ခဏထားပြီး ထပ်စမ်းကြည့်ပါ (ခဏတာပဲ ဖြစ်တတ်ပါတယ်)။'
            : `Gemini API error (${lastStatus}). ${lastErrText.slice(0, 300)}`
        },
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

    lesson.language = langOption.code;

    return NextResponse.json({ lesson });
  } catch (err: any) {
    console.error('analyze route error', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
