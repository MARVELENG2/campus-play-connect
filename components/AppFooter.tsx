"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function AppFooter() {
  const pathname = usePathname();

  const hideFooterRoutes = [
    "/vendor-dashboard",
    "/student-dashboard",
    "/student-saved",
  ];

  const shouldHideFooter = hideFooterRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}