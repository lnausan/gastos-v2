import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { Transaction, DollarValue, ClosedMonth } from '@/types/transaction'

// Verificar si Firebase está configurado
const isFirebaseEnabled = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
)

// console.log('transactionsService: Firebase configurado:', { isFirebaseEnabled })

export const transactionsService = {
  // Agregar una nueva transacción
  async addTransaction(transaction: Omit<Transaction, "id" | "created_at" | "updated_at" | "user_id">, userId: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }
    try {
      // console.log('addTransaction llamado:', { isFirebaseEnabled })
      const { db } = await import('./firebase')
      if (!db) { 
        // console.log('Firebase no configurado, retornando error')
        return { success: false, error: 'Firebase no está configurado' } 
      }

      const { date, ...rest } = transaction
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...rest,
        date: Timestamp.fromDate(new Date(date)),
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        archived: false
      })
      return { success: true, id: docRef.id }
    } catch (error: any) {
      console.error('Error en addTransaction:', error)
      return { success: false, error: error.message }
    }
  },

  // Actualizar una transacción
  async updateTransaction(id: string, transaction: Partial<Transaction>) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      const docRef = doc(db, 'transactions', id)
      
      const updatePayload: { [key: string]: any } = { ...transaction, updatedAt: Timestamp.now() }

      if (transaction.date) {
        updatePayload.date = Timestamp.fromDate(new Date(transaction.date))
      }

      await updateDoc(docRef, updatePayload)
      return { success: true }
    } catch (error: any) {
      console.error('Error en updateTransaction:', error)
      return { success: false, error: error.message }
    }
  },

  // Eliminar una transacción
  async deleteTransaction(id: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      await deleteDoc(doc(db, 'transactions', id))
      return { success: true }
    } catch (error: any) {
      console.error('Error en deleteTransaction:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtener todas las transacciones de un usuario
  async getTransactions(userId: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      // console.log('Creando query para transacciones...')
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      )
      // console.log('Query creada, ejecutando getDocs...')
      const querySnapshot = await getDocs(q)
      // console.log('Query ejecutada, procesando resultados...')
      const transactions: Transaction[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        
        let date: string
        if (data.date && typeof data.date.toDate === 'function') {
          date = data.date.toDate().toISOString().split('T')[0]
        } else {
          // Asumir que ya es un string YYYY-MM-DD, o que no existe
          date = data.date
        }
        
        transactions.push({
          id: doc.id,
          ...data,
          date,
          archived: data.archived || false
        } as Transaction)
      })
      
      // console.log('Transacciones procesadas:', transactions.length)
      return { success: true, transactions }
    } catch (error: any) {
      console.error('Error en getTransactions:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtener transacciones por mes
  async getTransactionsByMonth(userId: string, month: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const transactions: Transaction[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        
        let date: string
        if (data.date && typeof data.date.toDate === 'function') {
          date = data.date.toDate().toISOString().split('T')[0]
        } else {
          date = data.date
        }
        
        transactions.push({
          id: doc.id,
          ...data,
          date,
          archived: data.archived || false
        } as Transaction)
      })
      
      return { success: true, transactions }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Archivar transacciones de un mes
  async archiveMonthTransactions(userId: string, month: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        where('archived', '==', false)
      )
      
      const querySnapshot = await getDocs(q)
      const batch = writeBatch(db)
      
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { archived: true, updatedAt: Timestamp.now() })
      })
      
      await batch.commit()
      return { success: true, archivedCount: querySnapshot.size }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Guardar mes cerrado
  async saveClosedMonth(closedMonth: Omit<ClosedMonth, "id" | "user_id">, userId: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      const docRef = await addDoc(collection(db, 'closedMonths'), {
        ...closedMonth,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return { success: true, id: docRef.id }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Obtener meses cerrados
  async getClosedMonths(userId: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      const q = query(
        collection(db, 'closedMonths'),
        where('userId', '==', userId),
        orderBy('month', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const closedMonths: ClosedMonth[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        closedMonths.push({
          id: doc.id,
          ...data,
          user_id: userId
        } as ClosedMonth)
      })
      
      return { success: true, closedMonths }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Crear o actualizar valor del dólar
  async upsertDollarValue(dollarValue: Omit<DollarValue, "id" | "created_at" | "updated_at" | "user_id">, userId: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      // Buscar si ya existe un valor para este mes
      const q = query(
        collection(db, 'dollarValues'),
        where('userId', '==', userId),
        where('month', '==', dollarValue.month)
      )
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        // Actualizar existente
        const docRef = doc(db, 'dollarValues', querySnapshot.docs[0].id)
        await updateDoc(docRef, {
          value: dollarValue.value,
          updatedAt: Timestamp.now()
        })
        return { success: true, id: querySnapshot.docs[0].id }
      } else {
        // Crear nuevo
        const docRef = await addDoc(collection(db, 'dollarValues'), {
          ...dollarValue,
          userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
        return { success: true, id: docRef.id }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Obtener valores del dólar
  async getDollarValues(userId: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      const q = query(
        collection(db, 'dollarValues'),
        where('userId', '==', userId),
        orderBy('month', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const dollarValues: DollarValue[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        dollarValues.push({
          id: doc.id,
          ...data,
          user_id: userId
        } as DollarValue)
      })
      
      return { success: true, dollarValues }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Eliminar valor del dólar
  async deleteDollarValue(id: string) {
    if (!isFirebaseEnabled) {
      return { success: false, error: 'Firebase no está configurado' }
    }

    try {
      const { db } = await import('./firebase')
      if (!db) {
        return { success: false, error: 'Firebase no está configurado' }
      }

      await deleteDoc(doc(db, 'dollarValues', id))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
} 