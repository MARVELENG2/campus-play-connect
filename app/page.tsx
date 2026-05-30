import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Category = {
  name: string;
  description: string | null;
};

const fallbackCategories: Category[] = [
  {
    name: "Food & Drinks",
    description: "Meals, snacks, drinks, and food delivery around campus",
  },
  {
    name: "Printing & Photocopy",
    description:
      "Printing, photocopy, typing, binding, and assignment formatting",
  },
  {
    name: "Laundry & Dry Cleaning",
    description: "Washing, ironing, dry cleaning, and clothing care",
  },
  {
    name: "Phone Repairs & Accessories",
    description:
      "Phone repairs, chargers, earphones, screen guards, and accessories",
  },
  {
    name: "Fashion & Tailoring",
    description: "Tailoring, clothing, alterations, and student fashion",
  },
  {
    name: "Transport & Delivery",
    description: "Campus delivery, errands, and movement support",
  },
  {
    name: "Hair & Beauty",
    description: "Barbing, hair styling, makeup, nails, and beauty services",
  },
  {
    name: "Academic Services",
    description:
      "Handouts, project formatting, tutorial support, and academic materials",
  },
  {
    name: "Events & Entertainment",
    description:
      "Campus events, tickets, media, photography, and entertainment support",
  },
  {
    name: "Student Freelancers",
    description:
      "Designers, developers, writers, editors, and student digital workers",
  },
];

function getCategoryIcon(categoryName: string) {
  const icons: Record<string, string> = {
    "Food & Drinks": "🍔",
    "Printing & Photocopy": "🖨️",
    "Laundry & Dry Cleaning": "🧺",
    "Phone Repairs & Accessories": "📱",
    "Phone Repairs": "📱",
    "Fashion & Tailoring": "👕",
    "Transport & Delivery": "🛵",
    "Hair & Beauty": "💇",
    "Academic Services": "📚",
    "Events & Entertainment": "🎤",
    "Student Freelancers": "💻",
  };

  return icons[categoryName] || "✨";
}

