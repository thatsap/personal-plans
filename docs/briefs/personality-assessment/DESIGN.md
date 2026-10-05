# Design: Personality assessment (behavioral, vault-evidence)

## Approach

**Primary method (mandatory):** **Critical Incident Technique (CIT)** applied to the personal vault, with outputs structured as **Start / Stop / Continue** (mapped to **more of / less of** in the brief).

**Why this method (and not a scored instrument):**

- Standard development feedback that drives behavior change is usually **specific behaviors**, not trait labels or type codes. **Start–Stop–Continue** is a common 360 and team-development frame: start new helpful behaviors, stop counterproductive ones, continue what already works ([UW–Madison HR Start–Stop–Continue](https://hr.wisc.edu/professional-development/programs/healthy-teams/performing/start-stop-continue/); [PeopleBeam overview](https://www.peoplebeam.com/blog/understanding-the-stop-start-and-continue-feedback-framework-10-examples)).
- **Multirater / 360 feedback** research emphasizes **relevant, behaviorally specific content** and **credible data**—not invented norms—when the goal is behavior change ([Bracken & Rose, 2011](https://leadershipbeach.com/wp-content/uploads/2020/11/Bracken-and-Rose-2011.pdf); [Nowack, 2009 summary](https://www.envisialearning.com/system/resources/69/Leveraging_360_Feedback_to_Facilitate_Successful_Behavior_Change_Consulting_Psychology_Practice_and_Research_Nowack_2009.pdf)).
- **Critical Incident Technique** (Flanagan, 1954; applied guidance e.g. [Wiley CIT user guide](https://onlinelibrary.wiley.com/doi/10.1111/j.1365-2648.2007.04490.x)) collects **concrete past episodes**: circumstance, action, outcome. The vault already contains self-reported incidents (vow/break registers, scarcity climb, lab AAR, agent observations)—equivalent to **Behavioral Event Interview (BEI)** material without a live interview: past behavior in similar situations is the evidence base ([BEI / critical-incident competency practice](https://voicit.com/en/blog/human-resources/critical-incident-interview/8337/)).
- **Hogan-style “bright side vs derailer”** is useful only as a **qualitative lens**: strengths that become counterproductive when **overused under stress, idle time, or broken self-monitoring**—**not** as Hogan Development Survey scores he never took ([Hogan derailers overview](https://www.hoganassessments.com/blog/how-your-greatest-strength-can-become-your-greatest-weakness/)). Name patterns (“meticulous → same-day broken order”) only when vault incidents support them.
- **Coaching ethics boundary:** This artifact is **developmental feedback**, not clinical assessment. Do **not** diagnose, assign disorder labels, or invent psychometric scores (Big Five, MBTI, Hogan percentiles). Coaches refer clinical work elsewhere; stay in scope ([ICF coaching vs therapy / scope](https://coachingfederation.org/wp-content/uploads/2021/02/Therapy-White-Paper.pdf)).

**Process the implementer must follow:**

1. Read every vault file listed in `BRIEF.md` (evidence only).
2. Extract **critical incidents** (dated or situational facts: what happened, what he did, observable result).
3. Cluster incidents into **recurring behaviors** (not personality types).
4. For each behavior, assign **Continue / Start (more of)** or **Stop (less of)** using Start–Stop–Continue logic.
5. Where stress/idle clearly flips a strength into harm, note it in **less of** using derailer **language** only—never Hogan scale names as if scored.
6. Publish only items that have **behavior + cue + vault evidence** (file name + specific fact).

**Escalation check:** The vault **does** support this method (no missing questionnaire). **Do not escalate** for instrument gap.

**She / shrine:** She may appear only as a **named behavioral move** (self-erasure, same-day broken vow, fog treated as a door)—never as drafted contact, plot, or chat reload.

---

## Layers (table: Change | Layer | Path)

| Change | Layer | Path |
|--------|--------|------|
| Locked | Method & evidence rules | `docs/briefs/personality-assessment/DESIGN.md` (this file) |
| Locked | Product brief | `docs/briefs/personality-assessment/BRIEF.md` |
| Replace | Assessment artifact (UI) | `C:\Users\ashut\.cursor\projects\c-Learning-Projects-repo-personal-plans\canvases\ashutosh-personality-reading.canvas.tsx` |
| Read-only | Vault evidence | Paths listed in `BRIEF.md` § Vault to read |

---

## Contract

**Deliverable:** One Cursor Canvas that **replaces** the existing narrative portrait with a **behavioral assessment**.

**Required section order in the canvas (use `H1` / `H2` in this order):**

1. **Method & scope** — State primary method (**CIT → Start/Stop/Continue**). Summarize how that method is usually structured. Link or cite at least three web sources from Approach above. Include one `Callout` (tone appropriate) stating: not clinical diagnosis; no invented type scores or percentiles.
2. **How to use** — Short rules: each row is a behavior; **cue** = observable trigger; **evidence** = vault fact only.
3. **More of** — Distinct behaviors to **start or continue** (`Table` recommended).
4. **Less of** — Distinct behaviors to **stop or reduce** (include overuse-under-stress patterns only when incident-backed).
5. **Summary stats** — Optional `Stat` row(s): e.g. count of more-of items, count of less-of items, count of vault files cited. **No** fake norms, percentiles, or type codes.

**Per-item schema (every row in More of and Less of):**

| Field | Requirement |
|--------|----------------|
| **Behavior** | Imperative, observable action (not a trait slogan like “he is anxious”). |
| **Cue** | One observable sentence: body state, situation, or self-talk that means this behavior is active or tempting. |
| **Vault evidence** | Specific fact + source file from BRIEF vault list (e.g. date, metric, quoted pattern). Verify in file; do not invent beyond known facts listed in Design § Known facts anchor. |

**Known facts anchor (verify in vault; do not extend without evidence):**

- Ashutosh Pandey, 24 (birthday 29 Aug 2026), India; tech lead at 22; mechanical → software; configurators.
- Scarcity climb documented in `MY-STORY.md`.
- Vow/break pattern: 29 Aug like-and-leave then pour; 31 Aug morning order broken same afternoon; 1 Sep last try (closure files).
- Garmin 13–22 Aug sleep ~3h average, score 41; spoken weight ~93 kg (`fitness/CURRENT-STATS.md` and related).
- Lab AAR 21–23 Sep: ~2677 kcal vs 2455 target, protein ~177 vs 214, 0 days on target, laddu (`fitness/screenshots/aar/lab-aar-2026-09-14-to-2026-09-23.txt`).
- Agents: over-collects 90-day bibles; talks too much once valve opens; flow (court, code) clears loop; idle reopens it (`agents/*.md`).
- Chimera = cold overcorrection of leaked workplace warmth (`PROJECT-CHIMERA.md`—doctrine only, not extended).

**Minimum counts (QA):** At least **4** more-of items and **4** less-of items, each fully filled.

**Canvas technical contract:**

- Single file: `ashutosh-personality-reading.canvas.tsx` only.
- Imports **only** from `cursor/canvas`.
- Use **`useHostTheme()`** for colors; **no** hardcoded hex, **no** gradients, **no** box-shadows, **no** emojis.
- Prefer these components: **`H1`**, **`H2`**, **`Text`**, **`Stack`**, **`Table`**, **`Callout`**, **`Stat`**. Layout may use **`Grid`** / **`Divider`** sparingly if needed; do not introduce charts for fake scores.
- **No** `fetch`, no new helper files, no extra routes or app code.

---

## Allowlist (implementer may edit)

- `C:\Users\ashut\.cursor\projects\c-Learning-Projects-repo-personal-plans\canvases\ashutosh-personality-reading.canvas.tsx`

---

## Forbidden

- Editing `BRIEF.md`, `DESIGN.md`, or any other repo file.
- `MY-STORY.md`, all `KAI-*` files, fitness lab source, `.env`, `package.json`, new markdown protocols, or new docs.
- New dependencies, state libraries, UI kits, backend, auth, schema, env, CI, deploy.
- MBTI/Big Five/Hogan **scores**, percentiles, clinical diagnoses, or “type” labels presented as measured.
- New 90-day protocol, operating-system bible, or message drafted to her.
- Biography-only narrative without more-of / less-of tables.
- Reloading her chat logs as assessment subject.

---

## Risks / stop-lines

| Risk | Stop-line |
|------|-----------|
| Shrine / her as plot | Any drafted text to her or urge to reopen shrine → stop; keep named moves only. |
| Protocol cosplay | Assessment becomes another 90-day OS → out of scope; remove protocol sections. |
| Fake psychometrics | Any percentile, type code, or “HDS high X” → fail QA; rewrite as behavior + incident. |
| Trait soup | Items without vault citation → fail; add evidence or delete item. |
| Hogan cosplay | Using Hogan subscale names **as if he sat the assessment** → forbidden; overuse patterns OK with incident proof only. |
| Canvas skill violations | Hardcoded hex, gradients, shadows, emojis → fix before done. |
| Questionnaire gap | If implementer believes scoring requires answers not in vault → **escalate** (architect: vault is sufficient for CIT; do not invent answers). |

---

## QA hooks

Check by **reading only** `ashutosh-personality-reading.canvas.tsx`:

| Hook | Pass |
|------|------|
| Method named | Section 1 names **CIT + Start/Stop/Continue** and cites ≥3 external sources (URLs or clear titles). |
| More of | Section 3 lists distinct **behaviors** (not traits). |
| Less of | Section 4 lists distinct **behaviors**. |
| Cue on every item | Every more-of and less-of row has an explicit cue field/column. |
| Evidence on every item | Every row cites a vault file + specific fact. |
| No fake scores | No percentiles, MBTI, Big Five, Hogan numeric/scales-as-scored, or clinical labels. |
| Scope | No message to her; no 90-day plan; not solely biography (tables dominate). |
| Technical | Single `.canvas.tsx`; `cursor/canvas` only; no fetch; theme tokens only. |
| Counts | ≥4 more-of, ≥4 less-of, all fields complete. |
