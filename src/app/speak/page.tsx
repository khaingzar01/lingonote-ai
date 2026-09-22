'use client';

import { useRef, useState } from 'react';
import BottomNav from '@/components/BottomNav';

interface Bubble {
  role: 'user' | 'ai';
  korean: string;
  myanmar?: string;
  feedback?: string;
}

export default function SpeakPage() {
  const [bubbles, setBubbles] = useState<Bubble[]>([
    {
      role: 'ai',
      korean: '안녕하세요! 오늘 기분이 어때요?',
      myanmar: 'မင်္ဂလာပါ! ဒီနေ့ စိတ်ခံစားချက် ဘယ်လိုရှိလဲ?'
    }
  ]);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  function speak(text: string) {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      window.speechSynthesis.speak(utter);
    } catch {
      // speech synthesis not available; ignore silently
    }
  }

  async function sendToAI(transcript: string, priorBubbles: Bubble[]) {
    setBusy(true);
    setBubbles((b) => [...b, { role: 'user', korean: transcript }]);
    try {
      const history = priorBubbles.map((b) => ({ role: b.role, text: b.korean }));
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message: transcript })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'AI မှ အဖြေမရနိုင်ပါ။');
      const { koreanReply, myanmarMeaning, feedbackMyanmar } = json.reply;
      setBubbles((b) => [...b, { role: 'ai', korean: koreanReply, myanmar: myanmarMeaning, feedback: feedbackMyanmar }]);
      speak(koreanReply);
    } catch (e: any) {
      setBubbles((b) => [...b, { role: 'ai', korean: '', myanmar: `⚠️ ${e.message || 'အမှားတစ်ခုခု ဖြစ်သွားပါတယ်။'}` }]);
    } finally {
      setBusy(false);
    }
  }

  function startListening() {
    setSupportError(null);
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSupportError('ဒီ browser မှာ voice input ကို မထောက်ပံ့ပါ — Chrome (Android/Desktop) ကို သုံးကြည့်ပါ။');
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setBubbles((current) => {
        sendToAI(transcript, current);
        return current;
      });
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  return (
    <main className="mm min-h-screen flex justify-center bg-bg py-6 px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-xl overflow-hidden flex flex-col min-h-[80vh]">
        <div className="p-4 border-b border-surface2 flex items-center gap-2">
          <span className="font-bold text-sm flex-1">AI Speaking Practice</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {bubbles.map((b, i) => (
            <div
              key={i}
              className={`flex flex-col gap-0.5 max-w-[85%] ${b.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              {b.korean && (
                <div
                  className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                    b.role === 'user' ? 'bg-primary text-white' : 'bg-surface2 text-gray-800'
                  }`}
                >
                  {b.korean}
                </div>
              )}
              {b.myanmar && <div className="text-[11px] text-gray-400 px-1">{b.myanmar}</div>}
              {b.feedback && (
                <div className="text-[11px] text-primaryDark bg-primaryTint rounded-lg px-2 py-1 mt-0.5">
                  💡 {b.feedback}
                </div>
              )}
            </div>
          ))}
          {busy && <div className="text-xs text-gray-400">AI စဉ်းစားနေပါသည်…</div>}
        </div>

        {supportError && (
          <div className="bg-red-50 text-red-600 text-xs rounded-xl p-3 mx-4 mb-2">{supportError}</div>
        )}

        <div className="p-4 flex flex-col items-center gap-2 border-t border-surface2">
          <button
            onClick={startListening}
            disabled={listening || busy}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white ${
              listening ? 'bg-red-400 animate-pulse' : 'bg-primary'
            } disabled:opacity-60`}
          >
            🎙️
          </button>
          <div className="text-xs text-gray-400">{listening ? 'Listening…' : 'Tap and speak (한국어)'}</div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
