import api from "../services/api";

/**
 * Upload image through backend proxy to FreeImage.host
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImageToFreeImage = async (file) => {
  try {
    console.log("📤 Uploading image to FreeImage.host via backend...");

    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Upload failed");
    }

    const imageUrl = response.data.url;
    console.log("✅ Image uploaded successfully:", imageUrl);

    return imageUrl;
  } catch (error) {
    console.error("❌ Image upload error:", error);
    throw error;
  }
};

/**
 * Upload image with base64 encoding (alternative method)
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImageBase64 = async (file) => {
  try {
    console.log("📤 Uploading image (base64) to FreeImage.host via backend...");

    // Convert file to base64
    const base64 = await fileToBase64(file);

    const response = await api.post("/upload/image-base64", {
      image: base64,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Upload failed");
    }

    const imageUrl = response.data.url;
    console.log("✅ Image uploaded successfully:", imageUrl);

    return imageUrl;
  } catch (error) {
    console.error("❌ Image upload error:", error);
    throw error;
  }
};

/**
 * Convert file to base64
 * @param {File} file
 * @returns {Promise<string>}
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
