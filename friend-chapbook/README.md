# Chapbook

The Artworks reader, for someone else. Same quiet pages. His poems live in his own Supabase project, and he can write them in the site.

`artworks/` is unchanged. This app does not share a database with it.

## Run

```bash
cd friend-chapbook
npm install
cp .env.example .env.local   # then fill in his project
npm run dev
```

Opens on [http://localhost:5176](http://localhost:5176).

Without `.env.local`, the cover still opens. **Write** explains what is missing.

## One-time Supabase setup

Create a **new** Supabase project for him. Do not reuse another project.

1. **Project Settings → API.** Copy the project URL and the **anon public** key (or the **publishable** key).  
   Do not copy the `service_role` key or a secret key. The app refuses to start with those, because they would ship in the website.
2. **Authentication → Sign In / Providers → Email.** Leave email enabled.
3. Turn **off** public sign-ups. In the dashboard this is often “Allow new users to sign up”. He should not have a register form, and strangers should not be able to create accounts.
4. **Authentication → Users → Add user.** Use his email and a password, and turn on **Auto Confirm**.
5. **SQL Editor.** Paste `supabase/schema.sql` and run it.
6. In the SQL editor, allow his inbox (lowercase is fine; the table stores it lowercase):

   ```sql
   insert into public.allowed_emails (email)
   values ('friend@example.com')
   on conflict (email) do nothing;
   ```

7. **Authentication → URL Configuration**, for the email sign-in link:
   - Site URL: `http://localhost:5176` while building, then the Vercel URL.
   - Redirect URLs: `http://localhost:5176` and `https://HIS-DOMAIN/**`.

Password sign-in does not need the redirect URLs. The email link does, and it has to be opened in the **same browser** that requested it.

Put the URL and anon key in `.env.local`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

Restart `npm run dev` after changing env vars.

Optional cover text, also in `.env.local`:

```
VITE_SITE_TITLE=His Name
VITE_SITE_KICKER=A private collection
VITE_SITE_LEDE=A quiet room for poems. Read slowly. The page will wait.
```

The tab title before JavaScript loads is in `index.html`.

## How writing works

- `#/` is the public cover. It lists **published** poems. The featured one is the published poem saved most recently.
- `#/p/the-slug` is a poem.
- `#/write` is the desk. Drafts are listed here and are not on the cover.
- A blank line in the poem box starts a new stanza. One line of the poem per line.
- Leave the excerpt blank to use the first lines.
- The link is generated from the title until he edits it. Letters, numbers, and hyphens only.

Readers can open the site with no account. The database policies are what keep drafts private: the public key can read `published` rows, and only an allowlisted signed-in email can insert, update, delete, or read drafts.

## Vercel

Use a **new** Vercel project. Do not point his domain at the Artworks project.

1. Import this git repo.
2. Set **Root Directory** to `friend-chapbook`.
3. Framework preset: Vite. Build `npm run build`. Output `dist`.
4. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and any `VITE_SITE_*` names. Same rule: anon or publishable key only.
5. Deploy.
6. Add the production URL to Supabase redirect URLs.
7. **Analytics → Enable** if you want traffic. The snippet is already in the app. Local `npm run dev` does not count.

Hash routes mean a refresh on a poem still loads the app. No rewrite file is required.

## Troubleshooting

| What you see | What to check |
| --- | --- |
| Connect / not connected | `.env.local` exists, the dev server was restarted, the URL is `https://…supabase.co` |
| The app refuses the key | You pasted the secret or `service_role` key. Use the anon or publishable key |
| The desk is not ready / schema | `supabase/schema.sql` has been run in **this** project |
| Signed in, “Not the writer” | His email is the user email, and it is in `allowed_emails` |
| Email and password did not match | The user was created in Authentication, with Auto Confirm, and sign-in is the password you set there |
| Email link fails or loops | Redirect URL is allowed, and the link was opened in the same browser. Password sign-in avoids this |
| That link is already used | Change the link field. Slugs are unique |
