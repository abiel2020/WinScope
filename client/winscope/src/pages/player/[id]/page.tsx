import { useState, useEffect } from "react"
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

const urlRoot = import.meta.env.VITE_API_URL || ""

export default function PlayerPage() {
  const params = useParams()
  const playerId = params.id
  const [player, setPlayer] = useState<any>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchPlayer() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`${urlRoot}api/predictions/player/${playerId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch player data")
        setPlayer(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (playerId) fetchPlayer()
  }, [playerId])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading player data...</div>
  }
  if (error || !player) {
    return <div className="flex min-h-screen items-center justify-center text-red-600">{error || "Player not found."}</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <CircleDotIcon className="h-6 w-6 text-red-600" />
            <span>Winscope</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            {/* <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button> */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger> */}
            {/* <DropdownMenuContent className="w-56" align="end" forceMount>
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
              </DropdownMenuContent> */}
            {/* </DropdownMenu> */}
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
                  src={player.teamLogo || "/placeholder.svg"}
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
              {/* <Button
                variant={isFavorite ? "default" : "outline"}
                className={isFavorite ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Star className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Favorited" : "Add to Favorites"}
              </Button> */}
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
                    <div className="text-sm font-medium text-gray-500">Rank</div>
                    <div className="text-sm">{player.rank ?? '-'}</div>
                    <div className="text-sm font-medium text-gray-500">Player ID</div>
                    <div className="text-sm">{player.playerId}</div>
                    <div className="text-sm font-medium text-gray-500">Team Logo</div>
                    <div className="text-sm"><img src={player.teamLogo || "/placeholder.svg"} alt={player.team} className="h-6 w-6 inline-block" /></div>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm font-medium text-gray-500">Player URL</div>
                    <a href={player.playerUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-blue-600 hover:underline">
                      {player.playerUrl}
                    </a>
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
          <p className="text-sm text-gray-500">© 2025 Winscope. All rights reserved.</p>
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