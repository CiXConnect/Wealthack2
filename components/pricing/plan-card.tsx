import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

interface PlanCardProps {
  name: string
  price: number
  duration: string
  description: string
  features: string[]
  popular?: boolean
  requiresVerification?: boolean
  ctaText?: string
  ctaHref?: string
}

export function PlanCard({
  name,
  price,
  duration,
  description,
  features,
  popular = false,
  requiresVerification = false,
  ctaText = "Subscribe Now",
  ctaHref = "/signup",
}: PlanCardProps) {
  return (
    <Card className={`relative flex flex-col ${popular ? "border-primary shadow-lg shadow-primary/20" : ""}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            POPULAR
          </span>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">R {price.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground">Once-off for {duration}</p>
          <p className="text-xs text-muted-foreground">Billed once for the full period.</p>
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {requiresVerification ? (
          <Button className="w-full bg-transparent" variant="outline" disabled>
            Verification Required
          </Button>
        ) : (
          <Button className="w-full" variant={popular ? "default" : "outline"} asChild>
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
