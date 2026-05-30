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

  const { data: savedItems, error } = await supabaseAdmin
    .from("saved_items")
    .select(`
      id,
      student_id,
      vendor_id,
      catalog_item_id,
      created_at,
      catalog_items (
        id,
        title,
        item_type,
        category,
        description,
        price,
        image_url,
        is_available
      ),
      vendor_profiles (
        id,
        business_name,
        shop_slug,
        category
      )
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { savedItems: savedItems || [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { studentId, vendorId, catalogItemId } = body;

  if (!studentId || !vendorId || !catalogItemId) {
    return NextResponse.json(
      { error: "Missing student ID, vendor ID, or catalog item ID." },
      { status: 400 }
    );
  }

  const { data: existingItem } = await supabaseAdmin
    .from("saved_items")
    .select("id")
    .eq("student_id", studentId)
    .eq("catalog_item_id", catalogItemId)
    .maybeSingle();

  if (existingItem) {
    return NextResponse.json({
      message: "Item already saved.",
      savedItem: existingItem,
    });
  }

  const { data, error } = await supabaseAdmin
    .from("saved_items")
    .insert({
      student_id: studentId,
      vendor_id: vendorId,
      catalog_item_id: catalogItemId,
    })
    .select("id, student_id, vendor_id, catalog_item_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Item saved successfully.",
    savedItem: data,
  });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();

  const { studentId, savedItemId, catalogItemId } = body;

  if (!studentId) {
    return NextResponse.json(
      { error: "Missing student ID." },
      { status: 400 }
    );
  }

  if (!savedItemId && !catalogItemId) {
    return NextResponse.json(
      { error: "Missing saved item ID or catalog item ID." },
      { status: 400 }
    );
  }

  let query = supabaseAdmin
    .from("saved_items")
    .delete()
    .eq("student_id", studentId);

  if (savedItemId) {
    query = query.eq("id", savedItemId);
  }

  if (catalogItemId) {
    query = query.eq("catalog_item_id", catalogItemId);
  }

  const { data, error } = await query.select("id").maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Saved item not found for this student." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Saved item removed.",
    savedItem: data,
  });
}