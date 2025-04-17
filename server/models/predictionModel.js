import mongoose from 'mongoose';
import { PlayerStats } from './playerModel.js';

// Define the prediction schema
const predictionSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    ref: 'PlayerStats'
  },
  predictedStats: {
    points: Number,
    rebounds: Number,
    assists: Number,
    blocks: Number,
    steals: Number,
    turnovers: Number,
    minutes: Number,
    fgPercent: Number,
    fg3Percent: Number,
    ftPercent: Number
  },
  confidence: {
    points: Number,
    rebounds: Number,
    assists: Number,
    blocks: Number,
    steals: Number,
    turnovers: Number,
    minutes: Number,
    fgPercent: Number,
    fg3Percent: Number,
    ftPercent: Number
  },
  predictionDate: {
    type: Date,
    default: Date.now
  },
  nextGameDate: Date,
  nextOpponent: String,
  isHome: Boolean
});

// Create or retrieve the model
let Prediction;
try {
  Prediction = mongoose.model('Prediction');
} catch (error) {
  Prediction = mongoose.model('Prediction', predictionSchema);
}

/**
 * Calculate prediction confidence based on historical variance
 * @param {Array} historicalData - Array of historical game data
 * @param {string} stat - The stat to calculate confidence for
 * @returns {number} - Confidence score between 0 and 1
 */
function calculateConfidence(historicalData, stat) {
  if (!historicalData || historicalData.length < 5) return 0.5;

  const values = historicalData.map(game => game[stat]).filter(val => val !== undefined);
  if (values.length === 0) return 0.5;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = higher confidence
  const maxStdDev = mean * 0.5; // 50% of mean as maximum standard deviation
  const confidence = Math.max(0, 1 - (stdDev / maxStdDev));
  
  return confidence;
}

/**
 * Predict player stats for next game
 * @param {string} playerId - The player's ID
 * @param {Object} nextGameInfo - Information about the next game
 * @returns {Promise<Object>} - Predicted stats and confidence scores
 */
async function predictPlayerStats(playerId, nextGameInfo) {
  try {
    // Get player data
    const player = await PlayerStats.findOne({ playerId });
    if (!player) {
      throw new Error('Player not found');
    }

    // Get recent games and rolling averages
    const recentGames = player.recentGames || [];
    const rollingAvg5 = player.historicalPerformance.rollingAvg5;
    const rollingAvg10 = player.historicalPerformance.rollingAvg10;
    const currentStats = player.stats;

    // Calculate weighted predictions
    const predictions = {
      points: 0,
      rebounds: 0,
      assists: 0,
      blocks: 0,
      steals: 0,
      turnovers: 0,
      minutes: 0,
      fgPercent: 0,
      fg3Percent: 0,
      ftPercent: 0
    };

    const confidence = {
      points: 0,
      rebounds: 0,
      assists: 0,
      blocks: 0,
      steals: 0,
      turnovers: 0,
      minutes: 0,
      fgPercent: 0,
      fg3Percent: 0,
      ftPercent: 0
    };

    // Weight factors for different data sources
    const weights = {
      recentGames: 0.4,
      rollingAvg5: 0.3,
      rollingAvg10: 0.2,
      seasonStats: 0.1
    };

    // Calculate predictions for each stat
    const stats = ['points', 'rebounds', 'assists', 'blocks', 'steals', 'turnovers', 'minutes'];
    const percentages = ['fgPercent', 'fg3Percent', 'ftPercent'];

    // Predict counting stats
    stats.forEach(stat => {
      const recentGamesValue = recentGames.slice(0, 5).reduce((sum, game) => sum + (game[stat] || 0), 0) / 5;
      const rolling5Value = rollingAvg5[stat.toUpperCase()] || 0;
      const rolling10Value = rollingAvg10[stat.toUpperCase()] || 0;
      const seasonValue = currentStats[stat] || 0;

      predictions[stat] = 
        (recentGamesValue * weights.recentGames) +
        (rolling5Value * weights.rollingAvg5) +
        (rolling10Value * weights.rollingAvg10) +
        (seasonValue * weights.seasonStats);

      confidence[stat] = calculateConfidence(recentGames, stat);
    });

    // Predict percentage stats
    percentages.forEach(stat => {
      const recentGamesValue = recentGames.slice(0, 5).reduce((sum, game) => sum + (game[stat] || 0), 0) / 5;
      const rolling5Value = rollingAvg5[stat.toUpperCase()] || 0;
      const rolling10Value = rollingAvg10[stat.toUpperCase()] || 0;
      const seasonValue = currentStats[stat] || 0;

      predictions[stat] = 
        (recentGamesValue * weights.recentGames) +
        (rolling5Value * weights.rollingAvg5) +
        (rolling10Value * weights.rollingAvg10) +
        (seasonValue * weights.seasonStats);

      confidence[stat] = calculateConfidence(recentGames, stat);
    });

    // Adjust predictions based on home/away
    const homeAwayFactor = nextGameInfo.isHome ? 1.05 : 0.95;
    Object.keys(predictions).forEach(stat => {
      predictions[stat] *= homeAwayFactor;
    });

    // Create prediction record
    const prediction = new Prediction({
      playerId,
      predictedStats: predictions,
      confidence,
      nextGameDate: nextGameInfo.date,
      nextOpponent: nextGameInfo.opponent,
      isHome: nextGameInfo.isHome
    });

    await prediction.save();
    return prediction;
  } catch (error) {
    console.error('Error predicting player stats:', error);
    throw error;
  }
}

/**
 * Get predictions for multiple players
 * @param {Array<string>} playerIds - Array of player IDs
 * @param {Object} nextGameInfo - Information about the next game
 * @returns {Promise<Array>} - Array of predictions
 */
async function getPredictionsForPlayers(playerIds, nextGameInfo) {
  try {
    const predictions = await Promise.all(
      playerIds.map(playerId => predictPlayerStats(playerId, nextGameInfo))
    );
    return predictions;
  } catch (error) {
    console.error('Error getting predictions for players:', error);
    throw error;
  }
}

export { Prediction, predictPlayerStats, getPredictionsForPlayers }; 