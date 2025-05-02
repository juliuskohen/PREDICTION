import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { APICall } from "@/types/api"

export async function POST(req: Request) {
  try {
    const { apiCalls } = await req.json()

    // If there are no API calls, we can't make a prediction
    if (!apiCalls || apiCalls.length === 0) {
      return Response.json({ prediction: null })
    }

    // Format the API calls for the LLM
    const formattedCalls = apiCalls
      .map((call: APICall) => `${call.method} ${call.endpoint} at ${new Date(call.timestamp).toLocaleTimeString()}`)
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
      return Response.json({ prediction: predictedEndpoint })
    }

    return Response.json({ prediction: null })
  } catch (error) {
    console.error("Error predicting next API call:", error)
    return Response.json({ error: "Failed to predict next API call" }, { status: 500 })
  }
}
