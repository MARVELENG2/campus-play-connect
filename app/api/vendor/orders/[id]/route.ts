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
  const body = await request.json();

  const { status } = body;

  const allowedStatuses = [
    "pending",
    "accepted",
    "in_progress",
    "completed",
    "cancelled",
  ];

  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Invalid order status." },
      { status: 400 }
    );
  }

  const vendorProfile = await getVendorFromToken(request);

  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Unauthorized vendor request." },
      { status: 401 }
    );
  }

  const { data: order, error: orderFetchError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("vendor_id", vendorProfile.id)
    .single();

  if (orderFetchError || !order) {
    return NextResponse.json(
      { error: "Order not found for this vendor." },
      { status: 404 }
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("vendor_id", vendorProfile.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabaseAdmin.from("messages").insert({
    conversation_id: order.conversation_id,
    vendor_id: vendorProfile.id,
    sender_type: "system",
    sender_name: "CAMPUS PLAY CONNECT",
    message: `Order status updated to: ${status}`,
  });

  await supabaseAdmin
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", order.conversation_id);

  return NextResponse.json({
    message: "Order status updated.",
  });
}