"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  username: string;
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

export default function StudentSavedPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadSavedItems() {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const storedStudent = localStorage.getItem("student");

    if (!storedStudent) {
      window.location.href = "/student-login?redirect=/student-saved";
      return;
    }

    const parsedStudent = JSON.parse(storedStudent) as Student;
    setStudent(parsedStudent);

    try {
      const response = await fetch(
        `/api/student/saved-items?studentId=${parsedStudent.id}`
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load saved items.");
        return;
      }

      setSavedItems(result.savedItems || []);
    } catch {
      setErrorMessage("Something went wrong while loading saved items.");
    } finally {
      setLoading(false);
    }
  }

  async function removeSavedItem(savedItemId: string) {
    if (!student) return;

    try {
      const response = await fetch(
        `/api/student/saved-items/${savedItemId}?studentId=${student.id}`,
        {
          method: "DELETE",
        }
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to remove item.");
        return;
      }

      setMessage("Saved item removed.");
      await loadSavedItems();
    } catch {
      setErrorMessage("Something went wrong while removing item.");
    }
  }

  useEffect(() => {
    loadSavedItems();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-5xl font-bold">
          Loading saved items...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-7xl">
        <section>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Student Saved Items
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Your saved catalog items.
          </h1>

          <p className="mt-4 text-gray-700">
            Logged in as{" "}
            <span className="font-black">@{student?.username}</span>
          </p>
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
          {savedItems.length === 0 && (
            <div className="col-span-full rounded-3xl bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-black">No saved items yet.</h2>
              <p className="mt-3 text-gray-700">
                Browse shops and save products or services you like.
              </p>

              <Link
                href="/vendors"
                className="mt-5 inline-block rounded-full bg-blue-950 px-6 py-3 font-bold text-white"
              >
                Browse Vendors
              </Link>
            </div>
          )}

          {savedItems.map((saved) => (
            <div
              key={saved.id}
              className="overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              {saved.catalog_items.image_url ? (
                <img
                  src={saved.catalog_items.image_url}
                  alt={saved.catalog_items.title}
                  className="h-52 w-full object-cover"
                />
              ) : (
                <div className="flex h-52 items-center justify-center bg-gray-100 font-bold text-gray-500">
                  No Image
                </div>
              )}

              <div className="p-5">
                <h2 className="text-xl font-black">
                  {saved.catalog_items.title}
                </h2>

                <p className="mt-1 text-sm font-bold text-blue-900">
                  {saved.catalog_items.category} •{" "}
                  {saved.catalog_items.item_type}
                </p>

                <p className="mt-3 text-sm text-gray-700">
                  {saved.catalog_items.description}
                </p>

                <p className="mt-3 text-lg font-black">
                  {saved.catalog_items.price || "Ask seller"}
                </p>

                <p className="mt-3 text-sm text-gray-700">
                  Seller: {saved.vendor_profiles.business_name}
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  {saved.vendor_profiles.shop_slug && (
                    <Link
                      href={`/shop/${saved.vendor_profiles.shop_slug}`}
                      className="rounded-full bg-blue-950 px-5 py-3 text-center text-sm font-bold text-white"
                    >
                      View Shop
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => removeSavedItem(saved.id)}
                    className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white"
                  >
                    Remove Saved Item
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