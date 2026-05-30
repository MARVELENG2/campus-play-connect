"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  username: string;
  created_at: string;
};

export default function StartConversationPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const vendorId = params.id as string;
  const catalogItemId = searchParams.get("item") || "";

  const [student, setStudent] = useState<Student | null>(null);
  const [firstMessage, setFirstMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedStudent = localStorage.getItem("student");

    if (!storedStudent) {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/student-login?redirect=${encodeURIComponent(
        currentPath
      )}`;
      return;
    }

    try {
      setStudent(JSON.parse(storedStudent));
    } catch {
      localStorage.removeItem("student");
      window.location.href = "/student-login";
    }
  }, []);

  async function handleStartConversation() {
    setErrorMessage("");

    if (!student) {
      setErrorMessage("Please login as a student first.");
      return;
    }

    if (!firstMessage) {
      setErrorMessage("Please enter your message.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/conversations/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorId,
          studentId: student.id,
          firstMessage,
          catalogItemId: catalogItemId || null,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to start conversation.");
        return;
      }

      window.location.href = `/chat/${result.conversationId}?code=${result.accessCode}`;
    } catch (error) {
      console.error("Start conversation error:", error);
      setErrorMessage("Something went wrong while starting the chat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-3xl">
        <Link href={`/vendors/${vendorId}`} className="font-bold text-blue-900">
          ← Back to seller profile
        </Link>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Start Chat
          </p>

          <h1 className="text-4xl font-black">
            Message this seller before ordering.
          </h1>

          {student && (
            <p className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700">
              Logged in as{" "}
              <span className="font-black text-gray-950">
                @{student.username}
              </span>
            </p>
          )}

          <p className="mt-4 text-gray-700">
            Ask about price, availability, size, location, delivery time, or
            service details before placing an order.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              {errorMessage}
            </div>
          )}

          <form className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Message *
              </label>
              <textarea
                value={firstMessage}
                onChange={(event) => setFirstMessage(event.target.value)}
                placeholder="Example: Is this still available? What is the final price?"
                className="h-36 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <button
              type="button"
              onClick={handleStartConversation}
              disabled={loading}
              className="w-full rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
            >
              {loading ? "Starting Chat..." : "Start Chat"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}