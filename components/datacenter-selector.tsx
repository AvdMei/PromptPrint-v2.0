"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Globe, Zap } from "lucide-react"

// Define the datacenter information
export interface Datacenter {
  id: string
  market: string
  name: string
  continent: string
  coordinates: [number, number]
  co2Intensity?: number
}

// CO2 emission factors by country (gCO2e per kWh)
export const CO2_FACTORS: Record<string, number> = {
  Switzerland: 24,
  "United States of America": 379,
  Japan: 474,
  Singapore: 408,
  "U.K. of Great Britain and Northern Ireland": 231,
  "Republic of Korea": 415,
  "New Zealand": 138,
  Norway: 26,
  Germany: 350,
  Indonesia: 722,
  Australia: 505,
  Sweden: 13,
  Denmark: 135,
  Malaysia: 585,
  Uruguay: 25,
  Netherlands: 328,
  France: 56,
  Spain: 172,
  Canada: 120,
  Ireland: 296,
  Italy: 256,
  Austria: 109,
  Turkey: 464,
  Brazil: 74,
  Chile: 412,
  "United Arab Emirates": 410,
  "South Africa": 928,
  Kenya: 156,
  Mexico: 454,
  Greece: 311,
  China: 577,
  India: 708,
  Poland: 751,
  Colombia: 176,
  "Global Average": 463,
}

