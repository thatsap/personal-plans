# Personal Lab — PRD (v2)

**Status:** agreed direction, 30 Aug 2026  
**Owner:** Kai / Ashutosh  
**Job:** log intake. Nothing else.  
**Does not replace:** Garmin, Lyfta, the Greek God protocol.  
**Cost:** one user. Supabase free + Vercel Hobby + sideloaded APK. No AI API in the app (JSON is pasted). Not a paid product.

---

## 1. One line

Phone + website, same React code. Log what went in. Three doors: **manual**, **AI JSON**, **repeat a saved food** at a **new quantity**. JSON is stored in Supabase as **per 1 unit**; the lab multiplies.

---

## 2. Verdict on this plan

**Keep:** React + Vercel **and** Capacitor Android **in the same build** — this gets used on the phone, heavily. Supabase, login, tracking-only, three doors. LLM is the calorie brain **when the input is specific** (shop, ingredients, size). That is careful logging, not a guess we shrug at.

**Cut or delay:**

| Idea | Why |
|------|-----|
| Micros as first-class UI | Still skip. Macros + kcal. Extra JSON can sit unused. |
| File-upload as the only JSON path | **Paste** on Android (heavy daily use). File upload on web too. Both. |
| Sleep / gym / week dashboard in v0 | Meals day after day. Today + 2455 / 214g. |

**LLM path:** he will say what he bought, where, ingredients, size. The model predicts **per 1 unit** (1 g, 1 piece, 1 katori…). That JSON is saved on the backend. Next time: pick the food, type a new quantity, lab multiplies. No second AI call unless the recipe changed.

---

## 3. Definitions

| Term | Meaning here |
|------|-------------|
| **Lab** | This app. Not a hospital. Not Arjun OS. |
| **Ingestion** | One thing that went in: a meal, a snack, a junk hit. Row in the log. |
| **Food (saved)** | Backend row: name, unit, macros **per 1 unit**. Copied from JSON/manual. |
| **Manual** | Same math: unit + per-unit + quantity. Lab multiplies. |
| **JSON door** | Voice/text to any AI → JSON → paste/upload. Saved to `foods` + logged as ingestions. |
| **Repeat** | Pick saved food, **change quantity**, lab does `perUnit × quantity`. Same meal, different size. |
| **Unit** | What “1” means: `g` \| `ml` \| `piece` \| `katori` \| `cup` \| `tbsp` \| `tsp` \| `plate` \| `packet` \| `slice` |
| **Tag** | `protocol` = written meal. `snack` = extra, not necessarily junk. `junk` = the leak. All three still count. |
| **Day close** | Optional in v0. If we ship it: lock adds until tomorrow. |
| **Target** | 2,455 kcal · ~214 g protein. Over is visible, not punished. |
| **Capacitor** | Shell that turns the same React site into an Android APK. |
| **Supabase** | Auth + Postgres + row-level security. Your account. |

---

## 4. Surfaces (both, from the start)

Same React codebase. **Not web-then-maybe-phone.** Daily use is Android; Vercel is the same app in a browser (desk, share link, backup).

1. **Android** — Capacitor + Android Studio. Primary. Paste JSON + repeat must work on a phone.
2. **Web** — Vercel. Same UI, same Supabase.

Login: Supabase Auth, email + password. RLS: `user_id = auth.uid()`.

---

## 5. Three intake doors (v0 agenda)

```
[ + Add ]
  1. Manual
  2. Paste / upload JSON
  3. Repeat saved food
```

**Today screen:** date, kcal / 2455, protein / 214, list (name, qty + unit, tag, kcal).

Math the app always owns (never trust a mismatched total from the model):

```
kcal     = round(perUnit.kcal × quantity)
proteinG = perUnit.proteinG × quantity
carbsG   = perUnit.carbsG × quantity
fatG     = perUnit.fatG × quantity
```

Example: samosa saved as 260 kcal **per piece**. He ate 2 → 520. Tomorrow he eats 1 → 260. Same food row.

---

## 6. JSON contract (schemaVersion 2)

Per-unit is the source of truth. `quantity` is a **number**. The lab multiplies.

