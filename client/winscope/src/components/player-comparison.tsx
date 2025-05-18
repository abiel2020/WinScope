import { useState, useEffect } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PlayerComparisonProps {
  player: any
}

type StatKey = 'PTS' | 'REB' | 'AST' | 'FG' | '3P' | 'STL' | 'BLK' | 'TO' | 'MIN'

interface Player {
  playerId: string
  name: string
  team: string
  position: string
  stats: {
    [key in StatKey]: number
  }
}

export function PlayerComparison({ player }: PlayerComparisonProps) {
  const [comparisonPlayer, setComparisonPlayer] = useState<string>("")
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const urlRoot = import.meta.env.VITE_API_URL || ""

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`${urlRoot}api/predictions/allPlayers`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch players")
        setPlayers(data)
        // Set initial comparison player to first player in the list
        if (data.length > 0 && !comparisonPlayer) {
          setComparisonPlayer(data[0].playerId)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayers()
  }, [])

  if (loading) {
    return <div className="py-8 text-center">Loading players...</div>
  }
  if (error) {
    return <div className="py-8 text-center text-red-600">{error}</div>
  }

  const selectedPlayer = players.find(p => p.playerId === comparisonPlayer)
  if (!selectedPlayer) return null

  // Calculate radar chart data based on actual stats
  const radarData = [
    { subject: "Scoring", A: player.stats.PTS, B: selectedPlayer.stats.PTS, fullMark: 50 },
    { subject: "Rebounds", A: player.stats.REB, B: selectedPlayer.stats.REB, fullMark: 20 },
    { subject: "Assists", A: player.stats.AST, B: selectedPlayer.stats.AST, fullMark: 15 },
    { subject: "Steals", A: player.stats.STL, B: selectedPlayer.stats.STL, fullMark: 3 },
    { subject: "Blocks", A: player.stats.BLK, B: selectedPlayer.stats.BLK, fullMark: 3 },
    { subject: "Minutes", A: player.stats.MIN, B: selectedPlayer.stats.MIN, fullMark: 40 },
  ]

  return (
    <div className="space-y-6">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="h-6 w-6 text-red-600">🏀</span>
            <span>NBA Analytics Pro</span>
          </Link>
        </div>
      </header>
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
              {players.map((p) => (
                <SelectItem key={p.playerId} value={p.playerId}>
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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Skill Comparison</CardTitle>
            <CardDescription>
              {player.name} vs. {selectedPlayer.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 50]} />
                  <Radar name={player.name} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name={selectedPlayer.name} dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
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
                <span className="text-sm">{selectedPlayer.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    <th className="py-2 text-center font-medium">{selectedPlayer.name}</th>
                    <th className="py-2 text-center font-medium">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(player.stats).map(([key, value]) => {
                    const statKey = key as StatKey
                    const comparisonValue = selectedPlayer.stats[statKey]
                    const diff = Number(value) - Number(comparisonValue)
                    const diffColor = diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : ""
                    const diffPrefix = diff > 0 ? "+" : ""
                    
                    return (
                      <tr key={key} className="border-b">
                        <td className="py-2 text-left">{key}</td>
                        <td className="py-2 text-center">{Number(value).toFixed(1)}</td>
                        <td className="py-2 text-center">{Number(comparisonValue).toFixed(1)}</td>
                        <td className={`py-2 text-center ${diffColor}`}>
                          {diff !== 0 ? `${diffPrefix}${diff.toFixed(1)}` : "0.0"}
                        </td>
                      </tr>
                    )
                  })}
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
    </div>
  )
} 