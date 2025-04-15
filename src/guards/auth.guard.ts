import { Request } from 'express';
import { BaseGuard } from '../core/BaseGuard';
import { AppError, AuthError } from '../core/ErrorHandler';
import { SessionService } from '../services/session.service';
import { verify } from 'jsonwebtoken';
import { ISessionModel } from '../types/model/session.type';

interface TokenPayload {
      userId: number;
      email: string;
      role: string;
      sessionId: number;
}

export class AuthGuard extends BaseGuard {
      private sessionService: SessionService;
      private readonly JWT_SECRET: string;

      constructor() {
            super();
            this.sessionService = new SessionService();
            this.JWT_SECRET = String(process.env.JWT_SECRET);
      }

      /**
       * Checks if the request is authenticated
       */
      protected async check(req: Request): Promise<boolean | AppError> {
            try {
                  // 1. Extract and validate Authorization header
                  const token = await this.extractAndValidateToken(req);

                  // 2. Verify JWT token and get payload
                  const payload = await this.verifyToken(token);

                  // 3. Validate session is active and not expired
                  const session = await this.validateSession(
                        payload.userId,
                        payload.sessionId,
                        token
                  );

                  // 4. Set user data in request for controllers to use
                  req.user = {
                        id: payload.userId,
                        email: payload.email,
                        role: payload.role,
                        session_id: String(session.id),
                  };

                  return true;
            } catch (error) {
                  if (error instanceof AppError) {
                        return error;
                  }
                  return new AuthError('Authentication failed');
            }
      }

      /**
       * Extracts and validates the token from Authorization header
       */
      private extractAndValidateToken(req: Request): string {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                  throw new AuthError('No authorization header provided');
            }

            const [bearer, token] = authHeader.split(' ');
            if (bearer !== 'Bearer' || !token) {
                  throw new AuthError('Invalid authorization format');
            }

            return token;
      }

      /**
       * Verifies the JWT token
       */
      private verifyToken(token: string): TokenPayload {
            try {
                  const decoded = verify(token, this.JWT_SECRET) as TokenPayload;

                  if (!decoded.userId || !decoded.sessionId) {
                        throw new AuthError('Invalid token payload');
                  }

                  return decoded;
            } catch (error) {
                  if (error instanceof AuthError) {
                        throw error;
                  }
                  throw new AuthError('Invalid or expired token');
            }
      }

      /**
       * Validates that the session exists, is active, and not expired
       * Also verifies the session token matches
       */
      private async validateSession(
            userId: number,
            sessionId: number,
            providedToken: string
      ): Promise<ISessionModel> {
            const sessions = await this.sessionService.getUserSessions(userId);
            const session = sessions.find((s) => s.id === sessionId);

            if (!session) {
                  throw new AuthError('Session not found');
            }

            // Check if session is current
            if (!session.is_current) {
                  throw new AuthError('Session is no longer active');
            }

            // Verify session token matches
            if (session.session_token !== providedToken) {
                  throw new AuthError('Invalid session token');
            }

            // Check if session has expired
            const expireAt = new Date(session.expire_at);
            if (expireAt < new Date()) {
                  // Optionally, you might want to deactivate the expired session here
                  await this.sessionService.endSession(sessionId);
                  throw new AuthError('Session has expired');
            }

            // Update last active time
            await this.sessionService.updateLastActive(sessionId);

            return session;
      }
}
