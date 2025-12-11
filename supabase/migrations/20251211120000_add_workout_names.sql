-- Add name column to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing workouts with sequential names
WITH ranked_workouts AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at) as rn
  FROM workouts
)
UPDATE workouts
SET name = 'Treino ' || ranked_workouts.rn
FROM ranked_workouts
WHERE workouts.id = ranked_workouts.id;
