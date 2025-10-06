import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, type SARSReportData } from "@/lib/sars/report-generator"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ReportPreviewProps {
  reportData: SARSReportData
}

export function ReportPreview({ reportData }: ReportPreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="capitalize">{reportData.reportType.replace(/_/g, " ")}</CardTitle>
              <CardDescription>
                {formatDate(reportData.periodStart)} - {formatDate(reportData.periodEnd)}
              </CardDescription>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(reportData.totalIncome)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">{formatCurrency(reportData.totalExpenses)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Deductible Expenses</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(reportData.deductibleExpenses)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Taxable Income</p>
              <p className="text-2xl font-bold">{formatCurrency(reportData.taxableIncome)}</p>
            </div>
          </div>

          {reportData.reportType === "vat201" && (
            <div className="border-t pt-4">
              <h3 className="mb-4 font-semibold">VAT Summary</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">VAT Output (15%)</p>
                  <p className="text-xl font-bold">{formatCurrency(reportData.vatOutput)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">VAT Input (15%)</p>
                  <p className="text-xl font-bold">{formatCurrency(reportData.vatInput)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Net VAT Payable</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(reportData.netVAT)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="mb-4 font-semibold">Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(reportData.categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{category}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>{reportData.transactions.length} transactions in this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reportData.transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.sars_category || transaction.category} •{" "}
                    {new Date(transaction.transaction_date).toLocaleDateString("en-ZA")}
                    {transaction.is_deductible && (
                      <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Deductible</span>
                    )}
                  </p>
                </div>
                <p className={`font-semibold ${transaction.type === "credit" ? "text-primary" : ""}`}>
                  {transaction.type === "credit" ? "+" : "-"}
                  {formatCurrency(Number(transaction.amount))}
                </p>
              </div>
            ))}
            {reportData.transactions.length > 10 && (
              <p className="pt-2 text-center text-sm text-muted-foreground">
                And {reportData.transactions.length - 10} more transactions...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
