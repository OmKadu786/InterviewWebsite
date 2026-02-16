// API Configuration for HireByte
// Automatically detects the correct backend URL based on how the frontend is accessed

// Get the current hostname (works for both localhost and network IP)
// Hardcoded to localhost for debugging
const API_BASE_URL = 'http://localhost:9000';

console.log('HireByte API Config (Hardcoded):', {
  apiUrl: API_BASE_URL,
  originalEnvVar: import.meta.env.VITE_API_URL
});

export const API_ENDPOINTS = {
  uploadResume: `${API_BASE_URL}/upload-resume`,
  transcribe: `${API_BASE_URL}/transcribe`,
  getHint: `${API_BASE_URL}/get-hint`,
  stream: `${API_BASE_URL}/api/stream`,
  stopCamera: `${API_BASE_URL}/api/stop-camera`,
  analytics: `${API_BASE_URL}/api/analytics`,
  analyticsTimeline: `${API_BASE_URL}/api/analytics/timeline`,
  analyticsFeedback: `${API_BASE_URL}/api/analytics/feedback`,
  interviews: `${API_BASE_URL}/api/interviews`,
  health: `${API_BASE_URL}/health`,
};

// WebSocket endpoints - replace http with ws
const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');

export const WS_ENDPOINTS = {
  interview: `${WS_BASE_URL}/ws/interview`,
  video: `${WS_BASE_URL}/ws/video`,
};

export default API_BASE_URL;
