import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import type { AppLoadContext } from "@remix-run/cloudflare";

export function createSupabaseServerClient(
  request: Request,
  c: AppLoadContext
) {
  const headers = new Headers();

  const supabase = createServerClient(
    c.cloudflare.env.SUPABASE_URL,
    c.cloudflare.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    }
  );

  return supabase;
}
