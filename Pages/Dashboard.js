
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Subscription } from "@/entities/Subscription";
import { BankStatement } from "@/entities/BankStatement";
import { FinancialReport } from "@/entities/FinancialReport";
import { Account } from "@/entities/Account"; // Added Account entity
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertCircle,
  Upload,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null); // Added activeAccount state
  const [subscription, setSubscription] = useState(null);
  const [statements, setStatements] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState(null);

  const calculateFinancialData = useCallback((statements) => {
    const completed = statements.filter(s => s.processing_status === "completed");
    
    if (completed.length === 0) {
      setFinancialData(null);
      return;
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const monthlyData = {};
    const categoryData = {};

    completed.forEach(statement => {
      if (statement.ai_insights) {
        totalIncome += statement.ai_insights.total_income || 0;
        totalExpenses += statement.ai_insights.total_expenses || 0;

        // Aggregate categories
        if (statement.ai_insights.categories) {
          Object.entries(statement.ai_insights.categories).forEach(([category, amount]) => {
            categoryData[category] = (categoryData[category] || 0) + amount;
          });
        }
      }
    });

    const categoryChartData = Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    setFinancialData({
      totalIncome,
      totalExpenses,
      netCashflow: totalIncome - totalExpenses,
      categoryChartData
    });
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeAccountId = localStorage.getItem('activeAccountId');
      if (!activeAccountId) {
        setIsLoading(false);
        // In a real application, you might want to redirect to an account selection
        // or onboarding page if no active account is set.
        console.warn("No active account found in localStorage.");
        return;
      }
      
      const [currentUser, account] = await Promise.all([
          User.me(),
          Account.get(activeAccountId)
      ]);
      
      setUser(currentUser);
      setActiveAccount(account);

      const [subs, userStatements, userReports] = await Promise.all([
        Subscription.filter({ account_id: activeAccountId }, "-created_date", 1),
        BankStatement.filter({ account_id: activeAccountId }, "-created_date"),
        FinancialReport.filter({ account_id: activeAccountId }, "-created_date")
      ]);

      if (subs.length > 0) {
        setSubscription(subs[0]);
      } else {
        setSubscription(null); // Clear subscription if none found for the account
      }
      setStatements(userStatements);
      setReports(userReports);
      calculateFinancialData(userStatements);
    } catch (error) {
      if (error.message && error.message.includes('not found')) {
          localStorage.removeItem('activeAccountId');
          // Use react-router navigation instead of window.location.reload()
          // This might require passing `navigate` from `useNavigate` hook if used inside a component.
          // For now, a reload is a simpler fix.
          window.location.reload();
          return;
      }
      console.error("Error loading dashboard data:", error);
      // Optionally, set an error state to display to the user
    }
    setIsLoading(false);
  }, [calculateFinancialData]); // Dependency array updated

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // If no active account is loaded, show a message or redirect
  if (!activeAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 md:p-8 space-y-4 text-center">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-bold text-foreground">No Active Account Selected</h2>
        <p className="text-muted-foreground">
          Please select an account from the sidebar or create a new one to get started.
        </p>
        {/* Potentially add a link to account selection page here */}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-foreground">
            {activeAccount?.account_type === 'business' ? 'Business' : 'Personal'} Dashboard
          </h1>
          {activeAccount && (
            <Badge variant="secondary">
              {activeAccount.account_type === "business" ? "Business Account" : "Personal Account"}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Welcome back! Here's your financial overview for this account.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-100">
                Total Income
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R {(financialData?.totalIncome || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-600 to-pink-500 text-white shadow-lg">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-100">
                Total Expenses
              </CardTitle>
              <TrendingDown className="w-5 h-5 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R {(financialData?.totalExpenses || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-indigo-100">
                Net Cashflow
              </CardTitle>
              <DollarSign className="w-5 h-5 text-white" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold`}>
              R {(financialData?.netCashflow || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-lg">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-violet-100">
                Reports Generated
              </CardTitle>
              <FileText className="w-5 h-5 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {financialData && financialData.categoryChartData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={financialData.categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {financialData.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R ${(value || 0).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Spending Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData.categoryChartData} margin={{ top: 5, right: 20, left: 20, bottom: 90 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                  <YAxis tickFormatter={(value) => `R${((value || 0)/1000).toLocaleString()}k`} />
                  <Tooltip formatter={(value) => `R ${(value || 0).toLocaleString()}`} />
                  <Bar dataKey="value" fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-muted">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Financial Data Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Upload your bank statements to see detailed analytics and insights.
            </p>
            <Link to={createPageUrl("Upload")}>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Statements
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Statements</CardTitle>
          </CardHeader>
          <CardContent>
            {statements.length > 0 ? (
              <div className="space-y-3">
                {statements.slice(0, 5).map((statement) => (
                  <div key={statement.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{statement.file_name}</p>
                      <p className="text-sm text-muted-foreground">{statement.bank_name}</p>
                    </div>
                    <Badge
                      variant={
                        statement.processing_status === "completed"
                          ? "default"
                          : statement.processing_status === "processing"
                          ? "secondary"
                          : "destructive"
                      }
                      className={statement.processing_status === "completed" ? "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20" : ""}
                    >
                      {statement.processing_status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No statements uploaded yet for this account.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <Link to={createPageUrl(`Reports`)} key={report.id} className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium text-foreground">
                        {report.report_type.replace(/_/g, " ").toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">{report.report_period}</p>
                    </div>
                    <FileText className="w-5 h-5 text-primary" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No reports generated yet for this account.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
