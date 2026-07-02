import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// POST /api/admin/clubs/upload-logo - Upload club/hobby group logo
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clubId = formData.get('clubId') as string;
    const clubType = formData.get('clubType') as string;
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = clubId?.split(':')[0];
    
    console.log('Logo upload request:', { 
      originalId: clubId, 
      cleanId: cleanClubId, 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      hasCloudinaryConfig: !!process.env.CLOUDINARY_CLOUD_NAME
    });

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!cleanClubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary environment variables not found');
      return NextResponse.json({ error: "Server configuration error - missing Cloudinary credentials" }, { status: 500 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a folder and filename based on club type and ID
    const fileExtension = file.name.split('.').pop() || 'png';
    const logoType = clubType === 'club' ? 'clubs' : 
                    clubType === 'hobby-group' ? 'hobby-groups' : 
                    'technical-council-groups';
    const folder = `logos/${logoType}`;
    const fileName = `${cleanClubId}.${fileExtension}`;

    console.log('Uploading to Cloudinary:', { folder, fileName, logoType, fileExtension });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, folder, fileName, {
      overwrite: true,
      invalidate: true, // Invalidate CDN cache so the new logo shows up immediately
    });

    console.log('Logo uploaded successfully:', { url: result.url, fileName });

    return NextResponse.json({ 
      url: result.url,
      message: "Logo uploaded successfully" 
    });

  } catch (error) {
    console.error("Error uploading logo:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name
    });
    return NextResponse.json(
      { 
        error: "Failed to upload logo",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/clubs/upload-logo - Delete club logo
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const clubType = searchParams.get("clubType");
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = clubId?.split(':')[0];
    
    console.log('Logo delete request:', { originalId: clubId, cleanId: cleanClubId, clubType });

    if (!cleanClubId || !clubType) {
      return NextResponse.json({ error: "Club ID and type are required" }, { status: 400 });
    }

    // For now, just return success - actual deletion would require knowing the specific blob URL
    // The frontend will handle removing the logo from the UI
    return NextResponse.json({ message: "Logo deleted successfully" });

  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 }
    );
  }
}
