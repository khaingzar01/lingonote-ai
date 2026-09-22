'use client';

import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendLink() {
    setError(null);
    setSending(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    });
    setSending(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  if (!supabaseConfigured) {
    return (
      <main className="mm min-h-screen flex justify-center bg-bg py-6 px-4">
        <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-xl p-6 flex flex-col gap-3 my-auto">
          <div className="display text-lg font-bold">Setup လိုအပ်ပါတယ်</div>
          <div className="text-sm text-gray-500 leading-relaxed">
            Login/Cloud sync feature ကို သုံးဖို့ Supabase project တစ်ခု ချိတ်ဆက်ဖို့ လိုပါတယ်။ README.md ထဲက
            "Supabase Login / Cloud Sync ချိတ်ဆက်နည်း" အပိုင်းအတိုင်း လိုက်လုပ်ပြီး Vercel Environment Variables
            မှာ <code>NEXT_PUBLIC_SUPABASE_URL</code> နဲ့ <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ကို
            ထည့်ပေးပါ။
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mm min-h-screen flex justify-center items-center bg-bg">
        <div className="w-8 h-8 rounded-full border-4 border-surface2 border-t-primary animate-spin" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mm min-h-screen flex justify-center bg-bg py-6 px-4">
        <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-xl p-6 flex flex-col gap-4 my-auto">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-2xl">🌱</span>
            <span className="display text-xl font-bold">LingoNote AI</span>
          </div>
          {!sent ? (
            <>
              <div className="text-sm text-gray-500 text-center">
                Email လိပ်စာ ထည့်ပါ — login link တစ်ခု ပို့ပေးပါမယ် (password မလိုပါ)။
              </div>
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border border-surface2 rounded-xl px-4 py-3 text-sm"
              />
              <button
                onClick={sendLink}
                disabled={!email || sending}
                className="bg-primary disabled:opacity-50 text-white rounded-2xl py-3 font-bold"
              >
                {sending ? 'ပို့နေသည်…' : 'Login Link ပို့ရန်'}
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-600 text-center bg-primaryTint rounded-xl p-4">
              📧 {email} ကို login link ပို့လိုက်ပါပြီ — email ကိုဖွင့်ပြီး link ကို နှိပ်ပါ။
            </div>
          )}
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
