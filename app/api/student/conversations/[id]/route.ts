import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json();

  const { studentId } = body;

  if (!studentId) {
    return NextResponse.json(
      { error: "Missing student ID." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .update({
      student_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("student_id", studentId)
    .select("id, student_id, student_deleted")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Conversation not found for this student." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Chat deleted from your dashboard.",
    conversation: data,
  });
}