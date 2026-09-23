'use client';

import { useEffect, useRef, useState } from 'react';
import type { Lesson } from '@/types/lesson';
import LessonView from '@/components/LessonView';
import BottomNav from '@/components/BottomNav';
import { saveLesson, getProgressStats, getTodayGoalProgress } from '@/lib/storage';
import { LANGUAGES, DEFAULT_LANGUAGE_CODE, getLanguage } from '@/lib/languages';

type Step = 'home' | 'loading' | 'result';

const LANGUAGE_STORAGE_KEY = 'lingonote_language';

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [prefix, data] = result.split(',');
      const mediaType = prefix.match(/data:(.*);base64/)?.[1] || file.type;
      resolve({ data, mediaType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Phone camera photos can be 4-8MB+, which is bigger than Vercel's ~4.5MB
// serverless request body limit. Resize/compress in the browser first so
// the upload always stays well under that limit.
const MAX_DIMENSION = 1900; // a bit higher so small textbook print stays legible for OCR
const MAX_BASE64_BYTES = 3.5 * 1024 * 1024; // leave headroom under 4.5MB

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function compressImage(file: File): Promise<{ data: string; mediaType: string }> {
  const { data: originalData, mediaType: originalMediaType } = await fileToBase64(file);

  // Non-image files (shouldn't normally happen since input accepts images only)
  // or very small files: send as-is.
  if (!file.type.startsWith('image/')) {
    return { data: originalData, mediaType: originalMediaType };
  }

  const img = await loadImage(`data:${originalMediaType};base64,${originalData}`);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return { data: originalData, mediaType: originalMediaType };
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.85;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  let data = dataUrl.split(',')[1];

  while (data.length > MAX_BASE64_BYTES && quality > 0.4) {
    quality -= 0.15;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    data = dataUrl.split(',')[1];
  }

  return { data, mediaType: 'image/jpeg' };
}

export default function Home() {
  const [step, setStep] = useState<Step>('home');
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [stats, setStats] = useState({
    vocabCount: 0,
    grammarCount: 0,
    lessonsCompleted: 0,
    accuracy: 0,
    streak: 0
  });
  const [goal, setGoal] = useState({ quizToday: false, studiedToday: false });
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE_CODE);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'home') {
      getProgressStats().then(setStats);
      getTodayGoalProgress().then(setGoal);
    }
  }, [step]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved) setLanguage(saved);
    } catch {
      // localStorage unavailable (private mode etc.) — just keep the default.
    }
  }, []);

  function selectLanguage(code: string) {
    setLanguage(code);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }

  async function handleFile(file: File) {
    setError(null);
    setStep('loading');
    try {
      const { data, mediaType } = await compressImage(file);
      setImagePreview(`data:${mediaType};base64,${data}`);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: data, mediaType, language })
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        // Server returned something that isn't JSON (e.g. a platform error page).
        throw new Error(
          res.status === 413
            ? 'ဓာတ်ပုံ အရွယ်အစား ကြီးလွန်းနေပါတယ် — ဓာတ်ပုံအသေးလေးနဲ့ ထပ်စမ်းကြည့်ပါ။'
            : 'Server ကနေ အဖြေ မှန်ကန်စွာ ပြန်မလာပါ — ခဏနေမှ ထပ်စမ်းကြည့်ပါ။'
        );
      }

      if (!res.ok) {
        throw new Error(json?.error || 'AI ခွဲခြမ်းစိတ်ဖြာမှု မအောင်မြင်ပါ။');
      }
      await saveLesson(json.lesson);
      setLesson(json.lesson);
      setStep('result');
    } catch (e: any) {
      setError(e.message || 'တစ်ခုခု မှားယွင်းသွားပါတယ်။');
      setStep('home');
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function reset() {
    setStep('home');
    setLesson(null);
    setImagePreview(null);
    setError(null);
  }

  return (
    <main className="mm min-h-screen flex justify-center bg-bg py-6 px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-xl overflow-hidden flex flex-col min-h-[80vh]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onFileChange}
        />

        {step === 'home' && (
          <div className="flex flex-col flex-1">
            <div className="flex flex-col gap-5 p-5 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌱</span>
                <span className="display text-lg font-bold">LingoNote AI</span>
              </div>

              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}

              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-gray-400 uppercase">ဘာသာစကား ရွေးပါ</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => selectLanguage(l.code)}
                      className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold border flex items-center gap-1 ${
                        language === l.code
                          ? 'bg-primary text-white border-primary'
                          : 'border-surface2 text-gray-500 bg-white'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.labelMyanmar}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-primaryTint to-white rounded-2xl p-5 border border-surface2 flex flex-col gap-3">
                <div>
                  <div className="display text-xl font-bold leading-snug">
                    သင်ကျောင်းစာအုပ်ကို သင်ခန်းစာအဖြစ် ပြောင်းလိုက်ပါ
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {getLanguage(language).labelMyanmar} စာမျက်နှာတစ်ခုကို ဓာတ်ပုံရိုက်ပါ။ AI က ဖတ်ယူပြီး
                    မြန်မာလို ဘာသာပြန်ပေးပါလိမ့်မယ်။
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2"
                >
                  📷 စာမျက်နှာဓာတ်ပုံတင်ရန်
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-surface2 rounded-xl py-3 flex flex-col items-center gap-1 text-[11px] font-bold text-gray-600"
                >
                  <span className="text-lg">📷</span> Camera
                </button>
                <a
                  href="/lessons"
                  className="bg-surface2 rounded-xl py-3 flex flex-col items-center gap-1 text-[11px] font-bold text-gray-600"
                >
                  <span className="text-lg">📖</span> My Lessons
                </a>
                <a
                  href="/exam"
                  className="bg-surface2 rounded-xl py-3 flex flex-col items-center gap-1 text-[11px] font-bold text-gray-600"
                >
                  <span className="text-lg">📝</span> Exam
                </a>
              </div>

              <div className="border border-surface2 rounded-2xl p-4 flex flex-col gap-3">
                <div className="font-bold text-sm">ယနေ့ ပန်းတိုင်</div>
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full border-4 border-primaryTint flex items-center justify-center shrink-0">
                    <span className="font-extrabold text-primary text-sm">
                      {(goal.studiedToday ? 1 : 0) + (goal.quizToday ? 1 : 0)}/2
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-xs">
                    <div className={goal.studiedToday ? 'text-green-600 font-bold' : 'text-gray-400'}>
                      {goal.studiedToday ? '✓' : '○'} ဒီနေ့ စာအုပ်ဓာတ်ပုံတင်ခြင်း
                    </div>
                    <div className={goal.quizToday ? 'text-green-600 font-bold' : 'text-gray-400'}>
                      {goal.quizToday ? '✓' : '○'} Quiz/Exam တစ်ခု ဖြေခြင်း
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-surface2 rounded-xl py-3">
                  <div className="font-extrabold text-primary text-lg">{stats.vocabCount}</div>
                  <div className="text-[10px] text-gray-500">Vocabulary</div>
                </div>
                <div className="bg-surface2 rounded-xl py-3">
                  <div className="font-extrabold text-primary text-lg">{stats.grammarCount}</div>
                  <div className="text-[10px] text-gray-500">Grammar</div>
                </div>
                <div className="bg-surface2 rounded-xl py-3">
                  <div className="font-extrabold text-primary text-lg">🔥{stats.streak}</div>
                  <div className="text-[10px] text-gray-500">Day Streak</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 leading-relaxed bg-surface2 rounded-xl p-3">
                ℹ️ တင်လိုက်တဲ့ဓာတ်ပုံကို Google Gemini AI ဆီ ပို့ပြီး {getLanguage(language).labelMyanmar} စာသားကို
                ဖတ်ယူ/ဘာသာပြန်/vocabulary ခွဲခြမ်းပေးပါလိမ့်မယ် — ရလဒ်က AI ထုတ်ပေးတဲ့ တကယ့်စာသားဖြစ်ပြီး၊
                ပုံနှိပ်စာလုံးမပီသတဲ့ဓာတ်ပုံမျိုးမှာ အမှားအယွင်း အနည်းငယ် ဖြစ်နိုင်ပါတယ်။
              </div>
            </div>
            <BottomNav />
          </div>
        )}

        {step === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            {imagePreview && (
              <img src={imagePreview} alt="" className="w-40 h-28 object-cover rounded-xl border border-surface2" />
            )}
            <div className="w-8 h-8 rounded-full border-4 border-surface2 border-t-primary animate-spin" />
            <div className="font-bold text-sm">AI က ဓာတ်ပုံကို ခွဲခြမ်းစိတ်ဖြာနေပါသည်…</div>
            <div className="text-gray-400 text-xs">(စာသားထုတ်ယူခြင်း၊ ဘာသာပြန်ခြင်း၊ vocabulary ရွေးထုတ်ခြင်း)</div>
          </div>
        )}

        {step === 'result' && lesson && <LessonView lesson={lesson} imagePreview={imagePreview} onBack={reset} />}
      </div>
    </main>
  );
}
