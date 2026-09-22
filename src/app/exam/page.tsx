'use client';

import { useState } from 'react';
import { getAllVocab, getAllGrammar, recordQuizResult, recordWrongAnswer } from '@/lib/storage';
import BottomNav from '@/components/BottomNav';
import type { QuizQuestion } from '@/types/lesson';

type Stage = 'setup' | 'progress' | 'result';

async function buildExam(count: number): Promise<QuizQuestion[]> {
  const [vocab, grammar] = await Promise.all([getAllVocab(), getAllGrammar()]);
  const questions: QuizQuestion[] = [];

  vocab.forEach((item) => {
    const distractors = vocab
      .map((v) => v.meaningMyanmar)
      .filter((m) => m !== item.meaningMyanmar)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    if (distractors.length < 1) return;
    const options = [item.meaningMyanmar, ...distractors].sort(() => Math.random() - 0.5);
    questions.push({
      question: `"${item.word}" ရဲ့ အဓိပ္ပာယ်က ဘာလဲ။`,
      options,
      correctIndex: options.indexOf(item.meaningMyanmar),
      key: item.word
    });
  });

  grammar.forEach((g) => {
    const distractors = grammar
      .map((x) => x.meaningMyanmar)
      .filter((m) => m !== g.meaningMyanmar)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    if (distractors.length < 1) return;
    const options = [g.meaningMyanmar, ...distractors].sort(() => Math.random() - 0.5);
    questions.push({
      question: `"${g.pattern}" ရဲ့ အဓိပ္ပာယ်က ဘာလဲ။`,
      options,
      correctIndex: options.indexOf(g.meaningMyanmar),
      key: g.pattern
    });
  });

  return questions.sort(() => Math.random() - 0.5).slice(0, count);
}

export default function ExamPage() {
  const [stage, setStage] = useState<Stage>('setup');
  const [count, setCount] = useState(10);
  const [exam, setExam] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [notEnough, setNotEnough] = useState(false);
  const [starting, setStarting] = useState(false);

  async function startExam() {
    setStarting(true);
    const questions = await buildExam(count);
    setStarting(false);
    if (questions.length === 0) {
      setNotEnough(true);
      return;
    }
    setNotEnough(false);
    setExam(questions);
    setIndex(0);
    setScore(0);
    setAnswered(null);
    setStage('progress');
  }

  function answer(idx: number) {
    setAnswered(idx);
    const q = exam[index];
    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
    } else if (q.key) {
      recordWrongAnswer(q.key, 'vocab');
    }
  }

  function next() {
    if (index + 1 >= exam.length) {
      recordQuizResult(score, exam.length);
      setStage('result');
    } else {
      setIndex((i) => i + 1);
      setAnswered(null);
    }
  }

  return (
    <main className="mm min-h-screen flex justify-center bg-bg py-6 px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-xl overflow-hidden flex flex-col min-h-[80vh]">
        {stage === 'setup' && (
          <div className="flex flex-col flex-1">
            <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
              <div className="display text-lg font-bold">Exam Mode</div>
              <div className="text-sm text-gray-500">
                သင် အရင်တင်ထားတဲ့ သင်ခန်းစာအားလုံးက vocabulary/grammar တွေကို ပေါင်းစည်းပြီး စာမေးပွဲ ဖန်တီးပေးပါမယ်။
              </div>
              {notEnough && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">
                  Exam ဖန်တီးဖို့ vocabulary/grammar မလုံလောက်ပါ — Home မှာ သင်ခန်းစာ အနည်းဆုံး တစ်ခု အရင်ဖန်တီးပါ
                  (vocabulary ၄ ခု အထက် လိုပါတယ်)။
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-gray-400 uppercase">မေးခွန်းအရေအတွက်</div>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`flex-1 rounded-xl py-2 text-sm font-bold border ${
                        count === n ? 'bg-primary text-white border-primary' : 'border-surface2 text-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={startExam}
                disabled={starting}
                className="bg-primary disabled:opacity-50 text-white rounded-2xl py-4 font-bold mt-2"
              >
                {starting ? 'ပြင်ဆင်နေသည်…' : 'Start Exam'}
              </button>
            </div>
            <BottomNav />
          </div>
        )}

        {stage === 'progress' && exam.length > 0 && (
          <div className="flex flex-col flex-1">
            <div className="p-4 border-b border-surface2 flex items-center gap-2">
              <button
                onClick={() => setStage('setup')}
                className="w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center"
              >
                ←
              </button>
              <span className="font-bold text-sm flex-1">Exam</span>
              <span className="text-xs text-gray-400">
                {index + 1} / {exam.length}
              </span>
            </div>
            <div className="h-1.5 bg-surface2 mx-4 mt-3 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${((index + 1) / exam.length) * 100}%` }} />
            </div>
            <div className="flex-1 p-4 flex flex-col gap-4">
              <div className="bg-white border border-surface2 rounded-xl p-5 text-center font-bold">
                {exam[index].question}
              </div>
              <div className="flex flex-col gap-2">
                {exam[index].options.map((opt, i) => {
                  let cls = 'border-surface2 bg-white';
                  if (answered !== null) {
                    if (i === exam[index].correctIndex) cls = 'border-green-500 bg-green-50';
                    else if (i === answered) cls = 'border-red-400 bg-red-50';
                  }
                  return (
                    <button
                      key={i}
                      disabled={answered !== null}
                      onClick={() => answer(i)}
                      className={`border rounded-xl px-4 py-3 text-left text-sm font-medium ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={answered === null}
                onClick={next}
                className="bg-primary disabled:opacity-40 text-white rounded-xl py-3 font-bold mt-auto"
              >
                {index + 1 >= exam.length ? 'ရလဒ်ကြည့်မည်' : 'နောက်မေးခွန်း →'}
              </button>
            </div>
          </div>
        )}

        {stage === 'result' && (
          <div className="flex flex-col flex-1">
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 px-5 text-center">
              <div className="text-5xl">🏆</div>
              <div className="display text-xl font-bold">Test Completed!</div>
              <div className="text-4xl font-extrabold text-primary">
                {exam.length > 0 ? Math.round((score / exam.length) * 100) : 0}/100
              </div>
              <div className="text-sm text-gray-500">
                {score} / {exam.length} မှန်ပါတယ်
              </div>
              <button
                onClick={() => setStage('setup')}
                className="bg-primary text-white rounded-xl px-6 py-3 font-bold mt-2 w-full"
              >
                နောက်တစ်ကြိမ် ထပ်ဖြေမည်
              </button>
            </div>
            <BottomNav />
          </div>
        )}
      </div>
    </main>
  );
}
