"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Loader2, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Preset donation amounts
const PRESET_AMOUNTS = [5, 10, 25, 50]

export default function DonateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [donationAmount, setDonationAmount] = useState<number | string>("")
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount)
    setIsCustomAmount(false)
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow empty string or valid numbers
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setDonationAmount(value)
      setIsCustomAmount(true)
    }
  }

  const handleDonateSubmit = async () => {
    // Validate amount
    const amount = Number(donationAmount)
    if (isNaN(amount) || amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount of at least $1.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

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

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: "Could not connect to payment processor. Please try again later.",
        variant: "destructive",
      })
      setIsLoading(false)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md 
            bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 
            border border-gray-200 hover:border-sky-400 transition-all duration-200"
          aria-label="Support this project with a donation"
          onClick={() => setOpen(true)}
        >
          <Heart className="h-4 w-4 text-sky-500" />
          <span>Support This Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-800">Support PromptPrint</DialogTitle>
          <DialogDescription className="text-gray-600">
            Your donation helps us maintain and improve this tool for measuring the environmental impact of AI.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {PRESET_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                variant={donationAmount === amount && !isCustomAmount ? "default" : "outline"}
                className={`${
                  donationAmount === amount && !isCustomAmount
                    ? "bg-sky-500 hover:bg-sky-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                } border-gray-200`}
                onClick={() => handleAmountSelect(amount)}
              >
                ${amount}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Custom amount"
                className="pl-8 bg-white border-gray-200 focus:border-sky-400 text-gray-800"
                value={donationAmount}
                onChange={handleCustomAmountChange}
                onFocus={() => setIsCustomAmount(true)}
              />
            </div>
          </div>
          {isCustomAmount && Number(donationAmount) < 1 && donationAmount !== "" && (
            <p className="text-red-500 text-xs mt-1">Minimum donation amount is $1</p>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleDonateSubmit}
            disabled={isLoading || Number(donationAmount) < 1 || donationAmount === ""}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isLoading ? "Processing..." : `Donate $${donationAmount || "0"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
