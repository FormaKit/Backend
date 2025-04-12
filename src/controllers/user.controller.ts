import { NextFunction, Request, Response } from "express";
import { SupabaseConfig } from "../config/supabase";
import { BaseController } from "../core/BaseController";
import { UserService } from "../services/user.service";
import { ICreateUserDTO, IUser } from "../types/model/user.types";
import { IFilter } from "../types/filter.types";

export class UserController extends BaseController<ICreateUserDTO> {
    constructor() {
        super(new UserService(SupabaseConfig.getClient()));
    }

    protected mapRequestToDto(req: Request): Partial<IUser> {
        // For POST/PUT requests (body)
        if (req.method === "POST" || req.method === "PUT") {
            return {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                role_id: req.body.role,
                company_id: req.body.company_id,
                department_id: req.body.department_id,
            };
        }

        // For GET requests (query params)
        const filter: Partial<IUser> = {};

        if (req.query.username) filter.username = req.query.username as string;
        if (req.query.email) filter.email = req.query.email as string;
        if (req.query.role_id) filter.role_id = Number(req.query.role_id);
        if (req.query.company_id) filter.company_id = req.query.company_id as string;
        if (req.query.department_id) filter.department_id = req.query.department_id as string;

        return filter;
    }

    public register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userData = this.mapRequestToDto(req);
            const result = await (this.service as UserService).createUser(
                userData as ICreateUserDTO
            );
            this.sendSuccess(res, result, 201);
        } catch (err) {
            next(err);
        }
    };

    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;
            const user = await (this.service as UserService).authenticate(email, password);
            this.sendSuccess(res, { id: user.id, email: user.email, role: user.role_id });
        } catch (err) {
            next(err);
        }
    };

    public getUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await this.getAll(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}