// Create the datacenter list from the provided data
export const DATACENTERS: Datacenter[] = [
  {
    id: "zurich",
    market: "Zurich",
    name: "Switzerland",
    continent: "Europe",
    coordinates: [8.54002849155086, 47.3708138956672],
  },
  {
    id: "san-francisco",
    market: "San Fransisco",
    name: "United States of America",
    continent: "Americas",
    coordinates: [-122.419265474966, 37.7702620767915],
  },
  {
    id: "new-jersey",
    market: "New Jersey",
    name: "United States of America",
    continent: "Americas",
    coordinates: [-74.322942966692, 40.7217617168257],
  },
  { id: "tokyo", market: "Tokyo", name: "Japan", continent: "Asia", coordinates: [139.75989153369, 35.6764424633821] },
  {
    id: "singapore",
    market: "Singapore",
    name: "Singapore",
    continent: "Asia",
    coordinates: [103.819758182637, 1.42227096544023],
  },
  {
    id: "portland",
    market: "Portland",
    name: "United States of America",
    continent: "Americas",
    coordinates: [-122.669453166379, 45.4801926549824],
  },
  {
    id: "chicago",
    market: "Chicago",
    name: "United States of America",
    continent: "Americas",
    coordinates: [-87.759414532633, 41.734393456002],
  },
  {
    id: "london",
    market: "London",
    name: "U.K. of Great Britain and Northern Ireland",
    continent: "Europe",
    coordinates: [-0.031835423169071, 51.4651651053932],
  },
  {
    id: "north-virginia",
    market: "North Virginia",
    name: "United States of America",
    continent: "Americas",
    coordinates: [-78.4715478130839, 38.0259993141238],
  },
  {
    id: "seoul",
    market: "Seoul",
    name: "Republic of Korea",
    continent: "Asia",
    coordinates: [126.99324138039, 37.5439041756332],
  },
  {
    id: "auckland",
    market: "Auckland",
    name: "New Zealand",
    continent: "Oceania",
    coordinates: [174.801674690392, -36.9069519354632],
  },
  {
    id: "oslo",
    market: "Oslo",
    name: "Norway",
    continent: "Europe",
    coordinates: [10.7566626953298, 59.9188263711319],
  },
  {
    id: "frankfurt",
    market: "Frankfurt",
    name: "Germany",
    continent: "Europe",
    coordinates: [8.68853927518897, 50.1109077271305],
  },
  {
    id: "jakarta",
    market: "Jakarta",
    name: "Indonesia",
    continent: "Asia",
    coordinates: [106.893066528545, -6.21934280226191],
  },
  {
    id: "sydney",
    market: "Sydney",
    name: "Australia",
    continent: "Oceania",
    coordinates: [151.180153909339, -33.8361020085874],
  },
  {
    id: "stockholm",
    market: "Stockholm",
    name: "Sweden",
    continent: "Europe",
    coordinates: [18.0682101402724, 59.3339025755364],
  },
  {
    id: "berlin",
    market: "Berlin",
    name: "Germany",
    continent: "Europe",
    coordinates: [13.4097099110662, 52.5184958500722],
  },
  {
    id: "copenhagen",
    market: "Copenhagen",
    name: "Denmark",
    continent: "Europe",
    coordinates: [12.5793270226763, 55.6781288530652],
  },
  {
    id: "kuala-lumpur",
    market: "Kuala Lumpur",
    name: "Malaysia",
    continent: "Asia",
    coordinates: [101.707090376525, 3.10810272392893],
  },
  {
    id: "montevideo",
    market: "Montevideo",
    name: "Uruguay",
    continent: "Americas",
    coordinates: [-56.154441493672, -34.8753862525471],
  },
  {
    id: "amsterdam",
    market: "Amsterdam",
    name: "Netherlands",
    continent: "Europe",
    coordinates: [4.90742473937593, 52.3670423672841],
  },
  {
    id: "paris",
    market: "Paris",
    name: "France",
    continent: "Europe",
    coordinates: [2.36927326920305, 48.8522770598225],
  },
  {
    id: "madrid",
    market: "Madrid",
    name: "Spain",
    continent: "Europe",
    coordinates: [-3.68886604232071, 40.3813270914677],
  },
  {
    id: "melbourne",
    market: "Melbourne",
    name: "Australia",
    continent: "Oceania",
    coordinates: [144.965338581138, -37.8052277644133],
  },
  {
    id: "phoenix",
    market: "Phoenix",
    name: "United States of America",
    continent: "Americas",
    coordinates: [-112.072111845814, 33.4666922221078],
  },
  {
    id: "columbus-ohio",
    market: "Columbus Ohio",
    name: "United States of America",
    continent: "Americas",
    coordinates: [-83.0008769513338, 39.971358181162],
  },
  {
    id: "toronto",
    market: "Toronto",
    name: "Canada",
    continent: "Americas",
    coordinates: [-79.3816609660873, 43.6767459755811],
  },
  {
    id: "dallas",
    market: "Dallas",
    name: "United States of America",
    continent: "Americas",
    coordinates: [-96.7988114867181, 32.8086529520631],
  },
  {
    id: "atlanta",
    market: "Atlanta",
    name: "United States of America",
    continent: "Americas",
    coordinates: [-84.3482906947589, 33.7487090521271],
  },
  {
    id: "dublin",
    market: "Dublin",
    name: "Ireland",
    continent: "Europe",
    coordinates: [-6.26357524971814, 53.3488787384621],
  },
  {
    id: "milan",
    market: "Milan",
    name: "Italy",
    continent: "Europe",
    coordinates: [9.21340393105825, 45.4772145338982],
  },
  {
    id: "vienna",
    market: "Vienna",
    name: "Austria",
    continent: "Europe",
    coordinates: [16.3578302915449, 48.2347124274194],
  },
  {
    id: "istanbul",
    market: "Istanbul",
    name: "Turkey",
    continent: "Asia",
    coordinates: [28.9963623035168, 41.0693959313758],
  },
  {
    id: "san-paolo",
    market: "San Paolo",
    name: "Brazil",
    continent: "Americas",
    coordinates: [-46.625928412745, -23.5646834819155],
  },
  {
    id: "santiago-chili",
    market: "Santiago Chili",
    name: "Chile",
    continent: "Americas",
    coordinates: [-70.6286941677132, -33.4874978714803],
  },
  {
    id: "uae",
    market: "United Arab Emirates",
    name: "United Arab Emirates",
    continent: "Asia",
    coordinates: [54.6128910302617, 24.3390086171807],
  },
  {
    id: "johannesburg",
    market: "Johannesburg",
    name: "South Africa",
    continent: "Africa",
    coordinates: [28.0458611356744, -26.1994518290394],
  },
  {
    id: "nairobi",
    market: "Nairobi",
    name: "Kenya",
    continent: "Africa",
    coordinates: [36.8249406034946, -1.28796517734266],
  },
  {
    id: "santiago-mexico",
    market: "Santiago Mexico",
    name: "Mexico",
    continent: "Americas",
    coordinates: [-100.399748603352, 20.5840067508137],
  },
  {
    id: "athens",
    market: "Athens",
    name: "Greece",
    continent: "Europe",
    coordinates: [23.7477157448262, 38.0063798053338],
  },
  {
    id: "cape-town",
    market: "Cape Town",
    name: "South Africa",
    continent: "Africa",
    coordinates: [18.5460719911385, -33.9705822562355],
  },
  {
    id: "shanghai",
    market: "Shanghai",
    name: "China",
    continent: "Asia",
    coordinates: [121.469158613427, 31.2236139166773],
  },
  {
    id: "mumbai",
    market: "Mumbai",
    name: "India",
    continent: "Asia",
    coordinates: [72.8891483756734, 19.0694719229329],
  },
  {
    id: "warsaw",
    market: "Warsaw",
    name: "Poland",
    continent: "Europe",
    coordinates: [21.0137192538067, 52.2299508526915],
  },
  {
    id: "bogota",
    market: "Bogota",
    name: "Colombia",
    continent: "Americas",
    coordinates: [-74.0834003354484, 4.66311218945161],
  },
].map((dc) => ({
  ...dc,
  co2Intensity: CO2_FACTORS[dc.name] || CO2_FACTORS["Global Average"],
}))

