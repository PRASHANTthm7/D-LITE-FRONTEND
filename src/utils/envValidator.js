// Validate required environment variables
const requiredEnvVars = [
  'VITE_AUTH_SERVICE_URL',
  'VITE_CHAT_SERVICE_URL',
  'VITE_SOCKET_GATEWAY_URL',
  'VITE_IDENTITY_SERVICE_URL',
  'VITE_QUANTUM_ROOM_ENGINE_URL',
  'VITE_AI_ENGINE_URL',
  'VITE_PRESENCE_ENGINE_URL'
];

export const validateEnvironment = () => {
  const missing = [];

  requiredEnvVars.forEach(envVar => {
    if (!import.meta.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.warn('Using fallback localhost URLs for development');
  }

  return {
    isValid: missing.length === 0,
    missing,
    env: {
      AUTH_SERVICE_URL: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
      CHAT_SERVICE_URL: import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:8001',
      SOCKET_GATEWAY_URL: import.meta.env.VITE_SOCKET_GATEWAY_URL || 'http://localhost:3002',
      IDENTITY_SERVICE_URL: import.meta.env.VITE_IDENTITY_SERVICE_URL || 'http://localhost:3003',
      QUANTUM_ROOM_ENGINE_URL: import.meta.env.VITE_QUANTUM_ROOM_ENGINE_URL || 'http://localhost:3004',
      AI_ENGINE_URL: import.meta.env.VITE_AI_ENGINE_URL || 'http://localhost:8002',
      PRESENCE_ENGINE_URL: import.meta.env.VITE_PRESENCE_ENGINE_URL || 'http://localhost:8003'
    }
  };
};
