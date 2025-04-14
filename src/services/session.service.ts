import { SupabaseConfig } from "../config/supabase";
import { tableNames } from "../constance";
import { BaseService } from "../core/BaseService";
import { ISessionModel } from "../types/model/session.type";

export class SessionService extends BaseService<ISessionModel> {
  constructor() {
    super(SupabaseConfig.getClient(), tableNames.session);
  }

  public test() {}
}