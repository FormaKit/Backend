import { Question } from './question.types';

export interface IForm {
  id: string;
  title: string;
  description?: string;
  company_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface IFormWithQuestions extends IForm {
  questions: Question[];
}

export type CreateFormDTO = Omit<IForm, 'id' | 'created_at' | 'updated_at'>;
export type UpdateFormDTO = Partial<CreateFormDTO>;