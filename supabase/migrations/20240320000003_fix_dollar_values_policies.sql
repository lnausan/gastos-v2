-- Habilitar RLS en la tabla
ALTER TABLE dollar_values ENABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Allow all authenticated users to read dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Allow all authenticated users to insert dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Allow all authenticated users to update dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Allow all authenticated users to delete dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Users can view their own dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Users can insert their own dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Users can update their own dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Users can delete their own dollar values" ON dollar_values;

-- Crear políticas básicas para todas las operaciones
CREATE POLICY "Enable read access for authenticated users"
  ON dollar_values FOR SELECT
  TO authenticated
  USING (true);

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