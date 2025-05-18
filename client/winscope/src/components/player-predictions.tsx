import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PlayerPredictionsProps {
  player: any
}

interface PredictedStats {
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
}

interface Prediction {
  predictedStats: PredictedStats
  predictionDate: string
  team: string
}

export function PlayerPredictions({ player }: PlayerPredictionsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const urlRoot = import.meta.env.VITE_API_URL || ""

  useEffect(() => {
    async function fetchPredictions() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`${urlRoot}api/predictions/playerPrediction/${player.playerId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch predictions")
        setPredictions(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (player?.playerId) fetchPredictions()
  }, [player?.playerId])

  if (loading) {
    return <div className="py-8 text-center">Loading predictions...</div>
  }
  if (error) {
    return <div className="py-8 text-center text-red-600">{error}</div>
  }
  if (!predictions || predictions.length === 0) {
    return <div className="py-8 text-center text-gray-500">No predictions available for this player.</div>
  }

  const latestPrediction = predictions[0]
  const { predictedStats } = latestPrediction

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Predicted Performance</CardTitle>
          <CardDescription>Latest machine learning predictions for {player.playerName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Points</div>
              <div className="text-2xl font-bold">{predictedStats.points.toFixed(1)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Rebounds</div>
              <div className="text-2xl font-bold">{predictedStats.rebounds.toFixed(1)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Assists</div>
              <div className="text-2xl font-bold">{predictedStats.assists.toFixed(1)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Steals</div>
              <div className="text-2xl font-bold">{predictedStats.steals.toFixed(1)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Blocks</div>
              <div className="text-2xl font-bold">{predictedStats.blocks.toFixed(1)}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Prediction Date: {new Date(latestPrediction.predictionDate).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 