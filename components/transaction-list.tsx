"use client"

import { useState, useTransition, useEffect } from "react"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import { Edit, Trash2 } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTransactions } from "@/context/transaction-context"
import type { Transaction } from "@/types/transaction"
import TransactionForm from "@/components/transaction-form"
import { toast } from 'sonner'

interface TransactionListProps {
  month: string
  simplified?: boolean
}

const categoryLabels: Record<string, string> = {
  salario: "Salario",
  inversiones: "Inversiones",
  otros_ingresos: "Otros ingresos",
  alimentacion: "Alimentación",
  transporte: "Transporte",
  vivienda: "Vivienda",
  entretenimiento: "Entretenimiento",
  salud: "Salud",
  educacion: "Educación",
  otros_gastos: "Otros gastos",
}

export default function TransactionList({ month, simplified = false }: TransactionListProps) {
  const { getMonthTransactions, deleteTransaction } = useTransactions()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isPending, startTransition] = useTransition()
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from('categories').select('id, name')
      if (!error && data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const transactions = getMonthTransactions(month)

  // Ordenar transacciones por fecha (más recientes primero)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  const handleDelete = (id: string) => {
    setTransactionToDelete(id)
  }

  const confirmDelete = () => {
    if (!transactionToDelete) return

    startTransition(() => {
      try {
        deleteTransaction(transactionToDelete)
        toast.success('Transacción eliminada correctamente')
      } catch (error) {
        toast.error('Error al eliminar la transacción')
      } finally {
        setTransactionToDelete(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      {sortedTransactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No hay transacciones para este mes.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Monto</TableHead>
              {!simplified && <TableHead>Tipo</TableHead>}
              <TableHead>Categoría</TableHead>
              {!simplified && <TableHead>Fecha</TableHead>}
              {!simplified && <TableHead>Descripción</TableHead>}
              {!simplified && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className={transaction.type === "ingreso" ? "text-green-500" : "text-red-500"}>
                  {transaction.type === "ingreso" ? "+" : "-"}
                  {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                {!simplified && (
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        transaction.type === "ingreso"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                      }
                    >
                      {transaction.type === "ingreso" ? "Ingreso" : "Gasto"}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>{categories.find(cat => cat.id === transaction.category_id)?.name || "Sin categoría"}</TableCell>
                {!simplified && <TableCell>{formatDate(transaction.date)}</TableCell>}
                {!simplified && <TableCell>{transaction.description}</TableCell>}
                {!simplified && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Diálogo para editar transacción */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="edit-transaction-desc">
          <DialogHeader>
            <DialogTitle>Editar transacción</DialogTitle>
          </DialogHeader>
          <p id="edit-transaction-desc" className="sr-only">
            Completa los campos para editar la transacción seleccionada.
          </p>
          {editingTransaction && (
            <TransactionForm transaction={editingTransaction} onSuccess={() => setEditingTransaction(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta transacción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
