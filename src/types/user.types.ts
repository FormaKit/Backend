export type UserRole = 'user' | 'manager' | 'super_manager';

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  company_id?: string;
  department_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateUserDTO = Omit<IUser, 'id' | 'created_at' | 'updated_at'> & {
  password: string;
};

export type UpdateUserDTO = Partial<CreateUserDTO>;