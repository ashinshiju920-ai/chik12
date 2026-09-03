import axios from 'axios';

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/gog1fpsj/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'divachic_products';

/**
 * Uploads an image File or Blob to Cloudinary and returns the secure HTTPS CDN URL.
 * Endpoint: https://api.cloudinary.com/v1_1/gog1fpsj/image/upload
 * Preset: divachic_products
 */
export async function uploadToCloudinary(
  file: File | Blob,
  onProgress?: (percent: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await axios.post<{ secure_url: string; url: string }>(
    CLOUDINARY_UPLOAD_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    }
  );

  if (!response.data || !response.data.secure_url) {
    throw new Error('Cloudinary upload did not return a secure URL');
  }

  return response.data.secure_url;
}

export default uploadToCloudinary;
