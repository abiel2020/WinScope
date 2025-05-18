import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PlayerStatsProps {
  player: any
}

export function PlayerStats({ player }: PlayerStatsProps) {
  // Transform recent games data for the chart
  const chartData = player.recentGames?.map((game: any) => ({
    name: game.opponent,
    Points: game.points,
    Rebounds: game.rebounds,
    Assists: game.assists,
  })) || []

  // Get all stat keys and values
  const statEntries = player.stats ? Object.entries(player.stats) : []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Season Averages</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {statEntries.map(([key, value]) => (
            <div key={key} className="rounded-lg border bg-card p-3 text-center shadow-sm">
              <p className="text-xs font-medium text-gray-500">{key}</p>
              <p className="text-2xl font-bold">{String(value)}</p>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stats</CardTitle>
          <CardDescription>Full list of player stats for the season</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stat</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statEntries.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{String(value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Games Performance</CardTitle>
          <CardDescription>Last 5 games statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Points" fill="#3b82f6" />
                <Bar dataKey="Rebounds" fill="#10b981" />
                <Bar dataKey="Assists" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opponent</TableHead>
                  <TableHead>MIN</TableHead>
                  <TableHead>PTS</TableHead>
                  <TableHead>REB</TableHead>
                  <TableHead>AST</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {player.recentGames?.map((game: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{game.opponent}</TableCell>
                    <TableCell>{game.minutes}</TableCell>
                    <TableCell>{game.points}</TableCell>
                    <TableCell>{game.rebounds}</TableCell>
                    <TableCell>{game.assists}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 