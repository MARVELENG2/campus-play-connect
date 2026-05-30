"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin() {
    setErrorMessage("");
    setSuccess("");

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccess("Login successful. Redirecting to vendor dashboard...");

      setTimeout(() => {
        window.location.href = "/vendor-dashboard";
      }, 1000);
    } catch (error) {
      console.error("Vendor login error:", error);
      setErrorMessage("Something went wrong. Check the browser console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <section>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Vendor Login
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Access your seller dashboard.
          </h1>

          <p className="mt-4 text-lg text-gray-700">
            Login to manage your CAMPUS PLAY CONNECT vendor profile, messages,
            and future orders from BOUESTI students.
          </p>
        </section>

        <section>
          {success && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
              <h2 className="font-bold">Success</h2>
              <p className="mt-1 text-sm">{success}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              <h2 className="font-bold">Error</h2>
              <p className="mt-1 text-sm">{errorMessage}</p>
            </div>
          )}

          <form className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vendor@email.com"
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
                placeholder="Enter your password"
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
          </form>
        </section>
      </div>
    </main>
  );
}