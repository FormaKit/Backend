export interface IUser {
    id: string;
    username: string;
    email: string;
    password: string;
    role_id: number;
    comapny_id?: string;
    department_id?: string;
    is_active?: boolean;
    created_at?: string | Date;
    updated_at?: string | Date;
}

export interface ICreateUserDTO {
    username: string;
    email: string;
    password: string;
    role_id: number;
    company_id?: string;
    department_id?: string;
}
