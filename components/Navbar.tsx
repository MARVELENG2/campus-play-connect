"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  username: string;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    function loadStudent() {
      const storedStudent = localStorage.getItem("student");

      if (!storedStudent) {
        setStudent(null);
        return;
      }

      try {
        setStudent(JSON.parse(storedStudent));
      } catch {
        localStorage.removeItem("student");
        setStudent(null);
      }
    }

    loadStudent();

window.addEventListener("storage", loadStudent);
window.addEventListener("student-auth-change", loadStudent);

return () => {
  window.removeEventListener("storage", loadStudent);
  window.removeEventListener("student-auth-change", loadStudent);
};
  }, []);

  function closeMenu() {
    setIsOpen(false);
  }

  const navLinks = [
    { label: "Find Vendors", href: "/vendors" },
    ...(student
      ? [
          { label: "Saved Items", href: "/student-saved" },
          { label: `@${student.username}`, href: "/student-dashboard" },
        ]
      : [{ label: "Student Login", href: "/student-login" }]),
    { label: "Become a Seller", href: "/vendor-signup" },
    { label: "Seller Login", href: "/vendor-login" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-blue-950/95 text-white shadow-sm backdrop-blur">
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={closeMenu}
            className="text-lg font-black tracking-tight md:text-xl"
          >
            CAMPUS PLAY CONNECT
          </Link>

          <div className="hidden items-center gap-6 text-sm font-bold text-blue-100 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              href="/vendors"
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-blue-950 hover:bg-blue-50"
            >
              Explore
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="rounded-xl border border-white/30 px-4 py-2 text-sm font-bold text-white md:hidden"
          >
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={closeMenu}
                className="rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 shadow-sm"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/vendors"
              onClick={closeMenu}
              className="rounded-xl bg-blue-950 px-4 py-3 text-center text-sm font-bold text-white"
            >
              Explore Vendors
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}