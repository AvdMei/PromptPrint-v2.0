"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Heart, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DonationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDonate?: (amount: number) => void
  isPreview: boolean
}

const PRESET_AMOUNTS = [5, 10, 25, 50]

export default function DonationModal({ open, onOpenChange, onDonate, isPreview }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(10)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  const handleDonate = () => {
    if (isPreview) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onOpenChange(false)
        toast({
          title: "Preview Mode",
          description: "In a production environment, this would redirect to Stripe Checkout.",
        })
      }, 2000)
    } else if (onDonate) {
      onDonate(selectedAmount)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Heart className="h-5 w-5 text-sky-500" />
            Support PromptPrint
          </DialogTitle>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your support is greatly appreciated.</p>
          </div>
        ) : (
          <>
            <div className="py-4">
              <p className="text-gray-700 mb-4">
                Your donation helps us maintain and improve this tool for measuring the environmental impact of AI.
              </p>

              {isPreview && (
                <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-700">
                  <p>
                    <strong>Preview Mode:</strong> Actual payment processing is only available in the production
                    environment.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    className={`${
                      selectedAmount === amount
                        ? "bg-sky-500 hover:bg-sky-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    } border-gray-200`}
                    onClick={() => setSelectedAmount(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter className="flex sm:justify-between gap-2">
              <Button
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white" onClick={handleDonate}>
                Donate ${selectedAmount}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
