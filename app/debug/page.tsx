"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTransactions } from '@/context/transaction-context'
import { toast } from 'sonner'

export default function DebugPage() {
  const { user, loading: authLoading } = useAuth()
  const { 
    transactions, 
    dollarValues, 
    closedMonths, 
    isLoading, 
    isFirebaseEnabled,
    clearAllData,
    forceLoadHistoricalData,
    loadHistoricalDataImmediately
  } = useTransactions()
  const [localStorageData, setLocalStorageData] = useState<any>({})

  useEffect(() => {
    // Verificar datos en localStorage
    const checkLocalStorage = () => {
      const storageId = 'gastos-v2'
      const transactionsData = localStorage.getItem(`transactions-${storageId}`)
      const dollarValuesData = localStorage.getItem(`dollar-values-${storageId}`)
      const closedMonthsData = localStorage.getItem(`closed-months-${storageId}`)

      setLocalStorageData({
        transactions: transactionsData ? JSON.parse(transactionsData) : null,
        dollarValues: dollarValuesData ? JSON.parse(dollarValuesData) : null,
        closedMonths: closedMonthsData ? JSON.parse(closedMonthsData) : null
      })
    }

    checkLocalStorage()
  }, [])

          const clearLocalStorage = () => {
          const storageId = 'gastos-v2'
          localStorage.removeItem(`transactions-${storageId}`)
          localStorage.removeItem(`dollar-values-${storageId}`)
          localStorage.removeItem(`closed-months-${storageId}`)
          window.location.reload()
        }

        const forceReloadData = () => {
          // Forzar recarga de datos
          window.location.reload()
        }

        const clearAndReloadCurrentMonth = () => {
          const storageId = 'gastos-v2'
          localStorage.removeItem(`transactions-${storageId}`)
          localStorage.removeItem(`dollar-values-${storageId}`)
          localStorage.removeItem(`closed-months-${storageId}`)
          
          toast.success('Datos limpiados. Recargando con datos del mes actual...')
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }

        const addHistoricalDataLocal = () => {
          // Generar datos históricos para los últimos 6 meses
          const now = new Date()
          const historicalTransactions = []
          const historicalDollarValues = []
          
          for (let i = 0; i < 6; i++) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
            const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            
            // Agregar transacciones para cada mes
            historicalTransactions.push(
              {
                id: `hist-${month}-1`,
                amount: 80000 + Math.floor(Math.random() * 40000),
                type: 'ingreso',
                category_id: 'salario',
                date: `${month}-15`,
                description: `Salario ${monthName}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: 'local-user',
                archived: false
              },
              {
                id: `hist-${month}-2`,
                amount: 20000 + Math.floor(Math.random() * 15000),
                type: 'gasto',
                category_id: 'comida',
                date: `${month}-20`,
                description: 'Supermercado',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: 'local-user',
                archived: false
              },
              {
                id: `hist-${month}-3`,
                amount: 10000 + Math.floor(Math.random() * 10000),
                type: 'gasto',
                category_id: 'transporte',
                date: `${month}-22`,
                description: 'Combustible',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: 'local-user',
                archived: false
              }
            )
            
            // Agregar valor del dólar para cada mes
            historicalDollarValues.push({
              id: `dollar-${month}`,
              month: month,
              value: 950 + Math.floor(Math.random() * 100),
              user_id: 'local-user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
          
          // Obtener datos actuales
          const storageId = 'gastos-v2'
          const currentTransactions = localStorage.getItem(`transactions-${storageId}`)
          const currentDollarValues = localStorage.getItem(`dollar-values-${storageId}`)
          
          const existingTransactions = currentTransactions ? JSON.parse(currentTransactions) : []
          const existingDollarValues = currentDollarValues ? JSON.parse(currentDollarValues) : []
          
          // Combinar con datos actuales
          const allTransactions = [...existingTransactions, ...historicalTransactions]
          const allDollarValues = [...existingDollarValues, ...historicalDollarValues]
          
          // Guardar en localStorage
          localStorage.setItem(`transactions-${storageId}`, JSON.stringify(allTransactions))
          localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(allDollarValues))
          
          toast.success(`Datos históricos agregados: ${historicalTransactions.length} transacciones`)
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }

  const addTestData = () => {
    const storageId = 'gastos-v2'
    const testTransactions = [
      {
        id: '1',
        amount: 100000,
        type: 'ingreso',
        category_id: 'salario',
        date: '2024-01-15',
        description: 'Salario enero',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'test-user',
        archived: false
      },
      {
        id: '2',
        amount: 25000,
        type: 'gasto',
        category_id: 'comida',
        date: '2024-01-20',
        description: 'Supermercado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'test-user',
        archived: false
      },
      {
        id: '3',
        amount: 15000,
        type: 'gasto',
        category_id: 'transporte',
        date: '2024-01-22',
        description: 'Combustible',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'test-user',
        archived: false
      },
      {
        id: '4',
        amount: 50000,
        type: 'ingreso',
        category_id: 'freelance',
        date: '2024-01-25',
        description: 'Proyecto freelance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'test-user',
        archived: false
      }
    ]

    const testDollarValues = [
      {
        id: '1',
        month: '2024-01',
        value: 1000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        month: '2024-02',
        value: 1050,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const testClosedMonths = [
      {
        id: '1',
        month: '2023-12',
        income: 80000,
        expense: 45000,
        balance: 35000,
        transaction_count: 8,
        closed_at: new Date().toISOString(),
        user_id: 'test-user',
        carry_over_amount: 35000
      }
    ]

    localStorage.setItem(`transactions-${storageId}`, JSON.stringify(testTransactions))
    localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(testDollarValues))
    localStorage.setItem(`closed-months-${storageId}`, JSON.stringify(testClosedMonths))
    
    toast.success('Datos de prueba cargados correctamente')
    window.location.reload()
  }

  const checkFirebaseDirectly = async () => {
    try {
      console.log('Verificando Firebase directamente...')
      const { db } = await import('@/lib/firebase')
      console.log('DB importado:', !!db)
      
      if (!db) {
        console.log('DB es null')
        return
      }

      const { collection, getDocs } = await import('firebase/firestore')
      const querySnapshot = await getDocs(collection(db, 'transactions'))
      console.log('Documentos en transactions:', querySnapshot.size)
      
      querySnapshot.forEach((doc) => {
        console.log('Documento:', doc.id, doc.data())
      })
    } catch (error) {
      console.error('Error verificando Firebase:', error)
    }
  }

  const checkAuthStatus = async () => {
    try {
      console.log('Verificando estado de autenticación...')
      const { auth } = await import('@/lib/firebase')
      console.log('Auth importado:', !!auth)
      
      if (!auth) {
        console.log('Auth es null')
        return
      }

      const currentUser = auth.currentUser
      console.log('Usuario actual:', currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName
      } : 'No hay usuario autenticado')

      // Verificar si hay un usuario en localStorage (Firebase guarda el estado ahí)
      const authKey = Object.keys(localStorage).find(key => key.includes('firebase'))
      if (authKey) {
        console.log('Clave de Firebase en localStorage:', authKey)
        const authData = localStorage.getItem(authKey)
        console.log('Datos de autenticación:', authData ? JSON.parse(authData) : 'No hay datos')
      } else {
        console.log('No se encontraron claves de Firebase en localStorage')
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
    }
  }

  const testFirestoreAccess = async () => {
    try {
      console.log('Probando acceso a Firestore...')
      const { db } = await import('@/lib/firebase')
      console.log('DB importado:', !!db)
      
      if (!db) {
        console.log('DB es null')
        return
      }

      const { collection, getDocs } = await import('firebase/firestore')
      
      // Intentar leer una colección sin filtros
      console.log('Intentando leer colección transactions...')
      const querySnapshot = await getDocs(collection(db, 'transactions'))
      console.log('Documentos en transactions:', querySnapshot.size)
      
      if (querySnapshot.size > 0) {
        console.log('Primer documento:', querySnapshot.docs[0].data())
      }
      
      // Intentar leer valores del dólar
      console.log('Intentando leer colección dollarValues...')
      const dollarSnapshot = await getDocs(collection(db, 'dollarValues'))
      console.log('Documentos en dollarValues:', dollarSnapshot.size)
      
    } catch (error) {
      console.error('Error probando acceso a Firestore:', error)
    }
  }

  const checkUserDataInFirebase = async () => {
    try {
      console.log('Verificando datos del usuario en Firebase...')
      
      // Verificar si Firebase está configurado
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.log('Firebase no está configurado')
        toast.error('Firebase no está configurado correctamente')
        return
      }
      
      const { db } = await import('@/lib/firebase')
      console.log('DB importado:', !!db)
      
      if (!db) {
        console.log('DB es null')
        toast.error('No se pudo inicializar la base de datos')
        return
      }

      const { collection, getDocs, query, where } = await import('firebase/firestore')
      
      // Verificar si hay un usuario autenticado
      const { auth } = await import('@/lib/firebase')
      const currentUser = auth?.currentUser
      
      if (!currentUser) {
        console.log('No hay usuario autenticado')
        toast.warning('No hay usuario autenticado. Los datos se cargan localmente.')
        
        // Mostrar información sobre datos locales
        const storageId = 'gastos-v2'
        const transactionsData = localStorage.getItem(`transactions-${storageId}`)
        const dollarValuesData = localStorage.getItem(`dollar-values-${storageId}`)
        const closedMonthsData = localStorage.getItem(`closed-months-${storageId}`)
        
        const localTransactions = transactionsData ? JSON.parse(transactionsData) : []
        const localDollarValues = dollarValuesData ? JSON.parse(dollarValuesData) : []
        const localClosedMonths = closedMonthsData ? JSON.parse(closedMonthsData) : []
        
        console.log('Datos locales:', {
          transactions: localTransactions.length,
          dollarValues: localDollarValues.length,
          closedMonths: localClosedMonths.length
        })
        
        toast.success(`Datos locales: ${localTransactions.length} transacciones, ${localDollarValues.length} valores del dólar, ${localClosedMonths.length} meses cerrados`)
        return
      }

      console.log('Usuario autenticado:', currentUser.email)
      
      // Buscar transacciones del usuario
      console.log('Buscando transacciones del usuario...')
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', currentUser.uid)
      )
      const transactionsSnapshot = await getDocs(transactionsQuery)
      console.log('Transacciones del usuario:', transactionsSnapshot.size)
      
      if (transactionsSnapshot.size > 0) {
        console.log('Primera transacción:', transactionsSnapshot.docs[0].data())
        toast.success(`Encontradas ${transactionsSnapshot.size} transacciones del usuario`)
      } else {
        console.log('No se encontraron transacciones del usuario')
        toast.warning('No se encontraron transacciones del usuario en Firebase')
      }
      
      // Buscar valores del dólar del usuario
      console.log('Buscando valores del dólar del usuario...')
      const dollarQuery = query(
        collection(db, 'dollarValues'),
        where('user_id', '==', currentUser.uid)
      )
      const dollarSnapshot = await getDocs(dollarQuery)
      console.log('Valores del dólar del usuario:', dollarSnapshot.size)
      
      if (dollarSnapshot.size > 0) {
        console.log('Primer valor del dólar:', dollarSnapshot.docs[0].data())
        toast.success(`Encontrados ${dollarSnapshot.size} valores del dólar del usuario`)
      } else {
        console.log('No se encontraron valores del dólar del usuario')
        toast.warning('No se encontraron valores del dólar del usuario en Firebase')
      }
      
      // Buscar meses cerrados del usuario
      console.log('Buscando meses cerrados del usuario...')
      const closedMonthsQuery = query(
        collection(db, 'closedMonths'),
        where('user_id', '==', currentUser.uid)
      )
      const closedMonthsSnapshot = await getDocs(closedMonthsQuery)
      console.log('Meses cerrados del usuario:', closedMonthsSnapshot.size)
      
      if (closedMonthsSnapshot.size > 0) {
        console.log('Primer mes cerrado:', closedMonthsSnapshot.docs[0].data())
        toast.success(`Encontrados ${closedMonthsSnapshot.size} meses cerrados del usuario`)
      } else {
        console.log('No se encontraron meses cerrados del usuario')
        toast.warning('No se encontraron meses cerrados del usuario en Firebase')
      }
      
    } catch (error) {
      console.error('Error verificando datos del usuario:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('permissions')) {
          toast.error('Error de permisos en Firebase. Verifica las reglas de seguridad.')
        } else if (error.message.includes('network')) {
          toast.error('Error de conexión con Firebase.')
        } else {
          toast.error(`Error: ${error.message}`)
        }
      } else {
        toast.error('Error desconocido verificando datos del usuario')
      }
    }
  }

  const forceAuthCheck = async () => {
    try {
      console.log('Forzando verificación de autenticación...')
      const { auth } = await import('@/lib/firebase')
      
      if (!auth) {
        console.log('Auth no disponible')
        toast.error('Auth no disponible')
        return
      }

      // Verificar estado actual
      const currentUser = auth.currentUser
      console.log('Usuario actual:', currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName
      } : 'No hay usuario autenticado')

      if (currentUser) {
        toast.success(`Usuario autenticado: ${currentUser.email}`)
        
        // Verificar si hay datos en localStorage de Firebase
        const authKey = Object.keys(localStorage).find(key => key.includes('firebase'))
        if (authKey) {
          console.log('Clave de Firebase en localStorage:', authKey)
          const authData = localStorage.getItem(authKey)
          console.log('Datos de autenticación:', authData ? JSON.parse(authData) : 'No hay datos')
        } else {
          console.log('No se encontraron claves de Firebase en localStorage')
        }
      } else {
        toast.warning('No hay usuario autenticado')
        
        // Verificar si hay datos de autenticación en localStorage
        const authKey = Object.keys(localStorage).find(key => key.includes('firebase'))
        if (authKey) {
          console.log('Encontrada clave de Firebase en localStorage:', authKey)
          const authData = localStorage.getItem(authKey)
          console.log('Datos de autenticación:', authData ? JSON.parse(authData) : 'No hay datos')
        }
      }
      
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      toast.error('Error verificando autenticación')
    }
  }

  const checkAllUserDataInFirebase = async () => {
    try {
      console.log('Verificando TODOS los datos de usuarios en Firebase...')
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.log('Firebase no está configurado')
        toast.error('Firebase no está configurado correctamente')
        return
      }
      const { db } = await import('@/lib/firebase')
      if (!db) {
        console.log('DB es null')
        toast.error('No se pudo inicializar la base de datos')
        return
      }
      const { collection, getDocs } = await import('firebase/firestore')
      
      // Verificar transacciones de todos los usuarios
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'))
      const allTransactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        user_id: doc.data().user_id || 'sin-user-id'
      }))
      
      // Verificar valores del dólar de todos los usuarios
      const dollarValuesSnapshot = await getDocs(collection(db, 'dollar_values'))
      const allDollarValues = dollarValuesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        user_id: doc.data().user_id || 'sin-user-id'
      }))
      
      // Verificar meses cerrados de todos los usuarios
      const closedMonthsSnapshot = await getDocs(collection(db, 'closed_months'))
      const allClosedMonths = closedMonthsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        user_id: doc.data().user_id || 'sin-user-id'
      }))
      
      // Agrupar por usuario
      const usersWithData = new Set([
        ...allTransactions.map(t => t.user_id),
        ...allDollarValues.map(d => d.user_id),
        ...allClosedMonths.map(c => c.user_id)
      ])
      
      console.log('Datos encontrados en Firebase:')
      console.log('- Transacciones totales:', allTransactions.length)
      console.log('- Valores del dólar totales:', allDollarValues.length)
      console.log('- Meses cerrados totales:', allClosedMonths.length)
      console.log('- Usuarios con datos:', Array.from(usersWithData))
      
      // Mostrar detalles por usuario
      usersWithData.forEach(userId => {
        const userTransactions = allTransactions.filter(t => t.user_id === userId)
        const userDollarValues = allDollarValues.filter(d => d.user_id === userId)
        const userClosedMonths = allClosedMonths.filter(c => c.user_id === userId)
        
        console.log(`Usuario ${userId}:`)
        console.log(`  - Transacciones: ${userTransactions.length}`)
        console.log(`  - Valores del dólar: ${userDollarValues.length}`)
        console.log(`  - Meses cerrados: ${userClosedMonths.length}`)
      })
      
      toast.success(`Encontrados datos de ${usersWithData.size} usuarios en Firebase`)
      
      // Si hay datos pero no del usuario actual, mostrar advertencia
      if (usersWithData.size > 0 && user) {
        const currentUserHasData = usersWithData.has(user.uid)
        if (!currentUserHasData) {
          toast.warning(`Tienes datos en Firebase pero no asociados a tu cuenta actual (${user.email})`)
        }
      }
      
    } catch (error) {
      console.error('Error verificando todos los datos:', error)
      if (error instanceof Error) {
        if (error.message.includes('permissions')) {
          toast.error('Error de permisos en Firebase. Verifica las reglas de seguridad.')
        } else if (error.message.includes('network')) {
          toast.error('Error de conexión con Firebase.')
        } else {
          toast.error(`Error: ${error.message}`)
        }
      } else {
        toast.error('Error desconocido verificando datos')
      }
    }
  }

  const showFirebaseConfig = () => {
    console.log('=== CONFIGURACIÓN DE FIREBASE ===')
    console.log('API Key configurada:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    console.log('Project ID configurado:', !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    console.log('Auth Domain configurado:', !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    console.log('Storage Bucket configurado:', !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    console.log('Messaging Sender ID configurado:', !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
    console.log('App ID configurado:', !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
    
    console.log('=== ESTADO DE AUTENTICACIÓN ===')
    console.log('Usuario actual:', user ? {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    } : 'Sin usuario')
    console.log('Estado de carga:', authLoading)
    
    console.log('=== ESTADO DE FIREBASE ===')
    console.log('Firebase habilitado:', isFirebaseEnabled)
    
    toast.success('Configuración mostrada en consola (F12)')
  }

  const diagnoseDataLoadingIssue = async () => {
    try {
      console.log('=== DIAGNÓSTICO COMPLETO DE CARGA DE DATOS ===')
      
      // 1. Verificar configuración de Firebase
      console.log('1. CONFIGURACIÓN FIREBASE:')
      console.log('- API Key:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
      console.log('- Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
      console.log('- Firebase habilitado:', isFirebaseEnabled)
      
      // 2. Verificar estado de autenticación
      console.log('2. ESTADO DE AUTENTICACIÓN:')
      console.log('- Usuario actual:', user ? {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      } : 'Sin usuario')
      console.log('- Estado de carga auth:', authLoading)
      
      // 3. Verificar estado del contexto
      console.log('3. ESTADO DEL CONTEXTO:')
      console.log('- Transacciones cargadas:', transactions.length)
      console.log('- Valores del dólar cargados:', dollarValues.length)
      console.log('- Meses cerrados cargados:', closedMonths.length)
      console.log('- Cargando (isLoading):', isLoading)
      
      // 4. Intentar cargar datos manualmente
      if (user && isFirebaseEnabled) {
        console.log('4. INTENTANDO CARGA MANUAL DE DATOS:')
        
        const { db } = await import('@/lib/firebase')
        const { collection, getDocs, query, where } = await import('firebase/firestore')
        
        // Intentar cargar transacciones del usuario actual
        try {
          console.log('- Intentando cargar transacciones para usuario:', user.uid)
          const transactionsQuery = query(collection(db, 'transactions'), where('user_id', '==', user.uid))
          const transactionsSnapshot = await getDocs(transactionsQuery)
          console.log('- Transacciones encontradas:', transactionsSnapshot.docs.length)
          
          if (transactionsSnapshot.docs.length > 0) {
            console.log('- Primera transacción:', transactionsSnapshot.docs[0].data())
          }
        } catch (error) {
          console.error('- Error cargando transacciones:', error)
        }
        
        // Intentar cargar valores del dólar del usuario actual
        try {
          console.log('- Intentando cargar valores del dólar para usuario:', user.uid)
          const dollarValuesQuery = query(collection(db, 'dollarValues'), where('user_id', '==', user.uid))
          const dollarValuesSnapshot = await getDocs(dollarValuesQuery)
          console.log('- Valores del dólar encontrados:', dollarValuesSnapshot.docs.length)
        } catch (error) {
          console.error('- Error cargando valores del dólar:', error)
        }
        
        // Intentar cargar meses cerrados del usuario actual
        try {
          console.log('- Intentando cargar meses cerrados para usuario:', user.uid)
          const closedMonthsQuery = query(collection(db, 'closedMonths'), where('user_id', '==', user.uid))
          const closedMonthsSnapshot = await getDocs(closedMonthsQuery)
          console.log('- Meses cerrados encontrados:', closedMonthsSnapshot.docs.length)
        } catch (error) {
          console.error('- Error cargando meses cerrados:', error)
        }
        
        // Verificar TODOS los datos sin filtro de usuario
        try {
          console.log('5. VERIFICANDO TODOS LOS DATOS (sin filtro de usuario):')
          const allTransactionsSnapshot = await getDocs(collection(db, 'transactions'))
          const allDollarValuesSnapshot = await getDocs(collection(db, 'dollarValues'))
          const allClosedMonthsSnapshot = await getDocs(collection(db, 'closedMonths'))
          
          console.log('- Total transacciones en Firebase:', allTransactionsSnapshot.docs.length)
          console.log('- Total valores del dólar en Firebase:', allDollarValuesSnapshot.docs.length)
          console.log('- Total meses cerrados en Firebase:', allClosedMonthsSnapshot.docs.length)
          
          // Mostrar user_ids únicos
          const allUserIds = new Set([
            ...allTransactionsSnapshot.docs.map(doc => doc.data().user_id),
            ...allDollarValuesSnapshot.docs.map(doc => doc.data().user_id),
            ...allClosedMonthsSnapshot.docs.map(doc => doc.data().user_id)
          ])
          console.log('- User IDs únicos encontrados:', Array.from(allUserIds))
          
          // Verificar si el usuario actual tiene datos
          const currentUserHasData = Array.from(allUserIds).includes(user.uid)
          console.log('- Usuario actual tiene datos:', currentUserHasData)
          
          if (!currentUserHasData && allUserIds.size > 0) {
            console.log('⚠️ PROBLEMA IDENTIFICADO: Los datos están asociados a otro usuario')
            console.log('User IDs con datos:', Array.from(allUserIds))
            console.log('Tu user ID:', user.uid)
          }
          
        } catch (error) {
          console.error('- Error verificando todos los datos:', error)
        }
      } else {
        console.log('4. NO SE PUEDE CARGAR DATOS:')
        console.log('- Usuario presente:', !!user)
        console.log('- Firebase habilitado:', isFirebaseEnabled)
      }
      
      toast.success('Diagnóstico completo mostrado en consola (F12)')
      
    } catch (error) {
      console.error('Error en diagnóstico:', error)
      toast.error('Error durante el diagnóstico')
    }
  }

  const checkUserDataMismatch = async () => {
    try {
      console.log('=== VERIFICANDO MISMATCH DE USER_ID ===')
      
      if (!user) {
        console.log('No hay usuario autenticado')
        toast.error('No hay usuario autenticado')
        return
      }
      
      console.log('Usuario actual:', {
        uid: user.uid,
        email: user.email
      })
      
      const { db } = await import('@/lib/firebase')
      const { collection, getDocs } = await import('firebase/firestore')
      
      // Obtener todos los documentos sin filtro
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'))
      const dollarValuesSnapshot = await getDocs(collection(db, 'dollarValues'))
      const closedMonthsSnapshot = await getDocs(collection(db, 'closedMonths'))
      
      console.log('=== ANÁLISIS DE USER_IDS ===')
      
      // Analizar transacciones
      const transactionUserIds = transactionsSnapshot.docs.map(doc => ({
        docId: doc.id,
        userId: doc.data().user_id,
        matches: doc.data().user_id === user.uid
      }))
      
      console.log('Transacciones encontradas:', transactionUserIds.length)
      transactionUserIds.forEach(item => {
        console.log(`- Doc ${item.docId}: user_id="${item.userId}" (coincide: ${item.matches})`)
      })
      
      // Analizar valores del dólar
      const dollarValueUserIds = dollarValuesSnapshot.docs.map(doc => ({
        docId: doc.id,
        userId: doc.data().user_id,
        matches: doc.data().user_id === user.uid
      }))
      
      console.log('Valores del dólar encontrados:', dollarValueUserIds.length)
      dollarValueUserIds.forEach(item => {
        console.log(`- Doc ${item.docId}: user_id="${item.userId}" (coincide: ${item.matches})`)
      })
      
      // Analizar meses cerrados
      const closedMonthUserIds = closedMonthsSnapshot.docs.map(doc => ({
        docId: doc.id,
        userId: doc.data().user_id,
        matches: doc.data().user_id === user.uid
      }))
      
      console.log('Meses cerrados encontrados:', closedMonthUserIds.length)
      closedMonthUserIds.forEach(item => {
        console.log(`- Doc ${item.docId}: user_id="${item.userId}" (coincide: ${item.matches})`)
      })
      
      // Resumen
      const totalDocs = transactionUserIds.length + dollarValueUserIds.length + closedMonthUserIds.length
      const matchingDocs = [
        ...transactionUserIds.filter(item => item.matches),
        ...dollarValueUserIds.filter(item => item.matches),
        ...closedMonthUserIds.filter(item => item.matches)
      ].length
      
      console.log('=== RESUMEN ===')
      console.log(`Total documentos: ${totalDocs}`)
      console.log(`Documentos que coinciden con tu user_id: ${matchingDocs}`)
      console.log(`Documentos que NO coinciden: ${totalDocs - matchingDocs}`)
      
      if (matchingDocs === 0 && totalDocs > 0) {
        console.log('⚠️ PROBLEMA: Los datos existen pero están asociados a otro usuario')
        toast.warning('Los datos están asociados a otro usuario. Necesitamos migrarlos.')
      } else if (matchingDocs > 0) {
        console.log('✅ Los datos están correctamente asociados a tu usuario')
        toast.success('Los datos están correctamente asociados a tu usuario')
      } else {
        console.log('ℹ️ No hay datos en Firebase')
        toast.info('No hay datos en Firebase')
      }
      
    } catch (error) {
      console.error('Error verificando user_ids:', error)
      toast.error('Error verificando user_ids')
    }
  }

  const migrateDataToCurrentUser = async () => {
    try {
      console.log('=== MIGRANDO DATOS AL USUARIO ACTUAL ===')
      
      if (!user) {
        console.log('No hay usuario autenticado')
        toast.error('No hay usuario autenticado')
        return
      }
      
      console.log('Usuario actual:', {
        uid: user.uid,
        email: user.email
      })
      
      // Primero, necesitamos reglas permisivas temporalmente para acceder a todos los datos
      console.log('⚠️ IMPORTANTE: Necesitas cambiar temporalmente las reglas a:')
      console.log('allow read, write: if true;')
      console.log('para poder migrar los datos')
      
      const { db } = await import('@/lib/firebase')
      const { collection, getDocs, updateDoc, doc } = await import('firebase/firestore')
      
      // Obtener todos los documentos
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'))
      const dollarValuesSnapshot = await getDocs(collection(db, 'dollarValues'))
      const closedMonthsSnapshot = await getDocs(collection(db, 'closedMonths'))
      
      let migratedCount = 0
      
      // Migrar transacciones
      for (const docSnapshot of transactionsSnapshot.docs) {
        const data = docSnapshot.data()
        if (data.user_id !== user.uid) {
          await updateDoc(doc(db, 'transactions', docSnapshot.id), {
            user_id: user.uid,
            updated_at: new Date().toISOString()
          })
          migratedCount++
          console.log(`Migrada transacción: ${docSnapshot.id}`)
        }
      }
      
      // Migrar valores del dólar
      for (const docSnapshot of dollarValuesSnapshot.docs) {
        const data = docSnapshot.data()
        if (data.user_id !== user.uid) {
          await updateDoc(doc(db, 'dollarValues', docSnapshot.id), {
            user_id: user.uid,
            updated_at: new Date().toISOString()
          })
          migratedCount++
          console.log(`Migrado valor del dólar: ${docSnapshot.id}`)
        }
      }
      
      // Migrar meses cerrados
      for (const docSnapshot of closedMonthsSnapshot.docs) {
        const data = docSnapshot.data()
        if (data.user_id !== user.uid) {
          await updateDoc(doc(db, 'closedMonths', docSnapshot.id), {
            user_id: user.uid,
            updated_at: new Date().toISOString()
          })
          migratedCount++
          console.log(`Migrado mes cerrado: ${docSnapshot.id}`)
        }
      }
      
      console.log(`=== MIGRACIÓN COMPLETADA ===`)
      console.log(`Documentos migrados: ${migratedCount}`)
      
      if (migratedCount > 0) {
        toast.success(`Migrados ${migratedCount} documentos a tu cuenta`)
        console.log('✅ Ahora puedes cambiar las reglas a las seguras')
      } else {
        toast.info('No se encontraron documentos para migrar')
      }
      
    } catch (error) {
      console.error('Error migrando datos:', error)
      toast.error('Error migrando datos. Verifica las reglas de Firestore.')
    }
  }

  const quickDiagnostic = () => {
    console.log('=== DIAGNÓSTICO RÁPIDO ===')
    console.log('1. Estado de autenticación:')
    console.log('- Usuario:', user ? { uid: user.uid, email: user.email } : 'Sin usuario')
    console.log('- Auth loading:', authLoading)
    
    console.log('2. Estado de Firebase:')
    console.log('- Firebase habilitado:', isFirebaseEnabled)
    
    console.log('3. Estado de datos:')
    console.log('- Transacciones:', transactions.length)
    console.log('- Valores del dólar:', dollarValues.length)
    console.log('- Meses cerrados:', closedMonths.length)
    console.log('- Cargando:', isLoading)
    
    console.log('4. LocalStorage:')
    const storageId = 'gastos-v2'
    const storedTransactions = localStorage.getItem(`transactions-${storageId}`)
    const storedDollarValues = localStorage.getItem(`dollar-values-${storageId}`)
    console.log('- Transacciones en localStorage:', storedTransactions ? JSON.parse(storedTransactions).length : 0)
    console.log('- Valores del dólar en localStorage:', storedDollarValues ? JSON.parse(storedDollarValues).length : 0)
    
    toast.success('Diagnóstico mostrado en consola (F12)')
  }

  // Ocultar la página de debug en producción
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Página no encontrada
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            La página que buscas no existe.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Estado del Sistema</h2>
          <div className="space-y-2 text-sm">
            <div>Firebase: {isFirebaseEnabled ? '✅ Configurado' : '❌ No configurado'}</div>
            <div>Auth Loading: {authLoading ? '⏳ Cargando' : '✅ Listo'}</div>
            <div>User: {user ? '✅ Autenticado' : '❌ Sin usuario'}</div>
            <div>Data Loading: {isLoading ? '⏳ Cargando' : '✅ Listo'}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Datos en Context</h2>
          <div className="space-y-2 text-sm">
            <div>Transactions: {transactions.length}</div>
            <div>Dollar Values: {dollarValues.length}</div>
            <div>Closed Months: {closedMonths.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
          <div className="space-y-2 text-sm">
            <div>Transactions: {localStorageData.transactions ? localStorageData.transactions.length : 0}</div>
            <div>Dollar Values: {localStorageData.dollarValues ? localStorageData.dollarValues.length : 0}</div>
            <div>Closed Months: {localStorageData.closedMonths ? localStorageData.closedMonths.length : 0}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          <div className="space-y-2">
            <button 
              onClick={addTestData}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Agregar Datos de Prueba
            </button>
            <button 
              onClick={clearLocalStorage}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Limpiar LocalStorage
            </button>
            <button 
              onClick={checkFirebaseDirectly}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Verificar Firebase Directamente
            </button>
            <button 
              onClick={checkAuthStatus}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Verificar Estado de Auth
            </button>
            <button 
              onClick={testFirestoreAccess}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Probando Acceso a Firestore
            </button>
            <button 
              onClick={checkUserDataInFirebase}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Verificar Datos del Usuario en Firebase
            </button>
            <button 
              onClick={forceReloadData}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Forzar Recarga de Datos
            </button>
            <button 
              onClick={clearAndReloadCurrentMonth}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Limpiar y Recargar Mes Actual
            </button>
            <button 
              onClick={addHistoricalDataLocal}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Agregar Datos Históricos
            </button>
            <button 
              onClick={forceLoadHistoricalData}
              className="w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              Forzar Carga de Datos Históricos
            </button>
            <button 
              onClick={loadHistoricalDataImmediately}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cargar Datos Históricos Inmediatamente
            </button>
            <button 
              onClick={forceAuthCheck}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Forzar Verificación de Auth
            </button>
            <button onClick={checkAllUserDataInFirebase} className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Verificar TODOS los Datos de Usuarios en Firebase
            </button>
            <button onClick={showFirebaseConfig} className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Mostrar Configuración de Firebase
            </button>
            <button onClick={diagnoseDataLoadingIssue} className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              🔍 Diagnóstico Completo de Carga de Datos
            </button>
            <button onClick={checkUserDataMismatch} className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
              🔍 Verificar Mismatch de User_ID
            </button>
            <button onClick={migrateDataToCurrentUser} className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              🔄 Migrar Datos al Usuario Actual
            </button>
            <button onClick={quickDiagnostic} className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
              🔍 Diagnóstico Rápido
            </button>
          </div>
        </div>
      </div>

      {localStorageData.transactions && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Transacciones en LocalStorage</h2>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(localStorageData.transactions, null, 2)}
          </pre>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Transacciones en Context</h2>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(transactions, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 