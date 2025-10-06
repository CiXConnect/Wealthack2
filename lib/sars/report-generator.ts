import type { Transaction } from "@/lib/types/transaction"

export interface SARSReportData {
  reportType: string
  periodStart: Date
  periodEnd: Date
  totalIncome: number
  totalExpenses: number
  deductibleExpenses: number
  taxableIncome: number
  vatInput: number
  vatOutput: number
  netVAT: number
  transactions: Transaction[]
  categoryBreakdown: Record<string, number>
}

export function generateSARSReport(
  transactions: Transaction[],
  reportType: string,
  periodStart: Date,
  periodEnd: Date,
): SARSReportData {
  // Filter transactions by date range
  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.transaction_date)
    return date >= periodStart && date <= periodEnd
  })

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const deductibleExpenses = filteredTransactions
    .filter((t) => t.type === "debit" && t.is_deductible)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const taxableIncome = totalIncome - deductibleExpenses

  // Calculate VAT (15% in South Africa)
  const vatRate = 0.15
  const vatOutput = totalIncome * vatRate
  const vatInput = deductibleExpenses * vatRate
  const netVAT = vatOutput - vatInput

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {}
  filteredTransactions.forEach((t) => {
    const category = t.sars_category || t.category || "Uncategorized"
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + Number(t.amount)
  })

  return {
    reportType,
    periodStart,
    periodEnd,
    totalIncome,
    totalExpenses,
    deductibleExpenses,
    taxableIncome,
    vatInput,
    vatOutput,
    netVAT,
    transactions: filteredTransactions,
    categoryBreakdown,
  }
}

export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })
}
