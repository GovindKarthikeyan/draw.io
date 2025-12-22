import { NextRequest, NextResponse } from 'next/server';

// Force this route to use Node.js runtime (not Edge)
export const runtime = 'nodejs';

// In-memory storage for uploaded files (replace with database in production)
const fileStorage = new Map<string, { content: string; mimeType: string; uploadedAt: Date }>();

/**
 * POST handler to upload Excel, CSV, or PDF files
 * Accepts multipart/form-data with file field
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
      'text/csv',
      'application/csv',
      'application/pdf',
    ];

    const allowedExtensions = /\.(xlsx|xls|xlsm|csv|pdf)$/i;

    if (!allowedTypes.includes(file.type) && !file.name.match(allowedExtensions)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only Excel (.xlsx, .xls, .xlsm), CSV (.csv), and PDF (.pdf) files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 413 }
      );
    }

    // Read file as ArrayBuffer and convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString('base64');

    // Store file with metadata
    fileStorage.set(file.name, {
      content: base64Content,
      mimeType: file.type || 'application/octet-stream',
      uploadedAt: new Date(),
    });

    console.log(`[API] File uploaded: ${file.name}, size: ${file.size}, type: ${file.type}`);

    return NextResponse.json(
      {
        success: true,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error uploading file:', error);
    
    return NextResponse.json(
      { error: 'Internal server error while uploading file' },
      { status: 500 }
    );
  }
}

/**
 * GET handler to retrieve file by filename
 * Query parameter: filename
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('filename');

    if (!fileName) {
      return NextResponse.json(
        { error: 'Filename parameter is required' },
        { status: 400 }
      );
    }

    const fileData = fileStorage.get(fileName);

    if (!fileData) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    console.log(`[API] File retrieved: ${fileName}`);

    return NextResponse.json(
      {
        success: true,
        fileName: fileName,
        content: fileData.content,
        mimeType: fileData.mimeType,
        uploadedAt: fileData.uploadedAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error retrieving file:', error);
    
    return NextResponse.json(
      { error: 'Internal server error while retrieving file' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a file by filename
 * Query parameter: filename
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('filename');

    if (!fileName) {
      return NextResponse.json(
        { error: 'Filename parameter is required' },
        { status: 400 }
      );
    }

    const existed = fileStorage.has(fileName);
    
    if (!existed) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    fileStorage.delete(fileName);

    console.log(`[API] File deleted: ${fileName}`);

    return NextResponse.json(
      {
        success: true,
        message: `File ${fileName} deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error deleting file:', error);
    
    return NextResponse.json(
      { error: 'Internal server error while deleting file' },
      { status: 500 }
    );
  }
}
