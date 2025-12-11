export interface Student {
  id: string;
  personal_trainer_id: string;
  name: string;
  contact?: string;
  medical_info?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
