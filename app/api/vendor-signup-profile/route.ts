import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      email,
      businessName,
      category,
      businessLocation,
      whatsapp,
      services,
      description,
    } = body;

    if (
      !userId ||
      !email ||
      !businessName ||
      !category ||
      !businessLocation ||
      !whatsapp ||
      !services
    ) {
      return NextResponse.json(
        { error: "Missing required vendor profile fields." },
        { status: 400 }
      );
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email,
      role: "vendor",
    });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const { error: vendorProfileError } = await supabaseAdmin
      .from("vendor_profiles")
      .insert({
        user_id: userId,
        business_name: businessName,
        category,
        business_location: businessLocation,
        whatsapp,
        services,
        description,
        status: "pending",
        is_active: false,
      });

    if (vendorProfileError) {
      return NextResponse.json(
        { error: vendorProfileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Vendor profile created. Pending admin approval.",
    });
  } catch {
    return NextResponse.json(
      { error: "Server error while creating vendor profile." },
      { status: 500 }
    );
  }
}