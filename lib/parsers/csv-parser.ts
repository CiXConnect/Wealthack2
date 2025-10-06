import type { Transaction } from "../types/transaction"

export async function parseCSV(fileContent: string): Promise<Transaction[]> {
  const lines = fileContent.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  // Skip header row
  const dataLines = lines.slice(1)
  const transactions: Transaction[] = []

  for (const line of dataLines) {
    // Handle CSV with quoted fields
    const fields = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || []
    const cleanFields = fields.map((field) => field.replace(/^"|"$/g, "").trim())

    if (cleanFields.length < 3) continue

    // Common CSV formats: Date, Description, Amount or Date, Description, Debit, Credit
    const date = cleanFields[0]
    const description = cleanFields[1]
    let amount = 0
    let type: "debit" | "credit" = "debit"

    if (cleanFields.length === 3) {
      // Format: Date, Description, Amount (negative for debit)
      amount = Math.abs(Number.parseFloat(cleanFields[2].replace(/[^0-9.-]/g, "")))
      type = Number.parseFloat(cleanFields[2]) < 0 ? "debit" : "credit"
    } else if (cleanFields.length >= 4) {
      // Format: Date, Description, Debit, Credit
      const debit = Number.parseFloat(cleanFields[2].replace(/[^0-9.-]/g, "") || "0")
      const credit = Number.parseFloat(cleanFields[3].replace(/[^0-9.-]/g, "") || "0")
      amount = debit || credit
      type = debit > 0 ? "debit" : "credit"
    }

    if (amount > 0) {
      transactions.push({
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date,
        description,
        amount,
        type,
        category: "Uncategorized",
        isSarsDeductible: false,
        confidence: 0,
      })
    }
  }

  return transactions
}
