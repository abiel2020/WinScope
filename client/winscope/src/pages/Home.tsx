import { Link } from "react-router-dom"
import { CircleDotIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold">
            <CircleDotIcon className="h-6 w-6 text-red-600" />
            <span>NBA Analytics Pro</span>
          </div>
          <nav className="ml-auto flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-900 to-blue-950 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    NBA Player Analytics Platform
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl">
                    Make data-driven decisions with our advanced NBA player analytics. Predict performance and gain
                    insights.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700">
                      Explore Dashboard
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent rounded-lg blur-xl opacity-50 -z-10"></div>
                <img
                  src="/placeholder.svg?height=550&width=450"
                  alt="NBA Analytics Dashboard Preview"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                  width={550}
                  height={450}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides comprehensive analytics for all NBA players
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <CircleDotIcon className="h-6 w-6 text-blue-900" />
                </div>
                <h3 className="text-xl font-bold">Player Stats</h3>
                <p className="text-center text-gray-500">Comprehensive statistics for all NBA players</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-red-900"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Performance Predictions</h3>
                <p className="text-center text-gray-500">ML-powered predictions for future player performance</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-green-900"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Custom Reports</h3>
                <p className="text-center text-gray-500">Generate custom reports and analytics dashboards</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-100">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold">
              <CircleDotIcon className="h-6 w-6 text-red-600" />
              <span>NBA Analytics Pro</span>
            </div>
            <p className="text-sm text-gray-500">Advanced analytics for basketball professionals</p>
          </div>
          <nav className="ml-auto flex gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Platform</h3>
              <Link to="#" className="text-sm text-gray-500 hover:underline">
                Features
              </Link>
              <Link to="#" className="text-sm text-gray-500 hover:underline">
                Pricing
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Company</h3>
              <Link to="#" className="text-sm text-gray-500 hover:underline">
                About
              </Link>
              <Link to="#" className="text-sm text-gray-500 hover:underline">
                Contact
              </Link>
            </div>
          </nav>
        </div>
        <div className="border-t py-6">
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
        </div>
      </footer>
    </div>
  )
} 