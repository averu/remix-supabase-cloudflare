import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useActionData, redirect } from "@remix-run/react"
import { createSupabaseServerClient } from "~/utils/supabase.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { createSessionStorage } from "~/utils/sessions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"

// バリデーションスキーマ
const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { getSession } = createSessionStorage(context)

  const {
    data: { user },
  } = await getSession(request)
  if (user) {
    return redirect("/dashboard")
  }
  return { user }
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { getSession, commitSession } = createSessionStorage(context)
  const supabase = createSupabaseServerClient(request, context)
  const formData = await request.formData()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log("error", error)
    return { error: error.message }
  }

  // セッションにユーザー情報を保存
  const serverSession = await getSession(request)
  serverSession.set("user", session?.user)

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(serverSession),
    },
  })
}

export default function Login() {
  const actionData: { error?: string } = useActionData() as { error?: string }

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return (
    <div className="flex justify-center items-center h-screen">
      <Form {...form}>
        <form
          method="post"
          className="w-full max-w-sm space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Your Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {actionData?.error && <div className="text-red-500">{actionData.error}</div>}
          <Button
            type="submit"
            className="w-full"
          >
            Login
          </Button>
        </form>
      </Form>
    </div>
  )
}
