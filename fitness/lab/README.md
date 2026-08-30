# Personal Lab

Intake log. Android APK + same web app. JSON / repeat / manual. Review 3d / 7d / custom.

## One-time Supabase

1. New project (free).
2. SQL editor: run `supabase/schema.sql`.
3. Auth → Email on. **Turn off Confirm email**.
4. Settings → API: Project URL + `anon` `public` key.
5. In the app: **Connect** screen, paste those two, create account, log in.

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
