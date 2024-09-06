import { type PlatformProxy } from "wrangler"
import { type PrismaClient } from "@prisma/client"

interface Env {
  DATABASE_URL: string
  SUPABASE_URL: string
  SUPABASE_KEY: string
  SUPABASE_JWT_SECRET: string
  SUPABASE_ANON_KEY: string
  SUPABASE_DB_PASSWORD: string
  SESSION_SECRET: string
  CLOUDFLARE_ENV: string
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare
    db: PrismaClient
  }
}
