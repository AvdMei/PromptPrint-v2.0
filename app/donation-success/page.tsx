"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function DonationSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    // Check if we're in a preview environment
    const checkPreview = () => {
      return (
        process.env.NODE_ENV !== "production" ||
        window.location.hostname.includes("v0.dev") ||
        window.location.hostname.includes("localhost")
      )
    }
    setIsPreview(checkPreview())
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Heart className="h-12 w-12 text-sky-400" fill="#38bdf8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Thank You for Your Support!</h1>
        <p className="text-zinc-300 mb-8">
          Your donation helps us maintain and improve PromptPrint so we can continue to provide tools for measuring the
          environmental impact of AI.
        </p>
        {isPreview && !sessionId && (
          <div className="mb-6 p-3 bg-zinc-700/50 border border-zinc-600 rounded-md text-sm text-zinc-300">
            <p>
              <strong>Preview Mode:</strong> This is a simulated success page. In production, this would show after a
              successful Stripe payment.
            </p>
          </div>
        )}
        <Link href="/">
          <Button className="bg-sky-400 hover:bg-sky-300 text-zinc-900">Return to PromptPrint</Button>
        </Link>
      </div>
    </div>
  )
}
