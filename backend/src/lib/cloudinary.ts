import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  [key: string]: any;
}

/**
 * Uploads a file buffer to Cloudinary by caching it locally first,
 * uploading it, and unlinking the temp file afterward.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string,
  options: { overwrite?: boolean; invalidate?: boolean } = {}
): Promise<CloudinaryUploadResult> {
  // Extract file extension and clean filename without extension
  const extension = filename.split('.').pop() || 'jpg';
  // Strip paths and query params to get a clean name
  const basename = path.basename(filename);
  const cleanFilename = basename.replace(/\.[^/.]+$/, "");

  // Create workspace temporary directory for storing local cache
  const tempDir = path.join(process.cwd(), 'tmp');

  try {
    await fs.access(tempDir);
  } catch {
    await fs.mkdir(tempDir, { recursive: true });
  }

  // Create temporary unique filename
  const tempFilePath = path.join(
    tempDir,
    `upload-${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${extension}`
  );

  try {
    // 1. Write the buffer to local temporary storage
    await fs.writeFile(tempFilePath, buffer);
    console.log(`[Cloudinary] Cached file locally: ${tempFilePath}`);

    // 2. Upload the local file to Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: `tech-web/${folder}`,
      public_id: cleanFilename,
      overwrite: options.overwrite ?? true,
      invalidate: options.invalidate ?? true,
      resource_type: 'auto',
    });

    console.log(`[Cloudinary] Uploaded successfully: ${result.secure_url}`);

    return {
      ...result,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('[Cloudinary] Error during upload workflow:', error);
    throw error;
  } finally {
    // 3. Unlink the local temporary file in all cases
    try {
      await fs.unlink(tempFilePath);
      console.log(`[Cloudinary] Cleaned up temp file: ${tempFilePath}`);
    } catch (unlinkError) {
      console.error(`[Cloudinary] Failed to delete temp file ${tempFilePath}:`, unlinkError);
    }
  }
}
