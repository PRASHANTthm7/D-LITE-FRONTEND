import axios from 'axios';
import logger from './logger';

// Global API error handler
export const handleApiError = (error, context = 'API Call') => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || 'An error occurred';

    logger.error(`${context}: Server Error ${status}`, {
      status,
      message,
      data: error.response.data
    });

    return {
      status,
      message,
      isClientError: status >= 400 && status < 500,
      isServerError: status >= 500
    };
  } else if (error.request) {
    // Request made but no response
    logger.error(`${context}: No Response`, {
      message: 'Server did not respond',
      URL: error.request.URL || error.config?.url
    });

    return {
      status: null,
      message: 'Server did not respond. Check your connection.',
      isClientError: false,
      isServerError: true
    };
  } else {
    // Client-side error
    logger.error(`${context}: Client Error`, {
      message: error.message
    });

    return {
      status: null,
      message: error.message || 'An unexpected error occurred',
      isClientError: true,
      isServerError: false
    };
  }
};

// Retry logic for failed requests
export const retryWithBackoff = async (fn, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        logger.debug(`Retry attempt ${attempt}/${maxRetries}, waiting ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export default { handleApiError, retryWithBackoff };
