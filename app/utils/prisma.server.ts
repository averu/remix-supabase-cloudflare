import { PrismaClient } from "@prisma/client"
import type { AppLoadContext } from "@remix-run/cloudflare"

// PrismaClient を初期化する関数
const prismaClientSingleton = (databaseUrl: string) => {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl, // context から取得した DATABASE_URL を使用
      },
    },
  })
}

// グローバル変数に PrismaClient を保存
declare const globalThis: {
  prismaGlobal?: PrismaClient
} & typeof global

// Prisma クライアントの初期化関数
const getPrismaClient = (context: AppLoadContext) => {
  const databaseUrl = context.cloudflare.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set")
  }

  // 開発環境では PrismaClient を再利用
  const prisma = globalThis.prismaGlobal ?? prismaClientSingleton(databaseUrl)

  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma // 開発環境で PrismaClient をキャッシュ
  }

  return prisma
}

export default getPrismaClient
