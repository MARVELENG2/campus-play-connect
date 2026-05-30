import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const { data: existingStudent } = await supabaseAdmin
      .from("student_accounts")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existingStudent) {
      return NextResponse.json(
        { error: "Username already exists. Choose another username." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: student, error } = await supabaseAdmin
      .from("student_accounts")
      .insert({
        username: cleanUsername,
        password_hash: passwordHash,
      })
      .select("id, username, created_at")
      .single();

    if (error || !student) {
      return NextResponse.json(
        { error: error?.message || "Failed to create student account." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Student account created successfully.",
      student,
    });
  } catch {
    return NextResponse.json(
      { error: "Server error while creating student account." },
      { status: 500 }
    );
  }
}