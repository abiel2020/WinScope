import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, CircleDotIcon, Bell, LogOut, Settings, Star, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayerStats } from "@/components/player-stats"
import { PlayerPredictions } from "@/components/player-predictions"
import { PlayerComparison } from "@/components/player-comparison"

// Mock data for players
const players = [
  {
    id: "1",
    name: "LeBron James",
    team: "Los Angeles Lakers",
    position: "SF",
    age: 39,
    height: "6'9\"",
    weight: "250 lbs",
    college: "None",
    drafted: "2003 - Round 1, Pick 1",
    ppg: 25.7,
    rpg: 7.3,
    apg: 8.3,
    spg: 1.1,
    bpg: 0.5,
    fg: 53.5,
    threept: 38.6,
    ft: 75.8,
    image: "/placeholder.svg?height=300&width=300",
    bio: "LeBron James is an American professional basketball player for the Los Angeles Lakers. Widely considered one of the greatest players of all time, James has won four NBA championships, four NBA MVP awards, and two Olympic gold medals.",
    predictions: {
      nextGame: {
        opponent: "Golden State Warriors",
        points: 28,
        rebounds: 8,
        assists: 9,
        confidence: 85,
      },
      season: {
        ppg: 26.2,
        rpg: 7.5,
        apg: 8.1,
        winShare: 9.8,
        per: 25.3,
        confidence: 92,
      },
    },
    recentGames: [
      { opponent: "MIA", points: 28, rebounds: 10, assists: 11, minutes: 38 },
      { opponent: "BOS", points: 32, rebounds: 7, assists: 9, minutes: 36 },
      { opponent: "PHI", points: 25, rebounds: 8, assists: 10, minutes: 35 },
      { opponent: "MIL", points: 30, rebounds: 6, assists: 8, minutes: 37 },
      { opponent: "NYK", points: 27, rebounds: 9, assists: 7, minutes: 34 },
    ],
  },
  {
    id: "2",
    name: "Stephen Curry",
    team: "Golden State Warriors",
    position: "PG",
    age: 36,
    height: "6'2\"",
    weight: "185 lbs",
    college: "Davidson",
    drafted: "2009 - Round 1, Pick 7",
    ppg: 29.4,
    rpg: 6.1,
    apg: 6.3,
    spg: 1.3,
    bpg: 0.2,
    fg: 49.1,
    threept: 42.8,
    ft: 91.5,
    image: "/placeholder.svg?height=300&width=300",
    bio: "Stephen Curry is an American professional basketball player for the Golden State Warriors. He is widely regarded as one of the greatest basketball players of all time and the greatest shooter in NBA history.",
    predictions: {
      nextGame: {
        opponent: "Los Angeles Lakers",
        points: 32,
        rebounds: 5,
        assists: 7,
        confidence: 88,
      },
      season: {
        ppg: 30.1,
        rpg: 5.8,
        apg: 6.5,
        winShare: 10.2,
        per: 26.8,
        confidence: 90,
      },
    },
    recentGames: [
      { opponent: "LAC", points: 35, rebounds: 5, assists: 8, minutes: 36 },
      { opponent: "DEN", points: 28, rebounds: 6, assists: 7, minutes: 34 },
      { opponent: "PHX", points: 33, rebounds: 4, assists: 9, minutes: 35 },
      { opponent: "SAC", points: 30, rebounds: 7, assists: 6, minutes: 33 },
      { opponent: "POR", points: 38, rebounds: 5, assists: 8, minutes: 37 },
    ],
  },
]

export default function PlayerPage() {
  const params = useParams()
  const playerId = params.id

  // Find the player based on the ID from the URL
  const player = players.find((p) => p.id === playerId) || players[0]

  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <CircleDotIcon className="h-6 w-6 text-red-600" />
            <span>NBA Analytics Pro</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">john.doe@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="container py-6">
          <div className="mb-6">
            <Link to="/dashboard" className="mb-4 flex items-center text-blue-600 hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={player.image || "/placeholder.svg"}
                  alt={player.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-3xl font-bold">{player.name}</h1>
                  <p className="text-gray-500">
                    {player.position} | {player.team}
                  </p>
                </div>
              </div>
              <Button
                variant={isFavorite ? "default" : "outline"}
                className={isFavorite ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Star className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Favorited" : "Add to Favorites"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium text-gray-500">Team</div>
                    <div className="text-sm">{player.team}</div>
                    <div className="text-sm font-medium text-gray-500">Position</div>
                    <div className="text-sm">{player.position}</div>
                    <div className="text-sm font-medium text-gray-500">Age</div>
                    <div className="text-sm">{player.age}</div>
                    <div className="text-sm font-medium text-gray-500">Height</div>
                    <div className="text-sm">{player.height}</div>
                    <div className="text-sm font-medium text-gray-500">Weight</div>
                    <div className="text-sm">{player.weight}</div>
                    <div className="text-sm font-medium text-gray-500">College</div>
                    <div className="text-sm">{player.college}</div>
                    <div className="text-sm font-medium text-gray-500">Drafted</div>
                    <div className="text-sm">{player.drafted}</div>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm font-medium text-gray-500">Bio</div>
                    <p className="mt-1 text-sm">{player.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <Tabs defaultValue="stats">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Player Analysis</CardTitle>
                    <TabsList>
                      <TabsTrigger value="stats">Stats</TabsTrigger>
                      <TabsTrigger value="predictions">Predictions</TabsTrigger>
                      <TabsTrigger value="comparison">Comparison</TabsTrigger>
                    </TabsList>
                  </div>
                  <CardDescription>View detailed statistics, ML predictions, and player comparisons</CardDescription>
                </CardHeader>
                <CardContent>
                  <TabsContent value="stats" className="mt-0">
                    <PlayerStats player={player} />
                  </TabsContent>
                  <TabsContent value="predictions" className="mt-0">
                    <PlayerPredictions player={player} />
                  </TabsContent>
                  <TabsContent value="comparison" className="mt-0">
                    <PlayerComparison player={player} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500">© 2025 NBA Analytics Pro. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
            <Link to="#" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 