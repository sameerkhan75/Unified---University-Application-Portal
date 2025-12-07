/*
  # Update Applications Schema

  1. Changes
    - Add missing columns to applications table for academic information
    - Add missing columns to profiles table for personal information
    - Update applications table to include university_id and application_fee
    - Add submission_date and admin_notes columns

  2. Migration
    - Adds new columns with proper data types
    - Maintains backward compatibility with existing data
*/

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS father_name text,
ADD COLUMN IF NOT EXISTS mother_name text,
ADD COLUMN IF NOT EXISTS emergency_contact text;

-- Add missing columns to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS university_id uuid REFERENCES universities(id),
ADD COLUMN IF NOT EXISTS application_fee integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS submission_date timestamptz,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS tenth_school text,
ADD COLUMN IF NOT EXISTS tenth_board text,
ADD COLUMN IF NOT EXISTS tenth_year integer,
ADD COLUMN IF NOT EXISTS tenth_percentage numeric(5,2),
ADD COLUMN IF NOT EXISTS twelfth_school text,
ADD COLUMN IF NOT EXISTS twelfth_board text,
ADD COLUMN IF NOT EXISTS twelfth_year integer,
ADD COLUMN IF NOT EXISTS twelfth_percentage numeric(5,2),
ADD COLUMN IF NOT EXISTS graduation_college text,
ADD COLUMN IF NOT EXISTS graduation_university text,
ADD COLUMN IF NOT EXISTS graduation_degree text,
ADD COLUMN IF NOT EXISTS graduation_year integer,
ADD COLUMN IF NOT EXISTS graduation_percentage numeric(5,2);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_university_id_fkey'
  ) THEN
    ALTER TABLE applications 
    ADD CONSTRAINT applications_university_id_fkey 
    FOREIGN KEY (university_id) REFERENCES universities(id);
  END IF;
END $$;

-- Update universities table to add missing columns
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS code text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS website text;

-- Update programs table to add missing columns  
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS total_fees integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS eligibility text;

-- Update document_types table to add missing columns
ALTER TABLE document_types
ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT true;

-- Update application_documents table to match expected schema
ALTER TABLE application_documents
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Rename status values in application_documents if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM application_documents WHERE status = 'pending'
  ) THEN
    UPDATE application_documents SET status = 'pending_verification' WHERE status = 'pending';
  END IF;
END $$;
