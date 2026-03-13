"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess(data.message || "Account created! Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (err) {
      setError("Could not connect to server. Make sure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-black mb-6">Sign Up</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-black">
            Email
            <input
              type="email"
              name="email"
              className="rounded-md border px-3 py-2"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-black">
            Password
            <input
              type="password"
              name="password"
              className="rounded-md border px-3 py-2"
              placeholder="••••••••"
              required
            />
          </label>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600">{success}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-sm text-black">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-black hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
