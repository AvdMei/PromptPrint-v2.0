import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

// Update the title in the metadata
export const metadata: Metadata = {
  title: "PromptPrint 2.0 - New: Autonomous AI Model Choice and Routing",
  description: "Compare the environmental footprint from different language models and enable autonomous model choice",
  icons: {
    icon: "/promptprint-logo.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <footer className="w-full py-4 text-center text-gray-500 dark:text-gray-600 text-sm">Built at Sundai</footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
