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

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("vendor_id", vendorProfile.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    vendorProfile,
    orders: orders || [],
  });
}