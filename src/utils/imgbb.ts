// ImgBB API integration
const IMGBB_API_KEY = '80e36fc64660321209fefca92146c6f0';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadImage = async (imageFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', imageFile);
    
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`ImgBB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export default {
  uploadImage,
};