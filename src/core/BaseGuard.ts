import { NextFunction, Request, Response } from "express";
import { AppError } from "./ErrorHandler";

/**
 * Abstract base class for implementing route guards in an Express application.
 * Guards are used to protect routes by implementing custom authorization logic.
 */
export abstract class BaseGuard {
    /**
     * Abstract method to be implemented by concrete guard classes.
     * Contains the core logic to determine if a request should be allowed.
     * @param {Request} req Express request object
     * @returns {boolean | AppError} Returns true if authorized, false or AppError if not
     */
    protected abstract check(req: Request): boolean | AppError;

    /**
     * Express middleware function that uses the guard's check method to authorize requests.
     * Automatically handles successful and failed authorization scenarios.
     * @param {Request} req Express request object
     * @param {Response} res Express response object
     * @param {NextFunction} next Express next function
     */
    public canActivate(req: Request, res: Response, next: NextFunction): void {
        const result = this.check(req);

        if (result === true) {
            next();
        } else if (result instanceof AppError) {
            next(result); // Pass to error handler
        } else {
            next(new AppError("Unauthorized", 401));
        }
    }
}