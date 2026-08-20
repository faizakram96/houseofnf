import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads an image Buffer directly to Cloudinary
 * Returns secure URL and public_id upon success.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'house-of-nf/products'
): Promise<{ success: boolean; url?: string; public_id?: string; error?: string }> {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if Cloudinary credentials are provided and valid
    if (
      !cloudName ||
      !apiKey ||
      !apiSecret ||
      cloudName === 'your_cloud_name' ||
      (cloudName === 'houseofnf' && apiKey === '1234567890')
    ) {
      return {
        success: false,
        error: 'Cloudinary API credentials are unconfigured or using placeholder keys.',
      };
    }

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) {
            resolve({ success: false, error: error.message });
          } else if (result) {
            resolve({
              success: true,
              url: result.secure_url,
              public_id: result.public_id,
            });
          } else {
            resolve({ success: false, error: 'Unknown Cloudinary upload failure.' });
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export default cloudinary;
