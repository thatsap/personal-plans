# Artworks

A quiet React chapbook for poems. Reading-first, responsive, one collection.

## Run

```bash
cd artworks
npm install
npm run dev
```

Opens on [http://localhost:5175](http://localhost:5175).

## Add a poem

1. Create `src/poems/your-slug.ts` with a `Poem` object (copy `and-i-had-enough.ts`).
2. Import it in `src/poems/index.ts` and add it to the `poems` array.

That is the whole path. The home page and next/previous links update from that list.

## Analytics

Traffic shows in the Vercel project under **Analytics**, not from a deploy alone.

1. In the Vercel dashboard, open the project → **Analytics** → **Enable**.
2. Deploy this repo (the `@vercel/analytics` snippet is already in the app).
3. After real visitors hit the live site, page views appear there. Local `npm run dev` does not count.
