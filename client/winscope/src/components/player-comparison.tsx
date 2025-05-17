import { useState } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PlayerComparisonProps {
  player: any
}

export function PlayerComparison({ player }: PlayerComparisonProps) {
  const [comparisonPlayer, setComparisonPlayer] = useState("lebron-james")

  // Mock data for player comparison
  const comparisonPlayers = [
    { id: "lebron-james", name: "LeBron James" },
    { id: "stephen-curry", name: "Stephen Curry" },
    { id: "kevin-durant", name: "Kevin Durant" },
    { id: "giannis-antetokounmpo", name: "Giannis Antetokounmpo" },
    { id: "nikola-jokic", name: "Nikola Jokić" },
  ]

  // Mock data for radar chart
  const radarData = [
    { subject: "Scoring", A: 120, B: 110, fullMark: 150 },
    { subject: "Playmaking", A: 98, B: 130, fullMark: 150 },
    { subject: "Defense", A: 86, B: 130, fullMark: 150 },
    { subject: "Rebounding", A: 99, B: 100, fullMark: 150 },
    { subject: "Efficiency", A: 85, B: 90, fullMark: 150 },
    { subject: "Clutch", A: 65, B: 85, fullMark: 150 },
  ]

  // Mock data for similarity score
  const similarityScore = 78

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Player Comparison</h3>
          <p className="text-sm text-gray-500">Compare with other NBA players</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={comparisonPlayer} onValueChange={setComparisonPlayer}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {comparisonPlayers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Compare
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Skill Comparison</CardTitle>
            <CardDescription>
              {player.name} vs. {comparisonPlayers.find((p) => p.id === comparisonPlayer)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} />
                  <Radar name={player.name} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar
                    name={comparisonPlayers.find((p) => p.id === comparisonPlayer)?.name}
                    dataKey="B"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">{player.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span className="text-sm">{comparisonPlayers.find((p) => p.id === comparisonPlayer)?.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Similarity Score</CardTitle>
            <CardDescription>Based on playing style and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-4 flex h-40 w-40 items-center justify-center rounded-full border-8 border-gray-100">
                <div
                  className="absolute inset-0 rounded-full border-8 border-blue-500"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%, 0 0, 0 ${100 - similarityScore}%, ${similarityScore}% ${100 - similarityScore}%, ${similarityScore}% 0%, 0 0)`,
                  }}
                ></div>
                <span className="text-4xl font-bold">{similarityScore}%</span>
              </div>
              <p className="text-center text-sm text-gray-500">
                {player.name} and {comparisonPlayers.find((p) => p.id === comparisonPlayer)?.name} have a{" "}
                {similarityScore}% similarity in their playing style and statistical output.
              </p>
              <div className="mt-6 grid w-full grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-xs font-medium text-gray-500">Strengths</p>
                  <p className="text-sm">Scoring, Playmaking</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-xs font-medium text-gray-500">Differences</p>
                  <p className="text-sm">Defense, Clutch</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistical Comparison</CardTitle>
          <CardDescription>Season averages comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Stat</th>
                  <th className="py-2 text-center font-medium">{player.name}</th>
                  <th className="py-2 text-center font-medium">
                    {comparisonPlayers.find((p) => p.id === comparisonPlayer)?.name}
                  </th>
                  <th className="py-2 text-center font-medium">Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-left">PPG</td>
                  <td className="py-2 text-center">{player.ppg}</td>
                  <td className="py-2 text-center">27.1</td>
                  <td className="py-2 text-center text-green-600">+1.4</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-left">RPG</td>
                  <td className="py-2 text-center">{player.rpg}</td>
                  <td className="py-2 text-center">7.1</td>
                  <td className="py-2 text-center text-green-600">+0.2</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-left">APG</td>
                  <td className="py-2 text-center">{player.apg}</td>
                  <td className="py-2 text-center">7.5</td>
                  <td className="py-2 text-center text-red-600">-0.8</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-left">FG%</td>
                  <td className="py-2 text-center">{player.fg}%</td>
                  <td className="py-2 text-center">49.5%</td>
                  <td className="py-2 text-center text-green-600">+4.0%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-left">3PT%</td>
                  <td className="py-2 text-center">{player.threept}%</td>
                  <td className="py-2 text-center">35.2%</td>
                  <td className="py-2 text-center text-green-600">+3.4%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              This comparison is based on the current season statistics and may not reflect career averages or peak
              performance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 