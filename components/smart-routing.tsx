"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, Clock, Zap, ArrowRight, Brain, Cpu, Search, Leaf } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ModelResponseCard from "./model-response-card"
// Add the Datacenter type import at the top of the file
import DatacenterSelector, { type Datacenter } from "./datacenter-selector"
// Add the import at the top of the file
import CO2ImpactCard from "./co2-impact-card"
// Add the import at the top of the file
import WaterFootprintCard from "./water-footprint-card"

// Define the models we want to use
const MODELS = {
  "google-search": {
    id: "google-search",
    name: "Google Search",
    description: "Fast, efficient web search for simple queries",
    latency: "Very Low",
    cost: "Very Low",
    energy: "Very Low",
    complexity: ["Very Simple"],
  },
  "meta-llama/llama-2-70b-chat": {
    id: "meta-llama/llama-2-70b-chat",
    name: "Llama 2",
    description: "Balanced performance for simple to moderate queries",
    latency: "Low",
    cost: "Low",
    energy: "Low",
    complexity: ["Simple", "Moderate"],
  },
  "meta-llama/llama-3.1-405b:free": {
    id: "meta-llama/llama-3.1-405b:free",
    name: "Llama 3",
    description: "Advanced capabilities for moderate complexity queries",
    latency: "Medium",
    cost: "Medium",
    energy: "High",
    complexity: ["Moderate", "Complex"],
  },
  "deepseek/deepseek-r1:free": {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    description: "Powerful reasoning for complex queries",
    latency: "High",
    cost: "High",
    energy: "Medium",
    complexity: ["Complex", "Very Complex"],
  },
}

// Add this after the MODELS definition
// Energy per token data (Wh per 1000 tokens)
const MODEL_ENERGY_DATA = {
  "meta-llama/llama-2-70b-chat": 1.12,
  "meta-llama/llama-3.1-405b:free": 15.33,
  "deepseek/deepseek-r1:free": 2.72,
}

// Complexity levels and their colors
const COMPLEXITY_LEVELS = {
  "Very Simple": "bg-green-500",
  Simple: "bg-emerald-500",
  Moderate: "bg-yellow-500",
  Complex: "bg-orange-500",
  "Very Complex": "bg-red-500",
}

export interface SmartRoutingResponse {
  model: string
  modelName: string
  response: string
  inputTokens: number
  outputTokens: number
  responseTime: number
  complexity: keyof typeof COMPLEXITY_LEVELS
  reasoning: string
}

