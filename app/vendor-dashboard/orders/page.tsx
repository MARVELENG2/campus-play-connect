"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || "";
  }

  async function loadOrders() {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const response = await fetch("/api/vendor/orders", {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load orders.");
        return;
      }

      setOrders(result.orders || []);

      if (result.vendorProfile?.id) {
        setVendorId(result.vendorProfile.id);
      } else if (result.orders?.[0]?.vendor_id) {
        setVendorId(result.orders[0].vendor_id);
      }
    } catch (error) {
      console.error("Load orders error:", error);
      setErrorMessage("Something went wrong while loading orders.");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    setActionLoadingId(orderId);
    setMessage("");
    setErrorMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to update order.");
        return;
      }

      setMessage(result.message || "Order updated.");
    } catch (error) {
      console.error("Update order error:", error);
      setErrorMessage("Something went wrong while updating order.");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!vendorId) return;

    const channel = supabase
      .channel(`vendor-orders-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `vendor_id=eq.${vendorId}`,
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
  }, [vendorId]);

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const activeOrders = orders.filter(
    (order) => order.status === "accepted" || order.status === "in_progress"
  );
  const completedOrders = orders.filter((order) => order.status === "completed");
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-5xl font-bold">Loading orders...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-7xl">
        <Link href="/vendor-dashboard" className="font-bold text-blue-900">
          ← Back to dashboard
        </Link>

        <section className="mt-8">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Seller Orders
          </p>

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-black md:text-5xl">
                Manage student orders.
              </h1>

              <p className="mt-4 max-w-2xl text-gray-700">
                Accept, process, complete, or cancel orders created from student
                conversations.
              </p>
            </div>

            <p className="text-sm font-bold text-green-700">
              Live order updates enabled
            </p>
          </div>
        </section>

        {message && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            {errorMessage}
          </div>
        )}

        <section className="mt-10 grid gap-6 md:grid-cols-4">
          <StatCard label="Total Orders" value={orders.length} />
          <StatCard label="Pending" value={pendingOrders.length} />
          <StatCard label="Active" value={activeOrders.length} />
          <StatCard label="Completed" value={completedOrders.length} />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black">All Orders</h2>

          <div className="mt-6 grid gap-6">
            {orders.length === 0 && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                No orders yet.
              </div>
            )}

            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                loading={actionLoadingId === order.id}
                onUpdate={updateOrderStatus}
              />
            ))}
          </div>
        </section>

        {cancelledOrders.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-black">Cancelled Orders</h2>

            <div className="mt-6 grid gap-6">
              {cancelledOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  loading={actionLoadingId === order.id}
                  onUpdate={updateOrderStatus}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-gray-600">{label}</p>
      <h2 className="mt-2 text-4xl font-black">{value}</h2>
    </div>
  );
}

function OrderCard({
  order,
  loading,
  onUpdate,
}: {
  order: Order;
  loading: boolean;
  onUpdate: (orderId: string, status: string) => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 md:flex-row">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-black">{order.service_requested}</h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                order.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : order.status === "in_progress"
                  ? "bg-blue-100 text-blue-700"
                  : order.status === "accepted"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-gray-800 md:grid-cols-2">
            <p>Student: {order.student_name}</p>
            <p>WhatsApp: {order.student_whatsapp}</p>
            <p>Location: {order.location}</p>
            <p>Price: {order.price || "Not specified"}</p>
            <p>Created: {new Date(order.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(order.updated_at).toLocaleString()}</p>
          </div>

          {order.order_note && (
            <p className="mt-4 text-sm text-gray-700">{order.order_note}</p>
          )}

          <Link
            href={`/vendor-dashboard/messages/${order.conversation_id}`}
            className="mt-5 inline-block font-bold text-blue-900"
          >
            Open related chat →
          </Link>
        </div>

        <div className="flex min-w-52 flex-col gap-3">
          {order.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => onUpdate(order.id, "accepted")}
                disabled={loading}
                className="rounded-full bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? "Updating..." : "Accept Order"}
              </button>

              <button
                type="button"
                onClick={() => onUpdate(order.id, "cancelled")}
                disabled={loading}
                className="rounded-full bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
              >
                Cancel Order
              </button>
            </>
          )}

          {order.status === "accepted" && (
            <button
              type="button"
              onClick={() => onUpdate(order.id, "in_progress")}
              disabled={loading}
              className="rounded-full bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Updating..." : "Mark In Progress"}
            </button>
          )}

          {order.status === "in_progress" && (
            <button
              type="button"
              onClick={() => onUpdate(order.id, "completed")}
              disabled={loading}
              className="rounded-full bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Updating..." : "Mark Completed"}
            </button>
          )}

          {order.status === "completed" && (
            <div className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
              Completed
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              Cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}