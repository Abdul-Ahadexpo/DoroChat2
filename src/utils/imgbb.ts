// ImgBB API integration
const IMGBB_API_KEY = '2a78816b4b5cc1c4c3b18f8f258eda60';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadImage = async (imageFile: File): Promise<string> => {
  try {
    // Add timeout to prevent hanging uploads
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', imageFile);
    
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ImgBB API error response:', errorText);
      throw new Error(`ImgBB API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      console.error('ImgBB API error data:', data);
      throw new Error(`Image upload failed: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Image upload timed out. Please try again.');
    }
    console.error('Error uploading image:', error);
    throw error;
  }
};

export default {
  uploadImage,
};