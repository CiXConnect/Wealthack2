import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"

export default function TransactionsPage() {
  const transactions = [
    {
      id: "1",
      date: "2025-01-15",
      description: "Pick n Pay - Groceries",
      amount: -1250,
      category: "Groceries",
      sarsDeductible: false,
    },
    {
      id: "2",
      date: "2025-01-14",
      description: "Salary Deposit",
      amount: 28500,
      category: "Income",
      sarsDeductible: false,
    },
    {
      id: "3",
      date: "2025-01-13",
      description: "Discovery Health Medical Aid",
      amount: -3200,
      category: "Healthcare",
      sarsDeductible: true,
    },
    {
      id: "4",
      date: "2025-01-12",
      description: "Shell Fuel Station",
      amount: -850,
      category: "Transport",
      sarsDeductible: true,
    },
    {
      id: "5",
      date: "2025-01-11",
      description: "Clicks Pharmacy",
      amount: -420,
      category: "Healthcare",
      sarsDeductible: true,
    },
  ]

  return (
    <div className="flex min-h-screen">
      <DashboardNav />

      <main className="flex-1 lg:ml-64">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">View and manage your categorized transactions</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search transactions..." className="pl-9" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Automatically categorized from your uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.sarsDeductible && (
                          <Badge variant="secondary" className="text-xs">
                            SARS Deductible
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{transaction.date}</span>
                        <span>•</span>
                        <span>{transaction.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.amount > 0 ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}R {Math.abs(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
