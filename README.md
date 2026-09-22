# LingoNote AI

ဓာတ်ပုံတင်ပြီး Korean သင်ခန်းစာအဖြစ် AI နဲ့ အလိုအလျောက် ဖတ်ယူ/ဘာသာပြန်/vocabulary ခွဲထုတ်ပေးတဲ့ web app။
Photo → Google Gemini AI (vision) → Myanmar ဘာသာပြန် + Flashcard + Quiz အလိုအလျောက် ဖန်တီးပေးပါတယ်။

**အကုန်လုံး အခမဲ့ ဖြစ်ပါတယ် — credit card လုံးဝ မလိုအပ်ပါ။**

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

ဒီနောက်ပိုင်း code ကို ပြင်ချင်တိုင်း GitHub ပေါ်က file တွေကို edit လုပ်ရုံနဲ့ Vercel က အလိုအလျောက် ပြန် deploy လုပ်ပေးပါလိမ့်မယ်။

## Local dev (coding လုပ်တတ်သူများအတွက်)

```bash
npm install
cp .env.example .env.local   # GEMINI_API_KEY ကို ဖြည့်ပါ
npm run dev
```

http://localhost:3000 ကို ဖွင့်ကြည့်ပါ။

## ဘယ်လို အလုပ်လုပ်သလဲ

1. `src/app/page.tsx` — Home/Result/Flashcard/Quiz UI အားလုံး (client component)။
2. `src/app/api/analyze/route.ts` — ဓာတ်ပုံကို Google Gemini vision model ဆီ ပို့ပြီး JSON lesson data ပြန်ရယူတဲ့ server route။ ဒီနေရာမှာပဲ `GEMINI_API_KEY` ကို သုံးပါတယ် — client-side ကို API key ဘယ်တော့မှ မပို့ပါ (security)။
3. Flashcard/Quiz တွေကို AI ပြန်ပေးလိုက်တဲ့ vocabulary list ကနေ တကယ့် data နဲ့ client-side မှာ တည်ဆောက်ပါတယ်။

## သတိပြုရန်

- ဓာတ်ပုံရဲ့ ရှင်းလင်းမှု (focus၊ အလင်း) ကောင်းလေ AI ဖတ်ယူနိုင်မှု တိကျလေဖြစ်ပါတယ်။
- Free tier မှာ တစ်မိနစ်အတွင်း request အရေအတွက် ကန့်သတ်ချက် အနည်းငယ်ရှိပါတယ် — တစ်ယောက်တည်းသုံးရင် ပြဿနာ ဖြစ်နိုင်ခြေ နည်းပါတယ်။ "quota exceeded" error တွေ့ရင် ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။
- ယခုအချိန်မှာ database မထည့်သေးပါ (login/history မရှိသေးပါ) — ဖန်တီးထားတဲ့ lesson တစ်ခုချင်းစီဟာ page ပိတ်လိုက်ရင် ပျောက်သွားပါလိမ့်မယ်။ Login + history + spaced-repetition (Supabase) ကို နောက်တစ်ဆင့်အနေနဲ့ ထပ်ထည့်နိုင်ပါတယ်။
