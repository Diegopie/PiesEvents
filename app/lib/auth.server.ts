import { redirect } from "react-router";
import { createSupabaseServerClient } from "./supabase.server";

/**
 * Require an authenticated user. Redirects to /login if not authenticated.
 * Returns the supabase client, response headers, and the verified user.
 *
 * Usage:
 *   const { user, supabase, headers } = await requireAuth(request);
 */
export async function requireAuth(request: Request) {
  const { supabase, headers } = createSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw redirect("/login", { headers });
  }

  return { user, supabase, headers };
}

/**
 * Require an admin user. Redirects to /login if not authenticated,
 * throws 403 if authenticated but not admin.
 */
export async function requireAdmin(request: Request) {
  const { user, supabase, headers } = await requireAuth(request);

  const isAdmin = user.app_metadata?.is_admin === true;
  if (!isAdmin) {
    throw new Response("Forbidden", { status: 403, headers });
  }

  return { user, supabase, headers };
}

/**
 * Get the current user without requiring auth.
 * Returns null if not authenticated. Useful for pages that
 * work both logged-in and logged-out.
 */
export async function getOptionalUser(request: Request) {
  const { supabase, headers } = createSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabase, headers };
}
