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
      <CardHeader className="p-0">
        <div className="relative h-40 bg-gradient-to-r from-blue-900 to-blue-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={player.image || "/placeholder.svg"}
              alt={player.name}
              className="h-28 w-28 rounded-full border-4 border-white object-cover"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 text-center">
        <h3 className="mb-1 text-xl font-bold">{player.name}</h3>
        <p className="mb-3 text-sm text-gray-500">
          {player.position} | {player.team}
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">PPG</p>
            <p className="text-lg font-semibold">{player.ppg}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">RPG</p>
            <p className="text-lg font-semibold">{player.rpg}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">APG</p>
            <p className="text-lg font-semibold">{player.apg}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1">
          <span className="text-sm font-medium">Trend:</span>
          {getTrendIcon(player.trend)}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/player/${player.id}`} className="w-full">
          <Button className="w-full" variant="outline">
            View Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 