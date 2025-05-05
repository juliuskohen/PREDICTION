import type { APICall } from "@/types/api"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * this code predicts the next api calls based on previous clicked ones (also can be done using natural language)
 */
export async function predictNextAPICall(apiCalls: APICall[]): Promise<string | null> {
  // no API calls = no prediction!
  if (apiCalls.length === 0) {
    return null
  }

  try {
    // formetting the calls for LLM (see the end how this is implemented)
    const formattedCalls = apiCalls
      .map((call) => `${call.method} ${call.endpoint} at ${new Date(call.timestamp).toLocaleTimeString()}`)
      .join("\n")

    // uses OPENAI (can use Claude too) to predict the next api call (in a smart way). 
    // NOTE: modify the tokens based on the model of LLM you use! 4o is the best with 50 (I experimented). 
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

    // getting the endpoint (cleans up the response)
    const predictedEndpoint = text.trim().replace(/^["']|["']$/g, "")

    // sees if the prediction looks like an api edpoint.
    if (predictedEndpoint.startsWith("/api/")) {
      return predictedEndpoint
    }

    return null
  } catch (error) {
    console.error("Error predicting next API call:", error)
    return null
  }
}


