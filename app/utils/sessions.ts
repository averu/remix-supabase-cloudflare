// session.server.ts
import { Session } from "@remix-run/cloudflare"
import { createCookieSessionStorage } from "@remix-run/node"

// 環境変数からセッションの秘密鍵を取得
const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set")
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session", // クッキーの名前
    httpOnly: true, // JavaScriptからクッキーにアクセスできないようにする
    secure: process.env.NODE_ENV === "production", // 本番環境ではHTTPSを必須にする
    sameSite: "lax", // クロスサイトリクエストでクッキーを送信するかどうか
    path: "/", // クッキーが有効なパス
    maxAge: 60 * 60 * 24 * 30, // クッキーの有効期間（例: 30日）
    secrets: [sessionSecret], // クッキーの署名に使用する秘密鍵
  },
})

// ユーザーのセッションを取得
export const getSession = (request: Request) => {
  return sessionStorage.getSession(request.headers.get("Cookie"))
}

// セッションを保存
export const commitSession = (session: Session) => {
  return sessionStorage.commitSession(session)
}

// セッションを破棄
export const destroySession = (session: Session) => {
  return sessionStorage.destroySession(session)
}
