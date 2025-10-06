import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

const systemPrompt = `You are a helpful AI financial advisor for WealthHack, a South African financial management platform. Your role is to:

1. Help users understand their spending patterns and financial health
2. Provide budgeting advice tailored to South African context
3. Explain SARS tax regulations and deductions in simple terms
4. Suggest ways to save money and reduce expenses
5. Answer questions about financial planning, investments, and wealth building

Key context:
- Users are based in South Africa
- Currency is South African Rand (R)
- Tax authority is SARS (South African Revenue Service)
- Common deductions include medical aid, retirement annuities, donations, and travel allowances
- Be encouraging and supportive while being realistic about financial challenges

Always provide practical, actionable advice. When discussing tax matters, remind users to consult with a registered tax practitioner for complex situations.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    prompt,
    abortSignal: req.signal,
    temperature: 0.7,
    maxTokens: 1000,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat stream aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}