// Group datacenters by continent for better organization in the dropdown
export const DATACENTERS_BY_CONTINENT = DATACENTERS.reduce(
  (acc, dc) => {
    if (!acc[dc.continent]) {
      acc[dc.continent] = []
    }
    acc[dc.continent].push(dc)
    return acc
  },
  {} as Record<string, Datacenter[]>,
)

interface DatacenterSelectorProps {
  energyUsage: number | null
  onSelectDatacenter: (datacenter: Datacenter) => void
}

export default function DatacenterSelector({ energyUsage, onSelectDatacenter }: DatacenterSelectorProps) {
  const [selectedDatacenter, setSelectedDatacenter] = useState<Datacenter | null>(null)
  const [co2Impact, setCo2Impact] = useState<number | null>(null)

  // Set default datacenter on first render
  useEffect(() => {
    const defaultDatacenter = DATACENTERS.find((dc) => dc.id === "north-virginia") || DATACENTERS[0]
    setSelectedDatacenter(defaultDatacenter)
    onSelectDatacenter(defaultDatacenter)
  }, [onSelectDatacenter])

  // Calculate CO2 impact when energy usage or datacenter changes
  useEffect(() => {
    if (energyUsage && selectedDatacenter?.co2Intensity) {
      // Convert Wh to kWh for CO2 calculation
      const co2 = (energyUsage / 1000) * selectedDatacenter.co2Intensity
      setCo2Impact(co2)
    } else {
      setCo2Impact(null)
    }
  }, [energyUsage, selectedDatacenter])

  const handleDatacenterChange = (datacenterId: string) => {
    const datacenter = DATACENTERS.find((dc) => dc.id === datacenterId)
    if (datacenter) {
      setSelectedDatacenter(datacenter)
      onSelectDatacenter(datacenter)
    }
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Globe className="h-5 w-5 mr-2 text-sky-400" />
          Datacenter Location
        </CardTitle>
        <CardDescription>Select where your inference will run</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedDatacenter?.id} onValueChange={handleDatacenterChange}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Select datacenter location" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] bg-zinc-900 border-zinc-700">
              {Object.entries(DATACENTERS_BY_CONTINENT).map(([continent, datacenters]) => (
                <div key={continent}>
                  <div className="px-2 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-800">{continent}</div>
                  {datacenters.map((dc) => (
                    <SelectItem key={dc.id} value={dc.id} className="text-zinc-300">
                      {dc.market}, {dc.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>

          {selectedDatacenter && (
            <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 mr-2 text-sky-400" />
                <div>
                  <h3 className="text-white font-medium">{selectedDatacenter.market}</h3>
                  <p className="text-zinc-400 text-sm">
                    {selectedDatacenter.name}, {selectedDatacenter.continent}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-zinc-800 p-3 rounded-md">
                  <p className="text-xs text-zinc-500 mb-1">CO₂ Intensity</p>
                  <p className="text-zinc-300 font-medium">{selectedDatacenter.co2Intensity} gCO₂e/kWh</p>
                </div>
                <div className="bg-zinc-800 p-3 rounded-md">
                  <p className="text-xs text-zinc-500 mb-1">Coordinates</p>
                  <p className="text-zinc-300 text-xs">
                    {selectedDatacenter.coordinates[1].toFixed(4)}, {selectedDatacenter.coordinates[0].toFixed(4)}
                  </p>
                </div>
              </div>

              {energyUsage !== null && co2Impact !== null && (
                <div className="mt-4 p-4 bg-zinc-800 rounded-md border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-1 text-sky-400" />
                      <span className="text-zinc-300 text-sm">Energy Usage</span>
                    </div>
                    <span className="text-zinc-300 font-medium">{energyUsage.toFixed(4)} Wh</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 text-sm">CO₂ Impact</span>
                    <span className="text-sky-400 font-medium">{co2Impact.toFixed(6)} gCO₂e</span>
                  </div>
                  <div className="mt-3 h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-500 ease-out"
                      style={{ width: `${Math.min((co2Impact / 0.5) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
