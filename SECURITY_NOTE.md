# Security note

Credentials were previously committed to this public repository.
Those values are compromised. Rotate them; do not restore the old ones.

## What leaked

- Google Gemini API key (`GEMINI_API_KEY`)
- MongoDB Atlas connection string (`MONGODB_URI`), including username and password

Git history still contains the old blobs until history is rewritten. Rotation is the real fix.

## Rotate now

1. Gemini: https://aistudio.google.com/apikey — delete the old key. Also check Google Cloud credentials if you created it there.
2. MongoDB Atlas: Database Access — change the password for the leaked database user, or delete the user. Update or remove `MONGODB_URI` in Vercel.
3. Vercel: project for www.metrobotz.com → Settings → Environment Variables — remove or replace `GEMINI_API_KEY` and `MONGODB_URI`.
4. Local: `backend/.env` is gitignored. Keep secrets only there or in Vercel, never in markdown.

## Rules

- Store secrets in `.env` (gitignored) or the host's env vars
- Use `backend/env.example` for dummy names only
- Never paste live keys into docs, chat, or screenshots
