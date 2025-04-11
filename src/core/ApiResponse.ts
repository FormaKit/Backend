import { AppError } from "./ErrorHandler";

export class ApiResponse<T> {
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

    static success<T>(data: T, meta?: any): ApiResponse<T> {
        return new ApiResponse(true, data, undefined, meta);
    }

    static error(message: string, code?: string, details?: any): ApiResponse<any> {
        return new ApiResponse(false, undefined, { message, code, details });
    }

    static fromError(error: Error): ApiResponse<any> {
        if (error instanceof AppError) {
            return new ApiResponse(false, undefined, {
                message: error.message,
                code: error.constructor.name,
                details: error.details,
            });
        }
        return ApiResponse.error(error.message || "Internal server error");
    }

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
