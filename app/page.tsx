import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import TabNavigation from "@/components/tab-navigation"

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-800 text-zinc-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<div className="animate-pulse p-8 text-center">Loading application...</div>}>
          <TabNavigation />
        </Suspense>
      </div>
      <Toaster />
    </main>
  )
}
