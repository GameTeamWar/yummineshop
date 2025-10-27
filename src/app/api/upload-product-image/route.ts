import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const partnerId = formData.get('partnerId') as string;

    if (!file || !partnerId) {
      return NextResponse.json({ error: 'File and partnerId required' }, { status: 400 });
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const bucket = getStorage().bucket();
    const fileName = `products/${partnerId}/${Date.now()}_${file.name}`;
    const fileRef = bucket.file(fileName);

    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Firebase Storage'a yükle
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          partnerId,
          uploadedAt: new Date().toISOString(),
        },
      },
      public: true, // Public URL için
    });

    // Public URL al
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Uzun süreli URL
    });

    return NextResponse.json({
      url,
      fileName,
      success: true
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    return NextResponse.json({ error: 'Failed to upload product image' }, { status: 500 });
  }
}