import { AppError } from './ErrorHandler';

/**
 * A standardized response format for API responses
 * @template T Type of the data payload
 */
export class ApiResponse<T> {
      /**
       * Creates a new ApiResponse instance
       * @param {boolean} success Indicates if the request was successful
       * @param {T} [data] The response data payload
       * @param {Object} [error] Error information
       * @param {string} error.message Human-readable error message
       * @param {string} [error.code] Machine-readable error code
       * @param {any} [error.details] Additional error details
       * @param {Object} [meta] Metadata about the response
       * @param {number} [meta.page] Current page number (for paginated responses)
       * @param {number} [meta.limit] Items per page (for paginated responses)
       * @param {number} [meta.total] Total items available (for paginated responses)
       * @param {any} [meta.*] Additional metadata properties
       */
      constructor(
            public success: boolean,
            public data?: T,
            public error?: {
                  message: string;
                  code?: string;
                  details?: any;
            },
            public meta?: {
                  page?: number;
                  limit?: number;
                  total?: number;
                  [key: string]: any;
            }
      ) {}

      /**
       * Creates a successful API response
       * @template T Type of the data payload
       * @param {T} data The response data
       * @param {Object} [meta] Optional metadata
       * @returns {ApiResponse<T>} A successful ApiResponse instance
       */
      static success<T>(data: T, meta?: any): ApiResponse<T> {
            return new ApiResponse(true, data, undefined, meta);
      }

      /**
       * Creates an error API response
       * @param {string} message Human-readable error message
       * @param {string} [code] Machine-readable error code
       * @param {any} [details] Additional error details
       * @returns {ApiResponse<any>} An error ApiResponse instance
       */
      static error(message: string, code?: string, details?: any): ApiResponse<any> {
            return new ApiResponse(false, undefined, { message, code, details });
      }

      /**
       * Creates an API response from an Error object
       * @param {Error} error The error object
       * @returns {ApiResponse<any>} An error ApiResponse instance
       */
      static fromError(error: Error): ApiResponse<any> {
            if (error instanceof AppError) {
                  return new ApiResponse(false, undefined, {
                        message: error.message,
                        code: error.constructor.name,
                        details: error.details,
                  });
            }
            return ApiResponse.error(error.message || 'Internal server error');
      }

      /**
       * Converts the ApiResponse to a plain JavaScript object
       * @returns {Object} The response as a plain object with timestamp
       */
      toJSON() {
            return {
                  success: this.success,
                  data: this.data,
                  error: this.error,
                  meta: this.meta,
                  timestamp: new Date().toISOString(),
            };
      }
}
