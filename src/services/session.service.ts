import { promises } from 'dns';
import { SupabaseConfig } from '../config/supabase';
import { tableNames } from '../constance';
import { BaseService } from '../core/BaseService';
import { ISessionModel } from '../types/model/session.type';

export class SessionService extends BaseService<ISessionModel> {
      constructor() {
            super(SupabaseConfig.getClient(), tableNames.session);
      }

      /**
       * Create a new session for a user
       * @param sessionData --  Omit<ISessionModel, 'id' | 'created_at' | "last_active_at"
       */
      async createSession(
            sessionData: Omit<ISessionModel, 'id' | 'created_at' | 'last_active_at'>
      ): Promise<ISessionModel> {
            // Only one device can authenticate
            await this.supabase
                  .from(this.tableName)
                  .update({ is_current: false })
                  .eq('user_id', sessionData.user_id);

            // Create new session
            return await this.create({
                  ...sessionData,
                  is_current: true,
                  last_active_at: new Date().toISOString(),
            });
      }

      /**
       * Get all active sessions for a user
       * @param userId --  number
       */
      async getUserSessions(userId: number): Promise<ISessionModel[]> {
            return this.findAll({
                  where: { user_id: userId },
                  orderBy: { last_active_at: 'desc' },
            });
      }

      /**
       * Update last active time for a session
       * @param sessionId -- number
       */
      async updateLastActive(sessionId: number): Promise<void> {
            await this.update(sessionId, { last_active_at: new Date().toISOString() });
      }

      /**
       * End a specific session
       * @param sessionId -- number
       */
      async endSession(sessionId: number): Promise<void> {
            await this.delete(sessionId);
      }

      /**
       * End all sessions for a user except the current one\
       * @param userId -- number
       * @param currentSessionId -- number
       */
      async endOtherSessions(userId: number, currentSessionId: number): Promise<void> {
            await this.supabase
                  .from(this.tableName)
                  .delete()
                  .eq('user_id', userId)
                  .neq('id', currentSessionId);
      }

      /**
       * End all sessions for a user
       * @param userId -- number
       */
      async endAllSessions(userId: number): Promise<void> {
            await this.deleteMany({user_id: userId});
      }
}
