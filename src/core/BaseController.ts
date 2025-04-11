import { Request, Response, NextFunction } from "express";
import { BaseService } from "./BaseService";
import { ApiResponse } from "./ApiResponse";
import { AppError } from "./ErrorHandler";

export abstract class BaseController<T extends Record<string, any>> {
    constructor(protected service: BaseService<T>) {}

    //  Maps HTTP request to DTO (Data Transfer Object)
    protected abstract mapRequestToDto(req: Request): Partial<T>;

    protected sendSuccess(
        res: Response,
        data: any,
        statusCode: number = 200,
        meta?: Record<string, any>
    ): void {
        const response = ApiResponse.success(data, meta).toJSON();
        res.status(statusCode).json(response);
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filter = this.mapRequestToDto(req);
            const data = await this.service.findAll(filter);
            this.sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    }

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

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = this.mapRequestToDto(req);
            const data = await this.service.create(dto as Omit<T, "id" | "created_at" | "updated_at">);
            this.sendSuccess(res, data, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = this.mapRequestToDto(req);
            const data = await this.service.update(req.params.id, dto);
            this.sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.service.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

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
