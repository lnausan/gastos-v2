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
import { db } from './firebase'
import { Transaction, DollarValue, ClosedMonth } from '@/types/transaction'

export const transactionsService = {
  // Agregar una nueva transacción
  async addTransaction(transaction: Omit<Transaction, "id" | "created_at" | "updated_at" | "user_id">, userId: string) {
    try {
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
      return { success: false, error: error.message }
    }
  },

  // Actualizar una transacción
  async updateTransaction(id: string, transaction: Partial<Transaction>) {
    try {
      const docRef = doc(db, 'transactions', id)
      
      const updatePayload: { [key: string]: any } = { ...transaction, updatedAt: Timestamp.now() }

      if (transaction.date) {
        updatePayload.date = Timestamp.fromDate(new Date(transaction.date))
      }

      await updateDoc(docRef, updatePayload)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Eliminar una transacción
  async deleteTransaction(id: string) {
    try {
      await deleteDoc(doc(db, 'transactions', id))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Obtener todas las transacciones de un usuario
  async getTransactions(userId: string) {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
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
      
      return { success: true, transactions }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Obtener transacciones por mes
  async getTransactionsByMonth(userId: string, month: string) {
    try {
      const startDate = new Date(month + '-01')
      const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1) - 1)
      
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

  // Archivar transacciones de un mes específico
  async archiveMonthTransactions(userId: string, month: string) {
    try {
      const startDate = new Date(month + '-01')
      const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1) - 1)
      
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        where('archived', '==', false)
      )
      
      const querySnapshot = await getDocs(q)
      const batch = writeBatch(db)
      
      querySnapshot.forEach((docSnapshot) => {
        const docRef = doc(db, 'transactions', docSnapshot.id)
        batch.update(docRef, { 
          archived: true, 
          updatedAt: Timestamp.now() 
        })
      })
      
      await batch.commit()
      return { success: true, archivedCount: querySnapshot.size }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Guardar mes cerrado
  async saveClosedMonth(closedMonth: Omit<ClosedMonth, "id" | "user_id">, userId: string) {
    try {
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
    try {
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
          month: data.month,
          income: data.income,
          expense: data.expense,
          balance: data.balance,
          transaction_count: data.transaction_count,
          closed_at: data.closedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          user_id: data.userId,
          carry_over_amount: data.carry_over_amount
        } as ClosedMonth)
      })
      
      return { success: true, closedMonths }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Agregar o actualizar valor del dólar
  async upsertDollarValue(dollarValue: Omit<DollarValue, "id" | "created_at" | "updated_at" | "user_id">, userId: string) {
    try {
      // Buscar si ya existe un valor para ese mes
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
          month: dollarValue.month,
          value: dollarValue.value,
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

  // Obtener todos los valores del dólar de un usuario
  async getDollarValues(userId: string) {
    try {
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
          month: data.month,
          value: data.value,
          user_id: data.userId,
          created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as DollarValue)
      })
      
      return { success: true, dollarValues }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Eliminar valor del dólar
  async deleteDollarValue(id: string) {
    try {
      await deleteDoc(doc(db, 'dollarValues', id))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
} 