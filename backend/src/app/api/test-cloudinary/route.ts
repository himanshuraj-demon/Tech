import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const hasSecret = !!process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !hasSecret) {
      return NextResponse.json({
        success: false,
        error: "Cloudinary is not fully configured in environment variables",
        config: { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: hasSecret }
      }, { status: 500 });
    }

    // Attempt test upload of a tiny 1x1 transparent pixel
    const base64Pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const buffer = Buffer.from(base64Pixel, 'base64');

    console.log('[Cloudinary Test] Starting test upload of pixel...');
    const result = await uploadToCloudinary(buffer, 'test', 'test-pixel.png', {
      overwrite: true,
      invalidate: true
    });

    console.log('[Cloudinary Test] Test upload succeeded:', result.url);

    return NextResponse.json({
      success: true,
      message: "Cloudinary upload test succeeded!",
      url: result.url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error("[Cloudinary Test] Test route encountered an error:", error);
    return NextResponse.json({
      success: false,
      error: "Cloudinary upload test failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
