"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Student = {
  id: string;
  username: string;
  created_at: string;
};

function StudentLoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/student-dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin() {
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/student/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Login failed.");
        return;
      }

      const student = result.student as Student;

      localStorage.setItem("student", JSON.stringify(student));
      window.dispatchEvent(new Event("student-auth-change"));

      window.location.href = redirect;
    } catch (error) {
      console.error("Student login error:", error);
      setErrorMessage("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-xl">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Student Login
          </p>

          <h1 className="text-4xl font-black">Login to your student account.</h1>

          <p className="mt-4 text-gray-700">
            Continue chats, save seller items, and track your orders.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              {errorMessage}
            </div>
          )}

          <form className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <Link
              href="/student-signup"
              className="block text-center font-bold text-blue-900"
            >
              New student? Create account
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
          <div className="mx-auto max-w-xl font-bold">
            Loading student login...
          </div>
        </main>
      }
    >
      <StudentLoginContent />
    </Suspense>
  );
}