export default async function HomePage() {
  const { data: categories } = await supabase
    .from("service_categories")
    .select("name, description")
    .limit(10);

  const marketplaceCategories =
    categories && categories.length > 0
      ? ((categories || []) as Category[])
      : fallbackCategories;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <section className="relative overflow-hidden px-6 py-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-green-700">
              BOUESTI Campus Marketplace
            </p>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Find trusted campus sellers faster.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-gray-700">
              CAMPUS PLAY CONNECT is a campus marketplace for BOUESTI students
              to discover sellers, browse catalogs, save items, chat before
              ordering, and request products or services from verified campus
              shops.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/vendors"
                className="rounded-full bg-blue-950 px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:-translate-y-1 hover:bg-blue-800 hover:shadow-lg"
              >
                Find Sellers
              </Link>

              <Link
                href="/vendor-signup"
                className="rounded-full border border-blue-950 px-6 py-3 text-center text-sm font-bold text-blue-950 transition hover:-translate-y-1 hover:bg-blue-50"
              >
                Become a Seller
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Chat",
                  description: "Talk before ordering.",
                  icon: "💬",
                },
                {
                  title: "Order",
                  description: "Place request from chat.",
                  icon: "🛒",
                },
                {
                  title: "Track",
                  description: "See order status.",
                  icon: "📍",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    {item.icon}
                  </div>

                  <h3 className="mt-3 text-xl font-black">{item.title}</h3>

                  <p className="mt-1 text-xs text-gray-700">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <div className="relative overflow-hidden rounded-[1.4rem] bg-blue-950 p-5 text-white">
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-green-400/20 blur-2xl" />
              <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-blue-400/20 blur-2xl" />

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-widest text-green-300">
                  Marketplace Preview
                </p>

                <h2 className="mt-3 text-2xl font-black">
                  What students can do
                </h2>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      icon: "🔎",
                      text: "Search food, fashion, laundry, printing, repair, and more.",
                    },
                    {
                      icon: "🏪",
                      text: "Open a verified seller shop.",
                    },
                    {
                      icon: "🖼️",
                      text: "Browse catalog items with pictures, prices, and details.",
                    },
                    {
                      icon: "⭐",
                      text: "Save products or services for later.",
                    },
                    {
                      icon: "⚡",
                      text: "Chat before ordering and track order status live.",
                    },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm font-semibold"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg">
                        {item.icon}
                      </span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-xl">
                  🎓
                </div>
                <p className="mt-3 text-xs font-bold text-gray-600">
                  For Students
                </p>
                <h3 className="mt-1 text-lg font-black">Find help quickly</h3>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl">
                  🧑‍💼
                </div>
                <p className="mt-3 text-xs font-bold text-gray-600">
                  For Sellers
                </p>
                <h3 className="mt-1 text-lg font-black">Get more orders</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-green-400">
                Categories
              </p>

              <h2 className="max-w-4xl text-3xl font-black leading-tight md:text-5xl">
                Browse campus services by category.
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Find trusted BOUESTI sellers faster. Pick a category, browse
                shops, chat with sellers, save items, and place orders.
              </p>
            </div>

            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 text-base font-black text-blue-300 transition hover:translate-x-1 hover:text-green-300"
            >
              View all sellers <span>→</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketplaceCategories.map((category) => (
              <Link
                key={category.name}
                href={`/vendors?category=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-400/40 hover:bg-slate-900 hover:shadow-xl hover:shadow-green-950/20"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-400/10 blur-2xl transition group-hover:bg-green-400/20" />
                <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl transition group-hover:bg-blue-500/20" />

                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl ring-1 ring-white/10 transition duration-300 group-hover:scale-105 group-hover:bg-green-400/20 group-hover:ring-green-300/30">
                    {getCategoryIcon(category.name)}
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">
                      {category.name}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {category.description ||
                        "Find approved BOUESTI sellers in this category."}
                    </p>
                  </div>
                </div>

                <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs font-bold text-slate-400">
                    Open category
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-black text-green-300 transition group-hover:translate-x-1 group-hover:bg-green-400 group-hover:text-slate-950">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl rounded-[1.75rem] bg-white p-6 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green-700">
            How it works
          </p>

          <h2 className="text-3xl font-black">
            Built for BOUESTI campus buying and selling.
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Search",
                description:
                  "Student searches for a product, service, seller, or category.",
                icon: "🔎",
              },
              {
                step: "02",
                title: "Chat",
                description: "Student chats with seller before ordering.",
                icon: "💬",
              },
              {
                step: "03",
                title: "Order",
                description: "Student creates order after agreement.",
                icon: "🛒",
              },
              {
                step: "04",
                title: "Track",
                description: "Seller updates status until completed.",
                icon: "📍",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl bg-gray-50 p-5 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900">
                    {item.step}
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    {item.icon}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-black">{item.title}</h3>

                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-blue-950 p-6 text-white">
            <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
                🎓
              </div>

              <h2 className="mt-5 text-3xl font-black">
                Need a product or service?
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-100">
                Search verified campus sellers and chat before placing an
                order.
              </p>

              <Link
                href="/vendors"
                className="mt-5 inline-block rounded-full bg-white px-5 py-3 text-sm font-bold text-blue-950 transition hover:-translate-y-1"
              >
                Explore Sellers
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] bg-green-600 p-6 text-white">
            <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
                🏪
              </div>

              <h2 className="mt-5 text-3xl font-black">Sell on campus?</h2>

              <p className="mt-3 text-sm leading-6 text-green-50">
                Register your seller profile, get approved, add your catalog,
                and share your shop link.
              </p>

              <Link
                href="/vendor-signup"
                className="mt-5 inline-block rounded-full bg-white px-5 py-3 text-sm font-bold text-green-700 transition hover:-translate-y-1"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}