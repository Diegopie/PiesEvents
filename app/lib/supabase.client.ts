import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser-side use.
 * Used for client-side auth flows (signInWithOtp, verifyOtp, etc.).
 * Cookies are managed by the browser automatically.
 *
 * Env vars are passed from the server via the root loader
 * so they're available without exposing .env to the client bundle.
 */
export function createSupabaseBrowserClient(
  supabaseUrl: string,
  supabaseAnonKey: string
) {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
