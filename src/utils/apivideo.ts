// API.video integration
const API_KEY = 'nessfxT3S7HvLY741BQhKlAto1mhTUWPA49n04Ktxfc';
const BASE_URL = 'https://sandbox.api.video';
const AUTH_ENDPOINT = `${BASE_URL}/auth/api-key`;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

// Authenticate with API.video
const authenticate = async (): Promise<string> => {
  // Check if we have a valid token
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set token expiry to 1 hour from now (tokens typically last longer, but this is safe)
    tokenExpiry = Date.now() + (60 * 60 * 1000);
    
    return accessToken;
  } catch (error) {
    console.error('Error authenticating with API.video:', error);
    throw error;
  }
};

// Upload video to API.video
export const uploadVideo = async (
  videoFile: File,
  onProgress?: (progress: number) => void
): Promise<{ videoId: string; playbackUrl: string; thumbnailUrl: string }> => {
  try {
    // Validate file
    if (!videoFile) {
      throw new Error('No video file provided');
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      throw new Error('Video file size must be less than 100MB');
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
    if (!allowedTypes.includes(videoFile.type)) {
      throw new Error('Unsupported video format. Please use MP4, WebM, OGG, AVI, or MOV');
    }

    // Authenticate
    const token = await authenticate();

    // Create video object first
    const createResponse = await fetch(`${BASE_URL}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Chat Video - ${videoFile.name}`,
        description: 'Video uploaded from Doro Chat',
        public: true,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create video: ${createResponse.status} - ${errorText}`);
    }

    const videoData = await createResponse.json();
    const videoId = videoData.videoId;

    // Upload the video file
    const formData = new FormData();
    formData.append('file', videoFile);

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const uploadResult = JSON.parse(xhr.responseText);
            
            // Get video details to get playback URL
            const detailsResponse = await fetch(`${BASE_URL}/videos/${videoId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (detailsResponse.ok) {
              const details = await detailsResponse.json();
              resolve({
                videoId: videoId,
                playbackUrl: details.assets?.mp4 || details.assets?.hls || `${BASE_URL}/vod/${videoId}/mp4/source.mp4`,
                thumbnailUrl: details.assets?.thumbnail || '',
              });
            } else {
              // Fallback if we can't get details
              resolve({
                videoId: videoId,
                playbackUrl: `${BASE_URL}/vod/${videoId}/mp4/source.mp4`,
                thumbnailUrl: '',
              });
            }
          } catch (error) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} - ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      xhr.open('POST', `${BASE_URL}/videos/${videoId}/source`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.timeout = 300000; // 5 minute timeout
      xhr.send(formData);
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

export default {
  uploadVideo,
};