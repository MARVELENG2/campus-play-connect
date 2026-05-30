"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Conversation = {
  id: string;
  vendor_id: string;
  student_name: string;
  student_whatsapp: string;
  status: string;
  unread_for_vendor: boolean;
  vendor_deleted: boolean | null;
  created_at: string;
  updated_at: string;
};

export default function VendorMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || "";
  }

  async function loadConversations() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const response = await fetch("/api/vendor/conversations", {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();

      let result: {
        error?: string;
        conversations?: Conversation[];
      } = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        setErrorMessage(
          "Server returned invalid JSON. Check app/api/vendor/conversations/route.ts."
        );
        return;
      }

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load conversations.");
        return;
      }

      const visibleConversations = (result.conversations || []).filter(
        (conversation) => conversation.vendor_deleted !== true
      );

      setConversations(visibleConversations);
    } catch (error) {
      console.error("Load conversations error:", error);
      setErrorMessage("Something went wrong while loading conversations.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteConversation(conversationId: string) {
    const confirmed = window.confirm(
      "Delete this chat from your inbox? This will hide it from your seller dashboard."
    );

    if (!confirmed) return;

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    setActionLoadingId(conversationId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/vendor/conversations/${conversationId}`,
        {
          method: "DELETE",
          cache: "no-store",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      let result: {
        error?: string;
        message?: string;
        conversation?: Conversation;
      } = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        setErrorMessage(
          "Server returned invalid JSON while deleting chat. Check app/api/vendor/conversations/[id]/route.ts."
        );
        return;
      }

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to delete chat.");
        return;
      }

      if (result.conversation?.vendor_deleted !== true) {
        setErrorMessage(
          "Delete request ran, but vendor_deleted was not saved as true."
        );
        return;
      }

      setConversations((current) =>
        current.filter((conversation) => conversation.id !== conversationId)
      );

      setSuccessMessage(result.message || "Chat deleted from inbox.");
    } catch (error) {
      console.error("Delete conversation error:", error);
      setErrorMessage("Something went wrong while deleting chat.");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-5xl font-bold">Loading messages...</div>
      </main>
    );
  }

  const unreadCount = conversations.filter(
    (conversation) => conversation.unread_for_vendor === true
  ).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-5xl">
        <Link href="/vendor-dashboard" className="font-bold text-blue-900">
          ← Back to dashboard
        </Link>

        <section className="mt-8">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Vendor Inbox
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-4xl font-black">Student Conversations</h1>

              <p className="mt-4 text-gray-700">
                Reply to students who messaged your seller shop.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
              <p className="text-sm font-bold text-gray-600">Unread</p>
              <h2 className="mt-1 text-3xl font-black">{unreadCount}</h2>
            </div>
          </div>
        </section>

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            {errorMessage}
          </div>
        )}

        <section className="mt-8 grid gap-4">
          {conversations.length === 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              No conversations yet.
            </div>
          )}

          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black">
                      {conversation.student_name}
                    </h2>

                    {conversation.unread_for_vendor && (
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-black text-white shadow-sm">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-700">
                    WhatsApp: {conversation.student_whatsapp || "Not provided"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Status: {conversation.status}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Updated:{" "}
                    {new Date(conversation.updated_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/vendor-dashboard/messages/${conversation.id}`}
                    className="rounded-full bg-blue-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
                  >
                    Open Chat
                  </Link>

                  <button
                    type="button"
                    onClick={() => deleteConversation(conversation.id)}
                    disabled={actionLoadingId === conversation.id}
                    className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {actionLoadingId === conversation.id
                      ? "Deleting..."
                      : "Delete Chat"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}