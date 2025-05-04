"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import { Info } from "lucide-react"
import type { ModelResponse } from "./model-comparison"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Energy per token data (Wh per 1000 tokens)
const MODEL_ENERGY_DATA = {
  "meta-llama/llama-2-70b-chat": 1.12,
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

// CO2 emission factor (gCO2e per Wh)
const CO2_FACTOR = 0.463

interface ElectricityDemandGraphProps {
  responses: ModelResponse[]
}

export default function ElectricityDemandGraph({ responses }: ElectricityDemandGraphProps) {
  // Filter responses to only include models with energy data
  const modelsWithEnergyData = responses.filter(
    (response) => MODEL_ENERGY_DATA[response.model as keyof typeof MODEL_ENERGY_DATA] !== undefined,
  )

  // Calculate electricity demand for each model
  const chartData = modelsWithEnergyData.map((response) => {
    const totalTokens = response.inputTokens + response.outputTokens
    const energyPerThousandTokens = MODEL_ENERGY_DATA[response.model as keyof typeof MODEL_ENERGY_DATA] || 0
    const electricityDemand = (totalTokens / 1000) * energyPerThousandTokens
    const parameters = MODEL_PARAMETERS[response.model as keyof typeof MODEL_PARAMETERS] || "Unknown"

    return {
      name: response.modelName,
      parameters,
      electricityDemand: Number.parseFloat(electricityDemand.toFixed(4)),
      totalTokens,
      model: response.model,
    }
  })

  // Sort by electricity demand (highest first)
  chartData.sort((a, b) => b.electricityDemand - a.electricityDemand)

  // Enhanced custom tooltip component with more details
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const modelId = data.model
      const energyPerThousandTokens = MODEL_ENERGY_DATA[modelId as keyof typeof MODEL_ENERGY_DATA] || 0

      return (
        <div className="bg-zinc-800 p-3 border border-zinc-700 rounded-md shadow-lg text-sm">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-zinc-400">{data.parameters} parameters</p>
          <p className="text-zinc-300">
            <span className="text-sky-400 font-medium">{data.electricityDemand.toFixed(4)}</span> Wh
          </p>
          <div className="mt-2 pt-2 border-t border-zinc-700">
            <p className="text-zinc-400">Total Tokens: {data.totalTokens}</p>
            <p className="text-zinc-400">Energy Rate: {energyPerThousandTokens} Wh/1000 tokens</p>
            <p className="text-green-400">CO₂ Impact: {(data.electricityDemand * CO2_FACTOR).toFixed(4)} gCO₂e</p>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom formatter for X axis labels
  const formatXAxis = (value: string) => {
    return value
  }

  // If no models with energy data, show a message
  if (modelsWithEnergyData.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Estimated Electricity Demand</CardTitle>
          <CardDescription className="text-zinc-400 text-sm mt-1">based on the MEPS-2025 test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-zinc-400">
            No energy data available for the current models
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          Electricity Demand of your prompt
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-zinc-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  This graph shows the estimated electricity demand for each model based on the total tokens processed
                  and model-specific energy data.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm mt-1">based on the MEPS-2025 test</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 50,
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: "#9ca3af", fontSize: "85%" }}
                tickLine={{ stroke: "#555" }}
                axisLine={{ stroke: "#555" }}
                label={{
                  value: "Electricity Demand (Wh)",
                  position: "insideBottom",
                  offset: -10,
                  style: { fill: "#9ca3af", textAnchor: "middle", fontSize: "85%" },
                }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={(props) => {
                  const { x, y, payload } = props
                  const index = chartData.findIndex((item) => item.name === payload.value)
                  const parameters = index >= 0 ? chartData[index].parameters : ""

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={0} textAnchor="end" fill="#d1d5db" fontSize="103%">
                        {payload.value}
                      </text>
                      <text x={0} y={0} dy={18} textAnchor="end" fill="#9ca3af" fontSize="90%">
                        {parameters}
                      </text>
                    </g>
                  )
                }}
                tickLine={{ stroke: "#555" }}
                axisLine={{ stroke: "#555" }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(135, 206, 235, 0.2)" }} />
              <Bar
                dataKey="electricityDemand"
                fill="#87CEEB"
                radius={[0, 4, 4, 0]}
                // Add hover effect
                onMouseOver={(data) => {
                  return { fill: "#a5d8f7" }
                }}
                label={{
                  position: "right",
                  content: (props: any) => {
                    const { x, y, width, height, value } = props
                    const radius = 10
                    return (
                      <g>
                        <text
                          x={x + width + 5}
                          y={y + height / 2}
                          fill="#fff"
                          textAnchor="start"
                          dominantBaseline="middle"
                          fontSize="12"
                          opacity={
                            props.index === chartData.findIndex((item) => item.electricityDemand === value) ? 1 : 0
                          }
                        >
                          {value.toFixed(1)}
                        </text>
                      </g>
                    )
                  },
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-zinc-400 italic mt-1  text-right">
          Source: Van der Mei, Lal, Bakker, 2025. Under review.
        </p>
      </CardContent>
    </Card>
  )
}
