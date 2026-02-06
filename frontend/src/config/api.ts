// API Configuration for HireByte
// Automatically detects the correct backend URL based on how the frontend is accessed

// Get the current hostname (works for both localhost and network IP)
const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

// Determine the API base URL
// - If VITE_API_URL is set (production), use that
// - Otherwise, use the same hostname as the frontend but on port 8000
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${currentHost}:8000`;

console.log('HireByte API Config:', {
  currentHost,
  apiUrl: API_BASE_URL,
  isProduction: import.meta.env.PROD,
  hasEnvVar: !!import.meta.env.VITE_API_URL
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
  health: `${API_BASE_URL}/health`,
};

// WebSocket endpoints - replace http with ws
const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');

export const WS_ENDPOINTS = {
  interview: `${WS_BASE_URL}/ws/interview`,
  metrics: `${WS_BASE_URL}/ws/metrics`,
};

export default API_BASE_URL;
