"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const categories = [
  "Food & Drinks",
  "Printing & Photocopy",
  "Laundry & Dry Cleaning",
  "Phone Repairs & Accessories",
  "Fashion & Tailoring",
  "Transport & Delivery",
  "Hair & Beauty",
  "Academic Services",
  "Events & Entertainment",
  "Student Freelancers",
];

export default function VendorSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [services, setServices] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignup() {
    setSuccess("");
    setErrorMessage("");

    if (
      !email ||
      !password ||
      !businessName ||
      !category ||
      !businessLocation ||
      !whatsapp ||
      !services
    ) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data: signupData, error: signupError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

      if (signupError) {
        setErrorMessage(signupError.message);
        return;
      }

      const userId = signupData.user?.id;

      if (!userId) {
        setErrorMessage("Signup failed. Please try again.");
        return;
      }

      const response = await fetch("/api/vendor-signup-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email: cleanEmail,
          businessName,
          category,
          businessLocation,
          whatsapp,
          services,
          description,
        }),
      });

      const text = await response.text();

      let result: { error?: string; message?: string } = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        setErrorMessage("API returned invalid response. Check server route.");
        return;
      }

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create seller profile.");
        return;
      }

      setSuccess(
        "Seller account created successfully. Your profile is pending admin approval. You can login, but your shop will not go live until admin approves it."
      );

      setEmail("");
      setPassword("");
      setBusinessName("");
      setCategory("");
      setBusinessLocation("");
      setWhatsapp("");
      setServices("");
      setDescription("");
    } catch (error) {
      console.error("Seller signup error:", error);
      setErrorMessage("Something went wrong. Check the browser console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
        <section>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Seller Signup
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Create your seller account.
          </h1>

          <p className="mt-4 text-lg text-gray-700">
            CAMPUS PLAY CONNECT helps BOUESTI sellers create a shop, add
            catalogs, receive messages, and manage student orders.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl bg-white p-5 font-semibold shadow-sm">
              Email and password seller account
            </div>

            <div className="rounded-2xl bg-white p-5 font-semibold shadow-sm">
              Admin approval before going live
            </div>

            <div className="rounded-2xl bg-white p-5 font-semibold shadow-sm">
              Create your public shop and catalog
            </div>

            <div className="rounded-2xl bg-white p-5 font-semibold shadow-sm">
              Dashboard for messages and orders
            </div>
          </div>
        </section>

        <section>
          {success && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
              <h2 className="font-bold">Success</h2>
              <p className="mt-1 text-sm">{success}</p>

              <Link
                href="/vendor-login"
                className="mt-4 inline-block rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
              >
                Go to Seller Login
              </Link>
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
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seller@email.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Business Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="Example: Grace Laundry"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Category *
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Business Location *
              </label>
              <input
                type="text"
                value={businessLocation}
                onChange={(event) => setBusinessLocation(event.target.value)}
                placeholder="Example: Main Gate, Annex Gate, Hostel Area"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                WhatsApp *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="Example: 09137715973"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Services / Products *
              </label>
              <input
                type="text"
                value={services}
                onChange={(event) => setServices(event.target.value)}
                placeholder="Example: washing, ironing, delivery"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Business Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe your business"
                className="h-28 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
            >
              {loading ? "Creating Account..." : "Create Seller Account"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}