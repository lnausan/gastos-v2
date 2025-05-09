-- Create categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create expenses table
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some default categories
INSERT INTO categories (name, color, icon) VALUES
    ('Alimentación', '#FF5733', 'utensils'),
    ('Transporte', '#33FF57', 'car'),
    ('Entretenimiento', '#3357FF', 'film'),
    ('Servicios', '#F333FF', 'home'),
    ('Otros', '#33FFF3', 'ellipsis-h');

-- Create dollar_values table
CREATE TABLE dollar_values (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month TEXT NOT NULL UNIQUE,
    value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE dollar_values ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read dollar values
CREATE POLICY "Allow all authenticated users to read dollar values"
    ON dollar_values FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow all authenticated users to insert dollar values
CREATE POLICY "Allow all authenticated users to insert dollar values"
    ON dollar_values FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow all authenticated users to update dollar values
CREATE POLICY "Allow all authenticated users to update dollar values"
    ON dollar_values FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy to allow all authenticated users to delete dollar values
CREATE POLICY "Allow all authenticated users to delete dollar values"
    ON dollar_values FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_dollar_values_updated_at
    BEFORE UPDATE ON dollar_values
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 