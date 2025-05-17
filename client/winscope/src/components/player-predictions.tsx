import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PlayerPredictionsProps {
  player: any
}

export function PlayerPredictions({ player }: PlayerPredictionsProps) {
  // Mock data for prediction trends
  const predictionTrends = [
    { name: "Nov", actual: 24.2, predicted: 23.8 },
    { name: "Dec", actual: 25.7, predicted: 25.2 },
    { name: "Jan", actual: 26.3, predicted: 26.5 },
    { name: "Feb", actual: 25.8, predicted: 26.0 },
    { name: "Mar", actual: 27.1, predicted: 26.8 },
    { name: "Apr", actual: null, predicted: 28.2 },
    { name: "May", actual: null, predicted: 28.5 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Next Game Prediction</CardTitle>
            <CardDescription>vs. {player.predictions.nextGame.opponent}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Points</span>
                  <span className="text-sm font-bold">{player.predictions.nextGame.points}</span>
                </div>
                <Progress value={player.predictions.nextGame.points * 2} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Rebounds</span>
                  <span className="text-sm font-bold">{player.predictions.nextGame.rebounds}</span>
                </div>
                <Progress value={player.predictions.nextGame.rebounds * 5} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Assists</span>
                  <span className="text-sm font-bold">{player.predictions.nextGame.assists}</span>
                </div>
                <Progress value={player.predictions.nextGame.assists * 5} className="h-2" />
              </div>
              <div className="mt-6 rounded-lg bg-blue-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Prediction Confidence</span>
                  <span className="text-sm font-bold text-blue-800">{player.predictions.nextGame.confidence}%</span>
                </div>
                <Progress
                  value={player.predictions.nextGame.confidence}
                  className="h-2 bg-blue-200"
                  indicatorClassName="bg-blue-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Season Projection</CardTitle>
            <CardDescription>End of season predicted stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">PPG</p>
                  <p className="text-xl font-bold">{player.predictions.season.ppg}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">RPG</p>
                  <p className="text-xl font-bold">{player.predictions.season.rpg}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">APG</p>
                  <p className="text-xl font-bold">{player.predictions.season.apg}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Win Share</p>
                  <p className="text-xl font-bold">{player.predictions.season.winShare}</p>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Player Efficiency Rating (PER)</span>
                  <span className="text-sm font-bold">{player.predictions.season.per}</span>
                </div>
                <Progress value={player.predictions.season.per * 2} className="h-2" />
              </div>
              <div className="mt-6 rounded-lg bg-blue-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Prediction Confidence</span>
                  <span className="text-sm font-bold text-blue-800">{player.predictions.season.confidence}%</span>
                </div>
                <Progress
                  value={player.predictions.season.confidence}
                  className="h-2 bg-blue-200"
                  indicatorClassName="bg-blue-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Prediction Trend</CardTitle>
          <CardDescription>Actual vs. Predicted Performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionTrends} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis domain={[20, 30]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Actual PPG"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted PPG"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              The ML model has a {player.predictions.season.confidence}% confidence level in these predictions based on
              historical performance data, team dynamics, and opponent matchups.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 