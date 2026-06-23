"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import NotificationPermissionButton from "@/components/NotificationPermissionButton";

type VendorProfile = {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  business_location: string;
  whatsapp: string;
  services: string;
  description: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  shop_slug: string | null;
};

type Conversation = {
  id: string;
  vendor_id: string;
  student_name: string;
  student_whatsapp: string;
  status: string;
  unread_for_vendor: boolean;
  vendor_deleted: boolean;
  created_at: string;
  updated_at: string;
};

type Order = {
  id: string;
  vendor_id: string;
  status: string;
  created_at: string;
  updated_at: string;
};
<NotificationPermissionButton />

export default function VendorDashboardPage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [email, setEmail] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || "";
  }

  async function loadDashboardCounts() {
    const token = await getToken();

    if (!token) return;

    try {
      const [conversationResponse, orderResponse] = await Promise.all([
        fetch("/api/vendor/conversations", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/vendor/orders", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const conversationText = await conversationResponse.text();
      const conversationResult = conversationText
        ? JSON.parse(conversationText)
        : {};

      const orderText = await orderResponse.text();
      const orderResult = orderText ? JSON.parse(orderText) : {};

      if (conversationResponse.ok) {
        setConversations(conversationResult.conversations || []);
      } else {
        console.error("Conversation count error:", conversationResult);
      }

      if (orderResponse.ok) {
        setOrders(orderResult.orders || []);
      } else {
        console.error("Order count error:", orderResult);
      }
    } catch (error) {
      console.error("Dashboard count error:", error);
    }
  }

  async function loadVendorProfile() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = "/vendor-login";
      return;
    }

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setErrorMessage("No vendor profile found for this account.");
      setLoading(false);
      return;
    }

    setProfile(data[0] as VendorProfile);

    await loadDashboardCounts();

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/vendor-login";
  }

  async function copyShopLink() {
    if (!profile?.shop_slug) return;

    const shopUrl = `${window.location.origin}/shop/${profile.shop_slug}`;
    await navigator.clipboard.writeText(shopUrl);

    alert("Shop link copied.");
  }

  useEffect(() => {
    loadVendorProfile();
  }, []);

  const messageCount = conversations.filter(
  (conversation) => conversation.unread_for_vendor === true
).length;

  const pendingOrderCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const activeOrderCount = orders.filter(
    (order) => order.status === "accepted" || order.status === "in_progress"
  ).length;

  const completedOrderCount = orders.filter(
    (order) => order.status === "completed"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-5xl">
          <p className="text-lg font-bold">Loading vendor dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
              Vendor Dashboard
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              Seller Control Panel
            </h1>

            <p className="mt-3 text-gray-700">Logged in as {email}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            {errorMessage}
          </div>
        )}

        {profile && (
          <>
            <section className="mt-10 grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-gray-600">
                  Profile Status
                </p>
                <h2 className="mt-2 text-3xl font-black capitalize">
                  {profile.status}
                </h2>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-gray-600">Live Status</p>
                <h2 className="mt-2 text-3xl font-black">
                  {profile.is_active ? "Live" : "Not Live"}
                </h2>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-gray-600">Category</p>
                <h2 className="mt-2 text-xl font-black">{profile.category}</h2>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-gray-600">Public Shop</p>

                {profile.shop_slug ? (
                  <>
                    <h2 className="mt-2 break-all text-lg font-black">
                      /shop/{profile.shop_slug}
                    </h2>

                    <div className="mt-4 flex flex-col gap-3">
                      <Link
                        href={`/shop/${profile.shop_slug}`}
                        className="rounded-full bg-blue-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
                      >
                        Open Shop
                      </Link>

                      <button
                        type="button"
                        onClick={copyShopLink}
                        className="rounded-full border border-blue-950 px-5 py-3 text-sm font-bold text-blue-950 hover:bg-blue-50"
                      >
                        Copy Link
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="mt-2 text-lg font-black">Not set</h2>

                    <Link
                      href="/vendor-dashboard/shop-settings"
                      className="mt-4 inline-block rounded-full bg-purple-700 px-5 py-3 text-sm font-bold text-white hover:bg-purple-800"
                    >
                      Set Shop Link
                    </Link>
                  </>
                )}
              </div>
            </section>

            <section className="mt-10 grid gap-6 md:grid-cols-4">
              <DashboardMetric
                title="Messages"
                value={messageCount}
                description="Total student conversations"
              />

              <DashboardMetric
                title="Pending Orders"
                value={pendingOrderCount}
                description="Orders waiting for action"
              />

              <DashboardMetric
                title="Active Orders"
                value={activeOrderCount}
                description="Accepted or in progress"
              />

              <DashboardMetric
                title="Completed"
                value={completedOrderCount}
                description="Finished orders"
              />
            </section>

            <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Business Profile</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-bold text-gray-600">
                    Business Name
                  </p>
                  <p className="mt-1 font-semibold">{profile.business_name}</p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600">Location</p>
                  <p className="mt-1 font-semibold">
                    {profile.business_location}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600">WhatsApp</p>
                  <p className="mt-1 font-semibold">{profile.whatsapp}</p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600">Services</p>
                  <p className="mt-1 font-semibold">{profile.services}</p>
                </div>
              </div>

              {profile.description && (
                <div className="mt-6">
                  <p className="text-sm font-bold text-gray-600">
                    Description
                  </p>
                  <p className="mt-1 text-gray-800">{profile.description}</p>
                </div>
              )}
            </section>

            <section className="mt-10 grid gap-6 md:grid-cols-4">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black">Messages</h2>

                <p className="mt-3 text-gray-700">
                  View and reply to student conversations.
                </p>

                <Link
                  href="/vendor-dashboard/messages"
                  className="relative mt-5 inline-flex items-center justify-center rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800"
                >
                  Open Inbox

                  {messageCount > 0 && (
                    <span className="absolute -right-3 -top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-red-600 px-2 text-sm font-black text-white shadow-lg ring-4 ring-white">
                      {messageCount > 99 ? "99+" : messageCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black">Orders</h2>

                <p className="mt-3 text-gray-700">
                  View, accept, process, and complete student orders.
                </p>

                <Link
                  href="/vendor-dashboard/orders"
                  className="relative mt-5 inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
                >
                  Open Orders

                  {pendingOrderCount > 0 && (
                    <span className="absolute -right-3 -top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-red-600 px-2 text-sm font-black text-white shadow-lg ring-4 ring-white">
                      {pendingOrderCount > 99 ? "99+" : pendingOrderCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black">Catalog</h2>

                <p className="mt-3 text-gray-700">
                  Add products, services, prices, and images to your public
                  shop.
                </p>

                <Link
                  href="/vendor-dashboard/catalog"
                  className="mt-5 inline-block rounded-full bg-purple-700 px-6 py-3 font-bold text-white hover:bg-purple-800"
                >
                  Manage Catalog
                </Link>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black">Shop</h2>

                <p className="mt-3 text-gray-700">
                  Set your public shop link, banner, image, and about section.
                </p>

                <Link
                  href="/vendor-dashboard/shop-settings"
                  className="mt-5 inline-block rounded-full bg-purple-700 px-6 py-3 font-bold text-white hover:bg-purple-800"
                >
                  Shop Settings
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function DashboardMetric({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-gray-600">{title}</p>
      <h2 className="mt-2 text-4xl font-black">{value}</h2>
      <p className="mt-2 text-sm text-gray-700">{description}</p>
    </div>
  );
}