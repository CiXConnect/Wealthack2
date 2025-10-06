export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "debit" | "credit"
  category: string
  subcategory?: string
  merchant?: string
  isSarsDeductible: boolean
  sarsCategory?: string
  confidence: number
}

export interface ProcessedDocument {
  id: string
  fileName: string
  fileType: string
  uploadDate: string
  status: "processing" | "completed" | "error"
  transactions: Transaction[]
  summary: {
    totalIncome: number
    totalExpenses: number
    transactionCount: number
    dateRange: {
      start: string
      end: string
    }
  }
}

export interface SarsCategory {
  code: string
  name: string
  description: string
  keywords: string[]
  maxDeduction?: number
}
