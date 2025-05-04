import { NextResponse } from "next/server"
import Stripe from "stripe"

// Check if we're in a preview environment
const isPreview = process.env.NODE_ENV !== "production"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16", // Specify the Stripe API version
})

export async function POST(request: Request) {
  try {
    const { donationAmount, successUrl, cancelUrl } = await request.json()

    // Validate required parameters
    if (!donationAmount || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Validate donation amount
    const amount = Number(donationAmount)
    if (isNaN(amount) || amount < 1) {
      return NextResponse.json({ error: "Invalid donation amount" }, { status: 400 })
    }

    // Return mock data for preview environments
    if (isPreview) {
      console.log("Preview mode: Returning mock checkout URL")
      return NextResponse.json({ url: "/donation-success" })
    }

    // Convert dollars to cents for Stripe
    const amountInCents = Math.round(amount * 100)

    // Create a checkout session with custom amount
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to PromptPrint",
              description: "Support the LLM Comparison Tool",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    // Return the checkout session URL
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)

    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
