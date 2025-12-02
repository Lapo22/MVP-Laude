"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

const ensureEnv = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase client is missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Please update .env.local.",
    );
  }
};

export const getSupabaseBrowserClient = (): SupabaseClient | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    ensureEnv();
  } catch (error) {
    console.error("[supabaseBrowserClient] Environment check failed:", error);
    return null;
  }

  if (!browserClient) {
    try {
      browserClient = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
        cookieOptions: {
          name: "sb-access-token",
        },
      });
    } catch (error) {
      console.error("[supabaseBrowserClient] Failed to create client:", error);
      return null;
    }
  }

  return browserClient;
};

