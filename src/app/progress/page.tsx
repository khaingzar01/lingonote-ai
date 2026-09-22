'use client';

import { useEffect, useState } from 'react';
import { getProgressStats } from '@/lib/storage';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';
import BottomNav from '@/components/BottomNav';

const emptyStats = {
  vocabCount: 0,
  grammarCount: 0,
  lessonsCompleted: 0,
  accuracy: 0,
  streak: 0,
  weakPoints: [] as { key: string; type: string; count: number }[]
};

export default function ProgressPage() {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getProgressStats().then((s) => {
      setStats(s);
      setLoading(false);
    });
    if (supabaseConfigured) {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    }
  }, []);

  async function logout() {
    if (!supabaseConfigured) return;
    await supabase.auth.signOut();
  }

  return (
    <main className="mm min-h-screen flex justify-center bg-bg py-6 px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-xl overflow-hidden flex flex-col min-h-[80vh]">
        <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
          <div className="display text-lg font-bold">My Progress</div>

          {email && (
            <div className="text-xs text-gray-400 -mt-2">{email}</div>
          )}

          {loading && <div className="text-sm text-gray-400 text-center py-6">ဖတ်နေပါသည်…</div>}

          {!loading && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface2 rounded-xl p-3">
                  <div className="font-extrabold text-primary text-xl">{stats.vocabCount}</div>
                  <div className="text-[11px] text-gray-500">Vocabulary</div>
                </div>
                <div className="bg-surface2 rounded-xl p-3">
                  <div className="font-extrabold text-primary text-xl">{stats.grammarCount}</div>
                  <div className="text-[11px] text-gray-500">Grammar</div>
                </div>
                <div className="bg-surface2 rounded-xl p-3">
                  <div className="font-extrabold text-primary text-xl">{stats.lessonsCompleted}</div>
                  <div className="text-[11px] text-gray-500">Lessons Completed</div>
                </div>
                <div className="bg-surface2 rounded-xl p-3">
                  <div className="font-extrabold text-primary text-xl">{stats.accuracy}%</div>
                  <div className="text-[11px] text-gray-500">Quiz Accuracy</div>
                </div>
              </div>

              <div className="bg-primaryTint rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <div className="font-extrabold text-primaryDark">{stats.streak} days</div>
                  <div className="text-[11px] text-gray-500">Study Streak</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="font-bold text-sm">Weak Points</div>
                {stats.weakPoints.length === 0 && (
                  <div className="text-xs text-gray-400 bg-surface2 rounded-xl p-3">
                    Quiz/Exam ဖြေပြီးရင် မှားနေတဲ့ အချက်တွေ ဒီမှာ ပေါ်လာပါလိမ့်မယ်။
                  </div>
                )}
                {stats.weakPoints.map((w) => (
                  <div
                    key={w.key}
                    className="flex justify-between items-center bg-white border border-surface2 rounded-xl px-3 py-2"
                  >
                    <span className="text-sm font-medium">{w.key}</span>
                    <span className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-1 rounded-full">
                      {w.count >= 3 ? 'High' : w.count === 2 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                ))}
              </div>

              {supabaseConfigured && (
                <button
                  onClick={logout}
                  className="border border-surface2 text-gray-500 rounded-xl py-3 font-bold text-sm mt-2"
                >
                  Log out
                </button>
              )}
            </>
          )}
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
