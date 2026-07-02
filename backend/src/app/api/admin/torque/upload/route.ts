import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

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

    // Validate size (max 50MB for PDFs)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB." }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const folder = `magazines/${year}`;
    const filename = file.name;

    console.log(`[Torque Upload] Uploading PDF to Cloudinary: folder=${folder}, filename=${filename}`);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, folder, filename);

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
