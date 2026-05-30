"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  username: string;
  created_at: string;
};

type SavedItem = {
  id: string;
  catalog_item_id: string;
  vendor_id: string;
  created_at: string;
  catalog_items: {
    id: string;
    title: string;
    item_type: string;
    category: string;
    description: string;
    price: string | null;
    image_url: string | null;
    is_available: boolean;
  };
  vendor_profiles: {
    id: string;
    business_name: string;
    shop_slug: string | null;
    category: string;
  };
};

type Conversation = {
  id: string;
  vendor_id: string;
  student_id: string;
  student_name: string;
  access_code: string;
  status: string;
  student_deleted?: boolean;
  created_at: string;
  updated_at: string;
  vendor_profiles: {
    id: string;
    business_name: string;
    shop_slug: string | null;
    category: string;
  };
};

type Order = {
  id: string;
  conversation_id: string;
  vendor_id: string;
  student_id: string;
  service_requested: string;
  order_note: string | null;
  price: string | null;
  location: string;
  status: string;
  student_deleted?: boolean;
  created_at: string;
  updated_at: string;
  vendor_profiles: {
    id: string;
    business_name: string;
    shop_slug: string | null;
    category: string;
  };
};

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const storedStudent = localStorage.getItem("student");

    if (!storedStudent) {
      window.location.href = "/student-login?redirect=/student-dashboard";
      return;
    }

    try {
      const parsedStudent = JSON.parse(storedStudent) as Student;
      setStudent(parsedStudent);

      const [savedResponse, dashboardResponse] = await Promise.all([
        fetch(`/api/student/saved-items?studentId=${parsedStudent.id}`, {
          cache: "no-store",
        }),
        fetch(`/api/student/dashboard?studentId=${parsedStudent.id}`, {
          cache: "no-store",
        }),
      ]);

      const savedText = await savedResponse.text();
      const savedResult = savedText ? JSON.parse(savedText) : {};

      if (!savedResponse.ok) {
        setErrorMessage(savedResult.error || "Failed to load saved items.");
        return;
      }

      const dashboardText = await dashboardResponse.text();
      const dashboardResult = dashboardText ? JSON.parse(dashboardText) : {};

      if (!dashboardResponse.ok) {
        setErrorMessage(
          dashboardResult.error || "Failed to load student dashboard."
        );
        return;
      }

      setSavedItems(savedResult.savedItems || []);
      setConversations(dashboardResult.conversations || []);
      setOrders(dashboardResult.orders || []);
    } catch (error) {
      console.error("Student dashboard error:", error);
      setErrorMessage("Something went wrong while loading dashboard.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("student");
    window.dispatchEvent(new Event("student-auth-change"));
    window.location.href = "/";
  }

  async function removeSavedItem(savedItemId: string) {
    if (!student) return;

    const confirmed = window.confirm("Remove this item from your saved list?");
    if (!confirmed) return;

    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/student/saved-items", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
          savedItemId,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to remove saved item.");
        return;
      }

      setSavedItems((current) =>
        current.filter((item) => item.id !== savedItemId)
      );
      setSuccessMessage(result.message || "Saved item removed.");
    } catch (error) {
      console.error("Remove saved item error:", error);
      setErrorMessage("Something went wrong while removing saved item.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteChat(conversationId: string) {
    if (!student) return;

    const confirmed = window.confirm(
      "Delete this chat from your dashboard? This will not affect the seller."
    );
    if (!confirmed) return;

    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/student/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to delete chat.");
        return;
      }

      setConversations((current) =>
        current.filter((chat) => chat.id !== conversationId)
      );
      setSuccessMessage(result.message || "Chat deleted from your dashboard.");
    } catch (error) {
      console.error("Delete chat error:", error);
      setErrorMessage("Something went wrong while deleting chat.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteOrder(orderId: string) {
    if (!student) return;

    const confirmed = window.confirm(
      "Remove this order from your dashboard? This will not affect the seller."
    );
    if (!confirmed) return;

    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/student/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to delete order.");
        return;
      }

      setOrders((current) => current.filter((order) => order.id !== orderId));
      setSuccessMessage(result.message || "Order removed from your dashboard.");
    } catch (error) {
      console.error("Delete order error:", error);
      setErrorMessage("Something went wrong while deleting order.");
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-5xl font-bold">
          Loading student dashboard...
        </div>
      </main>
    );
  }

  const recentConversations = conversations.slice(0, 4);
  const recentOrders = orders.slice(0, 4);
  const recentSaves = savedItems.slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-7xl">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
              Student Dashboard
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              Welcome, @{student?.username}
            </h1>

            <p className="mt-4 max-w-2xl text-gray-700">
              Continue chats, track orders, view saved items, and browse campus
              sellers.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </section>

        {successMessage && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            {errorMessage}
          </div>
        )}

        <section className="mt-10 grid gap-6 md:grid-cols-4">
          <DashboardCard label="Saved Items" value={savedItems.length} />
          <DashboardCard label="Chats" value={conversations.length} />
          <DashboardCard label="Orders" value={orders.length} />

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-600">Marketplace</p>
            <h2 className="mt-2 text-2xl font-black">Browse sellers</h2>
            <Link
              href="/vendors"
              className="mt-5 inline-block rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              Find Sellers
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">Recent Chats</h2>
              <Link href="/vendors" className="text-sm font-bold text-blue-900">
                Start new chat →
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {recentConversations.length === 0 && (
                <p className="text-gray-700">No chats yet.</p>
              )}

              {recentConversations.map((chat) => (
                <div
                  key={chat.id}
                  className="rounded-2xl border bg-gray-50 p-4"
                >
                  <h3 className="font-black">
                    {chat.vendor_profiles?.business_name || "Seller"}
                  </h3>

                  <p className="mt-1 text-sm text-gray-700">
                    Status: {chat.status}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    Updated: {new Date(chat.updated_at).toLocaleString()}
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/chat/${chat.id}?code=${chat.access_code}`}
                      className="rounded-full bg-blue-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
                    >
                      Open Chat
                    </Link>

                    <button
                      type="button"
                      onClick={() => deleteChat(chat.id)}
                      disabled={actionLoading}
                      className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Delete Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Recent Orders</h2>

            <div className="mt-6 grid gap-4">
              {recentOrders.length === 0 && (
                <p className="text-gray-700">No orders yet.</p>
              )}

              {recentOrders.map((order) => {
                const linkedChat = conversations.find(
                  (chat) => chat.id === order.conversation_id
                );

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black">
                          {order.service_requested}
                        </h3>

                        <p className="mt-1 text-sm text-gray-700">
                          Seller:{" "}
                          {order.vendor_profiles?.business_name || "Seller"}
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          Price: {order.price || "Not specified"}
                        </p>
                      </div>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-700">
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      {linkedChat?.access_code && (
                        <Link
                          href={`/chat/${order.conversation_id}?code=${linkedChat.access_code}`}
                          className="rounded-full bg-blue-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
                        >
                          Open Chat
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteOrder(order.id)}
                        disabled={actionLoading}
                        className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
                      >
                        Delete Order
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-green-700">
                Recent Saves
              </p>

              <h2 className="text-3xl font-black">Items you saved recently.</h2>
            </div>

            <Link href="/student-saved" className="font-bold text-blue-900">
              View all saved items →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {recentSaves.length === 0 && (
              <div className="col-span-full rounded-3xl bg-white p-8 text-center shadow-sm">
                <h3 className="text-2xl font-black">No saved items yet.</h3>
                <p className="mt-3 text-gray-700">
                  Browse shops and save products or services you like.
                </p>

                <Link
                  href="/vendors"
                  className="mt-5 inline-block rounded-full bg-blue-950 px-6 py-3 font-bold text-white"
                >
                  Browse Marketplace
                </Link>
              </div>
            )}

            {recentSaves.map((saved) => (
              <div
                key={saved.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                {saved.catalog_items.image_url ? (
                  <img
                    src={saved.catalog_items.image_url}
                    alt={saved.catalog_items.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100 font-bold text-gray-500">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-xl font-black">
                    {saved.catalog_items.title}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-blue-900">
                    {saved.catalog_items.category}
                  </p>

                  <p className="mt-3 text-lg font-black">
                    {saved.catalog_items.price || "Ask seller"}
                  </p>

                  <div className="mt-5 grid gap-3">
                    {saved.vendor_profiles.shop_slug && (
                      <Link
                        href={`/shop/${saved.vendor_profiles.shop_slug}`}
                        className="block rounded-full bg-blue-950 px-5 py-3 text-center text-sm font-bold text-white"
                      >
                        View Shop
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => removeSavedItem(saved.id)}
                      disabled={actionLoading}
                      className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Remove Saved Item
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-gray-600">{label}</p>
      <h2 className="mt-2 text-4xl font-black">{value}</h2>
    </div>
  );
}