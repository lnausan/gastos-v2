-- Eliminar la tabla si existe
DROP TABLE IF EXISTS dollar_values;

-- Crear la tabla con la estructura correcta
CREATE TABLE dollar_values (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT dollar_values_month_user_id_key UNIQUE (month, user_id)
);

-- Habilitar RLS
ALTER TABLE dollar_values ENABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON dollar_values;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON dollar_values;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON dollar_values;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON dollar_values;

-- Crear políticas básicas
CREATE POLICY "Enable read access for authenticated users"
    ON dollar_values FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for authenticated users"
    ON dollar_values FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for authenticated users"
    ON dollar_values FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users"
    ON dollar_values FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id); 