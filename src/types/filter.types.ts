export interface IFilter<T> {
    where?: Partial<T>;
    orderBy?: {
        [key: string]: 'asc' | 'desc';
    };
    limit?: number;
    offset?: number;
}

export interface IPagination {
    page?: number;
    limit?: number;
} 