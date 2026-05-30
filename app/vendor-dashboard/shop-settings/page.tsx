"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type VendorProfile = {
  id: string;
  business_name: string;
  shop_slug: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  tagline: string | null;
  about: string | null;
};

export default function ShopSettingsPage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);

  const [shopSlug, setShopSlug] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || "";
  }

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>,
    folder: string,
    target: "profile" | "banner"
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setErrorMessage("");

    if (target === "profile") {
      setProfileImageUploading(true);
    } else {
      setBannerUploading(true);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

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

      if (target === "profile") {
        setProfileImageUrl(result.imageUrl);
        setMessage("Profile image uploaded.");
      } else {
        setBannerImageUrl(result.imageUrl);
        setMessage("Shop banner uploaded.");
      }
    } catch (error) {
      console.error("Shop image upload error:", error);
      setErrorMessage("Something went wrong while uploading image.");
    } finally {
      if (target === "profile") {
        setProfileImageUploading(false);
      } else {
        setBannerUploading(false);
      }

      event.target.value = "";
    }
  }

  async function loadSettings() {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const response = await fetch("/api/vendor/shop-settings", {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load shop settings.");
        return;
      }

      const vendor = result.vendorProfile as VendorProfile;

      setProfile(vendor);
      setShopSlug(vendor.shop_slug || "");
      setProfileImageUrl(vendor.profile_image_url || "");
      setBannerImageUrl(vendor.banner_image_url || "");
      setTagline(vendor.tagline || "");
      setAbout(vendor.about || "");
    } catch (error) {
      console.error("Load shop settings error:", error);
      setErrorMessage("Something went wrong while loading shop settings.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const response = await fetch("/api/vendor/shop-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopSlug,
          profileImageUrl,
          bannerImageUrl,
          tagline,
          about,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to save shop settings.");
        return;
      }

      setMessage(result.message || "Shop settings saved.");
      setShopSlug(result.shopSlug || shopSlug);
      await loadSettings();
    } catch (error) {
      console.error("Save shop settings error:", error);
      setErrorMessage("Something went wrong while saving shop settings.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-5xl font-bold">
          Loading shop settings...
        </div>
      </main>
    );
  }

  const shopLink = shopSlug ? `/shop/${shopSlug}` : "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-blue-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-6xl">
        <Link href="/vendor-dashboard" className="font-bold text-blue-900">
          ← Back to dashboard
        </Link>

        <section className="mt-8">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-700">
            Shop Settings
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Customize your public shop.
          </h1>

          <p className="mt-4 max-w-2xl text-gray-700">
            Set your shop link, upload your profile image and banner, then add a
            tagline and about section for students.
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

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Shop Link / Slug *
              </label>
              <input
                type="text"
                value={shopSlug}
                onChange={(event) => setShopSlug(event.target.value)}
                placeholder="example: grace-foods"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
              <p className="mt-2 text-sm text-gray-600">
                Your public shop link will be:{" "}
                <span className="font-bold text-blue-900">
                  /shop/{shopSlug || "your-shop-name"}
                </span>
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Profile Image
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  uploadImage(event, "shop-profile", "profile")
                }
                disabled={profileImageUploading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />

              <p className="mt-2 text-xs text-gray-600">
                Upload a logo, product face, or shop identity image. JPG, PNG,
                or WEBP. Maximum 5MB.
              </p>

              {profileImageUploading && (
                <p className="mt-2 text-sm font-bold text-blue-900">
                  Uploading profile image...
                </p>
              )}
            </div>

            {profileImageUrl && (
              <div>
                <p className="mb-2 text-sm font-bold text-gray-950">
                  Profile Image Preview
                </p>

                <div className="flex items-center gap-4 rounded-2xl border bg-gray-50 p-4">
                  <img
                    src={profileImageUrl}
                    alt="Profile preview"
                    className="h-24 w-24 rounded-2xl object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => setProfileImageUrl("")}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Shop Banner
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => uploadImage(event, "shop-banner", "banner")}
                disabled={bannerUploading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />

              <p className="mt-2 text-xs text-gray-600">
                Upload a wide image for the top of your shop page. JPG, PNG, or
                WEBP. Maximum 5MB.
              </p>

              {bannerUploading && (
                <p className="mt-2 text-sm font-bold text-blue-900">
                  Uploading banner...
                </p>
              )}
            </div>

            {bannerImageUrl && (
              <div>
                <p className="mb-2 text-sm font-bold text-gray-950">
                  Banner Preview
                </p>

                <div className="overflow-hidden rounded-2xl border bg-gray-50">
                  <img
                    src={bannerImageUrl}
                    alt="Banner preview"
                    className="h-40 w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setBannerImageUrl("")}
                  className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                >
                  Remove Banner
                </button>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
                placeholder="Example: Fresh meals for BOUESTI students"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-950">
                About Your Shop
              </label>
              <textarea
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                placeholder="Tell students what you sell and why they should buy from you."
                className="h-36 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none focus:border-blue-900"
              />
            </div>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving || profileImageUploading || bannerUploading}
              className="w-full rounded-full bg-purple-700 px-6 py-3 font-bold text-white hover:bg-purple-800 disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save Shop Settings"}
            </button>
          </form>

          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Shop Preview</h2>

            <div className="mt-5 overflow-hidden rounded-3xl border bg-gray-50">
              {bannerImageUrl ? (
                <img
                  src={bannerImageUrl}
                  alt="Shop banner"
                  className="h-36 w-full object-cover"
                />
              ) : (
                <div className="flex h-36 items-center justify-center bg-blue-950 text-sm font-bold text-white">
                  Banner Preview
                </div>
              )}

              <div className="p-5">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="-mt-12 h-20 w-20 rounded-2xl border-4 border-white object-cover"
                  />
                ) : (
                  <div className="-mt-12 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gray-300 text-xs font-bold">
                    Image
                  </div>
                )}

                <h3 className="mt-4 text-xl font-black">
                  {profile?.business_name || "Your business name"}
                </h3>

                <p className="mt-2 text-sm font-bold text-blue-900">
                  {tagline || "Your shop tagline appears here"}
                </p>

                <p className="mt-3 text-sm text-gray-700">
                  {about || "Your shop about section appears here."}
                </p>
              </div>
            </div>

            {shopLink && (
              <div className="mt-5">
                <Link
                  href={shopLink}
                  className="block rounded-full bg-blue-950 px-6 py-3 text-center font-bold text-white hover:bg-blue-800"
                >
                  View Public Shop
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${shopLink}`
                    );
                    setMessage("Shop link copied.");
                  }}
                  className="mt-3 w-full rounded-full border border-blue-950 px-6 py-3 font-bold text-blue-950 hover:bg-blue-50"
                >
                  Copy Shop Link
                </button>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}