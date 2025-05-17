import { useState } from "react"
import { Link } from "react-router-dom"
import { CircleDotIcon, Bell, LogOut, Search, Settings, User } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayerCard } from "@/components/player-card"

// Mock data for players
const players = [
  {
    id: 1,
    name: "LeBron James",
    team: "Los Angeles Lakers",
    position: "SF",
    ppg: 25.7,
    rpg: 7.3,
    apg: 8.3,
    image: "/placeholder.svg?height=150&width=150",
    trend: "up",
  },
  {
    id: 2,
    name: "Stephen Curry",
    team: "Golden State Warriors",
    position: "PG",
    ppg: 29.4,
    rpg: 6.1,
    apg: 6.3,
    image: "/placeholder.svg?height=150&width=150",
    trend: "stable",
  },
  {
    id: 3,
    name: "Giannis Antetokounmpo",
    team: "Milwaukee Bucks",
    position: "PF",
    ppg: 28.3,
    rpg: 11.3,
    apg: 5.7,
    image: "/placeholder.svg?height=150&width=150",
    trend: "up",
  },
  {
    id: 4,
    name: "Kevin Durant",
    team: "Phoenix Suns",
    position: "SF",
    ppg: 27.1,
    rpg: 6.9,
    apg: 5.0,
    image: "/placeholder.svg?height=150&width=150",
    trend: "down",
  },
  {
    id: 5,
    name: "Nikola Jokić",
    team: "Denver Nuggets",
    position: "C",
    ppg: 24.5,
    rpg: 11.8,
    apg: 9.8,
    image: "/placeholder.svg?height=150&width=150",
    trend: "up",
  },
  {
    id: 6,
    name: "Joel Embiid",
    team: "Philadelphia 76ers",
    position: "C",
    ppg: 30.6,
    rpg: 11.7,
    apg: 4.2,
    image: "/placeholder.svg?height=150&width=150",
    trend: "stable",
  },
  {
    id: 7,
    name: "Luka Dončić",
    team: "Dallas Mavericks",
    position: "PG",
    ppg: 32.4,
    rpg: 8.6,
    apg: 9.1,
    image: "/placeholder.svg?height=150&width=150",
    trend: "up",
  },
  {
    id: 8,
    name: "Jayson Tatum",
    team: "Boston Celtics",
    position: "SF",
    ppg: 26.9,
    rpg: 8.1,
    apg: 4.3,
    image: "/placeholder.svg?height=150&width=150",
    trend: "up",
  },
]

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPosition = positionFilter === "all" || player.position === positionFilter

    return matchesSearch && matchesPosition
  })

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
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Player Dashboard</h1>
              <p className="text-gray-500">View and analyze NBA player statistics and predictions</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search players or teams..."
                  className="w-full pl-8 md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="PG">Point Guard (PG)</SelectItem>
                  <SelectItem value="SG">Shooting Guard (SG)</SelectItem>
                  <SelectItem value="SF">Small Forward (SF)</SelectItem>
                  <SelectItem value="PF">Power Forward (PF)</SelectItem>
                  <SelectItem value="C">Center (C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Players</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
              {filteredPlayers.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="mb-2 text-lg font-medium">No players found</p>
                    <p className="text-center text-gray-500">Try adjusting your search or filter criteria</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="trending" className="mt-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPlayers
                  .filter((player) => player.trend === "up")
                  .map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="favorites" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Favorites</CardTitle>
                  <CardDescription>You haven't added any players to your favorites yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>Browse Players</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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