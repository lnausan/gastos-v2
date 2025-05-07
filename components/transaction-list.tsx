"use client"

import { useState } from "react"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import { Edit, Trash2 } from "lucide-react"

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
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  const transactions = getMonthTransactions(month)

  // Ordenar transacciones por fecha (más recientes primero)
  const sortedTransactions = [...transactions].sort((a, b) => b.createdAt - a.createdAt)

  const formatDate = (dateString: string) => {
    const date = parse(dateString, "yyyy-MM", new Date())
    return format(date, "MMMM yyyy", { locale: es })
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
              {!simplified && <TableHead>Notas</TableHead>}
              {!simplified && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className={transaction.type === "ingreso" ? "text-green-500" : "text-red-500"}>
                  {transaction.type === "ingreso" ? "+" : "-"}
                  {transaction.amount.toFixed(2)}
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
                <TableCell>{categoryLabels[transaction.category] || transaction.category}</TableCell>
                {!simplified && <TableCell>{formatDate(transaction.date)}</TableCell>}
                {!simplified && <TableCell className="max-w-[200px] truncate">{transaction.notes || "-"}</TableCell>}
                {!simplified && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingTransaction(transaction)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingTransaction(transaction)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Diálogo para editar transacción */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar transacción</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm transaction={editingTransaction} onSuccess={() => setEditingTransaction(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción de tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingTransaction) {
                  deleteTransaction(deletingTransaction.id)
                  setDeletingTransaction(null)
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
