import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
  type CookieOptions,
} from "@supabase/ssr";

/**
 * Creates a Supabase client for server-side use in loaders/actions.
 * Reads auth cookies from the incoming request and sets updated cookies
 * on the response headers (Supabase refreshes tokens automatically).
 *
 * Usage in a loader/action:
 *   const { supabase, headers } = createSupabaseServerClient(request);
 *   const { data: { user } } = await supabase.auth.getUser();
 *   return data({ user }, { headers });  // always pass headers back!
 */
export function createSupabaseServerClient(request: Request) {
  const headers = new Headers();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const parsed = parseCookieHeader(
            request.headers.get("Cookie") ?? ""
          );
          return parsed
            .filter(
              (c): c is { name: string; value: string } =>
                c.value !== undefined
            );
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            );
          });
        },
      },
    }
  );

  return { supabase, headers };
}
