import { NextFunction, Request, Response } from "express";
import { SupabaseConfig } from "../config/supabase";
import { BaseController } from "../core/BaseController";
import { UserService } from "../services/user.service";
import { ICreateUserDTO } from "../types/model/user.types";

export class UserController extends BaseController<ICreateUserDTO> {
    constructor() {
        super(new UserService(SupabaseConfig.getClient()));
    }

    protected mapRequestToDto(req: Request): ICreateUserDTO {
        return {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role_id: req.body.role,
            company_id: req.body.company_id,
            department_id: req.body.department_id,
        };
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData = this.mapRequestToDto(req);
            const result = await (this.service as UserService).createUser(userData);
            this.sendSuccess(res, result, 201);
        } catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const user = await (this.service as UserService).authenticate(email, password);
            this.sendSuccess(res, { id: user.id, email: user.email, role: user.role_id });
        } catch (err) {
            next(err);
        }
    }
}
