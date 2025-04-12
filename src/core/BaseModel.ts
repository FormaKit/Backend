import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Abstract base class for data models interacting with Supabase.
 * Provides common functionality for database operations.
 * @template T Type of the record this model handles
 */
export abstract class BaseModel<T> {
    /**
     * Creates a new BaseModel instance
     * @param {SupabaseClient} supabase Supabase client instance
     * @param {string} tableName Name of the database table
     */
    constructor(protected supabase: SupabaseClient, protected tableName: string) {}

    /**
     * Validates a record before database operations
     * @param {Omit<T, "id" | "created_at" | "updated_at">} record The record to validate
     * @throws {Error} If record is null or undefined
     */
    protected validateRecord(record: Omit<T, "id" | "created_at" | "updated_at">): void {
        if (!record) {
            throw new Error("Record cannot be null or undefined");
        }
    }
}