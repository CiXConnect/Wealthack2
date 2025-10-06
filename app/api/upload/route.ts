import { type NextRequest, NextResponse } from "next/server"
import { parseCSV } from "@/lib/parsers/csv-parser"
import { parsePDF } from "@/lib/parsers/pdf-parser"
import { categorizeBatch } from "@/lib/categorization/ai-categorizer"
import type { Transaction, ProcessedDocument } from "@/lib/types/transaction"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Processing file:", file.name, file.type)

    let transactions: Transaction[] = []

    // Parse based on file type
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      const content = await file.text()
      transactions = await parseCSV(content)
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const buffer = await file.arrayBuffer()
      transactions = await parsePDF(buffer)
    } else if (file.name.endsWith(".ofx")) {
      // OFX parsing would go here
      return NextResponse.json({ error: "OFX format not yet supported" }, { status: 400 })
    } else {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 400 })
    }

    console.log("[v0] Extracted", transactions.length, "transactions")

    // Categorize transactions using AI
    const categorizedTransactions = await categorizeBatch(transactions)

    console.log("[v0] Categorized", categorizedTransactions.length, "transactions")

    // Calculate summary
    const totalIncome = categorizedTransactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = categorizedTransactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0)

    const dates = categorizedTransactions.map((t) => new Date(t.date).getTime()).filter((d) => !isNaN(d))

    const processedDocument: ProcessedDocument = {
      id: `doc_${Date.now()}`,
      fileName: file.name,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      status: "completed",
      transactions: categorizedTransactions,
      summary: {
        totalIncome,
        totalExpenses,
        transactionCount: categorizedTransactions.length,
        dateRange: {
          start: dates.length > 0 ? new Date(Math.min(...dates)).toISOString().split("T")[0] : "",
          end: dates.length > 0 ? new Date(Math.max(...dates)).toISOString().split("T")[0] : "",
        },
      },
    }

    return NextResponse.json(processedDocument)
  } catch (error) {
    console.error("[v0] Error processing file:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}
