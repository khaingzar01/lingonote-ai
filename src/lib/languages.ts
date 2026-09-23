export interface LanguageOption {
  code: string;
  flag: string;
  labelMyanmar: string;
  englishName: string; // used inside the AI prompt
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'ko', flag: '🇰🇷', labelMyanmar: 'ကိုရီးယား', englishName: 'Korean' },
  { code: 'ja', flag: '🇯🇵', labelMyanmar: 'ဂျပန်', englishName: 'Japanese' },
  { code: 'zh', flag: '🇨🇳', labelMyanmar: 'တရုတ်', englishName: 'Chinese (Mandarin)' },
  { code: 'en', flag: '🇬🇧', labelMyanmar: 'အင်္ဂလိပ်', englishName: 'English' },
  { code: 'th', flag: '🇹🇭', labelMyanmar: 'ထိုင်း', englishName: 'Thai' },
  { code: 'vi', flag: '🇻🇳', labelMyanmar: 'ဗီယက်နမ်', englishName: 'Vietnamese' }
];

export const DEFAULT_LANGUAGE_CODE = 'ko';

export function getLanguage(code?: string | null): LanguageOption {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
