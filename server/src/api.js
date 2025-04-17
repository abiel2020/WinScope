import { connectToDatabase, closeConnection, getCollection } from '../config/database.js';
/**
 * getAllEmployees(): is a function that is responsible for allowing you
 * request a list of employees stored in the database.
 */
async function getAllPlayerStats()  { 
    await connectToDatabase();
  const playerStatsCollection = getCollection('playerstats');
  const stats = await playerStatsCollection.find({}).toArray();
  return stats;
}

async function getPlayerByID(playerId) {
  try {
    await connectToDatabase();
    const playerStatsCollection = getCollection('playerstats');
    
    // Find player by ID
    const player = await playerStatsCollection.findOne({ playerId: playerId });
    
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    return player;
  } catch (error) {
    console.error(`Error fetching player with ID ${playerId}:`, error);
    throw error;
  } finally {
    await closeConnection();
  }
}

async function getPlayerStatsByID(playerId) {
  try {
    await connectToDatabase();
    const playerStatsCollection = getCollection('playerstats');
    
    // Find player by ID and project only the stats field
    const player = await playerStatsCollection.findOne(
      { playerId: playerId },
      { projection: { stats: 1, historicalPerformance: 1, recentGames: 1 } }
    );
    
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    // Return the stats object with historical data
    const stats = {currentStats: player.stats};
    return stats;
  } catch (error) {
    console.error(`Error fetching player stats for ID ${playerId}:`, error);
    throw error;
  } finally {
    await closeConnection();
  }
}

export {getAllPlayerStats, getPlayerByID, getPlayerStatsByID}