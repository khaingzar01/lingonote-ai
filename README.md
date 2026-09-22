# LingoNote AI

ဓာတ်ပုံတင်ပြီး Korean သင်ခန်းစာအဖြစ် AI နဲ့ အလိုအလျောက် ဖတ်ယူ/ဘာသာပြန်/vocabulary ခွဲထုတ်ပေးတဲ့ web app။
Photo → Google Gemini AI (vision) → Myanmar ဘာသာပြန် + Flashcard + Quiz အလိုအလျောက် ဖန်တီးပေးပါတယ်။

**အကုန်လုံး အခမဲ့ ဖြစ်ပါတယ် — credit card လုံးဝ မလိုအပ်ပါ။**

> ⚠️ **အရေးကြီးသတိပေးချက်:** ဒီ update မှာ login/cloud-sync (Supabase) ကို အသစ်ထည့်ထားလို့ **အောက်မှာဖော်ပြထားတဲ့ "၄) Supabase Login/Cloud Sync ချိတ်ဆက်နည်း" ကို မလုပ်ဘဲ code ကို ပြန်တင်ရင် app က "Setup လိုအပ်ပါတယ်" ဆိုတဲ့ စာမျက်နှာကိုသာ ပြပါလိမ့်မယ်** — ဘာမှ အလုပ်မလုပ်သေးပါ။ ဒါကြောင့် အောက်က အဆင့်တွေကို အစဉ်လိုက် အကုန်လုပ်ပြီးမှသာ app က ပုံမှန် ပြန်အလုပ်လုပ်ပါလိမ့်မယ်။

## Coding မတတ်သူအတွက် — Deploy လုပ်နည်း (Vercel, click-only)

### ၁) Gemini API key ရယူရန် (အခမဲ့၊ ၂ မိနစ်)
1. https://aistudio.google.com/apikey သို့ သွားပြီး Google account (Gmail) နဲ့ ဝင်ပါ။
2. **Create API key** ကိုနှိပ်ပါ။
3. ထွက်လာတဲ့ key (AIza... နဲ့ စတဲ့ စာကြောင်း) ကို copy ကူးပြီး notepad မှာ ခဏထားလိုက်ပါ။
4. ဒါပဲ — credit card မလိုပါ၊ balance ဖြည့်စရာ မလိုပါ။ Free tier မှာ တစ်နေ့ကို ဓာတ်ပုံ အများအပြား analyze လုပ်လို့ရအောင် quota ပေးထားပါတယ် (ကိုယ်ပိုင်သုံးဖို့အတွက် လုံလောက်ပါတယ်)။

### ၂) ဒီ code ကို GitHub ပေါ်တင်ရန် (git command မလိုပါ)
1. https://github.com သို့ သွားပြီး အကောင့်ဖွင့်ပါ။
2. **New repository** ကိုနှိပ်ပြီး နာမည် (ဥပမာ `lingonote-ai`) ပေးပြီး **Create repository** နှိပ်ပါ။
3. ဖန်တီးပြီးတဲ့ page ပေါ်က **uploading an existing file** ဆိုတဲ့ link ကိုနှိပ်ပါ။
4. ဒီ folder ထဲက file/folder အားလုံးကို (README.md ဒီဖိုင်ပါ) ဆွဲပြီး ထည့်ပါ (drag & drop)။
5. **Commit changes** ကိုနှိပ်ပါ။

### ၃) Vercel မှာ Deploy လုပ်ရန် (အခမဲ့)
1. https://vercel.com သို့ သွားပြီး **Continue with GitHub** ဖြင့် အကောင့်ဝင်ပါ။
2. **Add New → Project** ကိုနှိပ်ပါ။
3. အထက်မှာ တင်ထားတဲ့ `lingonote-ai` repo ကို ရွေးပြီး **Import** နှိပ်ပါ။
4. **Environment Variables** ဆိုတဲ့ အပိုင်းမှာ:
   - Name: `GEMINI_API_KEY`
   - Value: (အဆင့် ၁ မှာ copy ကူးထားတဲ့ key ကို paste ချပါ)
   - **Add** ကိုနှိပ်ပါ။
