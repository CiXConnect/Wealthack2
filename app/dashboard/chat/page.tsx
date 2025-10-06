import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatPage() {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />

      <main className="flex-1 lg:ml-64">
        <div className="p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">AI Financial Advisor</h1>
            <p className="text-muted-foreground">Get personalized financial advice and insights</p>
          </div>

          <ChatInterface />
        </div>
      </main>
    </div>
  )
}
