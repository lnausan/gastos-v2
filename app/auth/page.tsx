import AuthForm from '@/components/auth/auth-form'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm />
    </div>
  )
} 