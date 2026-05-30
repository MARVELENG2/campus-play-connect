"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Conversation = {
  id: string;
  vendor_id: string;
  student_name: string;
  student_whatsapp: string;
  access_code: string;
  status: string;
  unread_for_vendor?: boolean;
  vendor_deleted?: boolean;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  vendor_id: string;
  sender_type: string;
  sender_name: string;
  message: string;
  created_at: string;
};

export default function VendorMessageThreadPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyMessage, setReplyMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || "";
  }

  async function markAsRead() {
    const token = await getToken();

    if (!token) return;

    try {
      await fetch(`/api/vendor/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          unreadForVendor: false,
        }),
      });
    } catch (error) {
      console.error("Mark chat as read error:", error);
    }
  }

  async function loadConversation() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const response = await fetch(`/api/vendor/messages/${conversationId}`, {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();

      let result: {
        error?: string;
        conversation?: Conversation;
        messages?: Message[];
      } = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        setErrorMessage(
          "Server returned invalid JSON. Check app/api/vendor/messages/[id]/route.ts."
        );
        return;
      }

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load conversation.");
        return;
      }

      setConversation(result.conversation || null);
      setMessages(result.messages || []);

      await markAsRead();
      scrollToBottom();
    } catch (error) {
      console.error("Load vendor conversation error:", error);
      setErrorMessage("Something went wrong while loading this chat.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReply() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!replyMessage.trim()) {
      setErrorMessage("Reply cannot be empty.");
      return;
    }

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`/api/vendor/messages/${conversationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyMessage,
        }),
      });

      const text = await response.text();

      let result: {
        error?: string;
        message?: string;
      } = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        setErrorMessage(
          "Server returned invalid JSON while sending reply. Check app/api/vendor/messages/[id]/route.ts."
        );
        return;
      }

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to send reply.");
        return;
      }

      setReplyMessage("");
      setSuccessMessage("Reply sent.");
    } catch (error) {
      console.error("Send vendor reply error:", error);
      setErrorMessage("Something went wrong while sending reply.");
    } finally {
      setSending(false);
    }
  }

  async function deleteChat() {
    const confirmed = window.confirm(
      "Delete this chat from your inbox? This will hide it from your seller dashboard."
    );

    if (!confirmed) return;

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/vendor/conversations/${conversationId}`, {
        method: "DELETE",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();

      let result: {
        error?: string;
        message?: string;
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

      window.location.href = "/vendor-dashboard/messages";
    } catch (error) {
      console.error("Delete vendor chat error:", error);
      setErrorMessage("Something went wrong while deleting chat.");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadConversation();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`vendor-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newRealtimeMessage = payload.new as Message;

          setMessages((currentMessages) => {
            const alreadyExists = currentMessages.some(
              (item) => item.id === newRealtimeMessage.id
            );

            if (alreadyExists) {
              return currentMessages;
            }

            return [...currentMessages, newRealtimeMessage];
          });

          if (newRealtimeMessage.sender_type === "student") {
            await markAsRead();
          }

          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-5xl font-bold">Loading chat...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link href="/vendor-dashboard/messages" className="font-bold text-blue-900">
            ← Back to inbox
          </Link>

          <button
            type="button"
            onClick={deleteChat}
            disabled={deleting}
            className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
          >
            {deleting ? "Deleting..." : "Delete Chat"}
          </button>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Seller Inbox
          </p>

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h1 className="text-4xl font-black">Student Conversation</h1>

            <p className="text-sm font-bold text-green-700">
              Live messaging enabled
            </p>
          </div>

          {conversation && (
            <div className="mt-5 grid gap-4 rounded-2xl bg-gray-50 p-5 md:grid-cols-3">
              <div>
                <p className="text-sm font-bold text-gray-600">Student</p>
                <p className="mt-1 font-black">{conversation.student_name}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-600">WhatsApp</p>
                <p className="mt-1 font-black">
                  {conversation.student_whatsapp || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-600">Status</p>
                <p className="mt-1 font-black capitalize">{conversation.status}</p>
              </div>
            </div>
          )}

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

          <section className="mt-8">
            <h2 className="text-2xl font-black">Messages</h2>

            <div className="mt-4 h-[460px] overflow-y-auto rounded-2xl border bg-gray-50 p-4">
              {messages.length === 0 && (
                <p className="text-gray-700">No messages yet.</p>
              )}

              <div className="space-y-4">
                {messages.map((item) => {
                  const isVendor = item.sender_type === "vendor";
                  const isSystem = item.sender_type === "system";

                  return (
                    <div
                      key={item.id}
                      className={`flex ${
                        isVendor ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl p-4 ${
                          isSystem
                            ? "bg-yellow-100 text-yellow-900"
                            : isVendor
                            ? "bg-blue-950 text-white"
                            : "bg-white text-gray-950 shadow-sm"
                        }`}
                      >
                        <p className="text-xs font-bold opacity-80">
                          {item.sender_name} • {item.sender_type}
                        </p>

                        <p className="mt-2 text-sm leading-6">{item.message}</p>

                        <p className="mt-2 text-[11px] opacity-70">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendReply();
                  }
                }}
                placeholder="Type your reply..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />

              <button
                type="button"
                onClick={sendReply}
                disabled={sending}
                className="rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
              >
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}