-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Personal Trainers (Profiles)
-- Linking id to auth.users to ensure auth.uid() works with RLS
CREATE TABLE personal_trainers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por email
CREATE INDEX idx_personal_trainers_email ON personal_trainers(email);

-- Tabela de Alunos
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_trainer_id UUID NOT NULL REFERENCES personal_trainers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    medical_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_students_personal_trainer_id ON students(personal_trainer_id);
CREATE INDEX idx_students_name ON students(name);

-- Tabela de Exercícios
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_trainer_id UUID NOT NULL REFERENCES personal_trainers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para filtros e buscas
CREATE INDEX idx_exercises_personal_trainer_id ON exercises(personal_trainer_id);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_name ON exercises(name);

-- Tabela de Treinos
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas frequentes
CREATE INDEX idx_workouts_student_id ON workouts(student_id);
CREATE INDEX idx_workouts_active ON workouts(active);
CREATE INDEX idx_workouts_dates ON workouts(start_date, end_date);

-- Tabela de Exercícios do Treino
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workout_id, exercise_id, week_number)
);

-- Índices para ordenação e busca
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
CREATE INDEX idx_workout_exercises_week ON workout_exercises(workout_id, week_number, order_index);

-- Tabela de Desempenho
CREATE TABLE performances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    weight DECIMAL(5,2),
    repetitions INTEGER,
    record_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workout_exercise_id, record_date)
);

-- Índices para consultas de evolução
CREATE INDEX idx_performances_workout_exercise_id ON performances(workout_exercise_id);
CREATE INDEX idx_performances_record_date ON performances(record_date);
CREATE INDEX idx_performances_date_range ON performances(workout_exercise_id, record_date);

-- Habilitar RLS
ALTER TABLE personal_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;

-- Políticas para Personal Trainers
CREATE POLICY "Personal trainers can view their own profile" ON personal_trainers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Personal trainers can update their own profile" ON personal_trainers
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Personal trainers can insert their own profile" ON personal_trainers
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para Students
CREATE POLICY "Personal trainers can view their own students" ON students
    FOR SELECT USING (auth.uid() = personal_trainer_id);

CREATE POLICY "Personal trainers can create their own students" ON students
    FOR INSERT WITH CHECK (auth.uid() = personal_trainer_id);

CREATE POLICY "Personal trainers can update their own students" ON students
    FOR UPDATE USING (auth.uid() = personal_trainer_id);

CREATE POLICY "Personal trainers can delete their own students" ON students
    FOR DELETE USING (auth.uid() = personal_trainer_id);

-- Políticas para Exercises
CREATE POLICY "Personal trainers can view their own exercises" ON exercises
    FOR SELECT USING (auth.uid() = personal_trainer_id);

CREATE POLICY "Personal trainers can create their own exercises" ON exercises
    FOR INSERT WITH CHECK (auth.uid() = personal_trainer_id);

CREATE POLICY "Personal trainers can update their own exercises" ON exercises
    FOR UPDATE USING (auth.uid() = personal_trainer_id);

CREATE POLICY "Personal trainers can delete their own exercises" ON exercises
    FOR DELETE USING (auth.uid() = personal_trainer_id);

-- Políticas para Workouts (indireto via student -> personal_trainer_id)
-- Note: Workouts don't have personal_trainer_id directly, but students do.
-- We need to join with students to check permission.
CREATE POLICY "Personal trainers can view workouts of their students" ON workouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE students.id = workouts.student_id
            AND students.personal_trainer_id = auth.uid()
        )
    );

CREATE POLICY "Personal trainers can create workouts for their students" ON workouts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM students
            WHERE students.id = workouts.student_id
            AND students.personal_trainer_id = auth.uid()
        )
    );

CREATE POLICY "Personal trainers can update workouts of their students" ON workouts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE students.id = workouts.student_id
            AND students.personal_trainer_id = auth.uid()
        )
    );

CREATE POLICY "Personal trainers can delete workouts of their students" ON workouts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE students.id = workouts.student_id
            AND students.personal_trainer_id = auth.uid()
        )
    );

-- Políticas para Workout Exercises
CREATE POLICY "Personal trainers can view workout exercises" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workouts
            JOIN students ON students.id = workouts.student_id
            WHERE workouts.id = workout_exercises.workout_id
            AND students.personal_trainer_id = auth.uid()
        )
    );

CREATE POLICY "Personal trainers can manage workout exercises" ON workout_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workouts
            JOIN students ON students.id = workouts.student_id
            WHERE workouts.id = workout_exercises.workout_id
            AND students.personal_trainer_id = auth.uid()
        )
    );

-- Políticas para Performances
CREATE POLICY "Personal trainers can view performances" ON performances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_exercises
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            JOIN students ON students.id = workouts.student_id
            WHERE workout_exercises.id = performances.workout_exercise_id
            AND students.personal_trainer_id = auth.uid()
        )
    );

CREATE POLICY "Personal trainers can manage performances" ON performances
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workout_exercises
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            JOIN students ON students.id = workouts.student_id
            WHERE workout_exercises.id = performances.workout_exercise_id
            AND students.personal_trainer_id = auth.uid()
        )
    );

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON personal_trainers TO anon;
GRANT ALL PRIVILEGES ON personal_trainers TO authenticated;

GRANT SELECT ON students TO anon;
GRANT ALL PRIVILEGES ON students TO authenticated;

GRANT SELECT ON exercises TO anon;
GRANT ALL PRIVILEGES ON exercises TO authenticated;

GRANT SELECT ON workouts TO anon;
GRANT ALL PRIVILEGES ON workouts TO authenticated;

GRANT SELECT ON workout_exercises TO anon;
GRANT ALL PRIVILEGES ON workout_exercises TO authenticated;

GRANT SELECT ON performances TO anon;
GRANT ALL PRIVILEGES ON performances TO authenticated;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.personal_trainers (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
