export interface APICall {
  endpoint: string
  method: string
  timestamp: string
  parameters: Record<string, any>
  response?: any
}

export interface APISchema {
  paths: Record<string, Record<string, APIEndpoint>>
}

export interface APIEndpoint {
  summary: string
  description?: string
  parameters?: APIParameter[]
  requestBody?: any
  responses?: Record<string, any>
}

export interface APIParameter {
  name: string
  in: "query" | "path" | "header" | "cookie"
  required: boolean
  schema: any
}
