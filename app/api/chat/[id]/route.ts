import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

async function verifyConversation(conversationId: string, accessCode: string) {
  const { data: conversation, error } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("access_code", accessCode)
    .single();

  if (error || !conversation) {
    return null;
  }

  return conversation;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { id } = await params;
  const accessCode = request.nextUrl.searchParams.get("code") || "";

  if (!accessCode) {
    return NextResponse.json(
      { error: "Missing chat access code." },
      { status: 400 }
    );
  }

  const conversation = await verifyConversation(id, accessCode);

  if (!conversation) {
    return NextResponse.json(
      { error: "Invalid or expired chat access." },
      { status: 403 }
    );
  }

  const { data: messages, error: messagesError } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json(
      { error: messagesError.message },
      { status: 500 }
    );
  }

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    return NextResponse.json(
      { error: ordersError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    conversation,
    messages: messages || [],
    orders: orders || [],
  });
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json();

  const { code, message } = body;

  if (!code || !message) {
    return NextResponse.json(
      { error: "Missing code or message." },
      { status: 400 }
    );
  }

  const conversation = await verifyConversation(id, code);

  if (!conversation) {
    return NextResponse.json(
      { error: "Invalid or expired chat access." },
      { status: 403 }
    );
  }

  const { error } = await supabaseAdmin.from("messages").insert({
    conversation_id: conversation.id,
    vendor_id: conversation.vendor_id,
    sender_type: "student",
    sender_name: conversation.student_name,
    message,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

 await supabaseAdmin
  .from("conversations")
  .update({
    updated_at: new Date().toISOString(),
    unread_for_vendor: true,
    vendor_deleted: false,
  })
  .eq("id", conversation.id);

  return NextResponse.json({
    message: "Message sent.",
  });
}