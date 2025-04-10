export type InputType =
    | "text"
    | "number"
    | "checkbox"
    | "radio"
    | "date"
    | "select"
    | "textarea";

export interface Question {
    id: string;
    form_id: string;
    title: string;
    description?: string;
    input_type: InputType;
    is_required: boolean;
    options?: string[];
    order_number: number;
    settings?: Record<string, any>;
}

export type CreateQuestionDTO = Omit<Question, "id">;
