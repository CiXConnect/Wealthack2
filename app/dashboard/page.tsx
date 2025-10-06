import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingDown, TrendingUp, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User"

  return (
    <div className="flex min-h-screen">
      <DashboardNav />

      <main className="flex-1 lg:ml-64">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back, {displayName}</h1>
            <p className="text-muted-foreground">Here's your financial overview for this month</p>
          </div>

          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Balance"
              value="R 45,230"
              change="+12.5% from last month"
              changeType="positive"
              icon={Wallet}
            />
            <StatCard
              title="Total Income"
              value="R 28,500"
              change="+5.2% from last month"
              changeType="positive"
              icon={TrendingUp}
            />
            <StatCard
              title="Total Expenses"
              value="R 18,750"
              change="-8.3% from last month"
              changeType="positive"
              icon={TrendingDown}
            />
            <StatCard title="Documents" value="12" change="3 pending processing" changeType="neutral" icon={FileText} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Grocery Store", amount: "-R 1,250", date: "Today", category: "Groceries" },
                    { name: "Salary Deposit", amount: "+R 28,500", date: "Yesterday", category: "Income" },
                    { name: "Electricity Bill", amount: "-R 850", date: "2 days ago", category: "Utilities" },
                    { name: "Restaurant", amount: "-R 420", date: "3 days ago", category: "Dining" },
                  ].map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                      <p
                        className={`font-semibold ${
                          transaction.amount.startsWith("+") ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {transaction.amount}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full group bg-transparent" asChild>
                  <Link href="/dashboard/transactions">
                    View All Transactions
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with these common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/dashboard/upload">
                    <FileText className="mr-2 h-4 w-4" />
                    Upload Bank Statement
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/dashboard/reports">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/dashboard/chat">
                    <FileText className="mr-2 h-4 w-4" />
                    Ask AI Advisor
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Where your money went this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: "Groceries", amount: "R 4,500", percentage: 24 },
                  { category: "Transport", amount: "R 3,200", percentage: 17 },
                  { category: "Utilities", amount: "R 2,800", percentage: 15 },
                  { category: "Entertainment", amount: "R 2,100", percentage: 11 },
                  { category: "Other", amount: "R 6,150", percentage: 33 },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">{item.amount}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
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
