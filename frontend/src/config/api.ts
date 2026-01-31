// API Configuration for HireByte
// In development: uses localhost
// In production: uses Render backend URL

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  uploadResume: `${API_BASE_URL}/upload-resume`,
  transcribe: `${API_BASE_URL}/transcribe`,
  stream: `${API_BASE_URL}/api/stream`,
  stopCamera: `${API_BASE_URL}/api/stop-camera`,
  analytics: `${API_BASE_URL}/api/analytics`,
  analyticsTimeline: `${API_BASE_URL}/api/analytics/timeline`,
  analyticsFeedback: `${API_BASE_URL}/api/analytics/feedback`,
  health: `${API_BASE_URL}/health`,
};

export const WS_ENDPOINTS = {
  interview: API_BASE_URL.replace('http', 'ws') + '/ws/interview',
  metrics: API_BASE_URL.replace('http', 'ws') + '/ws/metrics',
};

export default API_BASE_URL;