```json
{
  "schemaVersion": 2,
  "ingestions": [
    {
      "eatenAt": "2026-08-30T19:15:00+05:30",
      "name": "Samosa",
      "boughtFrom": "stall near gym",
      "ingredients": "potato-pea filling, fried in oil",
      "tag": "junk",
      "unit": "piece",
      "quantity": 2,
      "perUnit": {
        "kcal": 260,
        "proteinG": 4,
        "carbsG": 26,
        "fatG": 15,
        "fiberG": 2
      },
      "uncertainty": "low",
      "notes": "medium, oil-fried"
    }
  ]
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `schemaVersion` | yes | `2` |
| `ingestions` | yes | Array. |
| `eatenAt` | yes | ISO-8601 +05:30. Now if omitted. |
| `name` | yes | Human label. |
| `unit` | yes | `g` \| `ml` \| `piece` \| `katori` \| `cup` \| `tbsp` \| `tsp` \| `plate` \| `packet` \| `slice` |
| `quantity` | yes | Number of units eaten **this time** (e.g. `180` grams, `2` pieces, `1.5` katori). |
| `perUnit` | yes | Macros for **exactly 1** of `unit`. Prefer `g` when he gave grams. |
| `perUnit.kcal` | yes | Integer, per 1 unit. |
| `perUnit.proteinG` `carbsG` `fatG` | yes | Per 1 unit. |
| `boughtFrom` `ingredients` | no | |
| `tag` | yes | `protocol` \| `snack` \| `junk` |
| `uncertainty` | no | `low` \| `medium` \| `high` |
| `notes` | no | |
| `micros` | no | Persisted, not shown. |

Prefer `unit: "g"` when he weighed it or named grams. Piece/katori only when that is how he buys it.

On save: upsert **`foods`** on `(user_id, name, unit, boughtFrom)` with `perUnit`. Write **`ingestions`** with `quantity` + **computed** totals. If the JSON also sent plate totals, ignore them unless they match multiply within 2 kcal (then still store multiply).

Reject if `perUnit.kcal` or `unit` or `quantity` missing.

---

## 7. Data (Supabase)

**`foods`** — library (per-unit recipe)  
`id`, `user_id`, `name`, `bought_from`, `ingredients`, `tag`, `unit`, `kcal_per_unit`, `protein_g_per_unit`, `carbs_g_per_unit`, `fat_g_per_unit`, `fiber_g_per_unit`, `source_json` (jsonb), `last_used_at`, `created_at`

**`ingestions`** — log (snapshot of this eating)  
`id`, `user_id`, `eaten_at`, `food_id`, `name`, `unit`, `quantity`, `kcal`, `protein_g`, `carbs_g`, `fat_g`, `tag`, `source` (`manual` \| `json` \| `repeat`), `created_at`

Totals on ingestions are **multiplied at write time**. Changing quantity later is a new row, not an edit of the food’s per-unit unless he re-runs JSON because the recipe changed.

RLS: `user_id = auth.uid()`.

---

## 8. UX

**Login** — email, password.

**Today** — totals + list. Three buttons for the three doors.

**Manual** — name, unit, quantity, **per-unit** kcal (and P/C/F). Lab multiplies.

**JSON** — paste box (+ file on web). Preview: each line shows `qty × unit` and **computed** totals → confirm → save to `foods` + `ingestions`.

**Repeat** — list saved foods. Tap → quantity field (default last quantity) → live totals → save. Different amount of the same meal, no new JSON.

---

## 9. Build order (web and Android together)

1. Supabase: Auth, tables, RLS.
2. Vite + React + **Capacitor in the repo from day one** (`fitness/lab/`).
3. Login, today, three doors (manual, JSON paste, repeat).
4. Run on **localhost and Android emulator/device in the same stretch** — same commit. Then Vercel with the same build.

Phone paste of JSON is a v0 requirement, not a later wrap.

---

## 10. Out of scope (still)

Garmin import, eat-back, photo calories, barcode, social, AI inside the app, workout logger, Arjun OS merge, micros UI.

---

## 11. Success

You can log a junk snack in under 30 seconds (repeat or JSON paste). A week of rows exists in Supabase. Scale and sleep still belong to the watch and the Sunday weigh-in — not this app.

---

## 12. Prompt file

Copy-paste for Claude / Grok / ChatGPT / anything:

`fitness/prompts/INTAKE-JSON.md`
