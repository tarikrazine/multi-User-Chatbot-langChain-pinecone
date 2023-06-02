import { createClient } from "@supabase/supabase-js";

export const supabaseClient = async (supabaseAccessToken?: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${supabaseAccessToken}` } },
    },
  );

  return supabase;
};
