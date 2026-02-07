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

## 2. Create the decisions table

In the Supabase dashboard, open **SQL Editor** and run the migration:

- Copy the contents of `supabase/migrations/001_decisions.sql` into a new query and run it.

This creates the `decisions` table and Row Level Security so each user only sees their own rows.

## 3. Enable Google sign-in

1. In Supabase: **Authentication → Providers → Google** → Enable.
2. In [Google Cloud Console](https://console.cloud.google.com/):
   - Create or select a project → **APIs & Services → Credentials**.
   - Create **OAuth 2.0 Client ID** (Web application).
   - Add **Authorized redirect URI**:  
     `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client secret** into Supabase Google provider.

## 4. Enable Apple sign-in

1. In Supabase: **Authentication → Providers → Apple** → Enable.
2. In [Apple Developer](https://developer.apple.com/):
   - **Certificates, Identifiers & Profiles → Identifiers** → create a **Services ID**.
   - **Keys** → create a key with **Sign in with Apple**.
   - In Supabase Apple provider, set **Services ID**, **Secret Key**, **Key ID**, **Team ID**, and **Bundle ID** as shown in the Supabase form.

Use the Supabase docs for the exact Apple steps:  
[Supabase: Apple OAuth](https://supabase.com/docs/guides/auth/social-login/auth-apple).

## 5. Redirect URL for production

In Supabase **Authentication → URL Configuration**, set:

- **Site URL**: e.g. `https://app.nerdyexecutive.com`
- **Redirect URLs**: add `https://app.nerdyexecutive.com/auth/callback`

After this, **Sign in with Google** and **Sign in with Apple** in the app will work, and decisions will be stored in Supabase per user.
