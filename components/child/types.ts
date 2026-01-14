import { LucideIcon } from 'lucide-react-native';

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  profile_picture_url: string;
  special_needs?: string;
  allergies?: string;
  medical_conditions?: string;
  created_at: string;
  user_id: string;
  creche_id: string;
  share_code?: string;
  creche?: {
    id: string;
    name: string;
    header_image: string;
    address: string;
  };
  parents?: ChildParent[];
  relationship?: 'owner' | 'parent' | 'guardian' | 'relative';
  permissions?: {
    edit: boolean;
    view: boolean;
    manage: boolean;
  };
}

export interface ChildParent {
  id: string;
  child_id: string;
  user_id: string;
  relationship: string;
  is_verified: boolean;
  invited_by?: string;
  invitation_id?: string;
  permissions: any;
  created_at: string;
  updated_at: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
}

export interface ChildInvite {
  id: string;
  child_id: string;
  inviter_id: string;
  invitee_email: string;
  invitee_user_id: string | null;
  share_code: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  relationship: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  inviter?: {
    first_name: string;
    last_name: string;
  };
  invitee?: {
    first_name: string;
    last_name: string;
  };
}

export interface Application {
  id: string;
  application_status: string;
  created_at: string;
  parent_name: string;
  parent_phone_number: string;
  parent_email: string;
  message: string;
  child_id: string;
  creche_id: string;
  creches: {
    id: string;
    name: string;
    header_image: string;
    address: string;
    email: string;
    phone_number: string;
  };
}

export interface Student {
  id: string;
  name: string;
  dob: string;
  creche_id: string;
  child_id: string;
  application_id: string;
  class: string;
  fees_owed: number;
  fees_paid: number;
  profile_picture: string;
  user_id: string;
  parent_name: string;
  parent_phone_number: string;
  parent_email: string;
  creches: {
    name: string;
    header_image: string;
    address: string;
  };
}

export interface AttendanceRecord {
  id: string;
  attendance_date: string;
  status: string;
  created_at: string;
  student_id: string;
}

export interface ApplicationNote {
  id: string;
  note: string;
  created_at: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

export interface MedicalRecord {
  id: string;
  immunization_status: string;
  allergies: string;
  last_checkup: string;
  next_checkup: string;
  medical_notes: string;
  student_id: string;
  creches: {
    name: string;
  };
}

export interface Invoice {
  id: string;
  creche_id: string;
  student_id: string;
  child_id: string;
  title: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  prepared_by: string;
  prepared_for: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  application_id: string;
  creches?: {
    name: string;
    header_image: string;
  };
  students?: {
    name: string;
  };
  children?: {
    first_name: string;
    last_name: string;
  };
}

export interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}