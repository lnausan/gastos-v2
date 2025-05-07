"use client"

import { useState, useId } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useTransactions } from "@/context/transaction-context"
import type { Transaction, TransactionCategory } from "@/types/transaction"

const formSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser un número positivo"),
  type: z.enum(["ingreso", "gasto"], {
    required_error: "Debes seleccionar un tipo de transacción",
  }),
  category: z.custom<TransactionCategory>((val) => typeof val === "string", {
    message: "Debes seleccionar una categoría válida",
  }),
  date: z.date({
    required_error: "Debes seleccionar una fecha",
  }),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess?: () => void
}

export default function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formId = useId()

  const defaultValues: Partial<FormValues> = transaction
    ? {
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: new Date(transaction.date + "-01"), // Convertir YYYY-MM a Date
        notes: transaction.notes,
      }
    : {
        type: "gasto",
        date: new Date(),
      }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      // Formatear la fecha como YYYY-MM
      const formattedDate = format(values.date, "yyyy-MM")

      if (transaction) {
        // Actualizar transacción existente
        updateTransaction(transaction.id, {
          amount: values.amount,
          type: values.type,
          category: values.category,
          date: formattedDate,
          notes: values.notes,
        })
      } else {
        // Agregar nueva transacción
        addTransaction({
          amount: values.amount,
          type: values.type,
          category: values.category as Transaction["category"],
          date: formattedDate,
          notes: values.notes,
        })

        // Resetear el formulario después de agregar
        form.reset({
          amount: undefined,
          type: "gasto",
          category: undefined,
          date: new Date(),
          notes: "",
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const transactionType = form.watch("type")

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ingreso" className="text-green-500">
                      Ingreso
                    </SelectItem>
                    <SelectItem value="gasto" className="text-red-500">
                      Gasto
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transactionType === "ingreso" ? (
                      <>
                        <SelectItem value="salario">Salario</SelectItem>
                        <SelectItem value="inversiones">Inversiones</SelectItem>
                        <SelectItem value="otros_ingresos">Otros ingresos</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="alimentacion">Alimentación</SelectItem>
                        <SelectItem value="transporte">Transporte</SelectItem>
                        <SelectItem value="vivienda">Vivienda</SelectItem>
                        <SelectItem value="entretenimiento">Entretenimiento</SelectItem>
                        <SelectItem value="salud">Salud</SelectItem>
                        <SelectItem value="educacion">Educación</SelectItem>
                        <SelectItem value="otros_gastos">Otros gastos</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? (
                          format(field.value, "MMMM yyyy", { locale: es })
                        ) : (
                          <span>Selecciona un mes</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Agrega detalles adicionales sobre esta transacción"
                  className="resize-none"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>Puedes agregar información adicional sobre esta transacción.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : transaction ? "Actualizar transacción" : "Agregar transacción"}
        </Button>
      </form>
    </Form>
  )
}
