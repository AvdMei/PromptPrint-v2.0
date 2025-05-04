"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type TooltipProps,
} from "recharts"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Energy per token data (Wh per 1000 tokens)
const MODEL_ENERGY_DATA = [
  { id: "meta-llama/llama-2-70b-chat", name: "Llama 2", parameters: "70B", energyRate: 1.12 },
  { id: "meta-llama/llama-3.1-405b:free", name: "Llama 3", parameters: "405B", energyRate: 15.33 },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1", parameters: "671B", energyRate: 2.72 },
]

// CO2 emission factors by country (gCO2e per kWh)
const CO2_FACTORS = {
  "Global Average": 463,
  France: 56,
  Germany: 350,
  "United States": 379,
  China: 577,
  India: 708,
  Sweden: 13,
  Australia: 505,
}

// Grey color palette for bars
const GREY_COLORS = {
  global: "#D1D5DB", // Light grey
  country: "#9CA3AF", // Medium grey
  custom: "#6B7280", // Dark grey
}

// Assume 1000 tokens for the pre-run calculation
const EXAMPLE_TOKENS = 1000

export default function PreRunCO2Graph() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<keyof typeof CO2_FACTORS>("Global Average")
  const [customIntensity, setCustomIntensity] = useState("")
  const [showCustom, setShowCustom] = useState(false)

  // Calculate CO2 impact for each model with a specific CO2 factor
  const calculateChartData = (co2Factor: number, label: string) => {
    return MODEL_ENERGY_DATA.map((model) => {
      // Convert Wh to kWh for CO2 calculation (for 1000 tokens)
      const co2Impact = (model.energyRate / 1000) * co2Factor

      return {
        name: model.name,
        parameters: model.parameters,
        [label]: Number.parseFloat(co2Impact.toFixed(6)),
        energyRate: model.energyRate,
      }
    })
  }

  // Prepare data for the chart
  const globalData = calculateChartData(CO2_FACTORS["Global Average"], "globalCO2")
  const countryData =
    selectedCountry !== "Global Average" ? calculateChartData(CO2_FACTORS[selectedCountry], "countryCO2") : []
  const customData = showCustom && customIntensity ? calculateChartData(Number(customIntensity), "customCO2") : []

  // Merge the data for the chart
  const mergeChartData = () => {
    const result = [...globalData]

    if (countryData.length > 0) {
      countryData.forEach((countryItem, index) => {
        result[index] = { ...result[index], countryCO2: countryItem.countryCO2 }
      })
    }

    if (customData.length > 0) {
      customData.forEach((customItem, index) => {
        result[index] = { ...result[index], customCO2: customItem.customCO2 }
      })
    }

    return result.sort((a, b) => (b.globalCO2 || 0) - (a.globalCO2 || 0))
  }

  const chartData = mergeChartData()

  const handleAddCustom = () => {
    if (customIntensity && !isNaN(Number(customIntensity))) {
      setShowCustom(true)
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const modelName = label
      const model = MODEL_ENERGY_DATA.find((m) => m.name === modelName)

      if (!model) return null

      return (
        <div className="bg-zinc-800 p-3 border border-zinc-700 rounded-md shadow-lg text-sm">
          <p className="font-medium text-white">{modelName}</p>
          <p className="text-zinc-400">{model.parameters} parameters</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry, index) => (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: <span className="font-medium">{entry.value.toFixed(6)}</span> gCO₂e/kWh
              </p>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-700">
            <p className="text-zinc-400">Energy Rate: {model.energyRate} Wh/1000 tokens</p>
            <p className="text-zinc-400">This is based on the model's base energy consumption rate.</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700 mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white flex items-center">
            Climate impact of LLM model
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    This graph shows the CO₂ impact rates for each model based on their energy consumption. Run a prompt
                    to see the actual CO₂ impact based on token usage.
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm mt-1">based on the MEPS-2025 test</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-white"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
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
                    value: "CO₂ Impact (gCO₂eq/1000 tokens)",
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(209, 213, 219, 0.2)" }} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="right"
                  wrapperStyle={{
                    paddingTop: 10,
                    fontSize: "12px",
                    padding: "5px",
                    lineHeight: "20px",
                  }}
                />
                <Bar
                  dataKey="globalCO2"
                  name="Global Average"
                  fill={GREY_COLORS.global}
                  radius={[0, 6, 6, 0]}
                  label={{
                    position: "right",
                    content: (props: any) => {
                      const { x, y, width, height, value } = props
                      return (
                        <g>
                          <text
                            x={x + width + 5}
                            y={y + height / 2}
                            fill="#fff"
                            textAnchor="start"
                            dominantBaseline="middle"
                            fontSize="12"
                            opacity={props.index === chartData.findIndex((item) => item.globalCO2 === value) ? 1 : 0}
                          >
                            {value.toFixed(2)}
                          </text>
                        </g>
                      )
                    },
                  }}
                />
                {selectedCountry !== "Global Average" && (
                  <Bar
                    dataKey="countryCO2"
                    name={selectedCountry}
                    fill={GREY_COLORS.country}
                    radius={[0, 6, 6, 0]}
                    label={{
                      position: "right",
                      content: (props: any) => {
                        const { x, y, width, height, value } = props
                        return (
                          <g>
                            <text
                              x={x + width + 5}
                              y={y + height / 2}
                              fill="#fff"
                              textAnchor="start"
                              dominantBaseline="middle"
                              fontSize="12"
                              opacity={props.index === chartData.findIndex((item) => item.countryCO2 === value) ? 1 : 0}
                            >
                              {value.toFixed(2)}
                            </text>
                          </g>
                        )
                      },
                    }}
                  />
                )}
                {showCustom && customIntensity && (
                  <Bar
                    dataKey="customCO2"
                    name={`Custom (${customIntensity} gCO₂e/kWh)`}
                    fill={GREY_COLORS.custom}
                    radius={[0, 6, 6, 0]}
                    label={{
                      position: "right",
                      content: (props: any) => {
                        const { x, y, width, height, value } = props
                        return (
                          <g>
                            <text
                              x={x + width + 5}
                              y={y + height / 2}
                              fill="#fff"
                              textAnchor="start"
                              dominantBaseline="middle"
                              fontSize="12"
                              opacity={props.index === chartData.findIndex((item) => item.customCO2 === value) ? 1 : 0}
                            >
                              {value.toFixed(2)}
                            </text>
                          </g>
                        )
                      },
                    }}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-zinc-500 text-right">Source: IEA</div>

          {/* Controls moved below the graph */}
          <div className="mt-6 p-4 bg-zinc-800 rounded-md border border-zinc-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-zinc-400 mb-1">Add CO₂ Intensity by Country</label>
                <Select
                  value={selectedCountry}
                  onValueChange={(value) => {
                    setSelectedCountry(value as keyof typeof CO2_FACTORS)
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {Object.keys(CO2_FACTORS).map((country) => (
                      <SelectItem key={country} value={country} className="text-zinc-300">
                        {country} ({CO2_FACTORS[country as keyof typeof CO2_FACTORS]} gCO₂e/kWh)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Add your own CO₂ intensity (gCO₂e/kWh)
                  </label>
                  <Input
                    type="number"
                    value={customIntensity}
                    onChange={(e) => setCustomIntensity(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-300"
                    placeholder="Enter value"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddCustom}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white"
                    disabled={!customIntensity || isNaN(Number(customIntensity))}
                  >
                    Calculate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
