"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText } from "lucide-react"

const reportTypes = [
  { value: "personal_tax", label: "Personal Tax Summary" },
  { value: "itr14", label: "ITR14 - Company Income Tax Return" },
  { value: "vat201", label: "VAT201 - VAT Return" },
  { value: "emp201", label: "EMP201 - Employer Declaration" },
  { value: "cashflow", label: "Cashflow Statement" },
  { value: "balance_sheet", label: "Balance Sheet" },
]

export function ReportGeneratorForm() {
  const [reportType, setReportType] = useState("")
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!reportType || !periodStart || !periodEnd) {
      alert("Please fill in all fields")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          periodStart,
          periodEnd,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate report")

      const data = await response.json()

      // Download the report or redirect to view it
      if (data.reportId) {
        window.location.href = `/dashboard/reports/${data.reportId}`
      }
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Failed to generate report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Report</CardTitle>
        <CardDescription>Create SARS-compliant financial reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reportType">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger id="reportType">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="periodStart">Period Start</Label>
            <Input id="periodStart" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="periodEnd">Period End</Label>
            <Input id="periodEnd" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </CardContent>
    </Card>
  )
}
