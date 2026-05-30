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

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { id } = await params;
  const vendorProfile = await getVendorFromToken(request);

  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Unauthorized vendor request." },
      { status: 401 }
    );
  }

  const { data: conversation, error: conversationError } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", id)
    .eq("vendor_id", vendorProfile.id)
    .eq("vendor_deleted", false)
    .single();

  if (conversationError || !conversation) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  const { data: messages, error: messagesError } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .eq("vendor_id", vendorProfile.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json(
      { error: messagesError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    conversation,
    messages: messages || [],
  });
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const { id } = await params;
  const vendorProfile = await getVendorFromToken(request);

  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Unauthorized vendor request." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { message } = body;

  if (!message || !message.trim()) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  const { data: conversation, error: conversationError } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", id)
    .eq("vendor_id", vendorProfile.id)
    .eq("vendor_deleted", false)
    .single();

  if (conversationError || !conversation) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  const { error: messageError } = await supabaseAdmin.from("messages").insert({
    conversation_id: id,
    vendor_id: vendorProfile.id,
    sender_type: "vendor",
    sender_name: vendorProfile.business_name,
    message: message.trim(),
  });

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("conversations")
    .update({
      updated_at: new Date().toISOString(),
      unread_for_vendor: false,
    })
    .eq("id", id)
    .eq("vendor_id", vendorProfile.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Reply sent.",
  });
}