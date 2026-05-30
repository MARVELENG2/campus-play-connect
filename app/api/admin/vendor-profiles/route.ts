import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isAdmin(request: NextRequest) {
  const adminKey = request.headers.get("x-admin-key");
  return adminKey === process.env.ADMIN_PASSCODE;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: "Unauthorized admin request." },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("vendor_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Vendor profiles loaded.",
    vendors: data || [],
  });
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: "Unauthorized admin request." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { vendorId, action } = body;

  if (!vendorId || !action) {
    return NextResponse.json(
      { error: "Missing vendorId or action." },
      { status: 400 }
    );
  }

  let updateData: {
    status?: string;
    is_active?: boolean;
  } = {};

  if (action === "approve") {
    updateData = {
      status: "approved",
      is_active: true,
    };
  } else if (action === "reject") {
    updateData = {
      status: "rejected",
      is_active: false,
    };
  } else if (action === "suspend") {
    updateData = {
      status: "suspended",
      is_active: false,
    };
  } else if (action === "reactivate") {
    updateData = {
      status: "approved",
      is_active: true,
    };
  } else {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("vendor_profiles")
    .update(updateData)
    .eq("id", vendorId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Vendor ${action} action completed.`,
  });
}