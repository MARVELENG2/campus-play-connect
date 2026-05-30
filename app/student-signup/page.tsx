"use client";

import Link from "next/link";
import { useState } from "react";

export default function StudentSignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignup() {
    setSuccess("");
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Please enter username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/student/signup", {
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
        setErrorMessage(result.error || "Failed to create account.");
        return;
      }

      setSuccess("Account created. You can now login.");

      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Student signup error:", error);
      setErrorMessage("Something went wrong while creating account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 px-6 py-16 text-gray-950">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
        <section>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Student Buyer Account
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Create your student account.
          </h1>

          <p className="mt-4 text-lg leading-8 text-gray-700">
            Students use username and password to chat with sellers, place
            orders, and track order status.
          </p>

          <div className="mt-8 rounded-3xl bg-blue-950 p-6 text-white shadow-sm">
            <h2 className="text-2xl font-black">Why login?</h2>
            <p className="mt-3 text-blue-100">
              Your account keeps your chats and orders connected so sellers know
              who they are talking to.
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          {success && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
              {success}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Example: marvelstudent"
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
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
            >
              {loading ? "Creating Account..." : "Create Student Account"}
            </button>

            <p className="text-center text-sm text-gray-700">
              Already have an account?{" "}
              <Link href="/student-login" className="font-bold text-blue-900">
                Login
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}