5. **Deploy** ခလုတ်ကို နှိပ်ပါ။ ၁-၂ မိနစ်ခန့် စောင့်ပါ။
6. ပြီးရင် `https://lingonote-ai-xxxx.vercel.app` လိုမျိုး link တစ်ခု ရပါလိမ့်မယ် — ဒါက သင့် app ဖြစ်ပါပြီ! ဖုန်း/ကွန်ပျူတာ ဘယ်ကနေမဆို ဖွင့်နိုင်ပါတယ်၊ ပိုက်ဆံလုံးဝ မကုန်ပါ။

### ၄) Supabase Login/Cloud Sync ချိတ်ဆက်နည်း (အခမဲ့)

ဒီအဆင့်ပြီးရင် login ရှိပြီး Lesson history/Progress/Streak တွေကို ဖုန်း/ကွန်ပျူတာ ဘယ်ကနေမဆို ဝင်ကြည့်နိုင်ပါလိမ့်မယ် (ဒေတာက cloud ပေါ်မှာ သိမ်းပါလိမ့်မယ်)။

**(က) Supabase project အသစ်ဖန်တီးရန်**
1. https://supabase.com သို့ သွားပြီး **Start your project** ကိုနှိပ်ပြီး GitHub account နဲ့ login ဝင်ပါ။
2. **New project** ကိုနှိပ်ပါ။ Organization ကို default အတိုင်း ထားပါ။
3. Project name (ဥပမာ `lingonote-ai`)၊ Database Password တစ်ခု (မှတ်ထားပါ)၊ Region ကို **Southeast Asia (Singapore)** လို နီးစပ်တဲ့ region ရွေးပြီး **Create new project** နှိပ်ပါ။ (၁-၂ မိနစ် စောင့်ရပါမယ်)

**(ခ) Database table တွေ ဖန်တီးရန် (SQL တစ်ခုတည်း run ရုံပါပဲ)**
1. ဘေးဘက် menu ကနေ **SQL Editor** ကိုနှိပ်ပါ။
2. **New query** ကိုနှိပ်ပါ။
3. ဒီ code folder ထဲက `supabase/schema.sql` ဖိုင်ကို ဖွင့်ပြီး အကုန်လုံး copy ကူးပါ (Notepad/VS Code နဲ့ ဖွင့်လို့ရပါတယ်)။
4. SQL Editor ထဲမှာ paste ချပြီး **Run** (သို့) **RUN** ခလုတ် နှိပ်ပါ။ "Success. No rows returned" ဆိုတာ ပေါ်ရင် ရပါပြီ။

**(ဂ) Login link ပို့ဖို့ Site URL သတ်မှတ်ရန်**
1. ဘေးဘက် menu ကနေ **Authentication** → **URL Configuration** ကိုနှိပ်ပါ။
2. **Site URL** ထဲမှာ သင့် app ရဲ့ Vercel link (ဥပမာ `https://lingonote-ai.vercel.app`) ကို ထည့်ပြီး **Save** နှိပ်ပါ။ (ဒါမှ login link ကို email ထဲမှာ ပို့တဲ့အခါ မှန်ကန်တဲ့ link ဖြစ်ပါမယ်)

**(ဃ) API key တွေ ကူးယူရန်**
1. ဘေးဘက် menu ကနေ **Project Settings** (ဂီယာ icon) → **API** ကိုနှိပ်ပါ။
2. **Project URL** ကို copy ကူးပါ။
3. **anon public** key (ရှည်လျားတဲ့ စာကြောင်း) ကို copy ကူးပါ။

