import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow 5 minutes for large magazine PDF uploads

// POST /api/admin/torque/upload - Upload magazine PDF to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const year = formData.get("year") as string || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (support up to 60MB for PDFs)
    const maxSize = 60 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 60MB." }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const folder = `magazines/${year}`;
    const filename = file.name;

    console.log(`[Torque Upload] Uploading PDF to Cloudinary: folder=${folder}, filename=${filename}, size=${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    // Upload to Cloudinary using raw resource_type to avoid Cloudinary's 20MB image processing limit
    const result = await uploadToCloudinary(buffer, folder, filename, {
      resource_type: "raw",
    });

    return NextResponse.json({
      filePath: result.url,
      fileName: file.name,
      fileSize: file.size
    });
  } catch (error) {
    console.error("Error uploading magazine PDF:", error);
    return NextResponse.json(
      { error: "Failed to upload magazine PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
