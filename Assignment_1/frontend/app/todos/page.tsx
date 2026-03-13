"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getToken() {
    return localStorage.getItem("token");
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    };
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    fetch(`${API}/protected/todos`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/signin");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setTodos(data);
          setLoading(false);
        }
      });
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch(`${API}/protected/todos`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title: newTitle }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Failed to create todo");
      return;
    }

    const todo = await res.json();
    setTodos((prev) => [...prev, todo]);
    setNewTitle("");
    setError("");
  }

  async function handleToggle(todo: Todo) {
    const res = await fetch(`${API}/protected/todos/${todo.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ completed: !todo.completed }),
    });

    if (!res.ok) return;
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleDelete(id: string) {
    const res = await fetch(`${API}/protected/todos/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) return;
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleEditSave(id: string) {
    if (!editingTitle.trim()) return;

    const res = await fetch(`${API}/protected/todos/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ title: editingTitle }),
    });

    if (!res.ok) return;
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingId(null);
    setEditingTitle("");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    router.push("/signin");
  }

  const email = typeof window !== "undefined" ? localStorage.getItem("email") : "";
  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">My Todos</h1>
            {email && (
              <p className="mt-1 text-sm text-black">{email}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            Logout
          </button>
        </div>

        {/* Create form */}
        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 rounded-xl border bg-white px-4 py-3 text-sm text-black shadow-sm outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {/* Stats */}
        {!loading && todos.length > 0 && (
          <p className="mb-3 text-sm text-black">
            {remaining} of {todos.length} task{todos.length !== 1 ? "s" : ""} remaining
          </p>
        )}

        {/* Todo list */}
        {loading ? (
          <p className="text-sm text-black">Loading...</p>
        ) : todos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center">
            <p className="text-black">No tasks yet. Add one above!</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo)}
                  className="h-4 w-4 cursor-pointer accent-black"
                />

                {/* Title or edit input */}
                {editingId === todo.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave(todo.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 rounded-md border px-2 py-1 text-sm text-black outline-none focus:ring-2 focus:ring-black/10"
                  />
                ) : (
                  <span
                    className={`flex-1 text-sm ${
                      todo.completed ? "line-through text-black" : "text-black"
                    }`}
                  >
                    {todo.title}
                  </span>
                )}

                {/* Action buttons */}
                <div className="flex gap-1">
                  {editingId === todo.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(todo.id)}
                        className="rounded-lg bg-black px-3 py-1 text-xs text-white hover:bg-zinc-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(todo.id);
                          setEditingTitle(todo.title);
                        }}
                        className="rounded-lg border px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
