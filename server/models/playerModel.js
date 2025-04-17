import mongoose from 'mongoose';
// MongoDB Player Schema
const playerStatsSchema = new mongoose.Schema({
  // Player identification
  name: String,
  team: String,
  position: String,
  playerId: String,
  playerUrl: String,
  teamLogo: String,
  rank: Number,
  // Stats as a flexible object
  stats: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Historical performance data
  historicalPerformance: {
    rollingAvg5: {
      MIN: Number,
      FGPERCENT: Number,
      FTPERCENT: Number,
      REB: Number,
      AST: Number,
      BLK: Number,
      STL: Number,
      PF: Number,
      TO: Number,
      PTS: Number
    },
    rollingAvg10: {
      GP: Number,
      MIN: Number,
      FGPERCENT: Number,
      FTPERCENT: Number,
      REB: Number,
      AST: Number,
      BLK: Number,
      STL: Number,
      PF: Number,
      TO: Number,
      PTS: Number
    },
    vsOpponentAvg: {
      PTS: Number,
      REB: Number,
      AST: Number
    }
  },
  // Recent games
  recentGames: [
    {
      date: String,
      opponent: String,
      isHome: Boolean,
      result: String,
      score: String,
      minutes: Number,
      fgPercent: Number,
      fg3Percent: Number,
      ftPercent: Number,
      rebounds: Number,
      assists: Number,
      blocks: Number,
      steals: Number,
      fouls: Number,
      turnovers: Number,
      points: Number
    }
  ],
  
  // Metadata
  scrapedDate: {
    type: Date,
    default: Date.now
  }
});

// Create the model only if it hasn't been registered yet
let PlayerStats;
try {
  // Try to get the existing model first
  PlayerStats = mongoose.model('Player');
} catch (error) {
  // Model doesn't exist yet, create it
  PlayerStats = mongoose.model('Player', playerStatsSchema);
}

export { PlayerStats };