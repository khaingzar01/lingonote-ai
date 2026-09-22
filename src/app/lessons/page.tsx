'use client';

import { useEffect, useState } from 'react';
import type { SavedLesson } from '@/lib/storage';
import { getLessons } from '@/lib/storage';
import LessonView from '@/components/LessonView';
import BottomNav from '@/components/BottomNav';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<SavedLesson[]>([]);
  const [active, setActive] = useState<SavedLesson | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessons().then((l) => {
      setLessons(l);
      setLoading(false);
    });
  }, []);

  if (active) {
    return (
      <main className="mm min-h-screen flex justify-center bg-bg py-6 px-4">
        <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-xl overflow-hidden flex flex-col min-h-[80vh]">
          <LessonView lesson={active} onBack={() => setActive(null)} />
        </div>
      </main>
    );
  }

  return (
    <main className="mm min-h-screen flex justify-center bg-bg py-6 px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-xl overflow-hidden flex flex-col min-h-[80vh]">
        <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
          <div className="display text-lg font-bold">သင်ခန်းစာများ</div>
          {loading && <div className="text-sm text-gray-400 text-center py-6">ဖတ်နေပါသည်…</div>}
          {!loading && lessons.length === 0 && (
            <div className="text-sm text-gray-400 bg-surface2 rounded-xl p-4 text-center">
              သင်ခန်းစာ မရှိသေးပါ — Home မှာ ဓာတ်ပုံတင်ပြီး ပထမဆုံးသင်ခန်းစာ ဖန်တီးလိုက်ပါ။
            </div>
          )}
          {lessons.map((l) => (
            <button
              key={l.id}
              onClick={() => setActive(l)}
              className="bg-white border border-surface2 rounded-xl p-3 flex flex-col gap-1 text-left"
            >
              <div className="font-bold text-sm">{l.title}</div>
              <div className="text-[11px] text-gray-400">
                {new Date(l.createdAt).toLocaleDateString()} · Vocabulary {l.vocabulary.length} · Grammar{' '}
                {l.grammar.length}
              </div>
            </button>
          ))}
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
