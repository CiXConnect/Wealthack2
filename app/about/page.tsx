import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Target, Users, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">About WealthHack</h1>
            <p className="text-xl text-muted-foreground">
              Empowering South Africans to take control of their financial future with AI-powered insights
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-12">
            <section>
              <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                WealthHack was created to solve a critical problem: most South Africans struggle to understand where
                their money goes and how to optimize their finances for SARS compliance. We believe that everyone
                deserves access to professional-grade financial tools, not just large corporations.
              </p>
            </section>

            <section>
              <h2 className="mb-6 text-3xl font-bold">What We Do</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Smart Analysis</h3>
                    <p className="text-muted-foreground">
                      Our AI analyzes your bank statements, receipts, and financial documents to identify spending
                      patterns and opportunities for savings.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">SARS Compliance</h3>
                    <p className="text-muted-foreground">
                      Generate SARS-compliant reports including ITR14, VAT201, and EMP201 with confidence, ensuring
                      you're always tax-ready.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Goal Planning</h3>
                    <p className="text-muted-foreground">
                      Set financial goals and get personalized recommendations on how to achieve them based on your
                      spending patterns.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">For Everyone</h3>
                    <p className="text-muted-foreground">
                      Whether you're an individual managing personal finances or a business owner tracking expenses,
                      WealthHack adapts to your needs.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold">Why Choose WealthHack?</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Built for South Africa:</strong> We understand the unique
                  challenges of the South African financial landscape, from SARS regulations to local banking systems.
                </p>
                <p>
                  <strong className="text-foreground">Privacy First:</strong> Your financial data is encrypted and
                  stored securely on South African servers, fully POPIA compliant.
                </p>
                <p>
                  <strong className="text-foreground">AI-Powered Insights:</strong> Get personalized financial advice
                  from our AI advisor, trained on South African financial best practices.
                </p>
                <p>
                  <strong className="text-foreground">No Bank Integration Required:</strong> Simply upload your
                  statements - no need to connect your bank account or share sensitive credentials.
                </p>
              </div>
            </section>

            <section className="rounded-lg bg-primary/5 p-8 text-center">
              <h2 className="mb-4 text-3xl font-bold">Ready to Hack Your Wealth?</h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Join thousands of South Africans taking control of their financial future
              </p>
              <a
                href="/auth/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started Free
              </a>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
