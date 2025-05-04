"use client"

import { useState } from "react"
import ModelComparison from "@/components/model-comparison"
import Documentation from "@/components/documentation"
import SmartRouting from "@/components/smart-routing"
import Image from "next/image"
import SimpleDonateButton from "./simple-donate-button"

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Image src="/promptprint-logo.png" alt="PromptPrint Logo" width={112} height={112} className="mr-4" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">PromptPrint 2.0</h1>
            <p className="text-zinc-400 mt-2">what is the environmental footprint of your AI prompt? (alpha version)</p>
            <p className="text-sky-400 text-sm mt-1">v2.2 new! Autonomous AI Model Choice and Routing</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("home")}
              className={`text-sm font-medium transition-colors hover:text-white ${
                activeTab === "home" ? "text-white border-b-2 border-sky-400 pb-1" : "text-zinc-400"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab("smart-routing")}
              className={`text-sm font-medium transition-colors hover:text-white ${
                activeTab === "smart-routing" ? "text-white border-b-2 border-sky-400 pb-1" : "text-zinc-400"
              }`}
            >
              Autonomous Routing
            </button>
            <button
              onClick={() => setActiveTab("documentation")}
              className={`text-sm font-medium transition-colors hover:text-white ${
                activeTab === "documentation" ? "text-white border-b-2 border-sky-400 pb-1" : "text-zinc-400"
              }`}
            >
              Documentation
            </button>
          </nav>
          <SimpleDonateButton />
        </div>
      </header>

      <div>
        {activeTab === "home" ? (
          <ModelComparison />
        ) : activeTab === "smart-routing" ? (
          <SmartRouting />
        ) : (
          <Documentation />
        )}
      </div>
    </div>
  )
}
