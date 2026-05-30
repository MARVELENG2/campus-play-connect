import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  const { id } = await params;
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
    isAvailable,
  } = body;

  const updateData: Record<string, string | boolean | null> = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) updateData.title = title;
  if (itemType !== undefined) updateData.item_type = itemType;
  if (category !== undefined) updateData.category = category;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = price;
  if (imageUrl !== undefined) updateData.image_url = imageUrl;
  if (isAvailable !== undefined) updateData.is_available = isAvailable;

  const { error } = await supabaseAdmin
    .from("catalog_items")
    .update(updateData)
    .eq("id", id)
    .eq("vendor_id", vendorProfile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Catalog item updated.",
  });
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const { id } = await params;
  const vendorProfile = await getVendorFromToken(request);

  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Unauthorized vendor request." },
      { status: 401 }
    );
  }

  const { error } = await supabaseAdmin
    .from("catalog_items")
    .delete()
    .eq("id", id)
    .eq("vendor_id", vendorProfile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Catalog item deleted.",
  });
}