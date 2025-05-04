"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import { Info } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Energy per token data (Wh per 1000 tokens)
const MODEL_ENERGY_DATA = [
  { id: "meta-llama/llama-2-70b-chat", name: "Llama 2", parameters: "70B", energyRate: 1.12 },
  { id: "meta-llama/llama-3.1-405b:free", name: "Llama 3", parameters: "405B", energyRate: 15.33 },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1", parameters: "671B", energyRate: 2.72 },
]

export default function PreRunEnergyGraph() {
  // Sort by energy rate (highest first)
  const chartData = [...MODEL_ENERGY_DATA].sort((a, b) => b.energyRate - a.energyRate)

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="bg-zinc-800 p-3 border border-zinc-700 rounded-md shadow-lg text-sm">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-zinc-400">{data.parameters} parameters</p>
          <p className="text-zinc-300">
            <span className="text-sky-400 font-medium">{data.energyRate.toFixed(2)}</span> Wh/1000 tokens
          </p>
          <div className="mt-2 pt-2 border-t border-zinc-700">
            <p className="text-zinc-400">This is the base energy consumption rate for this model.</p>
            <p className="text-zinc-400">Actual usage will depend on the number of tokens processed.</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          Model Energy Consumption Rates
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-zinc-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  This graph shows the base energy consumption rates for each model in Wh per 1000 tokens. Run a prompt
                  to see the actual electricity demand based on token usage.
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
                  value: "Energy Consumption (Wh/1000 tokens)",
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
                dataKey="energyRate"
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
                    return (
                      <g>
                        <text
                          x={x + width + 5}
                          y={y + height / 2}
                          fill="#fff"
                          textAnchor="start"
                          dominantBaseline="middle"
                          fontSize="12"
                          opacity={props.index === chartData.findIndex((item) => item.energyRate === value) ? 1 : 0}
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
        <p className="text-xs text-zinc-400 italic  text-right">
          Source: Van der Mei, Lal, Bakker, 2025. Ongoing research.
        </p>
      </CardContent>
    </Card>
  )
}
