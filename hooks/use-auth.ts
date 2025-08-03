import { useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isFirebaseEnabled = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    )

    // console.log('useAuth: Verificando Firebase:', { isFirebaseEnabled })

    if (!isFirebaseEnabled) {
      // console.log('useAuth: Firebase no configurado, usando modo local')
      setLoading(false)
      return
    }

    const timeoutId = setTimeout(() => {
      // console.log('useAuth: Timeout alcanzado, estableciendo loading en false')
      setLoading(false)
    }, 3000) // 3 segundos de timeout

    const initializeAuth = async () => {
      try {
        // console.log('useAuth: Importando Firebase...')
        const { auth } = await import('@/lib/firebase')
        
        if (!auth) {
          // console.log('useAuth: Auth no disponible, usando modo local')
          clearTimeout(timeoutId)
          setLoading(false)
          return
        }

        // console.log('useAuth: Configurando onAuthStateChanged...')
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          clearTimeout(timeoutId)
          // console.log('useAuth: Estado de autenticación cambiado:', user ? {
          //   uid: user.uid,
          //   email: user.email
          // } : 'Sin usuario')
          setUser(user)
          setLoading(false)
        }, (error) => {
          clearTimeout(timeoutId)
          console.error('useAuth: Error en autenticación:', error)
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        clearTimeout(timeoutId)
        console.error('useAuth: Error al inicializar Firebase:', error)
        setLoading(false)
      }
    }

    initializeAuth()
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const isFirebaseEnabled = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    )

    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }
    
    try {
      const { auth } = await import('@/lib/firebase')
      if (!auth) {
        return { success: false, error: 'Firebase no está configurado' }
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: result.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email: string, password: string) => {
    const isFirebaseEnabled = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    )

    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }
    
    try {
      const { auth } = await import('@/lib/firebase')
      if (!auth) {
        return { success: false, error: 'Firebase no está configurado' }
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      return { success: true, user: result.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    const isFirebaseEnabled = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    )

    if (!isFirebaseEnabled) {
      setUser(null)
      return { success: true }
    }
    
    try {
      const { auth } = await import('@/lib/firebase')
      if (!auth) {
        setUser(null)
        return { success: true }
      }
      
      await signOut(auth)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    logout
  }
} 