/**
 * Cloudinary Image Upload Utility
 * Handles uploading student photos directly to Cloudinary CDN
 * Fallback: Converts to compressed Base64 Data URL if Cloudinary is unconfigured or offline
 * Includes built-in compression to prevent exceeding Firestore 1MB document limit
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

/**
 * Compress an image file using Canvas API
 * Returns a compressed Blob URL as base64
 */
const compressImageToBase64 = (file, maxWidth = 600, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        // Safety check: if compressed base64 is still > 700KB, reduce quality further
        if (compressedBase64.length > 700 * 1024) {
          const smallerBase64 = canvas.toDataURL('image/jpeg', 0.4);
          resolve(smallerBase64);
        } else {
          resolve(compressedBase64);
        }
      };
      img.onerror = () => {
        // Fallback: return raw base64 if image processing fails
        resolve(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const uploadStudentPhoto = async (file) => {
  if (!file) return null;

  // Try uploading to Cloudinary if credentials are configured
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'kuttab_students');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.secure_url;
      }
      console.warn('Cloudinary upload response not OK, falling back to compressed base64');
    } catch (err) {
      console.error('Cloudinary upload error:', err);
    }
  }

  // Fallback: Compressed Base64 conversion (safe for Firestore 1MB limit)
  try {
    const compressedUrl = await compressImageToBase64(file, 600, 0.6);
    return compressedUrl;
  } catch (err) {
    console.error('Image compression error, using raw base64:', err);
    // Last resort: raw FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
};

export const uploadToCloudinary = uploadStudentPhoto;
