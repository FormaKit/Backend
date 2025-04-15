import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SessionController } from './session.controller';
import { AuthError, NotFoundError, ValidationError } from '../core/ErrorHandler';
import { BaseController } from '../core/BaseController';
import { IUserModel } from '../types/model/user.type';
import { roles } from '../constance';

export class AuthController extends BaseController<IUserModel> {
      private sessionController: SessionController;

      constructor() {
            super(new AuthService());
            this.sessionController = new SessionController();
      }

      protected mapRequestToDto(req: Request): Partial<IUserModel> {
            return {};
      }

      private get authService(): AuthService {
            return this.service as AuthService;
      }

      /**
       * Register user
       */
      async register(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  const { email, password, username, companyId, departmentId } = req.body;

                  if (!email || !password || !username) {
                        throw new ValidationError('Email, password and username are required');
                  }

                  const user = await this.authService.register({
                        email,
                        password,
                        username,
                        role_id: roles.owner,
                        company_id: companyId || null,
                        department_id: departmentId || null,
                  });

                  // Remove sensitive data
                  const { password: _, ...userWithoutPassword } = user;

                  this.sendSuccess(res, userWithoutPassword, 201);
            } catch (err) {
                  next(err);
            }
      }
      /**
       * Handle user login
       */
      async login(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  const { email, password } = req.body;

                  // Authenticate user
                  const user = await this.authService.authenticate(email, password);

                  req.user = {
                    id: user.id,
                    email: user.email,
                    role: String(user.role_id),
                    session_id: ""
                  }

                  // Create session
                  await this.sessionController.createSession(req, res, next, user);
            } catch (error) {
                  next(error);
            }
      }

      /**
       * Handle user logout
       */
      async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  await this.sessionController.endCurrentSession(req, res, next);
            } catch (error) {
                  next(error);
            }
      }

      /**
       * Handle logout from all devices
       */
      async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  await this.sessionController.endAllSessions(req, res, next);
            } catch (error) {
                  next(error);
            }
      }

      /**
       * Handle logout from other devices
       */
      async logoutOthers(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  await this.sessionController.endOtherSessions(req, res, next);
            } catch (error) {
                  next(error);
            }
      }

      /**
       * Get all active sessions
       */
      async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  await this.sessionController.getCurrentUserSessions(req, res, next);
            } catch (error) {
                  next(error);
            }
      }

      /**
       * Get current authenticated user's information
       * Excludes sensitive data like password
       */
      async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  if (!req.user?.id) {
                        throw new AuthError('User not authenticated');
                  }

                  const user = await this.authService.findById(req.user.id);
                  if (!user) {
                        throw new AuthError('User not found');
                  }

                  // Remove sensitive information
                  const { password, ...userWithoutPassword } = user;

                  this.sendSuccess(res, userWithoutPassword);
            } catch (error) {
                  next(error);
            }
      }

      /**
       * Change Password
       */
      async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  const newPassword = req.body.newPassword;
                  if (!newPassword) throw new ValidationError('New password is required');

                  const userId = req.user!.id;
                  const users = await this.authService.findAll({ where: { id: userId } });

                  if (!users || users.length === 0) throw new NotFoundError('User not found');
                  const user = users[0];

                  await this.authService.changePassword(userId, user.password, newPassword);
            } catch (err) {
                  next(err);
            }
      }
}
