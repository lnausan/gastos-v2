-- Add user_id to transactions table
alter table transactions
add column user_id uuid references auth.users(id) on delete cascade;

-- Add user_id to dollar_values table
alter table dollar_values
add column user_id uuid references auth.users(id) on delete cascade;

-- Update RLS policies for transactions
drop policy if exists "Enable read access for all users" on transactions;
drop policy if exists "Enable insert for authenticated users only" on transactions;
drop policy if exists "Enable update for users based on user_id" on transactions;
drop policy if exists "Enable delete for users based on user_id" on transactions;

create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- Update RLS policies for dollar_values
drop policy if exists "Enable read access for all users" on dollar_values;
drop policy if exists "Enable insert for authenticated users only" on dollar_values;
drop policy if exists "Enable update for users based on user_id" on dollar_values;
drop policy if exists "Enable delete for users based on user_id" on dollar_values;

create policy "Users can view their own dollar values"
  on dollar_values for select
  using (auth.uid() = user_id);

create policy "Users can insert their own dollar values"
  on dollar_values for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own dollar values"
  on dollar_values for update
  using (auth.uid() = user_id);

create policy "Users can delete their own dollar values"
  on dollar_values for delete
  using (auth.uid() = user_id); 