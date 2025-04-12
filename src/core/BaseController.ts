import { Request, Response, NextFunction } from "express";
import { BaseService } from "./BaseService";
import { ApiResponse } from "./ApiResponse";
import { AppError } from "./ErrorHandler";

/**
 * Base controller class that provides common CRUD operations and response handling.
 * This class should be extended by specific controllers to implement domain-specific logic.
 *
 * @template T - The type of the data transfer object (DTO) used for request mapping
 */
export abstract class BaseController<T extends Record<string, any>> {
    /**
     * Creates a new instance of BaseController
     * @param {BaseService<T>} service - The service instance to handle business logic
     */
    constructor(protected service: BaseService<T>) {}

    /**
     * Maps HTTP request data to a DTO (Data Transfer Object).
     * This method must be implemented by child classes to specify how request data should be mapped.
     *
     * @param {Request} req - The Express request object
     * @returns {Partial<T>} The mapped DTO object
     */
    protected abstract mapRequestToDto(req: Request): Partial<T>;

    /**
     * Sends a successful HTTP response with the provided data.
     *
     * @param {Response} res - The Express response object
     * @param {any} data - The data to send in the response
     * @param {number} [statusCode=200] - The HTTP status code
     * @param {Record<string, any>} [meta] - Additional metadata to include in the response
     */
    protected sendSuccess(
        res: Response,
        data: any,
        statusCode: number = 200,
        meta?: Record<string, any>
    ): void {
        const response = ApiResponse.success(data, meta).toJSON();
        res.status(statusCode).json(response);
    }

    /**
     * Retrieves all records with optional filtering.
     *
     * @param {Request} req - The Express request object
     * @param {Response} res - The Express response object
     * @param {NextFunction} next - The Express next function
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await this.service.findAll();
            this.sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves a single record by its ID.
     *
     * @param {Request} req - The Express request object
     * @param {Response} res - The Express response object
     * @param {NextFunction} next - The Express next function
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await this.service.findById(req.params.id);
            if (!data) {
                throw new AppError(`Record with id of ${req.params.id} not found`, 404);
            }
            this.sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Creates a new record.
     *
     * @param {Request} req - The Express request object
     * @param {Response} res - The Express response object
     * @param {NextFunction} next - The Express next function
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = this.mapRequestToDto(req);
            const data = await this.service.create(
                dto as Omit<T, "id" | "created_at" | "updated_at">
            );
            this.sendSuccess(res, data, 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Updates an existing record.
     *
     * @param {Request} req - The Express request object
     * @param {Response} res - The Express response object
     * @param {NextFunction} next - The Express next function
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = this.mapRequestToDto(req);
            const data = await this.service.update(req.params.id, dto);
            this.sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Checks if a record exists based on the provided filter.
     *
     * @param {Request} req - The Express request object
     * @param {Response} res - The Express response object
     * @param {NextFunction} next - The Express next function
     */
    async exists(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filter = this.mapRequestToDto(req);
            const exists = await this.service.exists(filter);
            this.sendSuccess(res, { exists });
        } catch (error) {
            next(error);
        }
    }
}
