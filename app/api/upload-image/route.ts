import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() : "jpg";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const folder = formData.get("folder")?.toString() || "general";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file uploaded." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP images are allowed." },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Image must be 5MB or less." },
        { status: 400 }
      );
    }

    const extension = getFileExtension(file.name);
    const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "");
    const filePath = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("campus-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data } = supabaseAdmin.storage
      .from("campus-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      message: "Image uploaded successfully.",
      imageUrl: data.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Upload image error:", error);

    return NextResponse.json(
      { error: "Server error while uploading image." },
      { status: 500 }
    );
  }
}