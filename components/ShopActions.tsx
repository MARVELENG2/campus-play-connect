"use client";

import Link from "next/link";
import { useState } from "react";


type ShopActionsProps = {
  vendorId: string;
  shopSlug: string;
};

export default function ShopActions({ vendorId, shopSlug }: ShopActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyShopLink() {
    const shopUrl = `${window.location.origin}/shop/${shopSlug}`;

    try {
      await navigator.clipboard.writeText(shopUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert("Could not copy link. Copy it manually from the address bar.");
    }
  }

  return (
    <div className="flex min-w-64 flex-col gap-3">
      <Link
        href={`/vendors/${vendorId}/message`}
        className="rounded-full bg-blue-950 px-6 py-3 text-center font-bold text-white hover:bg-blue-800"
      >
        Ask Question / Chat
      </Link>

      <button
        type="button"
        onClick={copyShopLink}
        className="rounded-full border border-blue-950 px-6 py-3 font-bold text-blue-950 hover:bg-blue-50"
      >
        {copied ? "Copied!" : "Copy Shop Link"}
      </button>

      <p className="text-xs text-gray-600">
        Share this link on WhatsApp, status, groups, or social media.
      </p>
    </div>
  );
}