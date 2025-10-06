import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PricingTabs } from "@/components/pricing/pricing-tabs"

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Subscription Plans</h1>
            <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
              Choose the plan that's right for your personal or business financial goals.
            </p>
          </div>

          <PricingTabs />

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Need help choosing?{" "}
              <a href="/contact" className="text-primary hover:underline">
                Contact our team
              </a>{" "}
              for personalized recommendations.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
