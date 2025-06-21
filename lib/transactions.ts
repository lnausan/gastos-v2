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
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { Transaction } from '@/types/transaction'

export const transactionsService = {
  // Agregar una nueva transacción
  async addTransaction(transaction: Omit<Transaction, "id" | "created_at" | "updated_at" | "user_id">, userId: string) {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
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
      await updateDoc(docRef, {
        ...transaction,
        updatedAt: Timestamp.now()
      })
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
        transactions.push({
          id: doc.id,
          ...data,
          date: data.date.toDate().toISOString().split('T')[0]
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
        transactions.push({
          id: doc.id,
          ...data,
          date: data.date.toDate().toISOString().split('T')[0]
        } as Transaction)
      })
      
      return { success: true, transactions }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
} 