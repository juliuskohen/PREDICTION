import type { APICall } from "@/types/api"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Predicts the next API call based on the history of previous calls
 */
export async function predictNextAPICall(apiCalls: APICall[]): Promise<string | null> {
  // If there are no API calls, we can't make a prediction
  if (apiCalls.length === 0) {
    return null
  }

  try {
    // Format the API calls for the LLM
    const formattedCalls = apiCalls
      .map((call) => `${call.method} ${call.endpoint} at ${new Date(call.timestamp).toLocaleTimeString()}`)
      .join("\n")

    // Use OpenAI to predict the next API call
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Based on the following sequence of API calls, predict the most likely next API call.
        Only respond with the API endpoint path (e.g., "/api/users/list").
        
        Recent API calls:
        ${formattedCalls}
        
        Next API call:
      `,
      maxTokens: 50,
    })

    // Clean up the response to get just the endpoint
    const predictedEndpoint = text.trim().replace(/^["']|["']$/g, "")

    // Validate that the prediction looks like an API endpoint
    if (predictedEndpoint.startsWith("/api/")) {
      return predictedEndpoint
    }

    return null
  } catch (error) {
    console.error("Error predicting next API call:", error)
    return null
  }
}

/**
 * In a real implementation, this would be more sophisticated:
 *
 * 1. Consider the user's context (what page they're on, what data they're viewing)
 * 2. Use a fine-tuned model specifically for API prediction
 * 3. Incorporate knowledge of the API schema (from OpenAPI specs)
 * 4. Consider time patterns (certain API calls are more common at certain times)
 * 5. Use a more sophisticated algorithm that considers sequences, not just individual calls
 */
