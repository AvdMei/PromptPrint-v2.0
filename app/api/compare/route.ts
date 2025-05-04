import { NextResponse } from "next/server"

// Define the models we want to compare with correct OpenRouter IDs
// Updated Llama 3 model as requested
const MODELS = [
  // "google/gemma-2-9b-it:free", // Disabled
  // "mistralai/mistral-7b-instruct:free", // Disabled
  "meta-llama/llama-2-70b-chat",
  "meta-llama/llama-3.1-405b:free",
  "deepseek/deepseek-r1:free",
]

// Model display names mapping
const MODEL_NAMES = {
  // "google/gemma-2-9b-it:free": "Gemma 2 9B", // Disabled
  // "mistralai/mistral-7b-instruct:free": "Mistral 7B Instruct", // Disabled
  "meta-llama/llama-2-70b-chat": "Llama 2",
  "meta-llama/llama-3.1-405b:free": "Llama 3",
  "deepseek/deepseek-r1:free": "DeepSeek R1",
}

// Helper function to create a fetch request with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY environment variable is not set")
      return NextResponse.json(
        { error: "API key configuration error. Please check server configuration." },
        { status: 500 },
      )
    }

    // Parse request body
    let promptData
    try {
      promptData = await request.json()
    } catch (error) {
      console.error("Failed to parse request body:", error)
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const { prompt } = promptData

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Create an array of promises for each model request
    const modelPromises = MODELS.map(async (modelId) => {
      const startTime = Date.now()

      try {
        console.log(`Making request to model: ${modelId}`)

        // Make the API call using fetch with timeout
        const response = await fetchWithTimeout(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://vercel.com",
              "X-Title": "LLM Model Comparison",
            },
            body: JSON.stringify({
              model: modelId,
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              // Add a reasonable timeout for the model to respond
              timeout: 20,
            }),
          },
          30000, // 30 second timeout for the fetch request
        )

        if (!response.ok) {
          let errorMessage = `API returned ${response.status}: ${response.statusText}`
          try {
            const errorData = await response.json()
            errorMessage = `API returned ${response.status}: ${errorData.error?.message || errorData.error || response.statusText}`
          } catch (jsonError) {
            // If JSON parsing fails, use the status text
            console.error(`Failed to parse error response for ${modelId}:`, jsonError)
          }
          console.error(`Error response from OpenRouter for model ${modelId}:`, errorMessage)
          throw new Error(errorMessage)
        }

        // Safely parse the JSON response
        let data
        try {
          const text = await response.text()
          data = JSON.parse(text)
        } catch (jsonError) {
          console.error(`Failed to parse JSON response for ${modelId}:`, jsonError)
          throw new Error(
            `Failed to parse response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
          )
        }

        const responseTime = Date.now() - startTime

        // Extract the response text
        const responseText = data.choices?.[0]?.message?.content || "No response content"

        // Get token counts from the API response
        const inputTokens = data.usage?.prompt_tokens || 0
        const outputTokens = data.usage?.completion_tokens || 0

        return {
          model: modelId,
          modelName: MODEL_NAMES[modelId as keyof typeof MODEL_NAMES] || modelId,
          response: responseText,
          inputTokens,
          outputTokens,
          responseTime,
        }
      } catch (error: any) {
        console.error(`Error with model ${modelId}:`, error)
        return {
          model: modelId,
          modelName: MODEL_NAMES[modelId as keyof typeof MODEL_NAMES] || modelId,
          response: `Error: Failed to get response from this model. ${error?.message || "Unknown error"}`,
          inputTokens: 0,
          outputTokens: 0,
          responseTime: Date.now() - startTime,
        }
      }
    })

    // Wait for all model responses with Promise.allSettled to handle individual failures
    const settledResults = await Promise.allSettled(modelPromises)

    // Process the results, keeping successful ones and formatting errors for failed ones
    const results = settledResults.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value
      } else {
        const modelId = MODELS[index]
        console.error(`Promise rejected for model ${modelId}:`, result.reason)
        return {
          model: modelId,
          modelName: MODEL_NAMES[modelId as keyof typeof MODEL_NAMES] || modelId,
          response: `Error: Request failed. ${result.reason?.message || "Unknown error"}`,
          inputTokens: 0,
          outputTokens: 0,
          responseTime: 0,
        }
      }
    })

    // Sort results by response time (fastest first), putting errors at the end
    results.sort((a, b) => {
      // If both have response times, sort by time
      if (a.responseTime > 0 && b.responseTime > 0) {
        return a.responseTime - b.responseTime
      }
      // If only a has a response time, it comes first
      if (a.responseTime > 0) return -1
      // If only b has a response time, it comes first
      if (b.responseTime > 0) return 1
      // If neither has a response time (both errors), maintain original order
      return 0
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in compare API:", error)

    // Return a proper JSON error response with more details
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("Error details:", { message: errorMessage, stack: errorStack })

    return NextResponse.json({ error: "Failed to process request: " + errorMessage }, { status: 500 })
  }
}
