import { deriveKind, parseSections } from "../poems/stanzasCodec.ts";

import type { Poem, PoemInput, PoemStatus } from "../poems/types.ts";

import { getSupabase } from "./supabase.ts";



const columns = "id,slug,title,written,excerpt,stanzas,status,created_at,updated_at";



type PoemRow = {

  id: string;

  slug: string;

  title: string;

  written: string;

  excerpt: string;

  stanzas: unknown;

  status: string;

  created_at: string;

  updated_at: string;

};



type DbError = { code?: string; message: string };



function asWireStanzas(value: unknown): unknown[] {

  if (!Array.isArray(value)) return [];

  return value;

}



function asStatus(value: string): PoemStatus {

  return value === "published" ? "published" : "draft";

}



function rowToPoem(row: PoemRow): Poem {

  const stanzas = asWireStanzas(row.stanzas);

  const sections = parseSections(stanzas);

  const pieceKind = deriveKind(stanzas);

  return {

    id: row.id,

    slug: row.slug,

    title: row.title,

    written: row.written,

    excerpt: row.excerpt,

    stanzas,

    pieceKind,

    sections,

    status: asStatus(row.status),

    createdAt: row.created_at,

    updatedAt: row.updated_at,

  };

}



function fail(error: DbError): never {

  if (error.code === "23505") {

    throw new Error("That link is already used. Choose another.");

  }

  if (error.code === "23514") {

    throw new Error("Check the title, the link, and that a published poem has at least one stanza.");

  }

  if (error.code === "42501" || /row-level security/i.test(error.message)) {

    throw new Error("The desk refused this save. Sign in as the writer listed in allowed_emails.");

  }

  if (/is_writer|schema cache|could not find the table/i.test(error.message)) {

    throw new Error("The database is missing the chapbook schema. Run supabase/schema.sql in the Supabase SQL editor.");

  }

  throw new Error(error.message);

}



function client() {

  const supabase = getSupabase();

  if (!supabase) throw new Error("Supabase is not configured.");

  return supabase;

}



export async function listPublished(): Promise<Poem[]> {

  const { data, error } = await client()

    .from("poems")

    .select(columns)

    .eq("status", "published")

    .order("updated_at", { ascending: false });

  if (error) fail(error);

  return ((data ?? []) as PoemRow[]).map(rowToPoem);

}



export async function listDesk(): Promise<Poem[]> {

  const { data, error } = await client()

    .from("poems")

    .select(columns)

    .order("updated_at", { ascending: false });

  if (error) fail(error);

  return ((data ?? []) as PoemRow[]).map(rowToPoem);

}



export async function getBySlug(slug: string): Promise<Poem | null> {

  const { data, error } = await client()

    .from("poems")

    .select(columns)

    .eq("slug", slug)

    .maybeSingle();

  if (error) fail(error);

  return data ? rowToPoem(data as PoemRow) : null;

}



export async function getById(id: string): Promise<Poem | null> {

  const { data, error } = await client().from("poems").select(columns).eq("id", id).maybeSingle();

  if (error) fail(error);

  return data ? rowToPoem(data as PoemRow) : null;

}



export async function savePoem(id: string | null, input: PoemInput): Promise<Poem> {

  const payload = {

    slug: input.slug,

    title: input.title,

    written: input.written,

    excerpt: input.excerpt,

    stanzas: input.stanzas,

    status: input.status,

  };

  const supabase = client();

  const query = id

    ? supabase.from("poems").update(payload).eq("id", id).select(columns).maybeSingle()

    : supabase.from("poems").insert(payload).select(columns).maybeSingle();

  const { data, error } = await query;

  if (error) fail(error);

  if (!data) {

    throw new Error("The poem was not returned. Check the writer allowlist and schema.");

  }

  return rowToPoem(data as PoemRow);

}



export async function deletePoem(id: string): Promise<void> {

  const { error } = await client().from("poems").delete().eq("id", id);

  if (error) fail(error);

}


