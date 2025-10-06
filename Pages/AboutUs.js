
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  PiggyBank, 
  TrendingUp, 
  MessageSquare, 
  BarChart3,
  Shield,
  Users,
  CheckCircle,
  Sparkles,
  Home, // Added Home icon
  ArrowUp // Added ArrowUp icon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AboutUs() {
  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex justify-end items-center">
            <Link to={createPageUrl('Landing')}>
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68de9e486fce6eca7306d0e2/4dd13d4d2_WhatsAppImage2025-10-02at2046181.jpeg"
              alt="WealthHack Logo"
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-6">
            Your Personal AI Bookkeeper
          </h1>
          <p className="text-xl text-blue-200 text-center max-w-3xl mx-auto">
            WealthHack is more than just financial software - it's your dedicated financial partner, 
            helping you understand, manage, and grow your wealth through intelligent insights and personalized guidance.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        {/* What We Do */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What We Do
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Think of WealthHack as your own personal bookkeeper and financial advisor - 
              available 24/7, powered by advanced AI, and tailored to South African financial needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Analyze Your Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Upload your bank statements and watch as our AI automatically categorizes every transaction, 
                  showing you exactly where your money goes each month - from groceries to entertainment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-4">
                  <PiggyBank className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Smart Budgeting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Based on your spending patterns, we create realistic budgets that actually work. 
                  We'll show you where you're overspending and suggest practical ways to save more each month.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Goal-Oriented Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Set financial goals - buying a house, saving for retirement, or planning a vacation. 
                  We'll create a personalized roadmap showing exactly how to achieve them.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Features */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Interactive Financial Insights
            </h2>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto">
              WealthHack doesn't just show you numbers - it talks to you about your finances
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Smart Questions
              </h3>
              <p className="text-slate-600 mb-4">
                Our AI asks you relevant questions about your spending habits:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>"We noticed you spent R2,500 on takeaways last month. Would you like to set a budget?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>"Your grocery spending is 30% higher than average. Want tips to save?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>"You have R1,200 left over. Should we move it to savings?"</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Goal Tracking
              </h3>
              <p className="text-slate-600 mb-4">
                Set goals and get personalized action plans:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Save R50,000 for holiday:</strong> "Save R4,200/month for 12 months"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Emergency fund:</strong> "You need 6 months expenses = R72,000"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Debt payoff:</strong> "Pay R3,500/month to be debt-free in 18 months"</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Waste Money Tracking */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Stop Wasting Money
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We identify where you're losing money without realizing it
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-amber-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
                <CardTitle className="text-2xl text-amber-900">Hidden Expenses</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Forgotten Subscriptions</p>
                      <p className="text-sm text-slate-600">Gym memberships you don't use, streaming services you forgot about</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Banking Fees</p>
                      <p className="text-sm text-slate-600">Unnecessary charges that could be avoided with account changes</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Impulse Purchases</p>
                      <p className="text-sm text-slate-600">Small daily expenses that add up to thousands monthly</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Late Payment Fees</p>
                      <p className="text-sm text-slate-600">Penalties that could be prevented with better planning</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
                <CardTitle className="text-2xl text-emerald-900">Money-Saving Insights</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Better Alternatives</p>
                      <p className="text-sm text-slate-600">"Switch to Store A for groceries - save R800/month"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Bulk Buying Opportunities</p>
                      <p className="text-sm text-slate-600">"Buy in bulk and save 20% on household items"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Consolidation Tips</p>
                      <p className="text-sm text-slate-600">"Combine debts to save R450/month in interest"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Tax Deductions</p>
                      <p className="text-sm text-slate-600">"Claim R15,000 in tax deductions you're missing"</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Package Selection */}
        <section className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Choose Your Financial Journey
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Select a package that matches your financial goals and get personalized assistance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/20">
              <h3 className="text-2xl font-bold mb-4">Budget Master</h3>
              <p className="text-blue-100 mb-4">
