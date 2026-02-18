// Validate required environment variables
const requiredEnvVars = [
  'VITE_AUTH_SERVICE_URL',
  'VITE_CHAT_SERVICE_URL',
  'VITE_SOCKET_GATEWAY_URL'
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
      SOCKET_GATEWAY_URL: import.meta.env.VITE_SOCKET_GATEWAY_URL || 'http://localhost:3002'
    }
  };
};
