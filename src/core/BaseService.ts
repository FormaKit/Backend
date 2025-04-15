import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from './BaseModel';
import { ValidationError } from './ErrorHandler';
import { IFilter, IPagination } from '../types/filter.types';

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
       * Finds all records matching the filter criteria
       * @param filter The filter criteria
       * @returns Promise of array of records
       */
      async findAll(filter?: IFilter<T>): Promise<T[]> {
            let query = this.supabase.from(this.tableName).select('*');

            // Apply where conditions
            if (filter?.where) {
                  query = query.match(filter.where);
            }

            // Apply ordering
            if (filter?.orderBy) {
                  for (const [column, direction] of Object.entries(filter.orderBy)) {
                        query = query.order(column, { ascending: direction === 'asc' });
                  }
            }

            // Apply pagination
            if (filter?.limit) {
                  query = query.limit(filter.limit);
            }
            if (filter?.offset) {
                  query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
            }

            const { data, error } = await query;

            if (error) {
                  throw new ValidationError(error.message);
            }

            return data as T[];
      }

      /**
       * Finds a record by its ID
       * @param id The ID of the record
       * @returns Promise of the record or null if not found
       */
      async findById(id: string): Promise<T | null> {
            const { data, error } = await this.supabase
                  .from(this.tableName)
                  .select('*')
                  .eq('id', id)
                  .single();

            if (error) {
                  throw new ValidationError(error.message);
            }

            return data as T | null;
      }

      /**
       * Creates a new record
       * @param data The data to create
       * @returns Promise of the created record
       */
      async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
            const { data: created, error } = await this.supabase
                  .from(this.tableName)
                  .insert(data)
                  .select()
                  .single();

            if (error) {
                  throw new ValidationError(error.message);
            }

            return created as T;
      }

      /**
       * Updates a record
       * @param id The ID of the record to update -- string
       * @param data The data to update
       * @returns Promise of the updated record
       */
      async update(id: number, data: Partial<T>): Promise<T> {
            const { data: updated, error } = await this.supabase
                  .from(this.tableName)
                  .update(data)
                  .eq('id', id)
                  .select()
                  .single();

            if (error) {
                  throw new ValidationError(error.message);
            }

            return updated as T;
      }

      /**
       * Checks if a record exists based on filter criteria
       * @param filter The filter criteria
       * @returns Promise of boolean indicating if record exists
       */
      async exists(filter: Partial<T>): Promise<boolean> {
            const { data, error } = await this.supabase
                  .from(this.tableName)
                  .select('id')
                  .match(filter)
                  .limit(1);

            if (error) {
                  throw new ValidationError(error.message);
            }

            return data.length > 0;
      }

      /**
       * Deletes a record by its ID
       * @param id The ID of the record to delete
       * @returns Promise<void>
       * @throws ValidationError if deletion fails
       */
      async delete(id: number): Promise<void> {
            const { error } = await this.supabase.from(this.tableName).delete().eq('id', id);

            if (error) {
                  throw new ValidationError(error.message);
            }
      }

      /**
       * Deletes multiple records based on a filter
       * @param filter The filter criteria for deletion
       * @returns Promise<void>
       * @throws ValidationError if deletion fails
       */
      async deleteMany(filter: Partial<T>): Promise<void> {
            const { error } = await this.supabase.from(this.tableName).delete().match(filter);

            if (error) {
                  throw new ValidationError(error.message);
            }
      }

      /**
       * Soft deletes a record by updating its deleted_at timestamp
       * Note: Your table must have a deleted_at column for this to work
       * @param id The ID of the record to soft delete
       * @returns Promise<T> The soft deleted record
       * @throws ValidationError if soft deletion fails
       */
      async softDelete(id: number): Promise<T> {
            const { data: deleted, error } = await this.supabase
                  .from(this.tableName)
                  .update({ deleted_at: new Date().toISOString() })
                  .eq('id', id)
                  .select()
                  .single();

            if (error) {
                  throw new ValidationError(error.message);
            }

            return deleted as T;
      }
}
