import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthValue } from "./auth-context.ts";
import { getSupabase, readCloud } from "./supabase.ts";

function writerRpcMessage(message: string): string {
  if (/is_writer|schema cache|could not find/i.test(message)) {
    return "The database is missing the chapbook schema. Run supabase/schema.sql in the Supabase SQL editor.";
  }
  return message;
}

function cleanEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readUrlError(): string | null {
  const description = new URLSearchParams(window.location.search).get("error_description");
  return description ? description.replace(/\+/g, " ") : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const cloud = readCloud();
  const [ready, setReady] = useState(!cloud.ok);
  const [session, setSession] = useState<Session | null>(null);
  const [writer, setWriter] = useState(false);
  const [writerError, setWriterError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(readUrlError);

  useEffect(() => {
    const found = getSupabase();
    if (!found) return;
    const supabase = found;

    if (new URLSearchParams(window.location.search).has("error_description")) {
      window.location.hash = "/write";
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState(null, "", `${url.pathname}${url.hash}`);
    }

    let request = 0;
    let live = true;
    const userId = { current: null as string | null };

    async function sync(next: Session | null) {
      const id = ++request;
      const nextId = next?.user.id ?? null;
      const sameUser = nextId !== null && nextId === userId.current;
      userId.current = nextId;
      setSession(next);
      if (!nextId) {
        if (!live || id !== request) return;
        setWriter(false);
        setWriterError(null);
        setReady(true);
        return;
      }
      // Token refresh is the same person. Keep the desk mounted so a draft is not wiped.
      if (!sameUser) setReady(false);
      const { data, error } = await supabase.rpc("is_writer");
      if (!live || id !== request) return;
      if (error) {
        setWriter(false);
        setWriterError(writerRpcMessage(error.message));
      } else {
        setWriter(data === true);
        setWriterError(null);
      }
      setReady(true);
    }

    void supabase.auth.getSession().then(({ data }) => {
      void sync(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      // Supabase can deadlock if another auth call runs inside this callback.
      setTimeout(() => {
        void sync(next);
      }, 0);
      if (event === "SIGNED_IN" && new URLSearchParams(window.location.search).has("code")) {
        window.location.hash = "/write";
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }
    });

    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(() => {
    return {
      cloud,
      ready,
      email: session?.user.email ?? null,
      writer,
      writerError,
      urlError,
      async signInWithPassword(email, password) {
        const supabase = getSupabase();
        if (!supabase) return "Supabase is not configured.";
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail(email),
          password,
        });
        if (!error) {
          setUrlError(null);
          return null;
        }
        if (/invalid login credentials/i.test(error.message)) {
          return "That email and password did not match.";
        }
        return error.message;
      },
      async signInWithMagicLink(email) {
        const supabase = getSupabase();
        if (!supabase) return "Supabase is not configured.";
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail(email),
          options: {
            emailRedirectTo: window.location.origin,
            shouldCreateUser: false,
          },
        });
        if (error) return error.message;
        setUrlError(null);
        return null;
      },
      async signOut() {
        const supabase = getSupabase();
        if (!supabase) return null;
        const { error } = await supabase.auth.signOut();
        return error ? error.message : null;
      },
    };
  }, [cloud, ready, session, writer, writerError, urlError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
