import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

export class SupabaseConfig {
      private static instance: SupabaseClient;
      private constructor() {}

      public static getClient(): SupabaseClient {
            if (!this.instance) {
                  config();

                  const supabseURL = String(process.env.SUPABASE_URL);
                  const supabseKEY = String(process.env.SUPABASE_ANON_KEY);

                  if (!supabseKEY || !supabseURL) {
                        throw new Error('Supabse key and url must be provided');
                  }

                  this.instance = createClient(supabseURL, supabseKEY);
            }

            return this.instance;
      }
}
