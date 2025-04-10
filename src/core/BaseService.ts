const supabase = require("../config/supabase");

class BaseService {
    table: string;
    supabase: any;

    constructor(tableName: string) {
        this.table = tableName;
        this.supabase = supabase;
    }

    async findAll(filter = {}) {
        const { data, error } = await this.supabase.from(this.table).select("*").match(filter);

        if (error) throw error;
        return data;
    }

    async findById(id: number) {
        const { data, error } = await this.supabase
            .from(this.table)
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    }

    async create(item: any) {
        const { data, error } = await this.supabase.from(this.table).insert([item]).select();

        if (error) throw error;
        return data[0];
    }

    async update(id: number, updates: any) {
        const { data, error } = await this.supabase
            .from(this.table)
            .update(updates)
            .eq("id", id)
            .select();

        if (error) throw error;
        return data[0];
    }

    async delete(id: number) {
        const { error } = await this.supabase.from(this.table).delete().eq("id", id);

        if (error) throw error;
        return true;
    }
}

module.exports = BaseService;
