import type { APICall } from "@/types/api"

// In-memory storage for captured API calls
// In a real implementation, this might be stored in a database or localStorage
let capturedCalls: APICall[] = []

/**
 * Captures an API call and stores it for analysis
 */
export function captureAPICall(apiCall: APICall): void {
  capturedCalls.push(apiCall)
  console.log("API call captured:", apiCall)

  // In a real implementation, you might want to:
  // 1. Store this in localStorage or IndexedDB for persistence
  // 2. Send it to a backend for analysis
  // 3. Limit the number of stored calls to prevent memory issues

  // Limit to last 50 calls for memory management
  if (capturedCalls.length > 50) {
    capturedCalls = capturedCalls.slice(-50)
  }
}

/**
 * Gets all captured API calls
 */
export function getCapturedCalls(): APICall[] {
  return [...capturedCalls]
}

/**
 * Clears all captured API calls
 */
export function clearCapturedCalls(): void {
  capturedCalls = []
}

/**
 * In a real implementation, this would be a more sophisticated system
 * that could intercept actual network requests using:
 *
 * 1. Service Workers
 * 2. Proxy servers
 * 3. Browser extensions
 * 4. Monkey patching fetch/XMLHttpRequest
 */
