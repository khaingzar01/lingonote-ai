'use client';

import { useEffect, useRef, useState } from 'react';
import type { Lesson } from '@/types/lesson';
import LessonView from '@/components/LessonView';
import BottomNav from '@/components/BottomNav';
import { saveLesson, getProgressStats, getTodayGoalProgress } from '@/lib/storage';

type Step = 'home' | 'loading' | 'result';

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'home') {
      getProgressStats().then(setStats);
      getTodayGoalProgress().then(setGoal);
    }
  }, [step]);

  async function handleFile(file: File) {
    setError(null);
    const { data, mediaType } = await fileToBase64(file);
    setImagePreview(`data:${mediaType};base64,${data}`);
    setStep('loading');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: data, mediaType })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'AI ခွဲခြမ်းစိတ်ဖြာမှု မအောင်မြင်ပါ။');
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
          capture="environment"
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

              <div className="bg-gradient-to-br from-primaryTint to-white rounded-2xl p-5 border border-surface2 flex flex-col gap-3">
                <div>
                  <div className="display text-xl font-bold leading-snug">
                    သင်ကျောင်းစာအုပ်ကို သင်ခန်းစာအဖြစ် ပြောင်းလိုက်ပါ
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    စာမျက်နှာတစ်ခုကို ဓာတ်ပုံရိုက်ပါ။ AI က ဖတ်ယူပြီး မြန်မာလို ဘာသာပြန်ပေးပါလိမ့်မယ်။
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
                ℹ️ တင်လိုက်တဲ့ဓာတ်ပုံကို Google Gemini AI ဆီ ပို့ပြီး Korean စာသားကို ဖတ်ယူ/ဘာသာပြန်/vocabulary
                ခွဲခြမ်းပေးပါလိမ့်မယ် — ရလဒ်က AI ထုတ်ပေးတဲ့ တကယ့်စာသားဖြစ်ပြီး၊ ပုံနှိပ်စာလုံးမပီသတဲ့ဓာတ်ပုံမျိုးမှာ
                အမှားအယွင်း အနည်းငယ် ဖြစ်နိုင်ပါတယ်။
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
