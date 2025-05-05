"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { captureAPICall } from "@/lib/network-capture"
import type { APICall } from "@/types/api"

export function APIPredictor() {
  const [apiCalls, setApiCalls] = useState<APICall[]>([])
  const [prediction, setPrediction] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  //function to get prediction from server
  const getPrediction = async (calls: APICall[]) => {
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiCalls: calls }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      return data.prediction
    } catch (error) {
      console.error("Error getting prediction:", error)
      return null
    }
  }

  //capturing api calls.
  useEffect(() => {
    const handleButtonClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "BUTTON" && target.dataset.apiEndpoint) {
        const endpoint = target.dataset.apiEndpoint
        const method = "GET" //simplified for demo

        //capture
        const newCall: APICall = {
          endpoint,
          method,
          timestamp: new Date().toISOString(),
          parameters: {},
        }

        const updatedCalls = [...apiCalls, newCall]
        setApiCalls(updatedCalls)
        captureAPICall(newCall)

        //generetes prediction after a new call is made.
        const nextPrediction = await getPrediction(updatedCalls)
        setPrediction(nextPrediction)
      }
    }

    document.addEventListener("click", handleButtonClick)
    return () => document.removeEventListener("click", handleButtonClick)
  }, [apiCalls])

  //this is the tab key! 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && prediction && document.activeElement === inputRef.current) {
        e.preventDefault()
        executeAPICall(prediction)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [prediction])

  const executeAPICall = async (endpoint: string) => {
    //this would be calling the actual api by the json endponts when cell is integrated into a SaaS!
    console.log(`Executing API call: ${endpoint}`)

    const newCall: APICall = {
      endpoint,
      method: "GET", 
      timestamp: new Date().toISOString(),
      parameters: {},
    }

    const updatedCalls = [...apiCalls, newCall]
    setApiCalls(updatedCalls)
    captureAPICall(newCall)
    setPrediction(null)

    //new prediction
    const nextPrediction = await getPrediction(updatedCalls)
    setPrediction(nextPrediction)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    //adding user message. 
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])

    //opening chat if its not open. 
    if (!showChat) {
      setShowChat(true)
    }

  
    setInput("")

    //getting the ai response here. 
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiCalls,
        }),
      })

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Error getting chat response:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error processing your request." },
      ])
    }
  }

  return (
    <div className="w-full">
      {/* Recent API Calls Log */}
      <Card className="mb-4 p-4">
        <h3 className="text-lg font-medium mb-2">Recent API Calls</h3>
        <div className="max-h-40 overflow-y-auto">
          {apiCalls.length > 0 ? (
            <ul className="space-y-1">
              {apiCalls.map((call, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {call.method} {call.endpoint}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No API calls captured yet. Click on the buttons above to simulate API calls.
            </p>
          )}
        </div>
      </Card>

      {/* Prediction UI */}
      <div className="fixed bottom-4 left-0 right-0 mx-auto max-w-3xl px-4">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={prediction ? `Press Tab to execute: ${prediction}` : "Type a command or question..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="pr-24 pl-4 py-6 text-base"
          />
          {prediction && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-400 bg-gray-100 px-1 rounded text-xs">TAB</span>
            </div>
          )}
          <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2">
            Send
          </Button>
        </form>
      </div>

      {/* Chat UI */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Chat</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-gray-500">Start a conversation</p>}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
