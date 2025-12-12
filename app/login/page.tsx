"use client";

import Link from "next/link";
import Navbar from "../component/Navbar";

export default function Login() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-[var(--background-color)] px-4 pt-20">
        <main className="w-full max-w-md bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 animate-fadeInSlow">

          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">Welcome back</h1>
              <p className="text-[var(--text-muted)]">Sign in to your account</p>
            </div>

            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  className="w-full rounded-xl border border-gray-200 p-3.5 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-[var(--text-color)]">Password</label>
                  <a href="#" className="text-xs font-medium text-[var(--primary-color)] hover:underline">Forgot password?</a>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-gray-200 p-3.5 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--primary-color)] py-3.5 text-white font-semibold shadow-lg shadow-[var(--primary-color)]/30 hover:shadow-xl hover:shadow-[var(--primary-color)]/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign In
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Don't have an account?{" "}
                <Link href="/register" className="font-semibold text-[var(--primary-color)] hover:underline">
                  Create free account
                </Link>
              </p>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}