import { generateObject } from "ai"
import { z } from "zod"
import type { Transaction } from "../types/transaction"
import { matchSarsCategory } from "../sars-categories"

const categorizationSchema = z.object({
  category: z.string().describe("The main category of the transaction"),
  subcategory: z.string().optional().describe("A more specific subcategory if applicable"),
  merchant: z.string().optional().describe("The merchant or business name"),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0 and 1"),
})

const categories = [
  "Groceries",
  "Transport",
  "Utilities",
  "Entertainment",
  "Dining",
  "Healthcare",
  "Insurance",
  "Education",
  "Shopping",
  "Income",
  "Savings",
  "Investments",
  "Donations",
  "Other",
]

export async function categorizeTransaction(transaction: Transaction): Promise<Transaction> {
  try {
    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: categorizationSchema,
      prompt: `Categorize this financial transaction for a South African user:
      
Description: ${transaction.description}
Amount: R ${transaction.amount}
Type: ${transaction.type}

Available categories: ${categories.join(", ")}

Provide the most appropriate category, subcategory (if applicable), merchant name, and your confidence level.`,
    })

    // Check if this matches any SARS deductible category
    const sarsCategory = matchSarsCategory(transaction.description, object.category)

    return {
      ...transaction,
      category: object.category,
      subcategory: object.subcategory,
      merchant: object.merchant,
      confidence: object.confidence,
      isSarsDeductible: !!sarsCategory,
      sarsCategory: sarsCategory?.name,
    }
  } catch (error) {
    console.error("[v0] Error categorizing transaction:", error)
    return transaction
  }
}

export async function categorizeBatch(transactions: Transaction[]): Promise<Transaction[]> {
  // Process in batches to avoid rate limits
  const batchSize = 5
  const categorized: Transaction[] = []

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize)
    const results = await Promise.all(batch.map((txn) => categorizeTransaction(txn)))
    categorized.push(...results)
  }

  return categorized
}
