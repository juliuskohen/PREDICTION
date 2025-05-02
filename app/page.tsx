import { APIPredictor } from "@/components/api-predictor"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Cell Demo - API Prediction</h1>

        <div className="mb-8 p-4 border rounded-lg bg-white">
          <h2 className="text-xl font-semibold mb-4">Dummy SaaS Interface</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-2 bg-blue-500 text-white rounded" data-api-endpoint="/api/users/list">
              List Users
            </button>
            <button className="p-2 bg-green-500 text-white rounded" data-api-endpoint="/api/projects/create">
              Create Project
            </button>
            <button className="p-2 bg-purple-500 text-white rounded" data-api-endpoint="/api/tasks/assign">
              Assign Task
            </button>
            <button className="p-2 bg-yellow-500 text-white rounded" data-api-endpoint="/api/analytics/view">
              View Analytics
            </button>
          </div>
        </div>

        <div className="w-full">
          <APIPredictor />
        </div>
      </div>
    </main>
  )
}
