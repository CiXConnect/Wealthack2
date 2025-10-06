"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlanCard } from "./plan-card"
import { DurationSelector, type Duration } from "./duration-selector"

const durationMultipliers: Record<Duration, number> = {
  "1day": 0.033,
  "2weeks": 0.5,
  "1month": 1,
  "3months": 2.7, // 10% discount
  "6months": 5.1, // 15% discount
  "9months": 7.2, // 20% discount
  "12months": 9, // 25% discount
}

const durationLabels: Record<Duration, string> = {
  "1day": "1 Day",
  "2weeks": "2 Weeks",
  "1month": "1 Month",
  "3months": "3 Months",
  "6months": "6 Months",
  "9months": "9 Months",
  "12months": "12 Months",
}

const personalPlans = [
  {
    name: "Basic",
    basePrice: 190,
    description: "Perfect for getting started with financial management",
    features: ["Download PDFs", "5 statement uploads/month", "Basic budgeting tools", "Email support"],
  },
  {
    name: "Standard",
    basePrice: 390,
    description: "Everything you need for complete financial control",
    features: [
      "Everything in Basic",
      "Unlimited uploads",
      "Expenditure analysis",
      "AI-powered insights",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Premium",
    basePrice: 690,
    description: "Advanced analytics and professional reporting",
    features: [
      "Everything in Standard",
      "Cashflow statements",
      "Balance sheets",
      "Income statements",
      "Advanced analytics",
      "Full SARS-compliant reporting",
    ],
  },
  {
    name: "Enterprise",
    basePrice: 1290,
    description: "Complete tax filing assistance",
    features: [
      "Dedicated SARS Personal Tax Filing Module",
      "AI-assisted data preparation for your return",
      "Consolidates IRP5, medical, RA & logbook data",
      "Download a step-by-step guide (PDF/HTML) for manual eFiling",
      "Submission of IT Return",
      "Dedicated support for tax filing",
    ],
  },
]

const businessPlans = [
  {
    name: "Business Basic",
    basePrice: 220,
    description: "Essential tools for small businesses",
    features: ["All Personal Basic features", "10 statement uploads/month", "Multi-user access (2 users)"],
  },
  {
    name: "Business Standard",
    basePrice: 450,
    description: "Comprehensive business financial management",
    features: ["All Personal Standard features", "VAT & PAYE tracking", "Invoice matching"],
    popular: true,
  },
  {
    name: "Business Premium",
    basePrice: 795,
    description: "Full compliance and professional reporting",
    features: [
      "All Personal Premium features",
      "Full SARS-compliant reporting (ITR14, VAT201, EMP201)",
      "Management accounts",
    ],
  },
  {
    name: "Enterprise",
    basePrice: 1890,
    description: "Complete business tax filing solution",
    features: [
      "Dedicated Business Tax Filing Module (ITR14)",
      "AI prepares your Income Statement & Balance Sheet for SARS",
      "Consolidates data from bank statements & invoices",
      "Download a summary for easy capture on eFiling",
      "Submission of IT Return",
      "Dedicated accountant support for tax preparation",
    ],
  },
  {
    name: "Payroll",
    basePrice: 2490,
    description: "Complete payroll management system",
    features: [
      "Full SARS-Compliant Payslip Generation",
      "Automated PAYE, UIF, and SDL calculations",
      "Generates PDF payslips with company logo",
      "UIF submission-ready reports",
      "Employee self-service portal (coming soon)",
      "Requires one-time company vetting",
    ],
    requiresVerification: true,
  },
]

export function PricingTabs() {
  const [duration, setDuration] = useState<Duration>("1month")

  const calculatePrice = (basePrice: number) => {
    return Math.round(basePrice * durationMultipliers[duration])
  }

  return (
    <div>
      <DurationSelector value={duration} onChange={setDuration} />

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-8 grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="personal">Personal Plans</TabsTrigger>
          <TabsTrigger value="business">Business Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {personalPlans.map((plan) => (
              <PlanCard
                key={plan.name}
                name={plan.name}
                price={calculatePrice(plan.basePrice)}
                duration={durationLabels[duration]}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="business">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businessPlans.map((plan) => (
              <PlanCard
                key={plan.name}
                name={plan.name}
                price={calculatePrice(plan.basePrice)}
                duration={durationLabels[duration]}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                requiresVerification={plan.requiresVerification}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
