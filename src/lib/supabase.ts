import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'student' | 'admin';
          full_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string | null;
          gender: string | null;
          nationality: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          father_name: string | null;
          mother_name: string | null;
          emergency_contact: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'student' | 'admin';
          full_name: string;
          email: string;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          nationality?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          father_name?: string | null;
          mother_name?: string | null;
          emergency_contact?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'student' | 'admin';
          full_name?: string;
          email?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          nationality?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          father_name?: string | null;
          mother_name?: string | null;
          emergency_contact?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      universities: {
        Row: {
          id: string;
          name: string;
          code: string;
          city: string;
          state: string;
          rank: number | null;
          description: string | null;
          website: string | null;
          created_at: string;
        };
      };
      programs: {
        Row: {
          id: string;
          university_id: string;
          name: string;
          degree: string;
          duration_years: number;
          total_fees: number;
          application_fee: number;
          description: string | null;
          eligibility: string | null;
          created_at: string;
        };
      };
      applications: {
        Row: {
          id: string;
          application_number: string;
          student_id: string;
          university_id: string;
          program_id: string;
          status: string;
          application_fee: number;
          submission_date: string | null;
          tenth_school: string | null;
          tenth_board: string | null;
          tenth_year: number | null;
          tenth_percentage: number | null;
          twelfth_school: string | null;
          twelfth_board: string | null;
          twelfth_year: number | null;
          twelfth_percentage: number | null;
          graduation_college: string | null;
          graduation_university: string | null;
          graduation_degree: string | null;
          graduation_year: number | null;
          graduation_percentage: number | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      document_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_required: boolean;
          max_size_mb: number;
          allowed_formats: string[];
          ai_extraction_fields: any;
          created_at: string;
        };
      };
      application_documents: {
        Row: {
          id: string;
          application_id: string;
          document_type_id: string;
          file_url: string;
          file_name: string;
          file_size: number;
          status: string;
          extracted_data: any;
          admin_notes: string | null;
          uploaded_at: string;
          verified_at: string | null;
        };
      };
    };
  };
};
