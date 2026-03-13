import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prisma } from './lib/prisma.js'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Backend server is running' })
})

app.get('/api/todos', async (c) => {
  const todos = await prisma.todo.findMany({ orderBy: { id: 'desc' } })
  return c.json(todos)
})

app.post('/api/todos', async (c) => {
  const body = await c.req.json<{ title?: string }>()

  if (!body.title || body.title.trim().length === 0) {
    return c.json({ error: 'title is required' }, 400)
  }

  const todo = await prisma.todo.create({
    data: {
      title: body.title.trim(),
    },
  })

  return c.json(todo, 201)
})

const port = Number(process.env.PORT ?? 3000)

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Hono server running on http://localhost:${info.port}`)
  }
)
