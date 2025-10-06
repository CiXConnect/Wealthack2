import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { UploadZone } from "@/components/dashboard/upload-zone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default function UploadPage() {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />

      <main className="flex-1 lg:ml-64">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Upload Documents</h1>
            <p className="text-muted-foreground">Upload your bank statements, IRP5s, and receipts for analysis</p>
          </div>

          <div className="mb-6">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="flex gap-3 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Your data is secure</p>
                  <p className="text-muted-foreground">
                    All files are encrypted and stored securely on South African servers in compliance with POPIA
                    regulations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <UploadZone />

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bank Statements</CardTitle>
                <CardDescription>CSV, OFX, or PDF format</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload statements from any South African bank. We'll automatically categorize all transactions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">IRP5 Documents</CardTitle>
                <CardDescription>PDF format from employer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload your IRP5 for tax filing assistance and SARS-compliant reporting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receipts</CardTitle>
                <CardDescription>PDF or image format</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload medical receipts, donation certificates, and other deductible expenses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
