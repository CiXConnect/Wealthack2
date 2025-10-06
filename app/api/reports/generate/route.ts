import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateSARSReport } from "@/lib/sars/report-generator"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reportType, periodStart, periodEnd } = await request.json()

    if (!reportType || !periodStart || !periodEnd) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch transactions for the period
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("transaction_date", periodStart)
      .lte("transaction_date", periodEnd)
      .order("transaction_date", { ascending: false })

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    // Generate report data
    const reportData = generateSARSReport(transactions || [], reportType, new Date(periodStart), new Date(periodEnd))

    // Save report to database
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        report_type: reportType,
        report_period_start: periodStart,
        report_period_end: periodEnd,
        report_data: reportData,
      })
      .select()
      .single()

    if (reportError) {
      console.error("Error saving report:", reportError)
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
    }

    return NextResponse.json({ reportId: report.id, reportData })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
