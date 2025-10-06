import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-12 text-center">
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to Hack Your Wealth?
            </h2>
            <p className="mb-8 text-pretty text-lg text-muted-foreground">
              Join thousands of South Africans taking control of their financial future. Get started in minutes.
            </p>
            <Button size="lg" className="group" asChild>
              <Link href="/signup">
                Sign Up Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
