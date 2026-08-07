/**
 * Cloudinary Image Upload Utility
 * Handles uploading student photos directly to Cloudinary CDN
 * Fallback: Converts to compressed Base64 Data URL if Cloudinary is unconfigured or offline
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

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
      console.warn('Cloudinary upload response not OK, falling back to base64');
    } catch (err) {
      console.error('Cloudinary upload error:', err);
    }
  }

  // Fallback: Local Base64 conversion
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const uploadToCloudinary = uploadStudentPhoto;
