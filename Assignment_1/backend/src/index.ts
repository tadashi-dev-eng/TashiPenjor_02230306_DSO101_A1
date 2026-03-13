import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { sign } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { PrismaClient, Prisma } from "@prisma/client";
import { serve } from "@hono/node-server";
import bcrypt from "bcrypt";

type JwtPayload = { sub: string; exp: number };

const app = new Hono<{ Variables: { jwtPayload: JwtPayload } }>();
const prisma = new PrismaClient();

app.use("/*", cors());

app.use(
  "/protected/*",
  jwt({
    secret: "mySecretKey",
    alg: "HS256",
  })
);

app.get("/", (c) => {
  return c.json({ message: "Server is running" });
});


app.post("/register", async (c) => {
  try {
    const body = await c.req.json();

    const bcryptHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        hashedPassword: bcryptHash,
      },
    });

    return c.json({ message: `${user.email} created successfully` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if ((e as Prisma.PrismaClientKnownRequestError).code === "P2002") {
        console.log(
          "There is a unique constraint violation, a new user cannot be created with this email"
        );
        return c.json({ message: "Email already exists" }, 409);
      }
    }

    console.error(e);
    return c.json({ message: "Could not create user" }, 500);
  }
});

app.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, hashedPassword: true, email: true },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const match = await bcrypt.compare(body.password, user.hashedPassword);

    if (!match) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    const payload = {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 60 minutes
    };

    const token = await sign(payload, "mySecretKey");

    return c.json({
      message: "Login successful",
      token,
      email: user.email,
      id: user.id,
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Invalid credentials" }, 401);
  }
});

// ── Todo CRUD ──────────────────────────────────────────────────────────────

// GET all todos for the logged-in user
app.get("/protected/todos", async (c) => {
  const payload = c.get("jwtPayload");
  const todos = await prisma.todo.findMany({
    where: { userId: payload.sub },
    orderBy: { createdAt: "asc" },
  });
  return c.json(todos);
});

// POST create a new todo
app.post("/protected/todos", async (c) => {
  const payload = c.get("jwtPayload");
  const body = await c.req.json();

  if (!body.title || body.title.trim() === "") {
    return c.json({ message: "Title is required" }, 400);
  }

  const todo = await prisma.todo.create({
    data: {
      title: body.title.trim(),
      userId: payload.sub,
    },
  });
  return c.json(todo, 201);
});

// PUT update a todo (title and/or completed)
app.put("/protected/todos/:id", async (c) => {
  const payload = c.get("jwtPayload");
  const id = c.req.param("id");
  const body = await c.req.json();

  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== payload.sub) {
    return c.json({ message: "Todo not found" }, 404);
  }

  const updated = await prisma.todo.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.completed !== undefined && { completed: body.completed }),
    },
  });
  return c.json(updated);
});

// DELETE a todo
app.delete("/protected/todos/:id", async (c) => {
  const payload = c.get("jwtPayload");
  const id = c.req.param("id");

  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== payload.sub) {
    return c.json({ message: "Todo not found" }, 404);
  }

  await prisma.todo.delete({ where: { id } });
  return c.json({ message: "Todo deleted" });
});

serve({
  fetch: app.fetch,
  port: 3001,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

export default app;