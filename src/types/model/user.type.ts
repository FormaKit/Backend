export interface IUserModel {
      id: number;
      username: string;
      email: string;
      password: string;
      is_active: boolean;
      company_id: number | string | null;
      department_id: number | string | null;
      role_id: string | number;
      created_at: Date | string;
      updated_at: Date | string;
}
