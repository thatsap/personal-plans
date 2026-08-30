# Personal Lab

Intake log + gym routines. Android APK + same web app. Food and gym are sibling modules.

## One-time Supabase

1. New project (free).
2. SQL editor: run `supabase/schema.sql`.
3. **Existing project:** run `supabase/patch-workouts.sql` then `supabase/patch-sports.sql` (new tables only; meals stay).
4. Auth → Email on. **Turn off Confirm email**.
5. Settings → API: Project URL + `anon` `public` key.
6. In the app: **Connect** screen, paste those two, create account, log in.

Gym JSON prompt: `fitness/prompts/ROUTINE-JSON.md` (`kind` routine or session).

Home decks: **Fuel** (food) · **Training** (lifts + sports) · **Export** (one day combined).

Test on `npm run local` (localhost + LAN). Do not ship an APK until you say so.

## Commands

## Commands

```bash
cd fitness/lab
npm install
npm run dev          # web at :5174
npm run apk          # debug APK → PersonalLab-debug.apk
```

Install the APK: enable Install unknown apps, open `PersonalLab-debug.apk`.

Android build uses the same JDK as Time-Manager: `C:\Users\ashut\.jdks\jbr-21.0.11` (not Studio’s bundled Java 25).

Vercel later: same repo folder, env optional (Connect screen still works).
