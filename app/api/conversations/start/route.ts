import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function generateAccessCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { vendorId, studentId, firstMessage, catalogItemId } = body;

    if (!vendorId || !studentId || !firstMessage) {
      return NextResponse.json(
        { error: "Missing required conversation fields." },
        { status: 400 }
      );
    }

    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendor_profiles")
      .select("id, business_name, status, is_active")
      .eq("id", vendorId)
      .eq("status", "approved")
      .eq("is_active", true)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found or not approved." },
        { status: 404 }
      );
    }

    const { data: student, error: studentError } = await supabaseAdmin
      .from("student_accounts")
      .select("id, username")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: "Student account not found. Please login again." },
        { status: 401 }
      );
    }

    const accessCode = generateAccessCode();

    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("conversations")
      .insert({
        vendor_id: vendorId,
        student_id: student.id,
        catalog_item_id: catalogItemId || null,
        student_name: student.username,
        student_whatsapp: "Not provided",
        access_code: accessCode,
        status: "open",
      })
      .select()
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        {
          error:
            conversationError?.message || "Failed to create conversation.",
        },
        { status: 500 }
      );
    }

    const { error: messageError } = await supabaseAdmin.from("messages").insert({
      conversation_id: conversation.id,
      vendor_id: vendorId,
      sender_type: "student",
      sender_name: student.username,
      message: firstMessage,
    });

    if (messageError) {
      return NextResponse.json(
        { error: messageError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Conversation started.",
      conversationId: conversation.id,
      accessCode,
    });
  } catch {
    return NextResponse.json(
      { error: "Server error while starting conversation." },
      { status: 500 }
    );
  }
}