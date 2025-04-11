import { NextFunction, Request, Response } from "express";

/**
 * Custom error class that extends the built-in Error class.
 * It is used to represent application-specific errors.
 *
 * @class AppError
 * @extends {Error}
 */
export class AppError extends Error {
    constructor(public message: string, public statusCode: number, public details?: any) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }

    /**
     * Serializes the error object for consistent response formatting.
     *
     * @returns {{ message: string; statusCode: number; details?: any }} The serialized error object.
     */
    serialize(): { message: string; statusCode: number; details?: any } {
        const { message, statusCode, details } = this;
        return {
            message,
            statusCode,
            details,
        };
    }
}

/**
 * Error class for resource not found errors (404).
 *
 * @class NotFoundError
 * @extends {AppError}
 */
export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, 404);
    }
}

/**
 * Error class for validation failure errors (400).
 *
 * @class ValidationError
 * @extends {AppError}
 * @param {string} [message="Validation failed"] The error message.
 * @param {any} [details] The additional details for the error.
 */
export class ValidationError extends AppError {
    constructor(message: string = "Validation failed", details?: any) {
        super(message, 400, details);
    }
}

/**
 * Error class for authentication failure errors (401).
 *
 * @class AuthError
 * @extends {AppError}
 * @param {string} [message="Authentication failed"] The error message.
 */
export class AuthError extends AppError {
    constructor(message: string = "Authentication faild") {
        super(message, 401);
    }
}

/**
 * Error class for permission denied errors (403).
 *
 * @class PermissionError
 * @extends {AppError}
 * @param {string} [message="Permission denied"] The error message.
 */
export class PermissionError extends AppError {
    constructor(message: string = "Permission denied") {
        super(message, 403);
    }
}

/**
 * Express error handling middleware. It checks if the error is an instance of `AppError`
 * and serializes it, or returns a generic internal server error.
 *
 * @param {Error} err The error object.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The next middleware function.
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        const serialized = err.serialize();
        res.status(serialized.statusCode).json(serialized);
    } else {
        console.error("Unexpected Error:", err);
        res.status(500).json({
            message: err.message || "Internal server error",
            statusCode: 500,
        });
    }
}
