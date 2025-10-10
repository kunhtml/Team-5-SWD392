/**
 * Upload image to FreeImage.host
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImageToFreeImage = async (file) => {
  try {
    const apiKey = process.env.REACT_APP_FREEIMAGE_KEY;

    if (!apiKey) {
      throw new Error("Thiếu REACT_APP_FREEIMAGE_KEY trong .env");
    }

    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("action", "upload");
    formData.append("source", file);
    formData.append("format", "json");

    console.log("📤 Uploading image to FreeImage.host...");

    const response = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status_code !== 200) {
      throw new Error(data.error?.message || "Upload failed");
    }

    const imageUrl = data.image.url;
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
    const apiKey = process.env.REACT_APP_FREEIMAGE_KEY;

    if (!apiKey) {
      throw new Error("Thiếu REACT_APP_FREEIMAGE_KEY trong .env");
    }

    // Convert file to base64
    const base64 = await fileToBase64(file);
    const base64Data = base64.split(",")[1]; // Remove data:image/...;base64, prefix

    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("action", "upload");
    formData.append("source", base64Data);
    formData.append("format", "json");

    console.log("📤 Uploading image (base64) to FreeImage.host...");

    const response = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status_code !== 200) {
      throw new Error(data.error?.message || "Upload failed");
    }

    const imageUrl = data.image.url;
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
