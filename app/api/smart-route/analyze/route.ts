import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// Complexity levels
const COMPLEXITY_LEVELS = ["Very Simple", "Simple", "Moderate", "Complex", "Very Complex"]

// Model selection criteria
const MODEL_SELECTION = {
  "Very Simple": {
    default: "google-search",
    lowLatency: "google-search",
    lowCost: "google-search",
    lowEnergy: "google-search",
  },
  Simple: {
    default: "meta-llama/llama-2-70b-chat",
    lowLatency: "meta-llama/llama-2-70b-chat",
    lowCost: "meta-llama/llama-2-70b-chat",
    lowEnergy: "meta-llama/llama-2-70b-chat",
  },
  Moderate: {
    default: "meta-llama/llama-3.1-405b:free",
    lowLatency: "meta-llama/llama-2-70b-chat",
    lowCost: "meta-llama/llama-2-70b-chat",
    lowEnergy: "meta-llama/llama-2-70b-chat",
  },
  Complex: {
    default: "deepseek/deepseek-r1:free",
    lowLatency: "meta-llama/llama-3.1-405b:free",
    lowCost: "meta-llama/llama-3.1-405b:free",
    lowEnergy: "meta-llama/llama-3.1-405b:free",
  },
  "Very Complex": {
    default: "deepseek/deepseek-r1:free",
    lowLatency: "deepseek/deepseek-r1:free",
    lowCost: "meta-llama/llama-3.1-405b:free",
    lowEnergy: "meta-llama/llama-3.1-405b:free",
  },
}

// Helper function to extract JSON from text that might contain markdown code blocks
function extractJsonFromText(text: string): any {
  // Try to parse the text directly first
  try {
    return JSON.parse(text)
  } catch (e) {
    // If direct parsing fails, try to extract JSON from markdown code blocks
    const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
    const match = text.match(jsonRegex)

    if (match && match[1]) {
      try {
        return JSON.parse(match[1])
      } catch (e) {
        console.error("Failed to parse extracted JSON:", e)
        throw new Error("Failed to parse JSON from response")
      }
    }

    // If no code blocks found, try to find any JSON-like structure
    const bracesRegex = /\{[\s\S]*?\}/
    const bracesMatch = text.match(bracesRegex)

    if (bracesMatch && bracesMatch[0]) {
      try {
        return JSON.parse(bracesMatch[0])
      } catch (e) {
        console.error("Failed to parse JSON-like structure:", e)
        throw new Error("Failed to parse JSON from response")
      }
    }

    throw new Error("No valid JSON found in response")
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, preferences } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Analyze prompt complexity using AI
    const systemPrompt = `
      You are the Model Selector agent in a two-agent architecture for intelligent model selection.
      Your task is to analyze the given prompt and determine its complexity level.
      
      Classify the prompt on a 5-point scale:
      1. Very Simple: Basic factual questions, simple definitions, or straightforward information retrieval
      2. Simple: Questions requiring minimal context, basic explanations, or simple instructions
      3. Moderate: Questions requiring some reasoning, explanations with context, or multi-step instructions
      4. Complex: Problems requiring significant reasoning, complex explanations, or creative tasks
      5. Very Complex: Advanced reasoning, specialized knowledge, or multi-step problem solving
      
      Return a JSON object with the following fields:
      - complexity: The complexity level as a string (one of: "Very Simple", "Simple", "Moderate", "Complex", "Very Complex")
      - reasoning: A brief explanation of why you classified it at this complexity level (1-2 sentences)
      
      Format your response as a valid JSON object without any markdown formatting or code blocks.
    `

    // Use the AI SDK to analyze the prompt
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: prompt,
    })

    console.log("Raw response from OpenAI:", text)

    // Parse the analysis result using our helper function
    let analysisResult
    try {
      analysisResult = extractJsonFromText(text)
    } catch (error) {
      console.error("Failed to parse analysis result:", error)
      return NextResponse.json(
        {
          error: "Failed to analyze prompt: " + (error instanceof Error ? error.message : String(error)),
        },
        { status: 500 },
      )
    }

    // Validate the analysis result
    if (!analysisResult.complexity || !COMPLEXITY_LEVELS.includes(analysisResult.complexity)) {
      return NextResponse.json(
        {
          error: "Invalid complexity level: " + JSON.stringify(analysisResult),
        },
        { status: 500 },
      )
    }

    // Select the appropriate model based on complexity and preferences
    let selectedModel
    const complexity = analysisResult.complexity

    // Determine which preference to prioritize
    if (preferences.lowLatency) {
      selectedModel = MODEL_SELECTION[complexity as keyof typeof MODEL_SELECTION].lowLatency
    } else if (preferences.lowCost) {
      selectedModel = MODEL_SELECTION[complexity as keyof typeof MODEL_SELECTION].lowCost
    } else if (preferences.lowEnergy) {
      selectedModel = MODEL_SELECTION[complexity as keyof typeof MODEL_SELECTION].lowEnergy
    } else {
      selectedModel = MODEL_SELECTION[complexity as keyof typeof MODEL_SELECTION].default
    }

    // Add preference reasoning to the analysis result
    let preferenceReasoning = ""
    if (preferences.lowLatency) {
      preferenceReasoning = "Low latency was prioritized."
    } else if (preferences.lowCost) {
      preferenceReasoning = "Low cost was prioritized."
    } else if (preferences.lowEnergy) {
      preferenceReasoning = "Low energy usage was prioritized."
    } else {
      preferenceReasoning = "No specific preferences were prioritized."
    }

    const fullReasoning = `${analysisResult.reasoning} ${preferenceReasoning}`

    return NextResponse.json({
      complexity,
      selectedModel,
      reasoning: fullReasoning,
    })
  } catch (error) {
    console.error("Error in analyze API:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze prompt: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}
