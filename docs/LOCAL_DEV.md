# Local development

## 1. Install dependencies

From the project root (`decision-os/`):

```bash
npm install
```

## 2. Environment variables

Copy the example file and add your keys:

```bash
cp .env.local.example .env.local
```

Then edit **`.env.local`** in the project root and set:

| Variable | Where to get it |
|----------|-----------------|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) — paste after the `=` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase project → Settings → API (or use `NEXT_PUBLIC_SUPABASE_ANON_KEY`) |

You can leave Supabase vars blank if you only want to test the Measurement flow locally (recommendations will work; sign-in and cloud save won’t).

## 3. Run the dev server

From the project root:

```bash
npm run dev
```

You should see something like:

```
▲ Next.js 16.x.x
- Local:    http://localhost:3000
```

## 4. Open the app

In your browser go to: **http://localhost:3000**

- **New decision** → **Measurement Decision** → fill the 3 questions → **Get recommendation** (needs `OPENAI_API_KEY` in `.env.local`).
- **Sign in** and **Save to my decisions** need the Supabase variables set.

## If you’re stuck

- **“OpenAI API key is not configured”** — Add `OPENAI_API_KEY=sk-your-key` to `.env.local` and restart the dev server (stop with Ctrl+C, then run `npm run dev` again).
- **Port in use** — Run `npm run dev -- -p 3001` to use port 3001 instead.
- **Module not found** — Run `npm install` again from the project root.
