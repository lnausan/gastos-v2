declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any)
    setFont(fontName: string): void
    setFontSize(size: number): void
    text(text: string, x: number, y: number): void
    getNumberOfPages(): number
    setPage(pageNumber: number): void
    save(filename: string): void
    internal: {
      pageSize: {
        height: number
        width: number
      }
    }
    lastAutoTable: {
      finalY: number
    }
  }
}

declare module 'jspdf-autotable' {
  import jsPDF from 'jspdf'
  
  interface AutoTableOptions {
    startY?: number
    head?: string[][]
    body?: string[][]
    theme?: string
    headStyles?: {
      fillColor?: number[]
      textColor?: number
      fontStyle?: string
    }
    styles?: {
      fontSize?: number
    }
    columnStyles?: {
      [key: number]: {
        cellWidth?: number
        halign?: string
        fontStyle?: string
      }
    }
    alternateRowStyles?: {
      fillColor?: number[]
    }
  }
  
  function autoTable(doc: jsPDF, options: AutoTableOptions): void
  
  export default autoTable
} 