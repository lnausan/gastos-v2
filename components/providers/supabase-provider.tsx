'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

type SupabaseContext = {
  supabase: SupabaseClient<Database> | null
}

const Context = createContext<SupabaseContext>({ supabase: null })

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = useState<SupabaseClient<Database> | null>(() => {
    if (typeof window === 'undefined') return null
    return createClientComponentClient<Database>()
  })

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
} 