"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type VendorProfile = {
  id: string;
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
  profile_image_url: string | null;
  banner_image_url: string | null;
  tagline: string | null;
  about: string | null;
};

const categories = [
  "All Categories",
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
  "Other",
];

function VendorsContent() {
  const searchParams = useSearchParams();

  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Categories"
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadVendors() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("status", "approved")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setVendors((data || []) as VendorProfile[]);
    setLoading(false);
  }

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All Categories");
  }, [searchParams]);

  const filteredVendors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesCategory =
        selectedCategory === "All Categories" ||
        vendor.category === selectedCategory;

      const searchableText = [
        vendor.business_name,
        vendor.category,
        vendor.business_location,
        vendor.services,
        vendor.description || "",
        vendor.tagline || "",
        vendor.about || "",
        vendor.shop_slug || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [vendors, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-7xl">
        <section className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            BOUESTI Marketplace
          </p>

          <h1 className="text-4xl font-black md:text-6xl">
            Discover student sellers and campus shops.
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-700">
            Search approved BOUESTI sellers, open their shop, browse their
            catalog, save items, chat before ordering, and track your order
            status.
          </p>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_260px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search food, clothing, laundry, printing, phone repair..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
            />

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 text-sm text-gray-700 md:flex-row md:items-center">
            <p>
              Showing{" "}
              <span className="font-bold text-gray-950">
                {filteredVendors.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-950">{vendors.length}</span>{" "}
              approved sellers.
            </p>

            {(searchTerm || selectedCategory !== "All Categories") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Categories");
                }}
                className="font-bold text-blue-900"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {loading && (
          <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
            <p className="font-bold">Loading sellers...</p>
          </section>
        )}

        {errorMessage && (
          <section className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h2 className="text-xl font-black">Failed to load sellers</h2>
            <p className="mt-2">{errorMessage}</p>
          </section>
        )}

        {!loading && !errorMessage && (
          <section className="mt-10 grid gap-6 md:grid-cols-3">
            {filteredVendors.length === 0 && (
              <div className="col-span-full rounded-3xl bg-white p-8 text-center shadow-sm">
                <h2 className="text-2xl font-black">No sellers found.</h2>
                <p className="mt-3 text-gray-700">
                  Try another search term or category.
                </p>
              </div>
            )}

            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {vendor.banner_image_url ? (
                  <img
                    src={vendor.banner_image_url}
                    alt={`${vendor.business_name} banner`}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-blue-950 to-green-700 px-5 text-center text-white">
                    <p className="text-xl font-black">
                      {vendor.business_name}
                    </p>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {vendor.profile_image_url ? (
                      <img
                        src={vendor.profile_image_url}
                        alt={vendor.business_name}
                        className="-mt-12 h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-sm"
                      />
                    ) : (
                      <div className="-mt-12 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gray-200 text-2xl font-black shadow-sm">
                        {vendor.business_name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black">
                          {vendor.business_name}
                        </h2>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Verified
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-blue-900">
                        {vendor.category}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-2 text-sm text-gray-700">
                    {vendor.tagline ||
                      vendor.about ||
                      vendor.description ||
                      vendor.services}
                  </p>

                  <div className="mt-5 space-y-2 text-sm font-semibold text-gray-800">
                    <p>Location: {vendor.business_location}</p>
                    <p>Services: {vendor.services}</p>
                    {vendor.shop_slug && <p>Shop: /shop/{vendor.shop_slug}</p>}
                  </div>

                  <div className="mt-6">
                    {vendor.shop_slug ? (
                      <Link
                        href={`/shop/${vendor.shop_slug}`}
                        className="block rounded-full bg-blue-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
                      >
                        View Shop
                      </Link>
                    ) : (
                      <Link
                        href={`/vendors/${vendor.id}`}
                        className="block rounded-full bg-blue-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
                      >
                        View Seller
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default function VendorsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
          <div className="mx-auto max-w-5xl font-bold">
            Loading marketplace...
          </div>
        </main>
      }
    >
      <VendorsContent />
    </Suspense>
  );
}