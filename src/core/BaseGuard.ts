import { NextFunction, Request, Response } from 'express';
import { AppError } from './ErrorHandler';

/**
 * Abstract base class for implementing route guards in an Express application.
 * Guards are used to protect routes by implementing custom authorization logic.
 */
export abstract class BaseGuard {
      /**
       * Abstract method to be implemented by concrete guard classes.
       * Contains the core logic to determine if a request should be allowed.
       *
       * @param req - Express request object
       * @returns Promise<boolean | AppError> - Returns true if authorized, or an AppError if not
       */
      protected abstract check(req: Request): Promise<boolean | AppError>;

      /**
       * Express middleware function that uses the guard's check method to authorize requests.
       * This method is used in route definitions to protect routes.
       *
       * @param req - Express request object
       * @param res - Express response object
       * @param next - Express next function
       */
      public async canActivate(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  // Call the check method implemented by child classes
                  const result = await this.check(req);

                  if (result === true) {
                        // Request is authorized, proceed to next middleware/controller
                        next();
                  } else if (result instanceof AppError) {
                        // Specific error occurred during authorization
                        next(result);
                  } else {
                        // Unexpected result, throw generic unauthorized error
                        next(new AppError('Unauthorized', 401));
                  }
            } catch (error) {
                  // Handle any unexpected errors
                  if (error instanceof AppError) {
                        next(error);
                  } else {
                        next(new AppError('Guard check failed', 500));
                  }
            }
      }
}
