-- Add active column to students table
ALTER TABLE students ADD COLUMN active BOOLEAN DEFAULT true;

-- Update existing records to be active
UPDATE students SET active = true WHERE active IS NULL;
