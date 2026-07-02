import { uploadToCloudinary } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename query parameter' }, { status: 400 });
    }

    // Convert request body stream to buffer
    const arrayBuffer = await request.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }
    const buffer = Buffer.from(arrayBuffer);

    // Parse folder structure (e.g. "team/member-123.png" -> folder: "team", filename: "member-123.png")
    let folder = 'uploads';
    let cleanFilename = filename;

    if (filename.includes('/')) {
      const parts = filename.split('/');
      folder = parts.slice(0, -1).join('/');
      cleanFilename = parts[parts.length - 1];
    }

    const result = await uploadToCloudinary(buffer, folder, cleanFilename);

    return NextResponse.json({
      url: result.url,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
