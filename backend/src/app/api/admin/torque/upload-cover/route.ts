import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// POST /api/admin/torque/upload-cover - Upload magazine cover photo to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const magazineId = formData.get("magazineId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!magazineId) {
      return NextResponse.json({ error: "Magazine ID is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large. Maximum size is 10MB" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const folder = `magazines/covers`;
    const filename = `${magazineId}-cover.${extension}`;

    console.log(`[Torque Cover Upload] Uploading cover to Cloudinary: folder=${folder}, filename=${filename}`);

    // Upload to Cloudinary (allow overwriting cover photos for the same magazine)
    const result = await uploadToCloudinary(buffer, folder, filename, {
      overwrite: true,
      invalidate: true
    });

    // Return the expected file info structure
    return NextResponse.json({
      filePath: result.url,
      fileName: file.name
    });
  } catch (error) {
    console.error("Error uploading cover photo:", error);
    return NextResponse.json(
      { error: "Failed to upload cover photo", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
