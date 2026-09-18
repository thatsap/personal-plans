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
