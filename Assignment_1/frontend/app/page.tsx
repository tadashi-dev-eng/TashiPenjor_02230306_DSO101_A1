"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(localStorage.getItem("email"));
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    setEmail(null);
    router.push("/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to DSO101 Assignment 1
          </h1>
          {email ? (
            <p className="max-w-md text-lg leading-8 text-black">
              Signed in as <span className="font-medium text-black">{email}</span>
            </p>
          ) : (
            <p className="max-w-md text-lg leading-8 text-black">
              Use the buttons below to sign in or sign up.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          {email ? (
            <>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-white transition-colors hover:bg-zinc-800 md:w-40"
                href="/todos"
              >
                My Todos
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/20 px-5 transition-colors hover:bg-zinc-100 md:w-40"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-white transition-colors hover:bg-zinc-800 md:w-40"
                href="/signin"
              >
                Sign In
              </Link>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/15 dark:hover:bg-[#1a1a1a] md:w-40"
                href="/signup"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
