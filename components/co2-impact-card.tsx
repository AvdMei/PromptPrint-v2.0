"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Leaf, Zap, AlertTriangle } from "lucide-react"
import type { Datacenter } from "./datacenter-selector"

interface CO2ImpactCardProps {
  energyUsage: number | null
  datacenter: Datacenter | null
}

export default function CO2ImpactCard({ energyUsage, datacenter }: CO2ImpactCardProps) {
  // Calculate CO2 impact
  const co2Impact = energyUsage && datacenter?.co2Intensity ? (energyUsage / 1000) * datacenter.co2Intensity : null

  // Define impact levels for visualization
  const getImpactLevel = (co2: number) => {
    if (co2 < 0.1) return { level: "Very Low", color: "bg-green-500" }
    if (co2 < 0.5) return { level: "Low", color: "bg-emerald-500" }
    if (co2 < 1) return { level: "Moderate", color: "bg-yellow-500" }
    if (co2 < 5) return { level: "High", color: "bg-orange-500" }
    return { level: "Very High", color: "bg-red-500" }
  }

  const impactInfo = co2Impact ? getImpactLevel(co2Impact) : null

  // Calculate equivalent activities for context
  const getEquivalentActivity = (co2: number) => {
    // These are approximate values for educational purposes
    if (co2 < 0.01) return "Less than sending an email"
    if (co2 < 0.1) return "Equivalent to sending an email with attachment"
    if (co2 < 0.5) return "Equivalent to charging a smartphone"
    if (co2 < 1) return "Equivalent to boiling a cup of water"
    if (co2 < 5) return "Equivalent to driving a car for 100 meters"
    return "Equivalent to driving a car for 500 meters"
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Leaf className="h-5 w-5 mr-2 text-sky-400" />
          Carbon Footprint
        </CardTitle>
        <CardDescription>Environmental impact of your inference</CardDescription>
      </CardHeader>
      <CardContent>
        {!energyUsage || !datacenter ? (
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            <p className="text-zinc-400">Run a query to see carbon footprint data</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-sky-400" />
                  <span className="text-zinc-300">Energy Usage</span>
                </div>
                <span className="text-zinc-300 font-medium">{energyUsage.toFixed(4)} Wh</span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-300">CO₂ Intensity</span>
                <span className="text-zinc-300">{datacenter.co2Intensity} gCO₂e/kWh</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-300">CO₂ Impact</span>
                <span className="text-sky-400 font-medium">{co2Impact?.toFixed(6)} gCO₂e</span>
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
                    style={{ width: `${Math.min((co2Impact / 5) * 100, 100)}%` }}
                  ></div>
                </div>

                <p className="mt-3 text-sm text-zinc-400">{getEquivalentActivity(co2Impact)}</p>
              </div>
            )}

            <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
              <h4 className="text-sm font-medium text-white mb-2">Datacenter Location</h4>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-sky-400 mr-2"></div>
                <p className="text-zinc-300 text-sm">
                  {datacenter.market}, {datacenter.name}
                </p>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Running your inference in a region with lower CO₂ intensity can significantly reduce the environmental
                impact.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
