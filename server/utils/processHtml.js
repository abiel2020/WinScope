import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as mongoose from 'mongoose';
import {PlayerStats} from '../models/playerModel.js';
import 'dotenv/config';
// Import database connection
import { connectToDatabase, closeConnection } from '../config/database.js';

// Process saved HTML
async function processESPNHtml(htmlContent) {
  try {
    const $ = cheerio.load(htmlContent);
    const playerData = [];
    
    // Process each row in the table
    $('.Table__TBODY .Table__TR').each((index, row) => {
      // Get rank
      const rankCell = $(row).find('td:first-child');
      const rank = rankCell.length ? parseInt(rankCell.text().trim()) : null;
      
      // Get player info
      const playerCell = $(row).find('td:nth-child(2)');
      if (!playerCell.length) return;
      
      const playerLink = playerCell.find('a');
      const playerName = playerLink.length ? playerLink.text().trim() : null;
      const playerUrl = playerLink.length ? playerLink.attr('href') : null;
      
      // Extract player ID
      let playerId = null;
      if (playerLink.length && playerLink.attr('data-player-uid')) {
        const idParts = playerLink.attr('data-player-uid').split(':');
        playerId = idParts[idParts.length - 1];
      } else if (playerUrl) {
        const idMatch = playerUrl.match(/\/id\/(\d+)\//);
        playerId = idMatch ? idMatch[1] : null;
      }
      
      // Get team info
      const teamAbbrev = playerCell.find('.athleteCell__teamAbbrev');
      const team = teamAbbrev.length ? teamAbbrev.text().trim() : null;
      
      // Get team logo URL
      const teamLogo = playerCell.find('.Athlete__Flag');
      const logoUrl = teamLogo.length ? teamLogo.attr('src') : null;
      
      playerData.push({
        rank,
        name: playerName,
        team,
        playerUrl,
        playerId,
        teamLogo: logoUrl
      });
    });
    
    console.log(`Processed ${playerData.length} players from HTML`);
    return playerData;
  } catch (error) {
    console.error('HTML processing error:', error);
    throw error;
  }
}

// Save to MongoDB
async function saveToMongoDB(playerData) {
  try {
    await connectToDatabase();
    
    // Clear existing data (optional)
    await Player.deleteMany({});
    
    // Insert new data
    await Player.insertMany(playerData);
    console.log('Player data saved to MongoDB');
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    mongoose.disconnect();
  }
}

// For direct usage with a file
async function processFromFile(filePath) {
  try {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const playerData = await processESPNHtml(htmlContent);
    await saveToMongoDB(playerData);
    return playerData;
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
}

// Main execution if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Default file path - adjust as needed
  const filePath = path.join(__dirname, 'espn_data.html');
  
  processFromFile(filePath)
    .then(() => {
      console.log('Processing completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Processing failed:', error);
      process.exit(1);
    });
}

export { processESPNHtml, saveToMongoDB, processFromFile };