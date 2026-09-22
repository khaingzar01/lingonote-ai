'use client';

import { useRef, useState } from 'react';
import type { Lesson, QuizQuestion } from '@/types/lesson';

type Step = 'home' | 'loading' | 'result';
type View = 'overview' | 'vocab' | 'grammar' | 'flashcards' | 'quiz' | 'quizResult';

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

function buildQuiz(lesson: Lesson): QuizQuestion[] {
  const items = lesson.vocabulary;
  if (items.length === 0) return [];
  const allMeanings = items.map((v) => v.meaningMyanmar);
  return items.map((item) => {
    const distractors = allMeanings
      .filter((m) => m !== item.meaningMyanmar)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [item.meaningMyanmar, ...distractors].sort(() => Math.random() - 0.5);
    return {
      question: `"${item.word}" ရဲ့ အဓိပ္ပာယ်က ဘာလဲ။`,
      options,
      correctIndex: options.indexOf(item.meaningMyanmar)
    };
  });
}

export default function Home() {
  const [step, setStep] = useState<Step>('home');
  const [view, setView] = useState<View>('overview');
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);

  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setLesson(json.lesson);
      setQuiz(buildQuiz(json.lesson));
      setFcIndex(0);
      setFcFlipped(false);
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(null);
      setView('overview');
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
          <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <span className="display text-lg font-bold">LingoNote AI</span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>
            )}

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

            <div className="text-xs text-gray-400 leading-relaxed bg-surface2 rounded-xl p-3">
              ℹ️ တင်လိုက်တဲ့ဓာတ်ပုံကို Claude AI ဆီ ပို့ပြီး Korean စာသားကို ဖတ်ယူ/ဘာသာပြန်/vocabulary ခွဲခြမ်းပေးပါလိမ့်မယ် — ရလဒ်က AI ထုတ်ပေးတဲ့ တကယ့်စာသားဖြစ်ပြီး၊ ပုံနှိပ်စာလုံးမပီသတဲ့ဓာတ်ပုံမျိုးမှာ အမှားအယွင်း အနည်းငယ် ဖြစ်နိုင်ပါတယ်။
            </div>
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

        {step === 'result' && lesson && (
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2 p-4 border-b border-surface2">
              <button onClick={reset} className="w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center">←</button>
              <span className="font-bold text-sm flex-1 truncate">{lesson.title}</span>
            </div>

            <div className="flex gap-1 p-2 bg-surface2 mx-4 mt-3 rounded-xl">
              {(['overview', 'vocab', 'grammar', 'flashcards', 'quiz'] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v === 'quiz' ? (quiz.length ? 'quiz' : 'overview') : v)}
                  className={`flex-1 text-[11px] font-bold py-2 rounded-lg ${
                    view === v || (v === 'quiz' && view === 'quizResult')
                      ? 'bg-white text-primary shadow'
                      : 'text-gray-500'
                  }`}
                >
                  {v === 'overview' && 'အကျဉ်းချုပ်'}
                  {v === 'vocab' && 'စကားလုံး'}
                  {v === 'grammar' && 'သဒ္ဒါ'}
                  {v === 'flashcards' && 'Flashcard'}
                  {v === 'quiz' && 'Quiz'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {view === 'overview' && (
                <>
                  {imagePreview && (
                    <img src={imagePreview} alt="" className="w-full max-h-40 object-cover rounded-xl border border-surface2" />
                  )}
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">မူရင်း + ဘာသာပြန်</div>
                  <div className="flex flex-col gap-3">
                    {lesson.dialogue.length === 0 && (
                      <div className="text-sm text-gray-400">ဒီဓာတ်ပုံထဲမှာ စာသား မတွေ့ပါ။</div>
                    )}
                    {lesson.dialogue.map((line, i) => (
                      <div key={i} className="bg-white border border-surface2 rounded-xl p-3">
                        <div className="flex gap-2 text-sm font-medium">
                          {line.speaker && <span className="font-extrabold text-primary">{line.speaker}</span>}
                          <span>{line.korean}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{line.myanmar}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {view === 'vocab' && (
                <div className="flex flex-col gap-2">
                  {lesson.vocabulary.length === 0 && <div className="text-sm text-gray-400">Vocabulary မတွေ့ပါ။</div>}
                  {lesson.vocabulary.map((v, i) => (
                    <div key={i} className="bg-white border border-surface2 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-[15px]">
                          {v.word} <span className="text-gray-400 text-[11px] font-medium">{v.pronunciation}</span>
                        </div>
                        <div className="text-primaryDark text-xs mt-0.5">{v.meaningMyanmar}</div>
                      </div>
                      <span className="text-[10px] font-bold bg-primaryTint text-primaryDark px-2 py-1 rounded-full">
                        {v.partOfSpeech}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {view === 'grammar' && (
                <div className="flex flex-col gap-3">
                  {lesson.grammar.length === 0 && <div className="text-sm text-gray-400">သဒ္ဒါချက် မတွေ့ပါ။</div>}
                  {lesson.grammar.map((g, i) => (
                    <div key={i} className="bg-primaryTint rounded-xl p-3">
                      <div className="font-extrabold text-primaryDark text-[15px] mb-1">{g.pattern}</div>
                      <div className="text-[13px] mb-2">{g.meaningMyanmar}</div>
                      <div className="bg-white rounded-lg p-2 text-[13px]">
                        {g.exampleKorean}
                        <br />
                        <span className="text-gray-500">= {g.exampleMyanmar}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === 'flashcards' && (
                <FlashcardView lesson={lesson} index={fcIndex} flipped={fcFlipped}
                  onFlip={() => setFcFlipped((f) => !f)}
                  onNext={() => { setFcIndex((i) => (i + 1) % Math.max(lesson.vocabulary.length, 1)); setFcFlipped(false); }}
                />
              )}

              {view === 'quiz' && quiz.length > 0 && (
                <QuizView
                  quiz={quiz}
                  index={quizIndex}
                  answered={quizAnswered}
                  onAnswer={(idx) => {
                    setQuizAnswered(idx);
                    if (idx === quiz[quizIndex].correctIndex) setQuizScore((s) => s + 1);
                  }}
                  onNext={() => {
                    if (quizIndex + 1 >= quiz.length) {
                      setView('quizResult');
                    } else {
                      setQuizIndex((i) => i + 1);
                      setQuizAnswered(null);
                    }
                  }}
                />
              )}

              {view === 'quizResult' && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="text-5xl">🎉</div>
                  <div className="text-gray-500">ပြီးစီးပါပြီ!</div>
                  <div className="text-4xl font-extrabold text-primary">{quizScore}/{quiz.length}</div>
                  <button
                    onClick={() => { setQuizIndex(0); setQuizScore(0); setQuizAnswered(null); setView('quiz'); }}
                    className="bg-primary text-white rounded-xl px-6 py-3 font-bold mt-2"
                  >
                    ထပ်ဖြေမည်
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function FlashcardView({
  lesson,
  index,
  flipped,
  onFlip,
  onNext
}: {
  lesson: Lesson;
  index: number;
  flipped: boolean;
  onFlip: () => void;
  onNext: () => void;
}) {
  if (lesson.vocabulary.length === 0) {
    return <div className="text-sm text-gray-400">Flashcard ပြုလုပ်ဖို့ vocabulary မတွေ့ပါ။</div>;
  }
  const item = lesson.vocabulary[index % lesson.vocabulary.length];
  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="text-xs text-gray-400 text-center">{(index % lesson.vocabulary.length) + 1} / {lesson.vocabulary.length}</div>
      <div
        onClick={onFlip}
        className="flex-1 min-h-[220px] rounded-2xl border border-surface2 flex flex-col items-center justify-center text-center p-6 cursor-pointer gap-2"
      >
        {!flipped ? (
          <>
            <div className="text-3xl font-extrabold">{item.word}</div>
            <div className="text-gray-400 text-sm">{item.pronunciation}</div>
          </>
        ) : (
          <div className="text-xl font-bold text-primaryDark">{item.meaningMyanmar}</div>
        )}
        <div className="text-[11px] text-gray-400 mt-2">↻ လှန်ကြည့်ရန် တို့ပါ</div>
      </div>
      <button onClick={onNext} className="bg-primary text-white rounded-xl py-3 font-bold">
        နောက်တစ်ခု →
      </button>
    </div>
  );
}

function QuizView({
  quiz,
  index,
  answered,
  onAnswer,
  onNext
}: {
  quiz: QuizQuestion[];
  index: number;
  answered: number | null;
  onAnswer: (idx: number) => void;
  onNext: () => void;
}) {
  const q = quiz[index];
  const letters = ['A', 'B', 'C', 'D'];
  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-gray-400 text-center">{index + 1} / {quiz.length}</div>
      <div className="bg-white border border-surface2 rounded-xl p-5 text-center font-bold">{q.question}</div>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          let cls = 'border-surface2 bg-white';
          if (answered !== null) {
            if (i === q.correctIndex) cls = 'border-green-500 bg-green-50';
            else if (i === answered) cls = 'border-red-400 bg-red-50';
          }
          return (
            <button
              key={i}
              disabled={answered !== null}
              onClick={() => onAnswer(i)}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-left text-sm font-medium ${cls}`}
            >
              <span className="w-6 h-6 rounded-full border border-surface2 flex items-center justify-center text-[11px] font-bold text-gray-400">
                {letters[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {answered !== null && (
        <div className={`rounded-xl px-4 py-3 font-bold text-sm ${answered === q.correctIndex ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {answered === q.correctIndex ? '✓ မှန်ပါတယ်!' : `✕ မမှန်ပါ — အဖြေမှန်မှာ "${q.options[q.correctIndex]}"`}
        </div>
      )}
      <button
        disabled={answered === null}
        onClick={onNext}
        className="bg-primary disabled:opacity-40 text-white rounded-xl py-3 font-bold"
      >
        {index + 1 >= quiz.length ? 'ရလဒ်ကြည့်မည်' : 'နောက်မေးခွန်း →'}
      </button>
    </div>
  );
}
