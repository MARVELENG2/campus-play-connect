import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getVendorFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return null;
  }

  const { data: vendorProfile, error: vendorError } = await supabaseAdmin
    .from("vendor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (vendorError || !vendorProfile) {
    return null;
  }

  return vendorProfile;
}

export async function GET(request: NextRequest) {
  const vendorProfile = await getVendorFromToken(request);

  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Unauthorized vendor request." },
      { status: 401 }
    );
  }

  const { data: items, error } = await supabaseAdmin
    .from("catalog_items")
    .select("*")
    .eq("vendor_id", vendorProfile.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    vendorProfile,
    items: items || [],
  });
}

export async function POST(request: NextRequest) {
  const vendorProfile = await getVendorFromToken(request);

  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Unauthorized vendor request." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const {
    title,
    itemType,
    category,
    description,
    price,
    imageUrl,
  } = body;

  if (!title || !itemType || !category || !description) {
    return NextResponse.json(
      { error: "Title, type, category, and description are required." },
      { status: 400 }
    );
  }

  const allowedTypes = ["product", "service"];

  if (!allowedTypes.includes(itemType)) {
    return NextResponse.json(
      { error: "Item type must be product or service." },
      { status: 400 }
    );
  }

  const { data: item, error } = await supabaseAdmin
    .from("catalog_items")
    .insert({
      vendor_id: vendorProfile.id,
      title,
      item_type: itemType,
      category,
      description,
      price,
      image_url: imageUrl,
      is_available: true,
    })
    .select()
    .single();

  if (error || !item) {
    return NextResponse.json(
      { error: error?.message || "Failed to create catalog item." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Catalog item created.",
    item,
  });
}