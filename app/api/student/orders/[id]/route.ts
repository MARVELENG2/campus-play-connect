import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;

    let body: {
      studentId?: string;
    } = {};

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { studentId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing order ID." },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { error: "Missing student ID." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        student_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("student_id", studentId)
      .select("id, student_id, student_deleted, updated_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Order not found for this student." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Order removed from your dashboard.",
      order: data,
    });
  } catch (error) {
    console.error("Student delete order API error:", error);

    return NextResponse.json(
      { error: "Server error while deleting order." },
      { status: 500 }
    );
  }
}