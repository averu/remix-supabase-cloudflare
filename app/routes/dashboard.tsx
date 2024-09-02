import { useLoaderData, redirect } from "@remix-run/react"
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare"
import { destroySession, getSession } from "~/utils/sessions"
import { Button } from "~/components/ui/button"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const {
    data: { user },
  } = await getSession(request)
  if (!user) {
    return redirect("/login")
  }

  return user
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request)
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  })
}

export default function Dashboard() {
  const { email } = useLoaderData<{ email: string }>()

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {email}!</p>
      <form method="post">
        <Button type="submit">Logout</Button>
      </form>
    </div>
  )
}
