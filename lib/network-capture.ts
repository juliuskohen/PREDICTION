import type { APICall } from "@/types/api"


// this is in memory, list is fine for now, but should be in a localStorage or database 
let capturedCalls: APICall[] = []

/**
 * stores the API call! 
 */
export function captureAPICall(apiCall: APICall): void {
  capturedCalls.push(apiCall)
  console.log("API call captured:", apiCall)

  // thesea are the steps for clarity! 
  // 1) store in localstorage or indexdb
  // 2) send it to a backend to analyze
  // 3) limit the number of stored calls (for memory)

  // this limits to at least 50 calls for memory. 
  if (capturedCalls.length > 50) {
    capturedCalls = capturedCalls.slice(-50)
  }
}

/**
 * gets all API calls
 */
export function getCapturedCalls(): APICall[] {
  return [...capturedCalls]
}

/**
 * clears them all 
 */
export function clearCapturedCalls(): void {
  capturedCalls = []
}

