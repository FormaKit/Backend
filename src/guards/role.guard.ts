import { Request } from 'express';
import { BaseGuard } from '../core/BaseGuard';
import { AppError, AuthError, PermissionError } from '../core/ErrorHandler';
import { roles } from '../constance';

interface UserWithRole {
      id: number;
      email: string;
      role: string;
      session_id: string;
}

/**
 * Guard that restricts access based on user roles
 * @extends BaseGuard
 */
export class RoleGuard extends BaseGuard {
      /**
       * Creates a RoleGuard instance
       * @param allowedRoles Array of role IDs that are permitted
       */
      constructor(private readonly allowedRoles: string[]) {
            super();
      }

      /**
       * Checks if the requesting user has an allowed role
       * @param req Express request object
       * @returns Promise<boolean | AppError>
       */
      protected async check(req: Request): Promise<boolean | AppError> {
            const user = req.user as UserWithRole;

            if (!user) {
                  throw new AuthError('Authentication required');
            }

            if (!user.role) {
                  throw new AuthError('User role missing');
            }

            // Check if user's role is in the allowed roles list
            if (!this.allowedRoles.includes(user.role)) {
                  const roleNames = this.allowedRoles.map((roleId) => {
                        const role = Object.entries(roles).find(([_, id]) => id === roleId);
                        return role ? role[0] : roleId;
                  });

                  throw new PermissionError(
                        `Access denied. Requires one of these roles: ${roleNames.join(', ')}`
                  );
            }

            return true;
      }

      /**
       * Static factory method to create a guard for specific roles
       * @param roleIds Array of role IDs
       * @returns RoleGuard instance
       */
      static forRoles(...roleIds: string[]): RoleGuard {
            return new RoleGuard(roleIds);
      }

      /**
       * Static factory method to create a guard for admin roles (owner and manager)
       * @returns RoleGuard instance
       */
      static forAdmins(): RoleGuard {
            return new RoleGuard([roles.owner, roles.manager]);
      }

      /**
       * Static factory method to create a guard for owner role only
       * @returns RoleGuard instance
       */
      static forOwners(): RoleGuard {
            return new RoleGuard([roles.owner]);
      }
}
