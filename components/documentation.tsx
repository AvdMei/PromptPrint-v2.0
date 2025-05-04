import { Card, CardContent } from "@/components/ui/card"

export default function Documentation() {
  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium mb-4 text-white">Documentation</h2>

        <div className="space-y-6">
          {/* Energy Usage Data */}
          <div>
            <h3 className="text-lg font-medium mb-2 text-white">Energy Usage Data</h3>
            <p className="text-sm text-zinc-400 mb-2">
              Energy usage is calculated based on the following data (Wh per 1000 tokens):
            </p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              <li>• Llama 2 70B: 1.12 Wh/1000 tokens (H100 GPU)</li>
              <li>• Meta Llama 3.1: 15.33 Wh/1000 tokens (H100 GPU)</li>
              <li>• DeepSeek R1: 2.72 Wh/1000 tokens (H100 GPU)</li>
              <li>• Gemma and Mistral: No data available</li>
            </ul>
          </div>

          {/* Electricity Demand Calculation */}
          <div>
            <h3 className="text-lg font-medium mb-2 text-white">Electricity Demand Calculation</h3>
            <div className="text-sm text-zinc-400 space-y-2">
              <p>
                <span className="font-mono bg-zinc-900 px-2 py-1 rounded">
                  Electricity Demand (Wh) = (Input Tokens + Output Tokens) × Energy per 1000 tokens
                </span>
              </p>
              <p>
                This calculation estimates the total electricity consumed by the model to process your prompt and
                generate a response.
              </p>
            </div>
          </div>

          {/* CO2 Impact Calculation */}
          <div>
            <h3 className="text-lg font-medium mb-2 text-white">CO₂ Impact Calculation</h3>
            <div className="text-sm text-zinc-400 space-y-2">
              <p>
                <span className="font-mono bg-zinc-900 px-2 py-1 rounded">
                  CO₂ Impact (gCO₂e) = Electricity Demand (kWh) × CO₂ Intensity (gCO₂e/kWh) gCO₂eq/1000 tokens decribes
                  the amount of greenhouse gas emission equivalent that are estiamted to be emitted by the model for
                  every 1000 tokens usage.
                </span>
              </p>
              <p>
                The CO₂ intensity varies significantly by country depending on their energy mix. Countries with more
                renewable energy sources have lower CO₂ intensities.
              </p>
              <p className="mt-2">
                Global average emission factor used: <span className="text-sky-400">463 gCO₂e/kWh</span> for data
                centers.
              </p>
              <p>
                The CO₂ impact visualization allows you to compare the environmental impact of different models across
                various regions with different energy mixes.
              </p>
            </div>
          </div>

          {/* Sources */}
          <div>
            <h3 className="text-lg font-medium mb-2 text-white">Sources</h3>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Energy usage data: Van der Mei, Lal, Bakker, 2025. Under review.</li>
              <li>• CO₂ intensity data: International Energy Agency (IEA)</li>
              <li>• Global average emission factor: IEA, Data Centres and Data Transmission Networks</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
