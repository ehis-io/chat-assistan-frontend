"use client";

import Link from "next/link";
import Navbar from "../component/Navbar";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please sign in.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

      const res = await fetch(`${baseUrl}/authentication/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      const token = data.token || data.accessToken || data.jwt;
      if (token) {
        localStorage.setItem("token", token);

        // Check for business
        const hasBusiness = data.user?.business || data.business || data.business_id;

        if (hasBusiness) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } else {
        throw new Error("No access token received");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">Welcome back</h1>
          <p className="text-[var(--text-muted)]">Sign in to your account</p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center border border-green-100">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-gray-200 p-3.5 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--primary-color)] py-3.5 text-white font-semibold shadow-lg shadow-[var(--primary-color)]/30 hover:shadow-xl hover:shadow-[var(--primary-color)]/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
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
    </>
  );
}

export default function Login() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-[var(--background-color)] px-4 pt-20">
        <main className="w-full max-w-md bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 animate-fadeInSlow">
          <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </main>
      </div>
    </>
  );
}