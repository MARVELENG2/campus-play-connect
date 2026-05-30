"use client";

import { useState } from "react";

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
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadVendors() {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/vendor-profiles", {
        method: "GET",
        headers: {
          "x-admin-key": adminKey,
        },
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load vendors.");
        return;
      }

      setVendors(result.vendors || []);
      setMessage(result.message || "Vendors loaded.");
    } catch (error) {
      console.error("Admin load error:", error);
      setErrorMessage("Request failed. Check admin API route.");
    } finally {
      setLoading(false);
    }
  }

  async function updateVendor(vendorId: string, action: string) {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/vendor-profiles", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ vendorId, action }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Vendor action failed.");
        return;
      }

      setMessage(result.message || "Vendor updated.");
      await loadVendors();
    } catch (error) {
      console.error("Admin update error:", error);
      setErrorMessage("Request failed. Check admin API route.");
    } finally {
      setLoading(false);
    }
  }

  const pendingVendors = vendors.filter((vendor) => vendor.status === "pending");
  const approvedVendors = vendors.filter(
    (vendor) => vendor.status === "approved" && vendor.is_active
  );
  const inactiveVendors = vendors.filter(
    (vendor) => vendor.status !== "pending" && !vendor.is_active
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
          Admin Dashboard
        </p>

        <h1 className="text-4xl font-black md:text-5xl">
          CAMPUS PLAY CONNECT Control Panel
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-700">
          Approve, reject, suspend, and reactivate BOUESTI campus vendors.
        </p>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-bold text-gray-950">
            Admin Passcode
          </label>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="Enter admin passcode"
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
            />

            <button
              type="button"
              onClick={loadVendors}
              disabled={loading}
              className="rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Load Vendors"}
            </button>
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

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-600">Total Vendors</p>
            <h2 className="mt-2 text-4xl font-black">{vendors.length}</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-600">Pending</p>
            <h2 className="mt-2 text-4xl font-black">
              {pendingVendors.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-600">Approved Live</p>
            <h2 className="mt-2 text-4xl font-black">
              {approvedVendors.length}
            </h2>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black">
            Pending Vendors ({pendingVendors.length})
          </h2>

          <div className="mt-6 grid gap-6">
            {pendingVendors.length === 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                No pending vendors.
              </div>
            )}

            {pendingVendors.map((vendor) => (
              <VendorAdminCard
                key={vendor.id}
                vendor={vendor}
                loading={loading}
                onAction={updateVendor}
              />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black">
            Approved Live Vendors ({approvedVendors.length})
          </h2>

          <div className="mt-6 grid gap-6">
            {approvedVendors.length === 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                No approved vendors yet.
              </div>
            )}

            {approvedVendors.map((vendor) => (
              <VendorAdminCard
                key={vendor.id}
                vendor={vendor}
                loading={loading}
                onAction={updateVendor}
              />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black">
            Inactive / Rejected / Suspended ({inactiveVendors.length})
          </h2>

          <div className="mt-6 grid gap-6">
            {inactiveVendors.length === 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                No inactive vendors.
              </div>
            )}

            {inactiveVendors.map((vendor) => (
              <VendorAdminCard
                key={vendor.id}
                vendor={vendor}
                loading={loading}
                onAction={updateVendor}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function VendorAdminCard({
  vendor,
  loading,
  onAction,
}: {
  vendor: VendorProfile;
  loading: boolean;
  onAction: (vendorId: string, action: string) => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 md:flex-row">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-black">{vendor.business_name}</h3>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-700">
              {vendor.status}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                vendor.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {vendor.is_active ? "Live" : "Not Live"}
            </span>
          </div>

          <p className="mt-2 font-bold text-blue-900">{vendor.category}</p>

          <div className="mt-4 grid gap-2 text-sm text-gray-800 md:grid-cols-2">
            <p>Location: {vendor.business_location}</p>
            <p>WhatsApp: {vendor.whatsapp}</p>
            <p>Services: {vendor.services}</p>
            <p>Created: {new Date(vendor.created_at).toLocaleString()}</p>
          </div>

          {vendor.description && (
            <p className="mt-4 text-sm text-gray-700">{vendor.description}</p>
          )}
        </div>

        <div className="flex min-w-52 flex-col gap-3">
          {vendor.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => onAction(vendor.id, "approve")}
                disabled={loading}
                className="rounded-full bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                Approve
              </button>

              <button
                type="button"
                onClick={() => onAction(vendor.id, "reject")}
                disabled={loading}
                className="rounded-full bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
              >
                Reject
              </button>
            </>
          )}

          {vendor.status === "approved" && vendor.is_active && (
            <button
              type="button"
              onClick={() => onAction(vendor.id, "suspend")}
              disabled={loading}
              className="rounded-full bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
            >
              Suspend / Remove
            </button>
          )}

          {!vendor.is_active && vendor.status !== "pending" && (
            <button
              type="button"
              onClick={() => onAction(vendor.id, "reactivate")}
              disabled={loading}
              className="rounded-full bg-blue-950 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}