**(င) Vercel မှာ Environment Variables အသစ် ထည့်ရန်**
1. https://vercel.com ဆီ ပြန်သွားပြီး `lingonote-ai` project ကို ဖွင့်ပါ။
2. **Settings** → **Environment Variables** ကိုနှိပ်ပါ။
3. အောက်ပါ ၂ ခုကို တစ်ခုချင်းစီ **Add** လုပ်ပါ:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` → Value: (Project URL ကို paste)
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Value: (anon public key ကို paste)
4. **Save** နှိပ်ပါ။
5. ဘေးဘက် **Deployments** tab ကိုသွားပြီး အပေါ်ဆုံး deployment ရဲ့ **⋯** menu ကိုနှိပ်ပြီး **Redeploy** ကို နှိပ်ပါ (env var အသစ်ကို သက်ရောက်စေဖို့ redeploy လုပ်ပေးရပါမယ်)။

ပြီးရင် app ကို ပြန်ဖွင့်လိုက်ရင် email ထည့်ရမယ့် login page ကို မြင်ရပါလိမ့်မယ် — email ထည့်ပြီး "Login Link ပို့ရန်" နှိပ်ပြီး email box ကို ဖွင့်ကြည့်ပါ။

---

ဒီနောက်ပိုင်း code ကို ပြင်ချင်တိုင်း GitHub ပေါ်က file တွေကို edit လုပ်ရုံနဲ့ Vercel က အလိုအလျောက် ပြန် deploy လုပ်ပေးပါလိမ့်မယ်။

## Local dev (coding လုပ်တတ်သူများအတွက်)

```bash
npm install
cp .env.example .env.local   # GEMINI_API_KEY ကို ဖြည့်ပါ
npm run dev
```

http://localhost:3000 ကို ဖွင့်ကြည့်ပါ။

## Feature တွေ

- **Home** — ဓာတ်ပုံတင်ရန်၊ ယနေ့ပန်းတိုင် (goal ring)၊ vocabulary/grammar စုစုပေါင်း၊ study streak
- **Lesson Result / Sentence Breakdown / Flashcard / Quiz** — ဓာတ်ပုံ တစ်ပုံစီအတွက် AI ခွဲထုတ်ပေးတဲ့ dialogue + ဘာသာပြန် + vocabulary + grammar + flashcard + quiz
- **Login** — email လိပ်စာတစ်ခုတည်းနဲ့ ဝင်နိုင်သည် (password မလိုပါ — email ထဲကို "Login Link" ပို့ပေးပါလိမ့်မယ်)
- **My Lessons** (`/lessons`) — အရင်တင်ခဲ့တဲ့ သင်ခန်းစာအားလုံးကို ပြန်ကြည့်နိုင်သည် (account ထဲမှာ cloud ပေါ် သိမ်းထားပြီး device မရွေး ဝင်ကြည့်နိုင်သည်)
- **Exam Mode** (`/exam`) — တင်ခဲ့ပြီးသား သင်ခန်းစာအားလုံးက vocabulary/grammar အားလုံးကို ပေါင်းစည်းပြီး random စာမေးပွဲ ဖန်တီးပေးသည် — မေးခွန်းအရေအတွက် ရွေးနိုင်၊ ရမှတ် ပြသသည်
- **AI Speaking Practice** (`/speak`) — Microphone ကနေ Korean လို ပြောပြီး AI နဲ့ စကားပြောလေ့ကျင့်နိုင်သည် (Chrome ကိုသာ အကောင်းဆုံး ထောက်ပံ့သည်၊ mic permission လိုအပ်သည်)
- **My Progress** (`/progress`) — vocabulary/grammar စုစုပေါင်း၊ quiz accuracy၊ study streak၊ မကြာခဏ မှားနေတဲ့ vocabulary/grammar (Weak Points)

## ဘယ်လို အလုပ်လုပ်သလဲ

1. `src/app/page.tsx` — Home screen (ဓာတ်ပုံတင်ခြင်း + goal/stat summary)။
2. `src/components/LessonView.tsx` — Overview/Vocabulary/Grammar/Flashcard/Quiz tab UI (fresh scan ဖြစ်ဖြစ်၊ Lessons list ကနေ ပြန်ဖွင့်တာဖြစ်ဖြစ် ဒီ component ကိုပဲ သုံးပါတယ်)။
3. `src/app/api/analyze/route.ts` — ဓာတ်ပုံကို Google Gemini vision model ဆီ ပို့ပြီး JSON lesson data ပြန်ရယူတဲ့ server route။
4. `src/app/api/speak/route.ts` — Speaking Practice အတွက် Gemini ကို conversation partner အဖြစ် ခေါ်သုံးတဲ့ server route။
5. `src/lib/storage.ts` — Lesson history၊ quiz score၊ streak၊ weak points တွေကို Supabase database ထဲမှာ login ဝင်ထားတဲ့ account နဲ့ ချိတ်ပြီး သိမ်းဆည်း/ဖတ်ယူတဲ့ helper functions (Supabase ရဲ့ free tier ကို သုံးထားပါတယ် — credit card မလိုပါ)။
6. `src/components/AuthGate.tsx` — App တစ်ခုလုံးကို login လုပ်ထားမှသာ ဖွင့်ခွင့်ပြုတဲ့ wrapper (email magic-link login)။
7. `GEMINI_API_KEY` နဲ့ Supabase key တွေကို server route/client config ထဲမှာသာ သုံးပါတယ် — client bundle ထဲက `NEXT_PUBLIC_` key တွေက public ဖြစ်ပေမဲ့ Row Level Security (RLS) က user တစ်ယောက်ချင်းစီရဲ့ ဒေတာကို တခြားသူများ မမြင်စေရအောင် ကာကွယ်ပေးပါတယ်။

## သတိပြုရန်

- ဓာတ်ပုံရဲ့ ရှင်းလင်းမှု (focus၊ အလင်း) ကောင်းလေ AI ဖတ်ယူနိုင်မှု တိကျလေဖြစ်ပါတယ်။
- Free tier မှာ တစ်မိနစ်အတွင်း request အရေအတွက် ကန့်သတ်ချက် အနည်းငယ်ရှိပါတယ် — တစ်ယောက်တည်းသုံးရင် ပြဿနာ ဖြစ်နိုင်ခြေ နည်းပါတယ်။ "high demand"/"quota exceeded" error တွေ့ရင် ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ (Google ဘက်က ယာယီ ပြဿနာသာ ဖြစ်ပြီး app ကုဒ်မှာ ပြဿနာ မဟုတ်ပါ)။
- **Login/Cloud sync (Supabase)** ကို ချိတ်ဆက်ပြီးပါက Lesson history/Progress/Streak အားလုံးဟာ account ထဲမှာ cloud ပေါ်မှာ သိမ်းထားမှာမို့ ဖုန်း/ကွန်ပျူတာ ဘယ်ကနေမဆို login ပြန်ဝင်ရင် ဒေတာ အကုန်ပြန်မြင်ရပါလိမ့်မယ်။ "၄) Supabase Login/Cloud Sync ချိတ်ဆက်နည်း" အပိုင်းကို မလုပ်ရသေးရင် app က "Setup လိုအပ်ပါတယ်" ဆိုတဲ့ စာမျက်နှာကိုသာ ပြပါလိမ့်မယ်။
- Login link ရဲ့ email က မရောက်ရင် **Spam/Junk folder** ကို စစ်ကြည့်ပါ။ Supabase ရဲ့ free tier email quota က တစ်နာရီကို email အနည်းငယ်ပဲ ပို့နိုင်တာမို့ (ကိုယ်ပိုင်သုံးရင် လုံလောက်ပါတယ်)၊ email အများကြီး ခဏချင်း ပို့ရင် ရပ်တန့်နိုင်ပါတယ်။
- **AI Speaking Practice** ကို Chrome (Android app or Desktop) မှာ အကောင်းဆုံး အလုပ်လုပ်ပါတယ်၊ Safari/iOS မှာ voice input အပြည့်အဝ အလုပ်မလုပ်နိုင်ပါ (browser ရဲ့ Web Speech API ပေါ်မူတည်ပါတယ်)။ Microphone ခွင့်ပြုချက် တောင်းရင် "Allow" နှိပ်ပေးပါ။
- **Exam Mode** သုံးဖို့ vocabulary အနည်းဆုံး ၄ ခုပါတဲ့ သင်ခန်းစာ တစ်ခုအနည်းဆုံး ရှိဖို့ လိုပါတယ်။
