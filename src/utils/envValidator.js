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

  // Normalize URLs - remove extra spaces, commas, URL encoding, and trailing slashes
  const normalizeUrl = (url, defaultUrl) => {
    if (!url) return defaultUrl;
    
    // First, try to decode URL encoding (e.g., %20 -> space)
    let normalized;
    try {
      normalized = decodeURIComponent(url);
    } catch (e) {
      // If decode fails, use original
      normalized = url;
    }
    
    // Remove all commas, spaces, and other whitespace characters
    normalized = normalized.trim().replace(/[,\s%]+/g, '').replace(/\/+$/, '');
    
    // Remove any remaining URL-encoded characters
    normalized = normalized.replace(/%[0-9A-Fa-f]{2}/g, '');
    
    // Extract just the domain part (remove any path that might have been incorrectly included)
    // Match: protocol://domain:port or protocol://domain
    const urlMatch = normalized.match(/^(https?:\/\/)?([^\/\s,]+)/);
    if (urlMatch) {
      const protocol = urlMatch[1] || '';
      const domain = urlMatch[2];
      normalized = protocol + domain;
    }
    
    // If no protocol, determine based on domain or environment
    if (!normalized.match(/^https?:\/\//)) {
      const isProduction = normalized.includes('railway.app') ||
                          normalized.includes('netlify.app') ||
                          normalized.includes('vercel.app') ||
                          normalized.includes('render.com') ||
                          import.meta.env.PROD;
      normalized = `${isProduction ? 'https://' : 'http://'}${normalized}`;
    }
    
    return normalized || defaultUrl;
  };

  const getSocketGatewayUrl = () => {
    const rawUrl = import.meta.env.VITE_SOCKET_GATEWAY_URL || 'http://localhost:3002';
    return normalizeUrl(rawUrl, 'http://localhost:3002');
  };

  return {
    isValid: missing.length === 0,
    missing,
    env: {
      AUTH_SERVICE_URL: (import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001').trim().replace(/\/+$/, ''),
      CHAT_SERVICE_URL: (import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:8001').trim().replace(/\/+$/, ''),
      SOCKET_GATEWAY_URL: getSocketGatewayUrl()
    }
  };
};
