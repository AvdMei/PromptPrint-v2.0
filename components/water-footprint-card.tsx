"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Droplet, Zap, AlertTriangle } from "lucide-react"
import type { Datacenter } from "./datacenter-selector"

interface WaterFootprintCardProps {
  energyUsage: number | null
  datacenter: Datacenter | null
}

export default function WaterFootprintCard({ energyUsage, datacenter }: WaterFootprintCardProps) {
  // Calculate water footprint
  const energyInKwh = energyUsage ? energyUsage / 1000 : null
  const directWaterUsage = energyInKwh ? energyInKwh * 1.2 : null // liters

  const indirectWaterUsage =
    energyInKwh && datacenter?.co2Intensity ? (0.3 + 3 * (datacenter.co2Intensity / 1000)) * energyInKwh : null // liters

  const totalWaterUsage = directWaterUsage && indirectWaterUsage ? directWaterUsage + indirectWaterUsage : null // liters

  // Define impact levels for visualization
  const getImpactLevel = (water: number) => {
    if (water < 0.001) return { level: "Very Low", color: "bg-green-500" }
    if (water < 0.005) return { level: "Low", color: "bg-emerald-500" }
    if (water < 0.01) return { level: "Moderate", color: "bg-yellow-500" }
    if (water < 0.05) return { level: "High", color: "bg-orange-500" }
    return { level: "Very High", color: "bg-red-500" }
  }

  const impactInfo = totalWaterUsage ? getImpactLevel(totalWaterUsage) : null

  // Calculate equivalent activities for context
  const getEquivalentActivity = (water: number) => {
    // These are approximate values for educational purposes
    if (water < 0.001) return "Less than a drop of water"
    if (water < 0.005) return "Equivalent to a few drops of water"
    if (water < 0.01) return "Equivalent to washing hands for 1 second"
    if (water < 0.05) return "Equivalent to flushing a low-flow toilet once"
    return "Equivalent to taking a short shower"
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Droplet className="h-5 w-5 mr-2 text-sky-400" />
          Water Footprint
        </CardTitle>
        <CardDescription>Water consumption impact of your inference</CardDescription>
      </CardHeader>
      <CardContent>
        {!energyUsage || !datacenter ? (
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            <p className="text-zinc-400">Run a query to see water footprint data</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-sky-400" />
                  <span className="text-zinc-300">Energy Usage</span>
                </div>
                <span className="text-zinc-300 font-medium">{energyInKwh?.toFixed(6)} kWh</span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-300">Direct Water Usage</span>
                <span className="text-zinc-300">{directWaterUsage?.toFixed(6)} liters</span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-300">Indirect Water Usage</span>
                <span className="text-zinc-300">{indirectWaterUsage?.toFixed(6)} liters</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Total Water Usage</span>
                <span className="text-sky-400 font-medium">{totalWaterUsage?.toFixed(6)} liters</span>
              </div>
            </div>

            {impactInfo && (
              <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-300">Impact Level</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${impactInfo.color} text-zinc-900`}>
                    {impactInfo.level}
                  </span>
                </div>

                <div className="mt-3 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${impactInfo.color} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min((totalWaterUsage / 0.05) * 100, 100)}%` }}
                  ></div>
                </div>

                <p className="mt-3 text-sm text-zinc-400">{getEquivalentActivity(totalWaterUsage)}</p>
              </div>
            )}

            <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
              <h4 className="text-sm font-medium text-white mb-2">Water Usage Calculation</h4>
              <p className="text-xs text-zinc-500 mb-2">Direct water usage = Energy (kWh) × 1.2 liters/kWh</p>
              <p className="text-xs text-zinc-500 mb-2">
                Indirect water usage = Energy (kWh) × (0.3 + 3 × CO₂ Intensity/1000)
              </p>
              <p className="text-xs text-zinc-500">Total = Direct + Indirect water usage</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
