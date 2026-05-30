import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ShopActions from "@/components/ShopActions";
import SaveCatalogItemButton from "@/components/SaveCatalogItemButton";

type ShopPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type VendorProfile = {
  id: string;
  business_name: string;
  category: string;
  business_location: string;
  whatsapp: string;
  services: string;
  description: string | null;
  status: string;
  is_active: boolean;
  shop_slug: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  tagline: string | null;
  about: string | null;
};

type CatalogItem = {
  id: string;
  vendor_id: string;
  title: string;
  item_type: string;
  category: string;
  description: string;
  price: string | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
};

export default async function PublicShopPage({ params }: ShopPageProps) {
  const { slug } = await params;

  const { data: vendor, error } = await supabase
    .from("vendor_profiles")
    .select("*")
    .eq("shop_slug", slug)
    .eq("status", "approved")
    .eq("is_active", true)
    .single();

  if (error || !vendor) {
    notFound();
  }

  const typedVendor = vendor as VendorProfile;

  const { data: catalogItems } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("vendor_id", typedVendor.id)
    .order("created_at", { ascending: false });

  const items = ((catalogItems || []) as CatalogItem[]).filter(
    (item) => item.is_available === true
  );

  const products = items.filter((item) => item.item_type === "product");
  const services = items.filter((item) => item.item_type === "service");

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 text-gray-950">
      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <Link href="/vendors" className="font-bold text-blue-900">
            ← Back to marketplace
          </Link>

          <div className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <div className="relative">
              {typedVendor.banner_image_url ? (
                <img
                  src={typedVendor.banner_image_url}
                  alt={`${typedVendor.business_name} banner`}
                  className="h-60 w-full object-cover"
                />
              ) : (
                <div className="flex h-60 w-full items-center justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-green-700 px-6 text-center text-white">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-green-200">
                      BOUESTI Seller Shop
                    </p>
                    <h1 className="mt-4 text-4xl font-black md:text-6xl">
                      {typedVendor.business_name}
                    </h1>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                  {typedVendor.profile_image_url ? (
                    <img
                      src={typedVendor.profile_image_url}
                      alt={typedVendor.business_name}
                      className="-mt-8 h-32 w-32 rounded-3xl border-4 border-white object-cover shadow-sm"
                    />
                  ) : (
                    <div className="-mt-8 flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-white bg-blue-950 text-5xl font-black text-white shadow-sm">
                      {typedVendor.business_name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-black md:text-5xl">
                        {typedVendor.business_name}
                      </h1>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase text-green-700">
                        Verified Seller
                      </span>
                    </div>

                    <p className="mt-3 text-lg font-bold text-blue-900">
                      {typedVendor.tagline || typedVendor.category}
                    </p>

                    <p className="mt-4 max-w-3xl leading-7 text-gray-700">
                      {typedVendor.about ||
                        typedVendor.description ||
                        typedVendor.services}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
                      <span className="rounded-full bg-gray-100 px-4 py-2 text-gray-700">
                        {typedVendor.category}
                      </span>

                      <span className="rounded-full bg-gray-100 px-4 py-2 text-gray-700">
                        {typedVendor.business_location}
                      </span>

                      <span className="rounded-full bg-gray-100 px-4 py-2 text-gray-700">
                        @{typedVendor.shop_slug}
                      </span>

                      <span className="rounded-full bg-green-100 px-4 py-2 text-green-700">
                        {items.length} catalog item
                        {items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>

                <ShopActions
                  vendorId={typedVendor.id}
                  shopSlug={typedVendor.shop_slug || ""}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-600">Products</p>
              <h2 className="mt-2 text-4xl font-black">{products.length}</h2>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-600">Services</p>
              <h2 className="mt-2 text-4xl font-black">{services.length}</h2>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-600">Seller Status</p>
              <h2 className="mt-2 text-2xl font-black text-green-700">
                Active & Verified
              </h2>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-green-700">
                Catalog
              </p>

              <h2 className="text-4xl font-black">
                Products and services from this seller.
              </h2>

              <p className="mt-3 max-w-2xl text-gray-700">
                Browse available items, save what you like, or ask the seller a
                question before ordering.
              </p>
            </div>

            <p className="font-bold text-gray-700">
              {items.length} item{items.length === 1 ? "" : "s"} available
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {items.length === 0 && (
              <div className="col-span-full rounded-3xl bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-3xl font-black text-gray-500">
                  +
                </div>

                <h3 className="mt-5 text-2xl font-black">
                  No catalog items yet.
                </h3>

                <p className="mx-auto mt-3 max-w-md text-gray-700">
                  This seller has not added products or services yet. Check back
                  later or message the seller directly.
                </p>

                <div className="mt-6">
                  <Link
                    href={`/vendors/${typedVendor.id}/message`}
                    className="inline-block rounded-full bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800"
                  >
                    Message Seller
                  </Link>
                </div>
              </div>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-60 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-60 w-full items-center justify-center bg-gray-100 font-bold text-gray-500">
                      No Image
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase text-blue-950 shadow-sm">
                    {item.item_type}
                  </span>

                  <span className="absolute right-4 top-4 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 shadow-sm">
                    Available
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-sm font-bold text-blue-900">
                    {item.category}
                  </p>

                  <h3 className="mt-2 text-xl font-black">{item.title}</h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-700">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-2xl font-black">
                      {item.price || "Ask seller"}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <Link
                      href={`/vendors/${typedVendor.id}/message?item=${item.id}`}
                      className="block rounded-full bg-blue-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
                    >
                      Ask About This
                    </Link>

                    <SaveCatalogItemButton
                      vendorId={typedVendor.id}
                      catalogItemId={item.id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}