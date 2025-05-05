import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { APICall } from "@/types/api"

export async function POST(req: Request) {
  try {
    const { apiCalls } = await req.json()

    //no API calls, then no prediction!
    if (!apiCalls || apiCalls.length === 0) {
      return Response.json({ prediction: null })
    }

    //formatting the calls for LLM
    const formattedCalls = apiCalls
      .map((call: APICall) => `${call.method} ${call.endpoint} at ${new Date(call.timestamp).toLocaleTimeString()}`)
      .join("\n")

  
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

    //cleaning up the response. 
    const predictedEndpoint = text.trim().replace(/^["']|["']$/g, "")

    //validation of api looking like an end point. 
    if (predictedEndpoint.startsWith("/api/")) {
      return Response.json({ prediction: predictedEndpoint })
    }

    return Response.json({ prediction: null })
  } catch (error) {
    console.error("Error predicting next API call:", error)
    return Response.json({ error: "Failed to predict next API call" }, { status: 500 })
  }
}
