-- Eliminar la restricción UNIQUE del campo month
ALTER TABLE dollar_values DROP CONSTRAINT IF EXISTS dollar_values_month_key;

-- Crear una restricción UNIQUE compuesta para month y user_id
ALTER TABLE dollar_values ADD CONSTRAINT dollar_values_month_user_id_key UNIQUE (month, user_id);

-- Eliminar las políticas existentes
DROP POLICY IF EXISTS "Allow all authenticated users to read dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Allow all authenticated users to insert dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Allow all authenticated users to update dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Allow all authenticated users to delete dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Users can view their own dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Users can insert their own dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Users can update their own dollar values" ON dollar_values;
DROP POLICY IF EXISTS "Users can delete their own dollar values" ON dollar_values;

-- Crear nuevas políticas más específicas
CREATE POLICY "Users can view their own dollar values"
  ON dollar_values FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dollar values"
  ON dollar_values FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dollar values"
  ON dollar_values FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dollar values"
  ON dollar_values FOR DELETE
  USING (auth.uid() = user_id); 