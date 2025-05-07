import type { Category, Expense } from '@/types/database'
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs'

// Categorías
export async function getCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function createCategory(supabase: SupabaseClient, category: Omit<Category, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Gastos
export async function getExpenses(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createExpense(supabase: SupabaseClient, expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function updateExpense(supabase: SupabaseClient, id: string, expense: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', id)
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function deleteExpense(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
} 