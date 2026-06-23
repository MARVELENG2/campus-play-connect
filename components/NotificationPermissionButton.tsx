"use client";

import { useState } from "react";
import { requestNotificationPermission } from "@/lib/notifications";

export default function NotificationPermissionButton() {
  const [status, setStatus] = useState<string>("");

  async function enableNotifications() {
    const result = await requestNotificationPermission();

    if (result === "granted") {
      setStatus("Notifications enabled");
    } else if (result === "denied") {
      setStatus("Notifications blocked");
    } else if (result === "unsupported") {
      setStatus("Notifications not supported on this device");
    } else {
      setStatus("Notifications not enabled");
    }
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-black text-slate-900">
        App Notifications
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        Enable alerts for new chats and orders.
      </p>

      <button
        onClick={enableNotifications}
        className="mt-3 rounded-xl bg-blue-700 px-4 py-2 text-xs font-black text-white hover:bg-blue-800"
      >
        Enable Notifications
      </button>

      {status && (
        <p className="mt-2 text-xs font-bold text-slate-600">{status}</p>
      )}
    </div>
  );
}