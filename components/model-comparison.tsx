"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, Clock, Leaf, ArrowRight } from "lucide-react"
import ModelResponseCard from "./model-response-card"
import ElectricityDemandGraph from "./electricity-demand-graph"
import { useToast } from "@/hooks/use-toast"
import CO2ComparisonSection from "./co2-comparison-section"
import SubmissionAnimation from "./submission-animation"
import PreRunEnergyGraph from "./pre-run-energy-graph"
import PreRunCO2Graph from "./pre-run-co2-graph"

// Define the models we want to compare with their display colors
const MODEL_COLORS = {
  "meta-llama/llama-2-70b-chat": "bg-orange-500",
  "meta-llama/llama-3.1-8b-instruct": "bg-green-500",
  "deepseek/deepseek-r1:free": "bg-red-500",
}

// Model display names mapping
const MODEL_NAMES = {
  "meta-llama/llama-2-70b-chat": "Llama 2",
  "meta-llama/llama-3.1-8b-instruct": "Llama 3",
  "deepseek/deepseek-r1:free": "DeepSeek R1",
}

export interface ModelResponse {
  model: string
  modelName: string
  response: string
  inputTokens: number
  outputTokens: number
  responseTime: number
}

export default function ModelComparison() {
  const [prompt, setPrompt] = useState("Test your prompt...")
  const [isLoading, setIsLoading] = useState(false)
  const [responses, setResponses] = useState<ModelResponse[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [totalTime, setTotalTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Update elapsed time while loading
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isLoading && startTime) {
      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    } else if (!isLoading) {
      setElapsedTime(0)
      if (intervalId) clearInterval(intervalId)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isLoading, startTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to compare models.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResponses([])
    const now = Date.now()
    setStartTime(now)
    setTotalTime(null)

    try {
      // Add a timeout to the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        let errorMessage = `API returned ${response.status}`

        // Try to get error details if it's JSON
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            console.error("Failed to parse error response as JSON:", e)
          }
        } else {
          // If not JSON, try to get the text
          try {
            const errorText = await response.text()
            errorMessage = errorText || errorMessage
          } catch (e) {
            console.error("Failed to get error response text:", e)
          }
        }

        throw new Error(errorMessage)
      }

      // Parse the JSON response directly
      const data = await response.json()

      // Check if we got a valid response array
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format from API")
      }

      setResponses(data)
      setTotalTime(Math.floor((Date.now() - now) / 1000))
    } catch (error) {
      console.error("Error comparing models:", error)

      // Handle AbortError specifically
      if (error instanceof DOMException && error.name === "AbortError") {
        setError("Request timed out. Please try again with a shorter prompt.")
      } else {
        setError(error instanceof Error ? error.message : "Failed to compare models. Please try again.")
      }

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compare models. Please try again.",
        variant: "destructive",
      })

      // Provide fallback responses for a better user experience
      setResponses(
        Object.keys(MODEL_COLORS).map((modelId) => ({
          model: modelId,
          modelName: MODEL_NAMES[modelId as keyof typeof MODEL_NAMES] || modelId,
          response: `Error: Failed to get response. ${error instanceof Error ? error.message : "Unknown error"}`,
          inputTokens: 0,
          outputTokens: 0,
          responseTime: 0,
        })),
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Find the maximum token counts for visualization
  const maxInputTokens = Math.max(...responses.map((r) => r.inputTokens || 0), 1)
  const maxOutputTokens = Math.max(...responses.map((r) => r.outputTokens || 0), 1)

  // Get model information for the animation
  const modelInfo = Object.entries(MODEL_COLORS).map(([id, color]) => ({
    id,
    color,
    name: MODEL_NAMES[id as keyof typeof MODEL_NAMES] || id.split("/").pop() || id,
  }))

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="transition-transform duration-200 hover:scale-[1.01] bg-zinc-800 rounded-lg border border-zinc-700 flex items-center p-2 overflow-hidden">
          <input
            type="text"
            placeholder="Start a message..."
            className={`flex-grow bg-transparent border-none focus:outline-none ${prompt === "Test your prompt..." ? "text-zinc-600" : "text-white"} placeholder:text-zinc-600 px-3 py-2`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => {
              if (prompt === "Test your prompt...") {
                setPrompt("")
              }
            }}
            onBlur={() => {
              if (prompt.trim() === "") {
                setPrompt("Test your prompt...")
              }
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 rounded-full bg-sky-400 hover:bg-sky-300 transition-colors duration-200 flex items-center justify-center"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-900" />
            ) : (
              <div className="flex items-center">
                <Leaf className="h-5 w-5 text-zinc-900" />
                <ArrowRight className="h-4 w-4 ml-1 text-zinc-900" />
              </div>
            )}
          </button>
        </div>
        <div className="flex justify-between items-center px-2">
          {!isLoading && totalTime !== null && (
            <div className="flex items-center text-zinc-400 text-xs">
              <Clock className="mr-1 h-3 w-3" />
              <span>Total time: {formatTime(totalTime)}</span>
            </div>
          )}
          {!isLoading && totalTime === null && <div />}
        </div>
      </form>

      {/* Show error message if there is one */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300 mb-4">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-1">Please try again or check your connection.</p>
        </div>
      )}

      {/* Show pre-run graphs when not loading and no responses yet */}
      {!isLoading && responses.length === 0 && (
        <>
          <PreRunEnergyGraph />
          <PreRunCO2Graph />
        </>
      )}

      {/* Show animation when loading */}
      {isLoading && <SubmissionAnimation elapsedTime={elapsedTime} models={modelInfo} />}

      {/* Show results when not loading and have responses */}
      {!isLoading && responses.length > 0 && (
        <>
          <ElectricityDemandGraph responses={responses} />
          <CO2ComparisonSection responses={responses} />

          {totalTime !== null && (
            <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-zinc-300 text-xs">
                  <Clock className="mr-1 h-4 w-4 text-zinc-400" />
                  <span>Total processing time: {formatTime(totalTime)}</span>
                </div>
                <div className="text-zinc-400 text-xs">
                  {responses.filter((r) => !r.response.startsWith("Error:")).length} of{" "}
                  {Object.keys(MODEL_COLORS).length} models responded successfully
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {responses.map((response, index) => {
                  const hasError = response.response.startsWith("Error:")

                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-zinc-900 rounded-md">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-zinc-400 mr-2"></div>
                        <span className="text-zinc-300 text-xs">{response.modelName}</span>
                      </div>
                      <span className={`text-xs ${hasError ? "text-red-400" : "text-zinc-400"}`}>
                        {hasError ? "Failed" : `${(response.responseTime / 1000).toFixed(2)}s`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responses.map((response, index) => {
              // Use light grey for all model cards
              const modelColor = "bg-zinc-400"

              return (
                <ModelResponseCard
                  key={index}
                  response={response}
                  modelName={response.modelName}
                  modelColor={modelColor}
                  maxInputTokens={maxInputTokens}
                  maxOutputTokens={maxOutputTokens}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
