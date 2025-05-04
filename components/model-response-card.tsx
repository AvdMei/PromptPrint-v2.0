"use client"
import { Card } from "@/components/ui/card"
import type { ModelResponse } from "./model-comparison"
import { Clock, ArrowDownSquare, ArrowUpSquare, AlertTriangle, Zap } from "lucide-react"

// Energy per token data (Wh per 1000 tokens)
const MODEL_ENERGY_DATA = {
  "meta-llama/llama-2-70b-chat": 1.12, // Updated value
  "meta-llama/llama-3.1-405b:free": 15.33,
  "deepseek/deepseek-r1:free": 2.72,
  // Gemma and Mistral intentionally left without values
}

// Model parameters (in billions)
const MODEL_PARAMETERS = {
  "meta-llama/llama-2-70b-chat": "70B",
  "meta-llama/llama-3.1-405b:free": "405B",
  "deepseek/deepseek-r1:free": "671B",
}

// CO2 emission factor (gCO2e per Wh) - global average for data centers
// Source: https://www.iea.org/reports/data-centres-and-data-transmission-networks
const CO2_FACTOR = 0.463

interface ModelResponseCardProps {
  response: ModelResponse
  modelName: string
  modelColor: string
  maxInputTokens: number
  maxOutputTokens: number
  hideClimateImpact?: boolean // Add this new prop
}

export default function ModelResponseCard({
  response,
  modelName,
  modelColor,
  maxInputTokens,
  maxOutputTokens,
  hideClimateImpact = false, // Default to showing climate impact
}: ModelResponseCardProps) {
  const inputTokenPercentage = (response.inputTokens / maxInputTokens) * 100
  const outputTokenPercentage = (response.outputTokens / maxOutputTokens) * 100
  const hasError = response.response.startsWith("Error:")

  // Calculate energy and CO2 impact based on provided data
  const totalTokens = response.inputTokens + response.outputTokens
  const energyPerThousandTokens = MODEL_ENERGY_DATA[response.model as keyof typeof MODEL_ENERGY_DATA]

  // Calculate energy in Wh and CO2 in gCO2e
  const hasEnergyData = energyPerThousandTokens !== undefined
  const energyUse = hasEnergyData ? (totalTokens / 1000) * energyPerThousandTokens : null
  const co2Impact = energyUse !== null ? energyUse * CO2_FACTOR : null

  // Get model parameters
  const parameters = MODEL_PARAMETERS[response.model as keyof typeof MODEL_PARAMETERS]

  return (
    <Card
      className={`p-4 bg-zinc-800 border-zinc-700 transition-all duration-300 hover:shadow-lg h-full flex flex-col ${
        hasError ? "border-red-500 border-opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-zinc-400"></div>
          <div>
            <h3 className="font-medium text-zinc-200">{modelName}</h3>
            {parameters && <span className="text-xs text-zinc-400">{parameters}</span>}
          </div>
          {hasError && <AlertTriangle size={16} className="text-red-500 ml-2" />}
        </div>
      </div>

      {!hasError && (
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-zinc-400">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{(response.responseTime / 1000).toFixed(2)}s</span>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowUpSquare size={14} />
            <span>{response.inputTokens}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowDownSquare size={14} />
            <span>{response.outputTokens}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap size={14} className={hasEnergyData ? "text-sky-400" : "text-zinc-500"} />
            <span className={hasEnergyData ? "text-sky-400" : "text-zinc-500"}>
              {hasEnergyData ? `${energyUse?.toFixed(4)} Wh` : "No data"}
            </span>
          </div>
        </div>
      )}

      {/* Only show token visualizations if we have valid token counts and no error */}
      {!hasError && (response.inputTokens > 0 || response.outputTokens > 0) && (
        <div className="space-y-2 mb-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Input</span>
              <span>{response.inputTokens}</span>
            </div>
            <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-400 transition-all duration-500 ease-out"
                style={{ width: `${inputTokenPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Output</span>
              <span>{response.outputTokens}</span>
            </div>
            <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-400 transition-all duration-500 ease-out"
                style={{ width: `${outputTokenPercentage}%` }}
              ></div>
            </div>
          </div>

          {hasEnergyData && (
            <>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-xs text-sky-400">
                  <span>Energy</span>
                  <span>{energyUse?.toFixed(4)} Wh</span>
                </div>
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(((energyUse || 0) / 0.5) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {hasEnergyData && !hideClimateImpact && (
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Climate impact</span>
                    <span>{co2Impact?.toFixed(4)} gCO₂e</span>
                  </div>
                  <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-400 transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min(((co2Impact || 0) / 0.25) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </>
          )}

          {!hasEnergyData && (
            <div className="mt-2 p-2 bg-zinc-900 rounded-md text-xs text-zinc-500 text-center">
              No energy usage data available for this model
            </div>
          )}
        </div>
      )}

      {hasError && (
        <div className="p-2 bg-red-900 bg-opacity-20 rounded-md text-xs text-red-300 text-center">
          Failed to get response from this model
        </div>
      )}
    </Card>
  )
}
