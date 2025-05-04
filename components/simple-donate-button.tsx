"use client"

import { useState, useEffect } from "react"
import { Heart, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DonationModal from "./donation-modal"

export default function SimpleDonateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const { toast } = useToast()

  // Check if we're in a preview environment
  useEffect(() => {
    const checkPreview = () => {
      return (
        process.env.NODE_ENV !== "production" ||
        window.location.hostname.includes("v0.dev") ||
        window.location.hostname.includes("localhost")
      )
    }
    setIsPreview(checkPreview())
  }, [])

  const handleCreateCheckoutSession = async (amount: number) => {
    setIsLoading(true)
    setIsModalOpen(false)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationAmount: amount,
          successUrl: `${window.location.origin}/donation-success`,
          cancelUrl: `${window.location.origin}/`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout or success page in preview
      window.location.href = url
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: "Could not connect to payment processor. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md 
          bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white 
          border border-zinc-700 hover:border-sky-400 transition-all duration-200"
        aria-label="Support this project with a donation"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        ) : (
          <Heart className="h-4 w-4 text-sky-400" />
        )}
        <span>Support This Project</span>
      </button>

      <DonationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onDonate={handleCreateCheckoutSession}
        isPreview={isPreview}
      />
    </>
  )
}
