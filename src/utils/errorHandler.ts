import { logger } from './logger.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handler for API errors
 */
export function handleApiError(error: unknown): Error {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    logger.error('API error:', error);
    return new ApiError(error.message);
  }

  logger.error('Unknown API error:', error);
  return new ApiError('An unknown error occurred');
}
