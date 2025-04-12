import { Request } from "express";
import { BaseGuard } from "../core/BaseGuard";
import { AppError } from "../core/ErrorHandler";

export class AuthGuard extends BaseGuard {
    protected check(req: Request): boolean | AppError {
        const authHeader = req.headers.authorization;

        console.log("authHeader", authHeader);
        return true;
    }
}
