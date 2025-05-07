export type Category = {
    id: string
    name: string
    color: string
    icon: string
    created_at: string
}

export type Expense = {
    id: string
    amount: number
    description: string | null
    date: string
    category_id: string
    created_at: string
    updated_at: string
}

export type Database = {
    public: {
        Tables: {
            categories: {
                Row: Category
                Insert: Omit<Category, 'id' | 'created_at'>
                Update: Partial<Omit<Category, 'id' | 'created_at'>>
            }
            expenses: {
                Row: Expense
                Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>
            }
        }
    }
} 