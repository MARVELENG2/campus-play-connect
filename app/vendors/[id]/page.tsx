import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type VendorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VendorRedirectPage({ params }: VendorPageProps) {
  const { id } = await params;

  const { data: vendor, error } = await supabase
    .from("vendor_profiles")
    .select("id, shop_slug, status, is_active")
    .eq("id", id)
    .eq("status", "approved")
    .eq("is_active", true)
    .single();

  if (error || !vendor) {
    notFound();
  }

  if (!vendor.shop_slug) {
    notFound();
  }

  redirect(`/shop/${vendor.shop_slug}`);
}