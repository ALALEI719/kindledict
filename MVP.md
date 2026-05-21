# KindleDict MVP Checklist

## Live app

- Landing: https://kindledict.vercel.app
- Builder: https://kindledict.vercel.app/app
- Privacy / Terms / Contact pages

## Required before first real user test

1. **Add `OPENAI_API_KEY` on Vercel**
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
