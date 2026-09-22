'use client';

import type { Lesson, VocabItem, GrammarPoint } from '@/types/lesson';
import { supabase, supabaseConfigured } from './supabaseClient';

export interface SavedLesson extends Lesson {
  id: string;
  createdAt: number;
}

export interface WrongAnswerLog {
  key: string;
  type: 'vocab' | 'grammar';
  count: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function currentUserId(): Promise<string | null> {
  if (!supabaseConfigured) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function mapLessonRow(row: any): SavedLesson {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).getTime(),
    title: row.title,
    dialogue: row.dialogue || [],
    vocabulary: row.vocabulary || [],
    grammar: row.grammar || []
  };
}

export async function getLessons(): Promise<SavedLesson[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data.map(mapLessonRow);
}

export async function saveLesson(lesson: Lesson): Promise<SavedLesson | null> {
  if (!supabaseConfigured) return null;
  const uid = await currentUserId();
  if (!uid) return null;
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      user_id: uid,
      title: lesson.title,
      dialogue: lesson.dialogue,
      vocabulary: lesson.vocabulary,
      grammar: lesson.grammar
    })
    .select()
    .single();
  await markStudyToday();
  if (error || !data) return null;
  return mapLessonRow(data);
}

export async function deleteLesson(id: string) {
  if (!supabaseConfigured) return;
  await supabase.from('lessons').delete().eq('id', id);
}

export async function getAllVocab(): Promise<VocabItem[]> {
  const lessons = await getLessons();
  const map = new Map<string, VocabItem>();
  lessons.forEach((l) => l.vocabulary.forEach((v) => map.set(v.word, v)));
  return Array.from(map.values());
}

export async function getAllGrammar(): Promise<GrammarPoint[]> {
  const lessons = await getLessons();
  const map = new Map<string, GrammarPoint>();
  lessons.forEach((l) => l.grammar.forEach((g) => map.set(g.pattern, g)));
  return Array.from(map.values());
}

export async function markStudyToday() {
  if (!supabaseConfigured) return;
  const uid = await currentUserId();
  if (!uid) return;
  await supabase
    .from('study_dates')
    .upsert({ user_id: uid, study_date: todayStr() }, { onConflict: 'user_id,study_date' });
}

export async function recordQuizResult(correct: number, total: number) {
  if (!supabaseConfigured) return;
  const uid = await currentUserId();
  if (!uid) return;
  await supabase.from('quiz_results').insert({ user_id: uid, correct, total, taken_on: todayStr() });
  await markStudyToday();
}

export async function recordWrongAnswer(key: string, type: 'vocab' | 'grammar') {
  if (!supabaseConfigured) return;
  await supabase.rpc('increment_wrong_answer', { p_key: key, p_type: type });
}

export async function getStreak(): Promise<number> {
  if (!supabaseConfigured) return 0;
  const uid = await currentUserId();
  if (!uid) return 0;
  const { data } = await supabase.from('study_dates').select('study_date').eq('user_id', uid);
  const dates = new Set((data || []).map((r: any) => r.study_date));
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export async function getProgressStats() {
  const uid = await currentUserId();
  const [vocab, grammar, lessons, streak] = await Promise.all([
    getAllVocab(),
    getAllGrammar(),
    getLessons(),
    getStreak()
  ]);

  let accuracy = 0;
  let weakPoints: WrongAnswerLog[] = [];

  if (supabaseConfigured && uid) {
    const { data: quizRows } = await supabase.from('quiz_results').select('correct,total').eq('user_id', uid);
    const totalCorrect = (quizRows || []).reduce((a: number, r: any) => a + r.correct, 0);
    const totalQ = (quizRows || []).reduce((a: number, r: any) => a + r.total, 0);
    accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

    const { data: wrongRows } = await supabase
      .from('wrong_answers')
      .select('key,type,count')
      .eq('user_id', uid)
      .order('count', { ascending: false })
      .limit(10);
    weakPoints = wrongRows || [];
  }

  return {
    vocabCount: vocab.length,
    grammarCount: grammar.length,
    lessonsCompleted: lessons.length,
    accuracy,
    streak,
    weakPoints
  };
}

export async function getTodayGoalProgress() {
  if (!supabaseConfigured) return { quizToday: false, studiedToday: false };
  const uid = await currentUserId();
  if (!uid) return { quizToday: false, studiedToday: false };
  const t = todayStr();
  const [{ data: quizRows }, { data: studyRows }] = await Promise.all([
    supabase.from('quiz_results').select('id').eq('user_id', uid).eq('taken_on', t).limit(1),
    supabase.from('study_dates').select('study_date').eq('user_id', uid).eq('study_date', t).limit(1)
  ]);
  return { quizToday: (quizRows || []).length > 0, studiedToday: (studyRows || []).length > 0 };
}
