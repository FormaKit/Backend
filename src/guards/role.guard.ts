import { Request } from "express";
import { BaseGuard } from "../core/BaseGuard";
import { AppError, AuthError, PermissionError } from "../core/ErrorHandler";

export class RoleGuard extends BaseGuard {
    constructor(private allowedRoles: number[]) {
        super();
    }

    protected check(req: Request): boolean | AppError {
        const user = req.user;

        if (!user) {
            throw new AuthError();
        }

        if (!this.allowedRoles.includes(+user.role)) {
            throw new PermissionError();
        }

        return true;
    }
}
