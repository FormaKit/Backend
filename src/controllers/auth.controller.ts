import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SessionController } from './session.controller';
import { AuthError } from '../core/ErrorHandler';

export class AuthController {
      private sessionController: SessionController;
      private authService: AuthService;

      constructor() {
            this.sessionController = new SessionController();
            this.authService = new AuthService();
      }

      /**
       * Handle user login
       */
      async login(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  const { email, password } = req.body;

                  // Authenticate user
                  const user = await this.authService.authenticate(email, password);

                  // Create session
                  await this.sessionController.createSession(req, res, next);
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
}
