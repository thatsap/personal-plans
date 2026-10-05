/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SITE_TITLE?: string;
  readonly VITE_SITE_KICKER?: string;
  readonly VITE_SITE_LEDE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
