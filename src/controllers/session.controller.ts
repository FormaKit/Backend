import { Request } from "express";
import { SupabaseConfig } from "../config/supabase";
import { BaseController } from "../core/BaseController";
import { SessionService } from "../services/session.service";
import { ISessionModel } from "../types/model/session.type";
import { hash } from "crypto";

export class SessionController extends BaseController<ISessionModel> {
  protected salt: string;

  constructor() {
    super(new SessionService());
    this.salt = String(process.env.SALT);
  }

  protected mapRequestToDto(req: Request): Partial<ISessionModel> {
    return {};
  }

  private get sessionService(): SessionService {
    return this.service as SessionService;
  }

  public upsertSession(payload: string) {
    const sessionToken = hash(payload, this.salt);
  }
}
