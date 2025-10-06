import type { SarsCategory } from "./types/transaction"

export const sarsCategories: SarsCategory[] = [
  {
    code: "4005",
    name: "Medical Aid Contributions",
    description: "Medical scheme contributions paid",
    keywords: ["medical aid", "medical scheme", "discovery health", "bonitas", "momentum health"],
  },
  {
    code: "4006",
    name: "Retirement Annuity Contributions",
    description: "Contributions to retirement annuity funds",
    keywords: ["retirement annuity", "ra contribution", "pension fund", "provident fund"],
  },
  {
    code: "4007",
    name: "Medical Expenses",
    description: "Out-of-pocket medical expenses not covered by medical aid",
    keywords: ["pharmacy", "doctor", "hospital", "dentist", "optometrist", "physiotherapy", "medical expenses"],
  },
  {
    code: "4008",
    name: "Donations",
    description: "Donations to approved public benefit organizations",
    keywords: ["donation", "charity", "npo", "pbo", "section 18a"],
  },
  {
    code: "4009",
    name: "Travel Allowance",
    description: "Business travel expenses",
    keywords: ["fuel", "petrol", "diesel", "toll fees", "parking", "car maintenance"],
  },
  {
    code: "4010",
    name: "Home Office Expenses",
    description: "Expenses related to home office for business use",
    keywords: ["internet", "electricity", "office supplies", "stationery"],
  },
]

export function matchSarsCategory(description: string, category: string): SarsCategory | null {
  const searchText = `${description} ${category}`.toLowerCase()

  for (const sarsCategory of sarsCategories) {
    for (const keyword of sarsCategory.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return sarsCategory
      }
    }
  }

  return null
}
