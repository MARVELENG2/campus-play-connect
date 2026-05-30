import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      conversationId,
      accessCode,
      studentId,
      serviceRequested,
      orderNote,
      price,
      location,
    } = body;

    if (
      !conversationId ||
      !accessCode ||
      !studentId ||
      !serviceRequested ||
      !location
    ) {
      return NextResponse.json(
        { error: "Missing required order fields." },
        { status: 400 }
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

    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("access_code", accessCode)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Invalid conversation or access code." },
        { status: 403 }
      );
    }

    if (conversation.student_id && conversation.student_id !== student.id) {
      return NextResponse.json(
        { error: "This conversation does not belong to this student." },
        { status: 403 }
      );
    }

    if (!conversation.student_id) {
      await supabaseAdmin
        .from("conversations")
        .update({
          student_id: student.id,
          student_name: student.username,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        conversation_id: conversation.id,
        vendor_id: conversation.vendor_id,
        student_id: student.id,
        catalog_item_id: conversation.catalog_item_id || null,
        student_name: student.username,
        student_whatsapp: conversation.student_whatsapp || "Not provided",
        service_requested: serviceRequested,
        order_note: orderNote,
        price,
        location,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message || "Failed to create order." },
        { status: 500 }
      );
    }

    await supabaseAdmin.from("messages").insert({
      conversation_id: conversation.id,
      vendor_id: conversation.vendor_id,
      sender_type: "system",
      sender_name: "CAMPUS PLAY CONNECT",
      message: `New order created: ${serviceRequested}`,
    });

    await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation.id);

    return NextResponse.json({
      message: "Order created successfully.",
      order,
    });
  } catch {
    return NextResponse.json(
      { error: "Server error while creating order." },
      { status: 500 }
    );
  }
}