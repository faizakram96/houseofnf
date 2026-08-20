import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    let usedProvider = 'base64';

    for (const file of files) {
      // Validate image type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ success: false, error: `File "${file.name}" is not a valid image format.` }, { status: 400 });
      }

      // Max size limit check (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: `File "${file.name}" exceeds maximum size limit of 10MB.` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Attempt upload to Cloudinary CDN
      const cloudRes = await uploadToCloudinary(buffer, 'house-of-nf/products');

      if (cloudRes.success && cloudRes.url) {
        uploadedUrls.push(cloudRes.url);
        usedProvider = 'cloudinary';
      } else {
        // Fallback to persistent Base64 Data URL if Cloudinary credentials are unconfigured or invalid
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
        uploadedUrls.push(base64Image);
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      provider: usedProvider,
      message: `${uploadedUrls.length} image(s) uploaded successfully using ${usedProvider === 'cloudinary' ? 'Cloudinary CDN' : 'Local Base64 Fallback'}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
