"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CatalogItem = {
  id: string;
  vendor_id: string;
  title: string;
  item_type: string;
  category: string;
  description: string;
  price: string | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

const categories = [
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

export default function VendorCatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);

  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState("product");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || "";
  }

  function resetForm() {
    setTitle("");
    setItemType("product");
    setCategory("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setEditingItemId(null);
  }

  function startEdit(item: CatalogItem) {
    setEditingItemId(item.id);
    setTitle(item.title);
    setItemType(item.item_type);
    setCategory(item.category);
    setDescription(item.description);
    setPrice(item.price || "");
    setImageUrl(item.image_url || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadCatalogImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setErrorMessage("");
    setImageUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "catalog");

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to upload image.");
        return;
      }

      setImageUrl(result.imageUrl);
      setMessage("Image uploaded successfully.");
    } catch (error) {
      console.error("Image upload error:", error);
      setErrorMessage("Something went wrong while uploading image.");
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  }

  async function loadCatalog() {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const response = await fetch("/api/vendor/catalog", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load catalog.");
        return;
      }

      setItems(result.items || []);
    } catch (error) {
      console.error("Load catalog error:", error);
      setErrorMessage("Something went wrong while loading catalog.");
    } finally {
      setLoading(false);
    }
  }

  async function saveItem() {
    setMessage("");
    setErrorMessage("");

    if (!title || !itemType || !category || !description) {
      setErrorMessage("Title, type, category, and description are required.");
      return;
    }

    setActionLoading(true);

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const isEditing = Boolean(editingItemId);

      const response = await fetch(
        isEditing
          ? `/api/vendor/catalog/${editingItemId}`
          : "/api/vendor/catalog",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            itemType,
            category,
            description,
            price,
            imageUrl,
          }),
        }
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to save item.");
        return;
      }

      setMessage(isEditing ? "Catalog item updated." : "Catalog item created.");
      resetForm();
      await loadCatalog();
    } catch (error) {
      console.error("Save catalog item error:", error);
      setErrorMessage("Something went wrong while saving item.");
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleAvailability(item: CatalogItem) {
    setActionLoading(true);
    setMessage("");
    setErrorMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const response = await fetch(`/api/vendor/catalog/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isAvailable: !item.is_available,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to update item.");
        return;
      }

      setMessage(result.message || "Catalog item updated.");
      await loadCatalog();
    } catch (error) {
      console.error("Update catalog item error:", error);
      setErrorMessage("Something went wrong while updating item.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteItem(itemId: string) {
    const confirmed = window.confirm(
      "Delete this catalog item? This cannot be undone."
    );

    if (!confirmed) return;

    setActionLoading(true);
    setMessage("");
    setErrorMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const response = await fetch(`/api/vendor/catalog/${itemId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to delete item.");
        return;
      }

      setMessage(result.message || "Catalog item deleted.");

      if (editingItemId === itemId) {
        resetForm();
      }

      await loadCatalog();
    } catch (error) {
      console.error("Delete catalog item error:", error);
      setErrorMessage("Something went wrong while deleting item.");
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-5xl font-bold">Loading catalog...</div>
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
            Seller Catalog
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Manage your products and services.
          </h1>

          <p className="mt-4 max-w-2xl text-gray-700">
            Add, edit, delete, and control availability for items shown on your
            public shop page.
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

        <section className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <form className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">
                {editingItemId ? "Edit catalog item" : "Add catalog item"}
              </h2>

              {editingItemId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-bold text-red-600"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Black hoodie"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Type *
              </label>
              <select
                value={itemType}
                onChange={(event) => setItemType(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Category *
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Price
              </label>
              <input
                type="text"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Example: ₦8000"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Product / Service Image
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadCatalogImage}
                disabled={imageUploading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />

              <p className="mt-2 text-xs text-gray-600">
                JPG, PNG, or WEBP. Maximum 5MB.
              </p>

              {imageUploading && (
                <p className="mt-2 text-sm font-bold text-blue-900">
                  Uploading image...
                </p>
              )}
            </div>

            {imageUrl && (
              <div>
                <p className="mb-2 text-sm font-bold text-gray-950">
                  Image Preview
                </p>

                <div className="overflow-hidden rounded-2xl border bg-gray-50">
                  <img
                    src={imageUrl}
                    alt="Catalog preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the product or service"
                className="h-32 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <button
              type="button"
              onClick={saveItem}
              disabled={actionLoading || imageUploading}
              className="w-full rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
            >
              {actionLoading
                ? "Saving..."
                : editingItemId
                ? "Save Changes"
                : "Save Catalog Item"}
            </button>
          </form>

          <section>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <h2 className="text-2xl font-black">
                Your catalog ({items.length})
              </h2>

              <button
                type="button"
                onClick={loadCatalog}
                className="rounded-full border border-blue-950 px-5 py-2 font-bold text-blue-950 hover:bg-blue-50"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {items.length === 0 && (
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  No catalog item yet.
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gray-100 font-bold text-gray-500">
                      No Image
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black">{item.title}</h3>
                        <p className="mt-1 text-sm font-bold text-blue-900">
                          {item.category} • {item.item_type}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.is_available ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-700">
                      {item.description}
                    </p>

                    <p className="mt-3 text-lg font-black">
                      {item.price || "Price not set"}
                    </p>

                    <div className="mt-5 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        disabled={actionLoading}
                        className="rounded-full bg-purple-700 px-5 py-3 font-bold text-white hover:bg-purple-800 disabled:bg-gray-400"
                      >
                        Edit Item
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleAvailability(item)}
                        disabled={actionLoading}
                        className="rounded-full bg-blue-950 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
                      >
                        {item.is_available
                          ? "Mark Unavailable"
                          : "Mark Available"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        disabled={actionLoading}
                        className="rounded-full bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
                      >
                        Delete Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}