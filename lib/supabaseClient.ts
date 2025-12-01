import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

type CreateSupabaseServerClientOptions = {
  cookieStore?: CookieStore | Promise<CookieStore>;
  canSetCookies?: boolean;
};

const ensureEnv = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase client is missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Please update .env.local.",
    );
  }
};

export const createSupabaseServerClient = async (
  options: CreateSupabaseServerClientOptions = {},
) => {
  ensureEnv();

  const cookieStore = options.cookieStore 
    ? await Promise.resolve(options.cookieStore)
    : await cookies();
  const canSetCookies = Boolean(options.canSetCookies);

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, opts: CookieOptions) {
        if (!canSetCookies) return;
        cookieStore.set({ name, value, ...opts });
      },
      remove(name: string, opts: CookieOptions) {
        if (!canSetCookies) return;
        cookieStore.delete({ name, ...opts });
      },
    },
  });
};

