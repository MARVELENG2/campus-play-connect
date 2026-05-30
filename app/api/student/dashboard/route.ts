import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { error: "Missing student ID." },
      { status: 400 }
    );
  }

  const { data: student, error: studentError } = await supabaseAdmin
    .from("student_accounts")
    .select("id, username, created_at")
    .eq("id", studentId)
    .maybeSingle();

  if (studentError) {
    return NextResponse.json({ error: studentError.message }, { status: 500 });
  }

  if (!student) {
    return NextResponse.json(
      { error: "Student account not found." },
      { status: 404 }
    );
  }

  const { data: conversations, error: conversationsError } = await supabaseAdmin
    .from("conversations")
    .select(`
      id,
      vendor_id,
      student_id,
      student_name,
      access_code,
      status,
      student_deleted,
      created_at,
      updated_at,
      vendor_profiles (
        id,
        business_name,
        shop_slug,
        category
      )
    `)
    .eq("student_id", studentId)
    .or("student_deleted.eq.false,student_deleted.is.null")
    .order("updated_at", { ascending: false });

  if (conversationsError) {
    return NextResponse.json(
      { error: conversationsError.message },
      { status: 500 }
    );
  }

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      conversation_id,
      vendor_id,
      student_id,
      service_requested,
      order_note,
      price,
      location,
      status,
      student_deleted,
      created_at,
      updated_at,
      vendor_profiles (
        id,
        business_name,
        shop_slug,
        category
      )
    `)
    .eq("student_id", studentId)
    .or("student_deleted.eq.false,student_deleted.is.null")
    .order("updated_at", { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      student,
      conversations: conversations || [],
      orders: orders || [],
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}