import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

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

  const updateData: {
    unread_for_vendor?: boolean;
    vendor_deleted?: boolean;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (body.unreadForVendor !== undefined) {
    updateData.unread_for_vendor = body.unreadForVendor;
  }

  if (body.vendorDeleted !== undefined) {
    updateData.vendor_deleted = body.vendorDeleted;
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .update(updateData)
    .eq("id", id)
    .eq("vendor_id", vendorProfile.id)
    .select("id, vendor_id, vendor_deleted, unread_for_vendor, updated_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Conversation not found for this seller." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Conversation updated.",
    conversation: data,
  });
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const { id } = await params;
  const vendorProfile = await getVendorFromToken(request);

  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Unauthorized seller request." },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .update({
      vendor_deleted: true,
      unread_for_vendor: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("vendor_id", vendorProfile.id)
    .select("id, vendor_id, vendor_deleted, unread_for_vendor, updated_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Conversation not found for this seller." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Chat deleted from inbox.",
    conversation: data,
  });
}