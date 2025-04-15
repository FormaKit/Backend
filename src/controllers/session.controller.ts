import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../core/BaseController';
import { BaseService } from '../core/BaseService';
import { SessionService } from '../services/session.service';
import { ISessionModel } from '../types/model/session.type';
import { AuthError } from '../core/ErrorHandler';

export class SessionController extends BaseController<ISessionModel> {
      constructor() {
            super(new SessionService());
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
      async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                  const sessionDataDTO = this.mapRequestToDto(req);
                  if (!sessionDataDTO.user_id) {
                        throw new AuthError('User ID is required');
                  }

                  const session = await this.sessionService.createSession(
                        sessionDataDTO as Omit<ISessionModel, 'id' | 'created_at' | 'updated_at'>
                  );
                  this.sendSuccess(res, session, 201);
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
