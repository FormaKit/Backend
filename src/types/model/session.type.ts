export interface ISessionModel {
  id: number;
  user_id: number;
  device_name: string;
  user_agent: string;
  ip_address: string;
  location: string;
  is_current: boolean;
  created_at: Date | string;
  last_active_at: Date | string;
}
