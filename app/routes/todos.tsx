import { useLoaderData, redirect, Form, useActionData } from "@remix-run/react"
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/cloudflare"
import { createSessionStorage } from "~/utils/sessions"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import getPrismaClient from "~/utils/prisma.server"

const TodoSchema = z.object({
  title: z.string().min(1, { message: "Todo cannot be empty" }),
})

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { getSession } = createSessionStorage(context)
  const session = await getSession(request)
  const prisma = getPrismaClient(context)

  const user = session.get("user")

  if (!user) {
    return redirect("/login")
  }

  const todos = await prisma.todo.findMany({
    where: {
      user: {
        authId: user.id,
      },
    },
    orderBy: {
      id: "desc",
    },
  })
  return { todos, user }
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { getSession } = createSessionStorage(context)
  const prisma = getPrismaClient(context)
  const session = await getSession(request)

  const formData = await request.formData()
  const title = formData.get("title") as string
  const user = session.get("user")

  if (!user) {
    return redirect("/login")
  }

  if (!title || title.trim() === "") {
    return { error: "Todo title cannot be empty" }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { authId: user.id },
    })

    await prisma.todo.create({
      data: {
        title,
        status: "pending",
        user: {
          connect: {
            authId: existingUser?.authId,
          },
        },
      },
    })

    return redirect("/todos")
  } catch (error) {
    console.error("Error creating todo:", error)
    return { error: "Failed to create todo" }
  }
}

export default function TodoList() {
  const { todos, user } = useLoaderData<{
    todos: Array<{ id: number; title: string }>
    user: { id: string; email: string }
  }>()
  const actionData = useActionData<{ error?: string }>()

  const form = useForm<z.infer<typeof TodoSchema>>({
    resolver: zodResolver(TodoSchema),
    defaultValues: {
      title: "",
    },
  })

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-2xl font-bold">Todo List for {user.email}</h1>
      <Form
        method="post"
        className="flex space-x-4"
      >
        <Input
          {...form.register("title")}
          placeholder="Add a new todo"
          className="w-full max-w-md"
        />
        <Button type="submit">Add</Button>
      </Form>

      {/* フォームエラーメッセージ */}
      {form.formState.errors.title && (
        <p className="text-red-500">{form.formState.errors.title.message}</p>
      )}
      {actionData?.error && <p className="text-red-500">{actionData.error}</p>}

      {/* Todoリスト */}
      <ul className="w-full max-w-md space-y-2">
        {todos.map(todo => (
          <li
            key={todo.id}
            className="border p-4 rounded-md flex justify-between"
          >
            {todo.title}
            <Form
              method="post"
              action={`/todo/delete/${todo.id}`}
            >
              <Button
                type="submit"
                variant="destructive"
              >
                Delete
              </Button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  )
}
