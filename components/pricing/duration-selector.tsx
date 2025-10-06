"use client"
import { Button } from "@/components/ui/button"

export type Duration = "1day" | "2weeks" | "1month" | "3months" | "6months" | "9months" | "12months"

interface DurationOption {
  value: Duration
  label: string
  discount?: string
}

const durations: DurationOption[] = [
  { value: "1day", label: "1 Day" },
  { value: "2weeks", label: "2 Weeks" },
  { value: "1month", label: "1 Month" },
  { value: "3months", label: "3 Months", discount: "Save 10%" },
  { value: "6months", label: "6 Months", discount: "Save 15%" },
  { value: "9months", label: "9 Months", discount: "Save 20%" },
  { value: "12months", label: "12 Months", discount: "Save 25%" },
]

interface DurationSelectorProps {
  value: Duration
  onChange: (duration: Duration) => void
}

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  return (
    <div className="mb-12 flex flex-col items-center gap-4">
      <h3 className="text-lg font-semibold">Select Subscription Duration</h3>
      <div className="flex flex-wrap justify-center gap-2">
        {durations.map((duration) => (
          <Button
            key={duration.value}
            variant={value === duration.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(duration.value)}
            className="relative"
          >
            {duration.label}
            {duration.discount && (
              <span className="ml-2 rounded bg-primary-foreground/20 px-1.5 py-0.5 text-xs">{duration.discount}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
