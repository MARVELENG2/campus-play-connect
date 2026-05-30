import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-blue-950 px-6 py-4 text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-base font-black">CAMPUS PLAY CONNECT</h2>
          <p className="mt-1 text-xs text-blue-200">
            BOUESTI campus marketplace for sellers, chats, catalogs, and orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-bold text-blue-100">
          <Link href="/" className="hover:text-white">
            Home
          </Link>

          <Link href="/vendors" className="hover:text-white">
            Marketplace
          </Link>

          <Link href="/student-login" className="hover:text-white">
            Student
          </Link>

          <Link href="/vendor-login" className="hover:text-white">
            Seller
          </Link>

          <Link href="/vendor-signup" className="hover:text-white">
            Become a Seller
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-3 max-w-7xl border-t border-white/10 pt-3 text-[11px] text-blue-300">
        © {new Date().getFullYear()} CAMPUS PLAY CONNECT.
      </div>
    </footer>
  );
}