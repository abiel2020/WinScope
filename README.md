# WinScope: NBA Player Analytics Dashboard

WinScope is a modern NBA Player Analytics Dashboard that empowers users to explore, compare, and predict NBA player performance using advanced data visualization and machine learning. The platform is designed for basketball enthusiasts, analysts, and professionals who want to make data-driven decisions and gain deep insights into player statistics and trends.

## Features

- **Interactive Dashboard:** View, search, and filter NBA players by name, team, or position.
- **Player Analysis:** Dive into detailed player pages with season averages, recent game stats, and advanced analytics.
- **ML Predictions:** Get machine learning-powered predictions for player performance in upcoming games and the rest of the season.
- **Player Comparison:** Compare players side-by-side using radar charts and similarity scores.
- **Custom Reports:** Generate custom analytics and reports for deeper insights.
- **Responsive UI:** Beautiful, mobile-friendly design with smooth navigation and modern UI components.

## Tech Stack

- **Frontend:**
  - [React](https://react.dev/) (with [Vite](https://vitejs.dev/) for fast development)
  - [React Router](https://reactrouter.com/) for client-side routing
  - [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
  - [Radix UI](https://www.radix-ui.com/) for accessible, unstyled UI primitives
  - [Lucide React](https://lucide.dev/) for icons
  - [Recharts](https://recharts.org/) for data visualization (bar, line, and radar charts)

- **Backend:**
  - [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/) (API server)
  - [MongoDB Atlas](https://www.mongodb.com/atlas/database) (cloud database for player stats and predictions)
  - [Python](https://www.python.org/) (for machine learning scripts and data processing)

- **Other Tools:**
  - [TypeScript](https://www.typescriptlang.org/) for type safety
  - [ESLint](https://eslint.org/) for code quality
  - [Vite](https://vitejs.dev/) for fast builds and hot module replacement

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/winscope.git
   cd winscope
   ```
2. **Install dependencies:**
   ```bash
   cd client/winscope
   npm install

   cd server
   npm install
   ```
3. **Start the development server and client:**
   ```bash
   npm run dev
   ```
4. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) to view the app.

