import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Transaction, MonthSummary, DollarValue } from '@/types/transaction'

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
]

function formatMonth(month: string) {
  const [year, m] = month.split('-')
  return `${MONTHS_ES[parseInt(m, 10) - 1]} ${year}`
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
}

// Función auxiliar para obtener el nombre de la categoría
function getCategoryName(categoryId: string): string {
  const categories: Record<string, string> = {
    'usdt': 'USDT',
    'finanzas': 'Finanzas',
    'sueldo': 'Sueldo',
    'ingreso': 'Ingreso',
    'alimentacion': 'Alimentación',
    'transporte': 'Transporte',
    'entretenimiento': 'Entretenimiento',
    'salud': 'Salud',
    'educacion': 'Educación',
    'vivienda': 'Vivienda',
    'servicios': 'Servicios',
    'ropa': 'Ropa',
    'tecnologia': 'Tecnología',
    'otros': 'Otros'
  }
  
  return categories[categoryId] || categoryId
}

export async function generateMonthlyReport(
  month: string,
  transactions: Transaction[],
  monthSummary: MonthSummary,
  dollarValue?: DollarValue
) {
  // Importación dinámica de autoTable
  const { default: autoTable } = await import('jspdf-autotable')
  
  const doc = new jsPDF()
  
  // Configurar fuente para caracteres especiales
  doc.setFont('helvetica')
  
  // Título del reporte
  const title = `Reporte Mensual - ${formatMonth(month)}`
  doc.setFontSize(20)
  doc.text(title, 20, 30)
  
  // Fecha de generación
  doc.setFontSize(12)
  const generationDate = format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
  doc.text(`Generado el ${generationDate}`, 20, 45)
  
  // Resumen del mes
  doc.setFontSize(16)
  doc.text('Resumen del Mes', 20, 65)
  
  // Tabla de resumen
  const summaryData = [
    ['Ingresos', formatCurrency(monthSummary.income)],
    ['Gastos', formatCurrency(monthSummary.expense)],
    ['Balance', formatCurrency(monthSummary.balance)],
    ['Valor del Dólar', dollarValue ? formatCurrency(dollarValue.value) : 'No establecido']
  ]
  
  autoTable(doc, {
    startY: 75,
    head: [['Concepto', 'Monto']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 12
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    }
  })
  
  // Transacciones del mes
  if (transactions.length > 0) {
    const currentY = (doc as any).lastAutoTable.finalY + 20
    doc.setFontSize(16)
    doc.text('Transacciones del Mes', 20, currentY)
    
    // Preparar datos de transacciones
    const transactionData = transactions.map(t => [
      format(new Date(t.date), 'dd/MM/yyyy'),
      t.type === 'ingreso' ? 'Ingreso' : 'Gasto',
      getCategoryName(t.category_id),
      t.description || '-',
      formatCurrency(t.amount)
    ])
    
    autoTable(doc, {
      startY: currentY + 10,
      head: [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto']],
      body: transactionData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 50 },
        4: { cellWidth: 30, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })
  }
  
  // Pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10)
  }
  
  return doc
}

export async function generateAnnualReport(
  summaries: MonthSummary[],
  dollarValues: DollarValue[]
) {
  // Importación dinámica de autoTable
  const { default: autoTable } = await import('jspdf-autotable')
  
  const doc = new jsPDF()
  
  // Configurar fuente
  doc.setFont('helvetica')
  
  // Título del reporte
  const currentYear = new Date().getFullYear()
  const title = `Reporte Anual ${currentYear}`
  doc.setFontSize(20)
  doc.text(title, 20, 30)
  
  // Fecha de generación
  doc.setFontSize(12)
  const generationDate = format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
  doc.text(`Generado el ${generationDate}`, 20, 45)
  
  // Resumen anual
  const totalIncome = summaries.reduce((sum, s) => sum + s.income, 0)
  const totalExpense = summaries.reduce((sum, s) => sum + s.expense, 0)
  const totalBalance = totalIncome - totalExpense
  
  doc.setFontSize(16)
  doc.text('Resumen Anual', 20, 65)
  
  const annualSummaryData = [
    ['Total Ingresos', formatCurrency(totalIncome)],
    ['Total Gastos', formatCurrency(totalExpense)],
    ['Balance Anual', formatCurrency(totalBalance)]
  ]
  
  autoTable(doc, {
    startY: 75,
    head: [['Concepto', 'Monto']],
    body: annualSummaryData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 12
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    }
  })
  
  // Tabla mensual
  const currentY = (doc as any).lastAutoTable.finalY + 20
  doc.setFontSize(16)
  doc.text('Resumen Mensual', 20, currentY)
  
  const monthlyData = summaries.map(s => [
    formatMonth(s.month),
    formatCurrency(s.income),
    formatCurrency(s.expense),
    formatCurrency(s.balance)
  ])
  
  autoTable(doc, {
    startY: currentY + 10,
    head: [['Mes', 'Ingresos', 'Gastos', 'Balance']],
    body: monthlyData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  })
  
  // Pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10)
  }
  
  return doc
} 