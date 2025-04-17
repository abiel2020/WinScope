const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Player = require('../models/playerModel');
const { connectToDatabase, closeConnection } = require('../config/database');

/**
 * Process ESPN stats table HTML and extract player information
 * @param {string} html - The raw HTML content of the ESPN stats table
 * @returns {Array} - An array of player stat objects
 */
async function processStatsTable(html) {
  try {
    const $ = cheerio.load(html);
    
    // Extract header names
    const headers = [];
    $('.Table__THEAD .Table__sub-header th').each((index, element) => {
      // Try different ways to get header text
      let headerText = '';
      if ($(element).find('div').length) {
        headerText = $(element).find('div').text().trim();
      } else if ($(element).find('a').length) {
        headerText = $(element).find('a').text().trim();
      } else {
        headerText = $(element).text().trim();
      }
      
      // Clean up the header text (remove sort indicators)
      headerText = headerText.replace(/[▲▼]|svg/g, '').trim();
      headers.push(headerText);
    });
    
    console.log('Found headers:', headers);
    
    // Process each row (player)
    const players = [];
    $('.Table__TBODY .Table__TR').each((index, row) => {
      const playerObj = {
        stats: {}
      };
      
      // Extract position
      const positionCell = $(row).find('td:first-child');
      if (positionCell.length) {
        playerObj.position = positionCell.find('div').text().trim();
      }
      
      // Extract all stats
      $(row).find('td').each((cellIndex, cell) => {
        if (cellIndex < headers.length && headers[cellIndex]) {
          const headerName = headers[cellIndex];
          const value = $(cell).text().trim();
          
          // Convert numeric values to numbers
          if (!isNaN(parseFloat(value)) && isFinite(value)) {
            playerObj.stats[headerName] = parseFloat(value);
          } else {
            playerObj.stats[headerName] = value;
          }
        }
      });
      
      players.push(playerObj);
    });
    
    console.log(`Processed ${players.length} player stat rows`);
    return players;
  } catch (error) {
    console.error('Error processing stats HTML:', error);
    throw error;
  }
}

/**
 * Links stat data with player data based on rank or name
 * @param {Array} statsData - Array of player stats
 * @param {Array} playerData - Array of player info (name, team, etc.)
 * @returns {Array} - Combined player data with stats
 */
function linkPlayerData(statsData, playerData) {
  // This function would merge player basic info with their stats
  // For this simplified example, we just return the stats
  return statsData.map(player => {
    // In a real implementation, you'd match players based on name, ID or other identifiers
    return player;
  });
}

/**
 * Save player stats to MongoDB
 * @param {Array} playerData - Array of player objects with stats
 */
async function savePlayerStatsToMongoDB(playerData) {
  try {
    await connectToDatabase();
    
    // Clear existing data (optional)
    await Player.deleteMany({});
    
    // Insert new data
    await Player.insertMany(playerData);
    console.log('Player stats saved to MongoDB');
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    await closeConnection();
  }
}

/**
 * Process ESPN stats HTML directly
 * @param {string} html - The raw HTML content
 * @returns {Array} - Processed player data
 */
async function processESPNStatsHtml(html) {
  try {
    const statsData = await processStatsTable(html);
    await savePlayerStatsToMongoDB(statsData);
    return statsData;
  } catch (error) {
    console.error('Error processing ESPN stats HTML:', error);
    throw error;
  }
}

// Export functions for use in other modules
module.exports = {
  processStatsTable,
  linkPlayerData,
  savePlayerStatsToMongoDB,
  processESPNStatsHtml
};