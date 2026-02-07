# Supabase setup (auth + decisions)

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     (Or use **Publishable key** as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` if your project uses the new key format.)

3. Add to `.env.local` (and in Vercel: **Project → Settings → Environment Variables**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Create the decisions table (private per user)

In the Supabase dashboard, open **SQL Editor** and run the migrations in order:

1. **First run** `supabase/migrations/001_decisions.sql`  
   This creates the `decisions` table and Row Level Security (RLS) so each user only sees and edits their own rows.

2. **If decisions are visible to everyone** (e.g. you created the table earlier without RLS), run `supabase/migrations/002_decisions_rls_policies.sql`  
   This enables RLS and (re)creates the policies. Safe to run multiple times.

The app always saves new decisions with the signed-in user’s `user_id`; RLS ensures no user can read or change another user’s decisions.

## 3. (Fastest path) Enable Email sign-in

1. In Supabase: **Authentication → Providers → Email** → ensure it’s **Enabled**.
2. Optional: turn **off** “Confirm email” so new users can sign in immediately without checking their inbox. (You can turn it on later for production.)
3. No extra config needed. The app uses email + password on `/signin` (Sign in / Create account).

## 4. (Optional) Enable Google sign-in

1. In Supabase: **Authentication → Providers → Google** → Enable.
2. In [Google Cloud Console](https://console.cloud.google.com/):
   - Create or select a project → **APIs & Services → Credentials**.
   - Create **OAuth 2.0 Client ID** (Web application).
   - Add **Authorized redirect URI**:  
     `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client secret** into Supabase Google provider.

## 5. (Optional) Enable Apple sign-in

1. In Supabase: **Authentication → Providers → Apple** → Enable.
2. In [Apple Developer](https://developer.apple.com/):
   - **Certificates, Identifiers & Profiles → Identifiers** → create a **Services ID**.
   - **Keys** → create a key with **Sign in with Apple**.
   - In Supabase Apple provider, set **Services ID**, **Secret Key**, **Key ID**, **Team ID**, and **Bundle ID** as shown in the Supabase form.

Use the Supabase docs for the exact Apple steps:  
[Supabase: Apple OAuth](https://supabase.com/docs/guides/auth/social-login/auth-apple).

## 6. Redirect URL for production

In Supabase **Authentication → URL Configuration**, set:

- **Site URL**: e.g. `https://app.nerdyexecutive.com`
- **Redirect URLs**: add `https://app.nerdyexecutive.com/auth/callback`

After this, **email sign-in** works immediately. If you enabled Google/Apple, those will work too. Decisions are stored in Supabase per user.
