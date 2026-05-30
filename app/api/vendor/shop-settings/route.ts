import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getVendorFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) return null;

  const { data: vendorProfile, error: vendorError } = await supabaseAdmin
    .from("vendor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (vendorError || !vendorProfile) return null;

  return vendorProfile;
}

function cleanSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const vendorProfile = await getVendorFromToken(request);

  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Unauthorized vendor request." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    vendorProfile,
  });
}

export async function PATCH(request: NextRequest) {
  const vendorProfile = await getVendorFromToken(request);

  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Unauthorized vendor request." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const {
    shopSlug,
    profileImageUrl,
    bannerImageUrl,
    tagline,
    about,
  } = body;

  if (!shopSlug) {
    return NextResponse.json(
      { error: "Shop slug is required." },
      { status: 400 }
    );
  }

  const cleanedSlug = cleanSlug(shopSlug);

  if (cleanedSlug.length < 3) {
    return NextResponse.json(
      { error: "Shop slug must be at least 3 characters." },
      { status: 400 }
    );
  }

  const { data: existingShop } = await supabaseAdmin
    .from("vendor_profiles")
    .select("id")
    .eq("shop_slug", cleanedSlug)
    .neq("id", vendorProfile.id)
    .maybeSingle();

  if (existingShop) {
    return NextResponse.json(
      { error: "This shop link is already taken. Choose another one." },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin
    .from("vendor_profiles")
    .update({
      shop_slug: cleanedSlug,
      profile_image_url: profileImageUrl,
      banner_image_url: bannerImageUrl,
      tagline,
      about,
    })
    .eq("id", vendorProfile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Shop settings updated.",
    shopSlug: cleanedSlug,
  });
}