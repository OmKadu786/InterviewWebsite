/*
  # Create Mock Interviews Table

  1. New Tables
    - `mock_interviews`
      - `id` (uuid, primary key) - Unique identifier for each interview
      - `created_at` (timestamptz) - Timestamp when the interview was created
      - `role_title` (text) - The job role/title for the interview
      - `job_description` (text) - Full job description provided by user
      - `resume_filename` (text) - Name of the uploaded resume file
      - `performance_score` (integer) - Mock performance score (0-100)
      - `status` (text) - Status of the interview (pending, completed, in_progress)
      
  2. Security
    - Enable RLS on `mock_interviews` table
    - Add policy for public read access (for demo purposes)
    - Add policy for public insert access (for demo purposes)
    
  Note: In production, these policies should be restricted to authenticated users only.
*/

CREATE TABLE IF NOT EXISTS mock_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  role_title text NOT NULL,
  job_description text NOT NULL,
  resume_filename text NOT NULL,
  performance_score integer DEFAULT 0,
  status text DEFAULT 'pending'
);

ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mock interviews"
  ON mock_interviews
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create mock interviews"
  ON mock_interviews
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update mock interviews"
  ON mock_interviews
  FOR UPDATE
  USING (true)
  WITH CHECK (true);