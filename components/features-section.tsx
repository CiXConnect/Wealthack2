import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Target, FileText, Brain, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Analyze Your Spending",
    description:
      "Upload bank statements and let our AI automatically categorize transactions, revealing exactly where your money goes.",
  },
  {
    icon: Target,
    title: "Smart Budgeting",
    description: "Create realistic budgets based on your actual spending, and get alerts to help you stay on track.",
  },
  {
    icon: FileText,
    title: "Generate Pro Reports",
    description:
      "Instantly create professional, SARS-compliant reports like cashflow statements, balance sheets, and tax summaries.",
  },
  {
    icon: Brain,
    title: "AI Financial Advisor",
    description:
      "Get personalized insights and recommendations from our AI that understands South African financial regulations.",
  },
  {
    icon: Shield,
    title: "SARS & POPIA Compliant",
    description:
      "All reports meet the latest SARS requirements. Your data is encrypted and stored securely on SA servers.",
  },
  {
    icon: Zap,
    title: "Stop Wasting Money",
    description: "Identify hidden expenses, forgotten subscriptions, and unnecessary fees that drain your wealth.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            The Smart Way to Manage Your Money
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            WealthHack simplifies complex financial tasks so you can focus on what matters most.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 bg-card/50 backdrop-blur transition-colors hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
