"use client";

import { useState } from "react";

type SaveCatalogItemButtonProps = {
  vendorId: string;
  catalogItemId: string;
};

type Student = {
  id: string;
  username: string;
};

export default function SaveCatalogItemButton({
  vendorId,
  catalogItemId,
}: SaveCatalogItemButtonProps) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveItem() {
    setMessage("");

    const storedStudent = localStorage.getItem("student");

    if (!storedStudent) {
      window.location.href = `/student-login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    const student = JSON.parse(storedStudent) as Student;

    setSaving(true);

    try {
      const response = await fetch("/api/student/saved-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
          vendorId,
          catalogItemId,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setMessage(result.error || "Failed to save item.");
        return;
      }

      setMessage("Saved.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={saveItem}
        disabled={saving}
        className="mt-3 w-full rounded-full border border-blue-950 px-5 py-3 text-center text-sm font-bold text-blue-950 hover:bg-blue-50 disabled:bg-gray-200"
      >
        {saving ? "Saving..." : "Save Item"}
      </button>

      {message && <p className="mt-2 text-center text-xs font-bold">{message}</p>}
    </div>
  );
}