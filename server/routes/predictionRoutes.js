import express from 'express';
import { getPlayerPredictions } from '../models/predictionModel.js';
import {getPlayerByID,getPlayerStatsByID, getAllPlayerStats} from '../src/api.js';
const router = express.Router();

/**
 * @route   GET /api/predictions/player/:playerId
 * @desc    Get prediction for a single player
 * @access  Public
 */
router.get('/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await getPlayerByID(playerId);
    return res.json(player);
  } catch (error) {
    console.error('Error getting player prediction:', error);
    res.status(500).json({ 
      error: 'Error getting player prediction',
      details: error.message 
    });
  }
});
/**
 * @route   GET /api/predictions/player/allPlayers
 * @desc    Get stats for all players
 * @access  Public
 */
router.get('/allPlayers', async (req, res) => {
  try {
    const stats = await getAllPlayerStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return res.status(500).json({ 
      error: 'Error fetching player stats',
      details: error.message 
    });
  }
});
/**
 * @route   GET /api/predictions/player/:playerId
 * @desc    Get prediction for a single player
 * @access  Public
 */
router.get('/playerStats/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const playerStats = await getPlayerStatsByID(playerId);
    return res.json(playerStats);
  } catch (error) {
    console.error('Error getting player prediction:', error);
    res.status(500).json({ 
      error: 'Error getting player prediction',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/predictions/player/:playerId
 * @desc    Get prediction for a single player
 * @access  Public
 */
router.get('/playerPrediction/:playerId', async (req, res) => {
  try {
    const prediction = await axios.get('http://localhost:5000/prediction/',{
      player_id: playerId
    });
    return res.json(prediction);
  } catch (error) {
    console.error('Error getting player prediction:', error);
    res.status(500).json({ 
      error: 'Error getting player prediction',
      details: error.message 
    });
  }
});
/**
 * @route   POST /api/predictions/players
 * @desc    Get predictions for multiple players
 * @access  Public
 */
router.post('/players', async (req, res) => {
  try {
    const { playerIds, date, opponent, isHome } = req.body;

    // Validate required parameters
    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0 || !date || !opponent) {
      return res.status(400).json({ 
        error: 'Missing required parameters: playerIds (array), date, and opponent are required' 
      });
    }

    // Convert isHome to boolean
    const isHomeGame = isHome === true;

    const nextGameInfo = {
      date: new Date(date),
      opponent,
      isHome: isHomeGame
    };

    const predictions = await getPredictionsForPlayers(playerIds, nextGameInfo);
    res.json(predictions);
  } catch (error) {
    console.error('Error getting predictions for players:', error);
    res.status(500).json({ 
      error: 'Error getting predictions for players',
      details: error.message 
    });
  }
});

export default router; 