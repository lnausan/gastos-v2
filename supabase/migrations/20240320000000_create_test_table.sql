-- Create test table
create table if not exists test_table (
  id uuid default gen_random_uuid() primary key,
  test_column text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table test_table enable row level security;

-- Create policy to allow all operations for authenticated users
create policy "Allow all operations for authenticated users"
  on test_table
  for all
  to authenticated
  using (true)
  with check (true); 