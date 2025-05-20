import { useState, useEffect } from "react"
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

const urlRoot = import.meta.env.VITE_API_URL || ""

export function Dashboard() {
  const [players, setPlayers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name-asc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`${urlRoot}api/predictions/allPlayers`)
        const data = await res.json()
        console.log("Data:", data);
        if (!res.ok) throw new Error(data.error || "Failed to fetch players")
        setPlayers(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayers()
  }, [])

  let filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPosition = positionFilter === "all" || player.position === positionFilter
    return matchesSearch && matchesPosition
  })

  // Sorting logic
  if (sortBy === "name-asc") {
    filteredPlayers = filteredPlayers.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy === "name-desc") {
    filteredPlayers = filteredPlayers.sort((a, b) => b.name.localeCompare(a.name))
  } else if (sortBy === "rank-asc") {
    filteredPlayers = filteredPlayers.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
  } else if (sortBy === "rank-desc") {
    filteredPlayers = filteredPlayers.sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
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
            </DropdownMenu> */}
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
              {/* Sort dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="rank-asc">Rank (Low to High)</SelectItem>
                  <SelectItem value="rank-desc">Rank (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <span>Loading players...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10 text-red-600">
              <span>{error}</span>
            </div>
          ) : (
            <Tabs defaultValue="all" className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Players</TabsTrigger>
                {/* <TabsTrigger value="trending">Trending</TabsTrigger> */}
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredPlayers.map((player) => (
                    <PlayerCard key={player.id || player._id} player={player} />
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
                      <PlayerCard key={player.id || player._id} player={player} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
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