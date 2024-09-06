import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr"
import type { AppLoadContext } from "@remix-run/cloudflare"

export function createSupabaseServerClient(
  request: Request,
  context: AppLoadContext
) {
  const headers = new Headers()
  const supabase = createServerClient(
    context.cloudflare.env.SUPABASE_URL,
    context.cloudflare.env.SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "")
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          )
        },
      },
    }
  )

  return supabase
}
