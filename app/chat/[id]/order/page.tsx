"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  username: string;
  created_at: string;
};

export default function ChatOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const conversationId = params.id as string;
  const accessCode = searchParams.get("code") || "";

  const [student, setStudent] = useState<Student | null>(null);

  const [serviceRequested, setServiceRequested] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedStudent = localStorage.getItem("student");

    if (!storedStudent) {
      window.location.href = `/student-login?redirect=${encodeURIComponent(
        window.location.pathname + window.location.search
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

  async function createOrder() {
    setSuccess("");
    setErrorMessage("");

    if (!accessCode) {
      setErrorMessage(
        "Missing chat access code. Go back to your chat link and try again."
      );
      return;
    }

    if (!student) {
      setErrorMessage("Please login as a student before creating an order.");
      return;
    }

    if (!serviceRequested || !location) {
      setErrorMessage("Please enter the service requested and location.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          accessCode,
          studentId: student.id,
          serviceRequested,
          orderNote,
          price,
          location,
        }),
      });

      const text = await response.text();

      let result: { error?: string; message?: string } = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        setErrorMessage(
          "Server returned an invalid response. Check the order API route."
        );
        return;
      }

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create order.");
        return;
      }

      setSuccess("Order created successfully. The vendor can now see it.");

      setServiceRequested("");
      setLocation("");
      setPrice("");
      setOrderNote("");
    } catch (error) {
      console.error("Create order error:", error);
      setErrorMessage("Something went wrong while creating the order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/chat/${conversationId}?code=${accessCode}`}
          className="font-bold text-blue-900"
        >
          ← Back to chat
        </Link>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Place Order
          </p>

          <h1 className="text-4xl font-black">
            Create an order from this conversation.
          </h1>

          {student && (
            <p className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700">
              Ordering as{" "}
              <span className="font-black text-gray-950">
                @{student.username}
              </span>
            </p>
          )}

          <p className="mt-4 text-gray-700">
            Only place an order after you and the vendor have discussed the
            service, price, time, and location.
          </p>

          {success && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
              {success}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              {errorMessage}
            </div>
          )}

          <form className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Service / Product Requested *
              </label>
              <input
                type="text"
                value={serviceRequested}
                onChange={(event) => setServiceRequested(event.target.value)}
                placeholder="Example: Black hoodie size L / Wash and iron 5 clothes"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Example: BOUESTI Hostel, Main Gate, Annex Gate"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Agreed Price
              </label>
              <input
                type="text"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Example: ₦1500"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Order Note
              </label>
              <textarea
                value={orderNote}
                onChange={(event) => setOrderNote(event.target.value)}
                placeholder="Add extra details for the vendor"
                className="h-32 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <button
              type="button"
              onClick={createOrder}
              disabled={loading}
              className="w-full rounded-full bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Creating Order..." : "Create Order"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}