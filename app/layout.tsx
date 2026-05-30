import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AppFooter from "@/components/AppFooter";

export const metadata: Metadata = {
  title: "CAMPUS PLAY CONNECT",
  description: "A Fiverr-style marketplace for BOUESTI students and vendors.",
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