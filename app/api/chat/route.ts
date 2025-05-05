import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { APICall } from "@/types/api"

export async function POST(req: Request) {
  try {
    const { messages, apiCalls } = await req.json()

    //formatting the api calls for context
    const apiCallsContext =
      apiCalls.length > 0
        ? apiCalls
            .map(
              (call: APICall) => `${call.method} ${call.endpoint} at ${new Date(call.timestamp).toLocaleTimeString()}`,
            )
            .join("\n")
        : "No API calls recorded yet."

    //generating response using openai
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        You are Cell, an AI assistant integrated into a SaaS application.
        You have access to the user's recent API activity.
        
        Recent API calls:
        ${apiCallsContext}
        
        User message: ${messages[messages.length - 1].content}
        
        Respond helpfully, referencing their API usage when relevant. Keep responses concise.
      `,
      maxTokens: 500,
    })

    return Response.json({ message: text })
  } catch (error) {
    console.error("Error in chat API:", error)
    return Response.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
