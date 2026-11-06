import { createBrowserClient } from "@supabase/ssr";

export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

let browserClient: ReturnType<typeof createBrowserClient> | null = null;
export function createSupabaseBrowserClient() {
  if (!supabaseConfigured) return null;
  if (browserClient) return browserClient;
  try {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  } catch {
    // An invalid public URL must not prevent guest learning from rendering.
    return null;
  }
  return browserClient;
}
