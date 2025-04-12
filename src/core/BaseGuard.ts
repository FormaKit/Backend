import { NextFunction, Request, Response } from "express";
import { AppError } from "./ErrorHandler";

export abstract class BaseGuard {
    protected abstract check(req: Request): boolean | AppError;

    public canActivate(req: Request, res: Response, next: NextFunction) {
        if (this.check(req)) {
            next();
        }
    }
}
