# KindleDict MVP Checklist

## Live app

- Landing: https://kindledict.vercel.app
- Builder: https://kindledict.vercel.app/app
- Privacy / Terms / Contact pages

## Required before first real user test

**You do NOT need OpenAI.** Pick one LLM provider:

### Option A — Google Gemini (recommended, no foreign payment)

1. Open [Google AI Studio](https://aistudio.google.com/apikey) and create an API key
2. In Vercel → kindledict → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `LLM_PROVIDER` | `google` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | your Gemini key |
| `GOOGLE_CHAT_MODEL` | `gemini-2.0-flash` (optional) |

3. Redeploy

### Option B — DeepSeek (国内友好，便宜)

| Variable | Value |
|----------|-------|
| `LLM_PROVIDER` | `openai-compatible` |
| `OPENAI_API_KEY` | your DeepSeek key |
| `OPENAI_COMPAT_BASE_URL` | `https://api.deepseek.com/v1` |
| `OPENAI_CHAT_MODEL` | `deepseek-chat` |

### Option C — OpenAI official

Only if you have billing set up on OpenAI.

1. **Add `OPENAI_API_KEY` on Vercel** (if using OpenAI)
   - Dashboard → kindledict → Settings → Environment Variables
   - Redeploy after saving

2. **Vercel Pro (recommended)**
   - Hobby plan limits serverless functions to 10 seconds
   - Chapter extraction often needs 30–120 seconds

## MVP flow (working end-to-end)

```
Paste chapter OR upload DRM-free EPUB
  → pick chapter (if EPUB)
  → Preview entries OR Generate & download
  → ZIP with dict.opf + content.html
  → Kindle Previewer 3 → export .mobi
  → sideload to Kindle documents/dictionaries/
```

## Optional Phase 2

- Deploy `worker/` to Railway
- Set `COMPILE_WORKER_URL` + `COMPILE_WORKER_SECRET` on Vercel for direct `.mobi` download

## Try without your own book

Click **Try sample chapter** on `/app` — loads A Clash of Kings Ch. 4 excerpt.
