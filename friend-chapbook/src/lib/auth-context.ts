import { createContext, useContext } from "react";
import type { Cloud } from "./supabase.ts";

export type AuthValue = {
  cloud: Cloud;
  ready: boolean;
  email: string | null;
  writer: boolean;
  writerError: string | null;
  urlError: string | null;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signInWithMagicLink: (email: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
};

export const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
