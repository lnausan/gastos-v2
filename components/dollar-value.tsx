"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DollarSign, Edit2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useTransactions } from "@/context/transaction-context"

interface DollarValueProps {
  month: string
}

const formSchema = z.object({
  value: z.coerce.number().positive("El valor debe ser un número positivo"),
})

type FormValues = z.infer<typeof formSchema>

export default function DollarValue({ month }: DollarValueProps) {
  const { getDollarValue, updateDollarValue } = useTransactions()
  const dollarValue = getDollarValue(month)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: dollarValue?.value || undefined,
    },
    values: dollarValue ? { value: dollarValue.value } : undefined,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "-01")
    return format(date, "MMMM yyyy", { locale: es })
  }

  const onSubmit = (data: FormValues) => {
    updateDollarValue(month, data.value)
    setIsDialogOpen(false)
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
          <DollarSign className="mr-2 h-5 w-5" />
          Valor del Dólar
        </CardTitle>
        <CardDescription>{formatDate(month)}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {dollarValue ? dollarValue.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
          </span>
          <span className="ml-1 text-sm text-muted-foreground">{dollarValue ? "ARS" : "No establecido"}</span>
        </div>
        {dollarValue && (
          <p className="text-xs text-muted-foreground mt-1">
            Última actualización: {format(new Date(dollarValue.updated_at), "dd/MM/yyyy HH:mm")}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Edit2 className="mr-2 h-4 w-4" />
              {dollarValue ? "Actualizar valor" : "Establecer valor"}
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="dollar-value-desc">
            <DialogHeader>
              <DialogTitle>Establecer valor del dólar</DialogTitle>
            </DialogHeader>
            <p id="dollar-value-desc" className="sr-only">
              Ingresa el valor del dólar para el mes seleccionado.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingrese el valor del dólar para {formatDate(month)}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Guardar
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
