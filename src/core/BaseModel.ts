import { SupabaseClient } from "@supabase/supabase-js";

export abstract class BaseModel<T> {
      constructor(protected supabase: SupabaseClient, protected tableName: string) {}

      protected validateRecord(record: Omit<T, "id" | "created_at" | "updated_at">): void {
            if(!record) {
                  throw new Error("Record cannot be null or undefined");
            }
      }
}