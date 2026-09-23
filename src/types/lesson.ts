export interface VocabItem {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaningMyanmar: string;
}

export interface GrammarPoint {
  pattern: string;
  meaningMyanmar: string;
  exampleKorean: string;
  exampleMyanmar: string;
}

export interface LessonLine {
  speaker: string;
  korean: string;
  myanmar: string;
}

export interface Lesson {
  title: string;
  dialogue: LessonLine[];
  vocabulary: VocabItem[];
  grammar: GrammarPoint[];
  language?: string; // language code of the source text, e.g. 'ko', 'ja', 'zh', 'en', 'th'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  key?: string;
}
