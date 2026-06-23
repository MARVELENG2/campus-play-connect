import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AppFooter from "@/components/AppFooter";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "CAMPUS PLAY CONNECT",
  description: "A Fiverr-style marketplace for BOUESTI students and vendors.",
  applicationName: "Campus Play Connect",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Campus Play Connect",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <AppFooter />
      </body>
    </html>
  );
}