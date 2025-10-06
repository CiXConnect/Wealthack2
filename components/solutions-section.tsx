import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Briefcase, ArrowRight } from "lucide-react"

export function SolutionsSection() {
  return (
    <section id="solutions" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Built for South Africa, by South Africans
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            We understand the unique financial landscape of South Africa. Our platform is specifically tailored for
            local banks, SARS regulations, and your needs.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Personal Finance</CardTitle>
              <CardDescription className="text-base">
                Perfect for individuals who want to control spending and build better money habits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Detailed spending analysis and categorization</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Custom budget creation with smart alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Goal-oriented planning and investment insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>SARS tax optimization and filing assistance</span>
                </li>
              </ul>
              <Button className="w-full group" asChild>
                <Link href="/pricing#personal">
                  View Personal Plans
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Briefcase className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Business Finance</CardTitle>
              <CardDescription className="text-base">
                Complete financial management for entrepreneurs and business owners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>Multi-user access and team collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>VAT, PAYE, and payroll management</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>Full SARS-compliant reporting (ITR14, VAT201, EMP201)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>Business plan drafting and financial statements</span>
                </li>
              </ul>
              <Button className="w-full group" variant="secondary" asChild>
                <Link href="/pricing#business">
                  View Business Plans
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
