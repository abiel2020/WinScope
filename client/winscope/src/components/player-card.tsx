import { Link } from "react-router-dom"
import { ArrowDown, ArrowRight, ArrowUp, CircleDotIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface Player {
  id: number
  name: string
  team: string
  position: string
  ppg: number
  rpg: number
  apg: number
  image: string
  trend: "up" | "down" | "stable"
  teamLogo: string
  stats: any
  playerId: number
}

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case "down":
        return <ArrowDown className="h-4 w-4 text-red-500" />
      case "stable":
        return <CircleDotIcon className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <img
          src={player.teamLogo || "/placeholder.svg"}
          alt={player.team}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <h3 className="text-lg font-bold">{player.name}</h3>
          <p className="text-sm text-gray-500">{player.position} | {player.team}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">PTS:</span> {player.stats?.PTS ?? "-"}
          </div>
          <div>
            <span className="font-medium">REB:</span> {player.stats?.REB ?? "-"}
          </div>
          <div>
            <span className="font-medium">AST:</span> {player.stats?.AST ?? "-"}
          </div>
          <div>
            <span className="font-medium">FG%:</span> {player.stats?.["FG%"] ?? "-"}
          </div>
          <div>
            <span className="font-medium">3P%:</span> {player.stats?.["3P%"] ?? "-"}
          </div>
          <div>
            <span className="font-medium">MIN:</span> {player.stats?.MIN ?? "-"}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/player/${player.playerId}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            View Analysis
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 