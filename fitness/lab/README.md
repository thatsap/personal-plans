# Personal Lab

Intake log + gym routines. Android APK + same web app. Food and gym are sibling modules.

## One-time Supabase

1. New project (free).
2. SQL editor: run `supabase/schema.sql`.
3. **Existing project:** run `supabase/patch-workouts.sql`, then `patch-sports.sql`, then `patch-recovery.sql`, then `patch-recycle.sql`, then `patch-lab-v2.sql` (targets + body log).
4. Auth → Email on. **Turn off Confirm email**.
5. Settings → API: Project URL + `anon` `public` key.
6. In the app: **Connect** screen, paste those two, create account, log in.

Home is **Today**: kcal/protein vs saved targets, last scale, last night’s sleep, next lift. Decks stay as Fuel / Train / Recover. Body log at `/body`. Fuel Today: tap a recent food, then log.

Gym JSON prompt: `fitness/prompts/ROUTINE-JSON.md` (`kind` routine or session).

Test on `npm run local` (localhost + LAN). Do not ship an APK until you say so.

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
