import axios from 'axios';

const DEFAULT_CLOUD_NAME = 'gog1fpsj';
const DEFAULT_PRESET = 'divachic_products';

const CLOUD_NAME = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) || DEFAULT_CLOUD_NAME;
const UPLOAD_PRESET = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET) || DEFAULT_PRESET;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Uploads an image File or Blob to Cloudinary CDN and returns the secure HTTPS CDN URL.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  onProgress?: (percent: number) => void
): Promise<string> {
  // Max size check: 25MB
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Image size exceeds maximum limit of 25MB. Please choose a smaller photo.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post<{ secure_url: string; url: string }>(
      CLOUDINARY_UPLOAD_URL,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 45000, // 45s timeout for mobile networks
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      }
    );

    if (!response.data || !response.data.secure_url) {
      throw new Error('Cloudinary upload succeeded but did not return a secure URL');
    }

    return response.data.secure_url;
  } catch (error: any) {
    const serverMessage = error.response?.data?.error?.message;
    if (serverMessage) {
      console.error('Cloudinary CDN Error:', serverMessage);
      throw new Error(`Cloudinary Upload Error: ${serverMessage}`);
    }
    throw error;
  }
}

/**
 * Transforms Cloudinary URL with optimal mobile compression, format negotiation (WebP/AVIF), and quality.
 */
export function optimizeCloudinaryUrl(url: string, width = 800): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }
  // Inject f_auto,q_auto,w_xxx into upload path
  if (url.includes('/image/upload/') && !url.includes('/f_auto')) {
    return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

export default uploadToCloudinary;