export default function SmartRouting() {
  const [prompt, setPrompt] = useState("Test your prompt...")
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [response, setResponse] = useState<SmartRoutingResponse | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [totalTime, setTotalTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState({
    lowLatency: false,
    lowCost: false,
    lowEnergy: true,
  })
  const { toast } = useToast()
  // Add the datacenter state in the SmartRouting component
  const [selectedDatacenter, setSelectedDatacenter] = useState<Datacenter | null>(null)
  const [energyUsage, setEnergyUsage] = useState<number | null>(null)

  // Update elapsed time while loading
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if ((isLoading || isAnalyzing) && startTime) {
      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    } else if (!isLoading && !isAnalyzing) {
      setElapsedTime(0)
      if (intervalId) clearInterval(intervalId)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isLoading, isAnalyzing, startTime])

  // Add this function to calculate energy usage when response is received
  useEffect(() => {
    if (response && response.model !== "google-search") {
      const totalTokens = response.inputTokens + response.outputTokens
      const energyPerThousandTokens = MODEL_ENERGY_DATA[response.model as keyof typeof MODEL_ENERGY_DATA] || 0
      const calculatedEnergyUsage = (totalTokens / 1000) * energyPerThousandTokens
      setEnergyUsage(calculatedEnergyUsage)
    } else {
      setEnergyUsage(null)
    }
  }, [response])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!prompt.trim() || prompt === "Test your prompt...") {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to process.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setResponse(null)
    const now = Date.now()
    setStartTime(now)
    setTotalTime(null)

    try {
      // First agent: Model Selector - Analyze prompt and select model
      const analyzeResponse = await fetch("/api/smart-route/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          preferences,
        }),
      })

      if (!analyzeResponse.ok) {
        throw new Error(`Analysis failed: ${analyzeResponse.status}`)
      }

      const analysisResult = await analyzeResponse.json()
      setIsAnalyzing(false)
      setIsLoading(true)

      // Second agent: Query Executor - Route to selected model
      const executeResponse = await fetch("/api/smart-route/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          selectedModel: analysisResult.selectedModel,
          complexity: analysisResult.complexity,
          reasoning: analysisResult.reasoning,
        }),
      })

      if (!executeResponse.ok) {
        throw new Error(`Execution failed: ${executeResponse.status}`)
      }

      const executionResult = await executeResponse.json()

      // Combine results
      setResponse({
        model: analysisResult.selectedModel,
        modelName: MODELS[analysisResult.selectedModel as keyof typeof MODELS]?.name || analysisResult.selectedModel,
        response: executionResult.response,
        inputTokens: executionResult.inputTokens,
        outputTokens: executionResult.outputTokens,
        responseTime: executionResult.responseTime,
        complexity: analysisResult.complexity,
        reasoning: analysisResult.reasoning,
      })

      setTotalTime(Math.floor((Date.now() - now) / 1000))
    } catch (error) {
      console.error("Error in smart routing:", error)
      setError(error instanceof Error ? error.message : "Failed to process request. Please try again.")

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsAnalyzing(false)
    }
  }

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Preference Panel */}
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white">Reduce your AI footprint with our Autonomous Scheduling Agent</CardTitle>
          <CardDescription>Set your preferences to optimize model selection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="low-latency"
                checked={preferences.lowLatency}
                onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, lowLatency: checked }))}
              />
              <Label htmlFor="low-latency" className="text-zinc-300">
                Low Latency
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="low-cost"
                checked={preferences.lowCost}
                onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, lowCost: checked }))}
              />
              <Label htmlFor="low-cost" className="text-zinc-300">
                Low Cost
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="low-energy"
                checked={preferences.lowEnergy}
                onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, lowEnergy: checked }))}
              />
              <Label htmlFor="low-energy" className="text-zinc-300">
                Low Energy Usage
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Form */}
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
            disabled={isLoading || isAnalyzing}
          />
          <button
            type="submit"
            disabled={isLoading || isAnalyzing}
            className="p-2 rounded-full bg-sky-400 hover:bg-sky-300 transition-colors duration-200 flex items-center justify-center"
            aria-label="Send message"
          >
            {isLoading || isAnalyzing ? (
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
          {!isLoading && !isAnalyzing && totalTime !== null && (
            <div className="flex items-center text-zinc-400 text-xs">
              <Clock className="mr-1 h-3 w-3" />
              <span>Total time: {formatTime(totalTime)}</span>
            </div>
          )}
          {(isLoading || isAnalyzing) && (
            <div className="flex items-center text-zinc-400 text-xs">
              <Clock className="mr-1 h-3 w-3" />
              <span>Time elapsed: {formatTime(elapsedTime)}</span>
            </div>
          )}
          {!isLoading && !isAnalyzing && totalTime === null && <div />}
        </div>
      </form>

      {/* Show error message if there is one */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300 mb-4">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-1">Please try again or check your connection.</p>
        </div>
      )}

      {/* Processing States */}
      {isAnalyzing && (
        <Card className="bg-zinc-800 border-zinc-700 p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <Brain className="h-12 w-12 text-sky-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-sky-400 animate-spin"></div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-white">Model Selector Agent</h3>
              <p className="text-zinc-400 mt-1">Analyzing prompt complexity and preferences...</p>
            </div>
          </div>
        </Card>
      )}

      {isLoading && !isAnalyzing && response && (
        <Card className="bg-zinc-800 border-zinc-700 p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <Cpu className="h-12 w-12 text-sky-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-sky-400 animate-spin"></div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-white">Query Executor Agent</h3>
              <p className="text-zinc-400 mt-1">
                Processing with {MODELS[response.model as keyof typeof MODELS]?.name || response.model}...
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {!isLoading && !isAnalyzing && response && (
        <div className="space-y-6">
          {/* Model Selection Card */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Model Selection</CardTitle>
                <Badge
                  className={`${COMPLEXITY_LEVELS[response.complexity as keyof typeof COMPLEXITY_LEVELS]} text-zinc-900 text-base px-3 py-1.5 transform scale-115`}
                >
                  {response.complexity} Complexity
                </Badge>
              </div>
              <CardDescription>Based on your prompt and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center space-x-3 mb-3">
                  {response.model === "google-search" ? (
                    <Search className="h-6 w-6 text-sky-400" />
                  ) : (
                    <Brain className="h-6 w-6 text-sky-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {MODELS[response.model as keyof typeof MODELS]?.name || response.model}
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      {MODELS[response.model as keyof typeof MODELS]?.description || "Custom model"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-sm text-zinc-300">
                  <h4 className="font-medium mb-1">Selection Reasoning:</h4>
                  <p className="text-zinc-400">{response.reasoning}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-zinc-800 p-2 rounded">
                    <p className="text-xs text-zinc-500">Latency</p>
                    <p className="text-sm text-zinc-300">
                      {MODELS[response.model as keyof typeof MODELS]?.latency || "Unknown"}
                    </p>
                  </div>
                  <div className="bg-zinc-800 p-2 rounded">
                    <p className="text-xs text-zinc-500">Cost</p>
                    <p className="text-sm text-zinc-300">
                      {MODELS[response.model as keyof typeof MODELS]?.cost || "Unknown"}
                    </p>
                  </div>
                  <div className="bg-zinc-800 p-2 rounded">
                    <p className="text-xs text-zinc-500">Energy</p>
                    <p className="text-sm text-zinc-300">
                      {MODELS[response.model as keyof typeof MODELS]?.energy || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add the datacenter selector component after the model selection card in the results section */}
          {!isLoading && !isAnalyzing && response && response.model !== "google-search" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-sky-400" />
                      Energy Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModelResponseCard
                      response={{
                        model: response.model,
                        modelName: response.modelName,
                        response: response.response,
                        inputTokens: response.inputTokens,
                        outputTokens: response.outputTokens,
                        responseTime: response.responseTime,
                      }}
                      modelName={response.modelName}
                      modelColor="bg-zinc-400"
                      maxInputTokens={response.inputTokens}
                      maxOutputTokens={response.outputTokens}
                      hideClimateImpact={true} // Add this prop to hide climate impact
                    />
                  </CardContent>
                </Card>

                <WaterFootprintCard energyUsage={energyUsage} datacenter={selectedDatacenter} />
              </div>

              <CO2ImpactCard energyUsage={energyUsage} datacenter={selectedDatacenter} />

              <DatacenterSelector energyUsage={energyUsage} onSelectDatacenter={setSelectedDatacenter} />
            </>
          )}

          {/* Response Metadata Card - Replaced full response card with just metadata */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Response Metrics</CardTitle>
              <CardDescription>
                Performance metrics for {MODELS[response.model as keyof typeof MODELS]?.name || response.model}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-md">
                  <span className="text-zinc-400">Response Time</span>
                  <span className="text-zinc-300 font-medium">{(response.responseTime / 1000).toFixed(2)}s</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-md">
                  <span className="text-zinc-400">Input Tokens</span>
                  <span className="text-zinc-300 font-medium">{response.inputTokens}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-md">
                  <span className="text-zinc-400">Output Tokens</span>
                  <span className="text-zinc-300 font-medium">{response.outputTokens}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Model Comparison Table */}
      {!isLoading && !isAnalyzing && !response && (
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Available Models</CardTitle>
            <CardDescription>
              The smart routing system will select from these models based on your query
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Model</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Best For</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Latency</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Cost</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Energy</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(MODELS).map((model) => (
                    <tr key={model.id} className="border-b border-zinc-700">
                      <td className="py-3 px-4 text-white">{model.name}</td>
                      <td className="py-3 px-4 text-zinc-300">{model.complexity.join(", ")}</td>
                      <td className="py-3 px-4 text-zinc-300">{model.latency}</td>
                      <td className="py-3 px-4 text-zinc-300">{model.cost}</td>
                      <td className="py-3 px-4 text-zinc-300">{model.energy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
