import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../core/BaseController';
import { BaseService } from '../core/BaseService';
import { SessionService } from '../services/session.service';
import { ISessionModel } from '../types/model/session.type';
import { AuthError } from '../core/ErrorHandler';
import { IUserModel } from '../types/model/user.type';
import { sign } from 'jsonwebtoken';

export class SessionController extends BaseController<ISessionModel> {
      protected JWT_SECRET: string;

      constructor() {
            super(new SessionService());
            this.JWT_SECRET = String(process.env.JWT_SECRET);
      }

      protected mapRequestToDto(req: Request): Partial<ISessionModel> {
            return {
                  user_id: req.user?.id ? Number(req.user.id) : undefined,
                  device_name: req.body.device_name || 'Unknown Device',
                  user_agent: req.headers['user-agent'] || 'Unknown',
                  ip_address: req.ip || req.socket.remoteAddress || 'Unknown',
                  location: req.body.location || 'Unknown',
            };
      }

      private get sessionService(): SessionService {
            return this.service as SessionService;
      }

      /**
       * Create a new session when user logs in
       */
      async createSession(
            req: Request,
            res: Response,
            next: NextFunction,
            authenticatedUser: IUserModel
      ): Promise<void> {
            try {
                  const sessionDataDTO = this.mapRequestToDto(req);
                  if (!sessionDataDTO.user_id) {
                        throw new AuthError('User ID is required');
                  }

                  const session_token = sign(
                        JSON.stringify({
                              userId: authenticatedUser.id,
                              email: authenticatedUser.email,
                              role: authenticatedUser.role_id,
                        }),
                        this.JWT_SECRET,
                        { expiresIn: '15Days' }
                  );
                  const expire_at = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
                  const session = await this.sessionService.createSession({
                        ...sessionDataDTO,
                        session_token,
                        expire_at,
                  } as Omit<ISessionModel, 'id' | 'created_at' | 'updated_at'>);

                  req.user = {
                        id: authenticatedUser.id,
                        email: authenticatedUser.email,
                        role: String(authenticatedUser.role_id),
                        session_id: String(session.id),
                  };
                  this.sendSuccess(res, {
                        user: {
                              userId: authenticatedUser.id,
                              email: authenticatedUser.email,
                              role: authenticatedUser.role_id,
                        },
                        session: {
                              id: session.id,
                              expire_at,
                              session_token,
                        },
                  });
            } catch (err) {
                  next(err);
            }
      }

      /**
       * Get all sessions for the current user
       */
      async getCurrentUserSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  const sessions = this.sessionService.getUserSessions(req.user!.id);
                  this.sendSuccess(res, sessions);
            } catch (err) {
                  next(err);
            }
      }

      /**
       * End the current session (logout)
       */
      async endCurrentSession(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  const sessionId = req.body.sessionId;
                  if (!sessionId) {
                        throw new AuthError('Session ID is required');
                  }

                  await this.sessionService.endSession(sessionId);
                  this.sendSuccess(res, null, 204);
            } catch (err) {
                  next(err);
            }
      }

      /**
       * End all other sessions except the current one
       */
      async endOtherSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  const currentSessionId = req.body.currentSessionId;
                  if (!currentSessionId) {
                        throw new AuthError('Current session ID is required');
                  }
                  await this.sessionService.endOtherSessions(req.user!.id, currentSessionId);
                  this.sendSuccess(res, null, 204);
            } catch (err) {
                  next(err);
            }
      }

      /**
       * End all sessions for the current user
       */
      async endAllSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  await this.sessionService.endAllSessions(req.user!.id);
                  this.sendSuccess(res, null, 204);
            } catch (err) {
                  next(err);
            }
      }
}
