"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Conversation = {
  id: string;
  vendor_id: string;
  student_name: string;
  student_whatsapp: string;
  access_code: string;
  status: string;
  created_at: string;
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

type Order = {
  id: string;
  conversation_id: string;
  vendor_id: string;
  student_name: string;
  student_whatsapp: string;
  service_requested: string;
  order_note: string | null;
  price: string | null;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function StudentChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const conversationId = params.id as string;
  const accessCode = searchParams.get("code") || "";

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function loadChat() {
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/chat/${conversationId}?code=${accessCode}`,
        {
          cache: "no-store",
        }
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load chat.");
        setLoading(false);
        return;
      }

      setConversation(result.conversation);
      setMessages(result.messages || []);
      setOrders(result.orders || []);
      setLoading(false);
      scrollToBottom();
    } catch (error) {
      console.error("Load chat error:", error);
      setErrorMessage("Something went wrong while loading chat.");
      setLoading(false);
    }
  }

  async function sendMessage() {
    setErrorMessage("");

    if (!newMessage.trim()) {
      setErrorMessage("Message cannot be empty.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: accessCode,
          message: newMessage,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to send message.");
        return;
      }

      setNewMessage("");
    } catch (error) {
      console.error("Send chat error:", error);
      setErrorMessage("Something went wrong while sending message.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`student-chat-messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newRealtimeMessage = payload.new as Message;

          setMessages((currentMessages) => {
            const alreadyExists = currentMessages.some(
              (item) => item.id === newRealtimeMessage.id
            );

            if (alreadyExists) return currentMessages;

            return [...currentMessages, newRealtimeMessage];
          });

          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    const channel = supabase
      .channel(`student-chat-orders-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const changedOrder = payload.new as Order;

          setOrders((currentOrders) => {
            const alreadyExists = currentOrders.some(
              (order) => order.id === changedOrder.id
            );

            if (payload.eventType === "INSERT" && !alreadyExists) {
              return [changedOrder, ...currentOrders];
            }

            if (payload.eventType === "UPDATE") {
              return currentOrders.map((order) =>
                order.id === changedOrder.id ? changedOrder : order
              );
            }

            return currentOrders;
          });
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
        <div className="mx-auto max-w-4xl">
          <p className="font-bold">Loading chat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Student Chat
          </p>

          <h1 className="text-3xl font-black">Conversation with Seller</h1>

          {conversation && (
            <p className="mt-3 text-gray-700">
              Chat started by{" "}
              <span className="font-bold">{conversation.student_name}</span>.
              Keep this page link safe so you can return to the chat.
            </p>
          )}

          {conversation && (
            <a
              href={`/chat/${conversationId}/order?code=${accessCode}`}
              className="mt-5 inline-block rounded-full bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
            >
              Place Order
            </a>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              {errorMessage}
            </div>
          )}

          <section className="mt-8">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <h2 className="text-2xl font-black">Your Orders</h2>

              <p className="text-sm font-bold text-green-700">
                Live order updates enabled
              </p>
            </div>

            <div className="mt-4 grid gap-4">
              {orders.length === 0 && (
                <div className="rounded-2xl border bg-gray-50 p-5 text-gray-700">
                  No order created from this conversation yet.
                </div>
              )}

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border bg-gray-50 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h3 className="text-lg font-black">
                        {order.service_requested}
                      </h3>

                      <p className="mt-2 text-sm text-gray-700">
                        Location: {order.location}
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        Price: {order.price || "Not specified"}
                      </p>

                      {order.order_note && (
                        <p className="mt-2 text-sm text-gray-700">
                          Note: {order.order_note}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-gray-600">
                        Updated: {new Date(order.updated_at).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-bold uppercase ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "accepted"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <h2 className="text-2xl font-black">Messages</h2>

              <p className="text-sm font-bold text-green-700">
                Live messaging enabled
              </p>
            </div>

            <div className="mt-4 h-[420px] overflow-y-auto rounded-2xl border bg-gray-50 p-4">
              {messages.length === 0 && (
                <p className="text-gray-700">No messages yet.</p>
              )}

              <div className="space-y-4">
                {messages.map((item) => {
                  const isStudent = item.sender_type === "student";

                  return (
                    <div
                      key={item.id}
                      className={`flex ${
                        isStudent ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          isStudent
                            ? "bg-blue-950 text-white"
                            : "bg-white text-gray-950 shadow-sm"
                        }`}
                      >
                        <p className="text-xs font-bold opacity-80">
                          {item.sender_name} • {item.sender_type}
                        </p>

                        <p className="mt-2 text-sm">{item.message}</p>

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
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={sending}
                className="rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}