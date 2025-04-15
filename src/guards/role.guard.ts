import { Request } from 'express';
import { BaseGuard } from '../core/BaseGuard';
import { AppError, AuthError, PermissionError } from '../core/ErrorHandler';

/**
 * Guard that restricts access based on user roles
 * @extends BaseGuard
 */
export class RoleGuard extends BaseGuard {
      /**
       * Creates a RoleGuard instance
       * @param {number[]} allowedRoles Array of role IDs that are permitted
       */
      constructor(private readonly allowedRoles: number[]) {
            super();
      }

      /**
       * Checks if the requesting user has an allowed role
       * @param {Request} req Express request object
       * @returns {boolean | AppError}
       * @throws {AuthError} If user is not authenticated
       * @throws {PermissionError} If user lacks required role
       */
      protected check(req: Request): boolean | AppError {
            const user = req.user;

            if (!user) {
                  throw new AuthError('Authentication required');
            }

            if (!user.role) {
                  throw new AuthError('User role missing');
            }

            const userRole = Number(user.role);

            if (isNaN(userRole)) {
                  throw new AuthError('Invalid role format');
            }

            if (!this.allowedRoles.includes(userRole)) {
                  throw new PermissionError(
                        `Requires one of these roles: ${this.allowedRoles.join(', ')}`
                  );
            }

            return true;
      }
}
