import { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "./BaseModel";
import { ValidationError } from "./ErrorHandler";

/**
 * BaseService class for handling CRUD operations in Supabase.
 *
 * @template T Type of the record.
 */
export abstract class BaseService<T extends Record<string, any>> extends BaseModel<T> {
    constructor(supabse: SupabaseClient, tableName: string) {
        super(supabse, tableName);
    }

    /**
     * Initializes the service with Supabase client and table name.
     * @param {SupabaseClient} supabase Supabase client instance.
     * @param {string} tableName Name of the table.
     */
    async create(item: Omit<T, "id" | "created_at" | "updated_at">): Promise<T | null> {
        this.validateRecord(item);

        const { data, error } = await this.supabase
            .from(this.tableName)
            .insert(item)
            .select()
            .single<T>();

            console.error('error', error)

        return data;
    }

    /**
     * Creates a new record in the table.
     * @param {Omit<T, "id" | "created_at" | "updated_at">} item The record to create.
     * @returns {Promise<T>} The created record.
     */
    async findById(id: string): Promise<T | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select("*")
            .eq("id", id)
            .single<T>();

        return data;
    }

    /**
     * Finds all records matching the filter.
     * @param {Partial<T>} filter Filter for the records.
     * @returns {Promise<T[]>} Array of records.
     */
    async findAll(filter: Partial<T> = {}): Promise<T[] | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select("*")
            .match(filter);

        return data;
    }

    /**
     * Updates a record by ID.
     * @param {string} id The ID of the record.
     * @param {Partial<T>} updates The fields to update.
     * @returns {Promise<T>} The updated record.
     */
    async update(id: string, updates: Partial<T>): Promise<T | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .update(updates)
            .eq("id", id)
            .select()
            .single<T>();

        return data;
    }

    /**
     * Deletes a record by ID.
     * @param {string} id The ID of the record.
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
        const { data, error } = await this.supabase.from(this.tableName).delete().eq("id", id);
    }

    /**
     * Checks if any records match the filter.
     * @param {Partial<T>} filter The filter to match.
     * @returns {Promise<boolean>} True if records exist, false otherwise.
     */
    async exists(filter: Partial<T>): Promise<boolean> {
        const { count } = await this.supabase
            .from(this.tableName)
            .select("*", { count: "exact", head: true })
            .match(filter);

        return (count || 0) > 0;
    }
}
