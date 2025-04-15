export interface ISessionModel {
      id: number;
      user_id: number;
      session_token: string;    // Store the JWT token
      expire_at: Date | string; // Session expiration timestamp
      device_name: string;
      user_agent: string;
      ip_address: string;
      location: string;
      is_current: boolean;
      created_at: Date | string;
      last_active_at: Date | string;
}
