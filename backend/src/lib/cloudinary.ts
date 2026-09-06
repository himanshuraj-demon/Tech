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

export interface CloudinaryUploadOptions {
  overwrite?: boolean;
  invalidate?: boolean;
  resource_type?: 'auto' | 'raw' | 'image' | 'video';
  chunk_size?: number;
}

/**
 * Uploads a file buffer to Cloudinary by caching it locally first,
 * uploading it (using chunked upload_large for large files > 10MB or raw docs),
 * and unlinking the temp file afterward.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  // Extract file extension and clean filename without extension
  const extension = (filename.split('.').pop() || 'jpg').toLowerCase();
  // Strip paths and query params to get a clean name
  const basename = path.basename(filename);
  const cleanFilename = basename.replace(/\.[^/.]+$/, "");

  // Determine resource_type: if explicitly provided use it, otherwise PDFs default to 'raw'
  const resourceType = options.resource_type || (extension === 'pdf' ? 'raw' : 'auto');

  // For 'raw' files (such as PDFs), include the extension in public_id so Cloudinary delivers the URL with .pdf
  const publicId = resourceType === 'raw' ? `${cleanFilename}.${extension}` : cleanFilename;

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
    console.log(`[Cloudinary] Cached file locally: ${tempFilePath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

    // 2. Upload to Cloudinary:
    // Files > 10MB or 'raw' documents (like magazine PDFs) must use upload_large to avoid Cloudinary's 20MB limit
    const isLarge = buffer.length > 10 * 1024 * 1024 || resourceType === 'raw';

    let result: any;
    if (isLarge) {
      console.log(`[Cloudinary] Using chunked upload_large for ${filename} (size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB, type: ${resourceType})`);
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(
          tempFilePath,
          {
            folder: `tech-web/${folder}`,
            public_id: publicId,
            overwrite: options.overwrite ?? true,
            invalidate: options.invalidate ?? true,
            resource_type: resourceType,
            chunk_size: options.chunk_size || 6000000, // 6MB chunks
            timeout: 300000, // 5 minutes timeout
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
            } else {
              resolve(uploadResult);
            }
          }
        );
      });
    } else {
      result = await cloudinary.uploader.upload(tempFilePath, {
        folder: `tech-web/${folder}`,
        public_id: publicId,
        overwrite: options.overwrite ?? true,
        invalidate: options.invalidate ?? true,
        resource_type: resourceType,
        timeout: 120000,
      });
    }

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
