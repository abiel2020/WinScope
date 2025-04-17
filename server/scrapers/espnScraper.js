import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import 'dotenv/config';

// Import database connection
import { connectToDatabase, closeConnection } from '../config/database.js';

// Define player schema with flexible stats structure and historical performance
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

// Create or retrieve the model
let PlayerStats;
try {
  PlayerStats = mongoose.model('PlayerStats');
} catch (error) {
  PlayerStats = mongoose.model('PlayerStats', playerStatsSchema);
}

/**
 * Recursively click "Load More" button until all players are loaded
 * @param {object} page - Puppeteer page object
 * @param {number} attempt - Current attempt number (to prevent infinite loops)
 * @returns {Promise<number>} - Final number of player rows
 */
async function loadAllPlayers(page, attempt = 1) {
  // Set maximum attempts to prevent infinite loops
  const MAX_ATTEMPTS = 20;
  if (attempt > MAX_ATTEMPTS) {
    console.log(`Reached maximum ${MAX_ATTEMPTS} attempts, stopping.`);
    return await getPlayerCount(page);
  }
  
  // Check if "Load More" button exists
  const hasMoreButton = await page.evaluate(() => {
    return document.querySelector('.loadMore') !== null;
  });
  
  if (!hasMoreButton) {
    console.log('No more "Load More" button found, all players loaded.');
    return await getPlayerCount(page);
  }
  
  // Get current player count for comparison
  const beforeCount = await getPlayerCount(page);
  console.log(`Currently ${beforeCount} players loaded (attempt ${attempt}/${MAX_ATTEMPTS})`);
  
  // Click the "Load More" button
  console.log('Clicking "Load More" button...');
  await page.click('.loadMore');
  
  // Wait for new content to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Wait for player count to increase
  try {
    await page.waitForFunction((prevCount) => {
      const currentCount = document.querySelectorAll('.Table--fixed-left .Table__TBODY .Table__TR').length;
      return currentCount > prevCount;
    }, { timeout: 10000 }, beforeCount);
  } catch (e) {
    console.log('Timeout waiting for new rows, but continuing...');
  }
  
  // Get new count for verification
  const afterCount = await getPlayerCount(page);
  console.log(`Now have ${afterCount} players loaded`);
  
  // If count didn't change, we might be done or there's an issue
  if (afterCount <= beforeCount) {
    console.log('Player count did not increase, finishing...');
    return afterCount;
  }
  
  // Recursively load more players
  return loadAllPlayers(page, attempt + 1);
}

/**
 * Helper function to get the current player count
 * @param {object} page - Puppeteer page object
 * @returns {Promise<number>} - Number of player rows currently loaded
 */
async function getPlayerCount(page) {
  return await page.evaluate(() => {
    return document.querySelectorAll('.Table--fixed-left .Table__TBODY .Table__TR').length;
  });
}

/**
 * Scrape player's recent games data from their profile page
 * @param {object} page - Puppeteer page object
 * @param {string} playerUrl - URL of the player's page
 * @returns {Promise<object>} - Player's recent games data and rolling averages
 */
async function scrapePlayerHistoricalData(page, playerUrl) {
  try {
    console.log(`Navigating to player page: ${playerUrl}`);
    const fullUrl = playerUrl.startsWith('http') ? playerUrl : `https://www.espn.com${playerUrl}`;
    
    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 90000 });
    
    // Wait for the Recent Games section to load
    await page.waitForSelector('.gamelogWidget', { timeout: 30000 }).catch(() => {
      console.log('Could not find Recent Games section for this player');
    });
    
    // Extract the recent games data and calculate rolling averages
    const playerData = await page.evaluate(() => {
      // Find the Recent Games section
      const gamelogSection = document.querySelector('.gamelogWidget');
      if (!gamelogSection) return { recentGames: [] };
      
      // Get column headers
      const headers = [];
      const headerCells = gamelogSection.querySelectorAll('.Table__TR.Table__even th');
      headerCells.forEach(cell => {
        const headerText = cell.getAttribute('title') || cell.textContent.trim();
        headers.push(headerText);
      });
      
      // Extract data from each game row
      const games = [];
      const gameRows = gamelogSection.querySelectorAll('.Table__TBODY .Table__TR.Table__TR--sm');
      
      gameRows.forEach(row => {
        const game = {};
        const cells = row.querySelectorAll('.Table__TD');
        
        cells.forEach((cell, index) => {
          if (index < headers.length) {
            const header = headers[index];
            let value = cell.textContent.trim();
            
            // Handle special case for Date
            if (index === 0) {
              game.date = value;
            }
            // Handle special case for OPP
            else if (header === 'OPP') {
              const oppText = cell.textContent.trim();
              const isHome = !oppText.includes('@');
              const teamLink = cell.querySelector('a');
              const teamName = teamLink ? teamLink.textContent.trim() : oppText.replace('@', '').trim();
              
              game.isHome = isHome;
              game.opponent = teamName;
            }
            // Handle special case for Result (W/L and score)
            else if (header === 'Result' || header === '') {
              const resultCell = cell.querySelector('.ResultCell');
              if (resultCell) {
                game.result = resultCell.textContent.trim(); // W or L
                
                // Extract score
                const scoreText = cell.textContent.replace(game.result, '').trim();
                game.score = scoreText;
              } else {
                game[header.toLowerCase()] = value;
              }
            }
            // Map other stats to our schema
            else {
              // Convert numeric values to numbers
              if (!isNaN(parseFloat(value)) && isFinite(value)) {
                value = parseFloat(value);
              }
              
              // Map headers to our schema fields
              switch(header) {
                case 'MIN': game.minutes = value; break;
                case 'FG%': game.fgPercent = value; break;
                case '3P%': game.fg3Percent = value; break;
                case 'FT%': game.ftPercent = value; break;
                case 'REB': game.rebounds = value; break;
                case 'AST': game.assists = value; break;
                case 'BLK': game.blocks = value; break;
                case 'STL': game.steals = value; break;
                case 'PF': game.fouls = value; break;
                case 'TO': game.turnovers = value; break;
                case 'PTS': game.points = value; break;
                default: game[header.toLowerCase()] = value;
              }
            }
          }
        });
        
        games.push(game);
      });
      
      // Calculate 5-game rolling average
      const rollingAvg5 = {
        MIN: 0.0,
        FGPERCENT: 0.0, 
        FTPERCENT: 0.0,
        REB: 0.0,
        AST: 0.0,
        BLK: 0.0,
        STL: 0.0,
        PF: 0.0,
        TO: 0.0,
        PTS: 0.0
      };

      // Initialize rollingAvg10 with default values
      const rollingAvg10 = {
        GP: 0,
        MIN: 0.0,
        FGPERCENT: 0.0,
        FTPERCENT: 0.0,
        REB: 0.0,
        AST: 0.0,
        BLK: 0.0,
        STL: 0.0,
        PF: 0.0,
        TO: 0.0,
        PTS: 0.0
      };

      // Find the L10 row in the table
      const l10Row = Array.from(gamelogSection.querySelectorAll('.Table__TR')).find(row => {
        const firstCell = row.querySelector('.Table__TD');
        return firstCell && firstCell.textContent.trim() === 'L10';
      });

      if (l10Row) {
        const cells = l10Row.querySelectorAll('.Table__TD');
        if (cells.length >= 13) { // Ensure we have all the cells we need
          rollingAvg10.GP = parseInt(cells[1].textContent.trim()) || 0;
          rollingAvg10.MIN = parseFloat(cells[2].textContent.trim()) || 0.0;
          rollingAvg10.FGPERCENT = parseFloat(cells[3].textContent.trim()) || 0.0;
          rollingAvg10.FG3PERCENT = parseFloat(cells[4].textContent.trim()) || 0.0;
          rollingAvg10.FTPERCENT = parseFloat(cells[5].textContent.trim()) || 0.0;
          rollingAvg10.REB = parseFloat(cells[6].textContent.trim()) || 0.0;
          rollingAvg10.AST = parseFloat(cells[7].textContent.trim()) || 0.0;
          rollingAvg10.BLK = parseFloat(cells[8].textContent.trim()) || 0.0;
          rollingAvg10.STL = parseFloat(cells[9].textContent.trim()) || 0.0;
          rollingAvg10.PF = parseFloat(cells[10].textContent.trim()) || 0.0;
          rollingAvg10.TO = parseFloat(cells[11].textContent.trim()) || 0.0;
          rollingAvg10.PTS = parseFloat(cells[12].textContent.trim()) || 0.0;
        }
      }
      
      // Only calculate 5-game rolling average if we have enough games
      if (games.length >= 5) {
        const last5Games = games.slice(0, 5);
        rollingAvg5.MIN = last5Games.reduce((sum, game) => sum + (game.minutes || 0), 0) / 5;
        rollingAvg5.FGPERCENT = last5Games.reduce((sum, game) => sum + (game.fgPercent || 0), 0) / 5;
        rollingAvg5.FTPERCENT = last5Games.reduce((sum, game) => sum + (game.ftPercent || 0), 0) / 5;
        rollingAvg5.REB = last5Games.reduce((sum, game) => sum + (game.rebounds || 0), 0) / 5;
        rollingAvg5.AST = last5Games.reduce((sum, game) => sum + (game.assists || 0), 0) / 5;
        rollingAvg5.BLK = last5Games.reduce((sum, game) => sum + (game.blocks || 0), 0) / 5;
        rollingAvg5.STL = last5Games.reduce((sum, game) => sum + (game.steals || 0), 0) / 5;
        rollingAvg5.PF = last5Games.reduce((sum, game) => sum + (game.fouls || 0), 0) / 5;
        rollingAvg5.TO = last5Games.reduce((sum, game) => sum + (game.turnovers || 0), 0) / 5;
        rollingAvg5.PTS = last5Games.reduce((sum, game) => sum + (game.points || 0), 0) / 5;
      }
      
      // Return all data
      return {
        recentGames: games,
        historicalPerformance: {
          rollingAvg5,
          rollingAvg10,
          vsOpponentAvg: {
            PTS: 0, // Will require additional data to calculate
            REB: 0,
            AST: 0
          }
        }
      };
    });
    
    return playerData;
  } catch (error) {
    console.error(`Error scraping historical data: ${error.message}`);
    return {
      recentGames: [],
      historicalPerformance: {
        rollingAvg5: { MIN: 0.0, FGPERCENT: 0.0, FTPERCENT: 0.0,  REB: 0, AST: 0, BLK:0.9, STL: 0.0, PF: 0.0, TO: 0.0, PTS: 0.0  },
        rollingAvg10: { GP: 0, MIN: 0.0, FGPERCENT: 0.0, FTPERCENT: 0.0,  REB: 0, AST: 0, BLK:0.9, STL: 0.0, PF: 0.0, TO: 0.0, PTS: 0.0 },
        vsOpponentAvg: { PTS: 0, REB: 0, AST: 0 }
      }
    };
  }
}

/**
 * Scrape ESPN NBA player stats
 */
async function scrapeESPNPlayersAndStats() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    protocolTimeout: 120000, // Increase protocol timeout to 120 seconds
    timeout: 120000, // Increase overall timeout to 120 seconds
    defaultViewport: { width: 1366, height: 768 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Set a larger viewport
    await page.setViewport({ width: 1366, height: 768 });
    
    // Set longer timeouts for navigation and network idle
    await page.setDefaultNavigationTimeout(120000);
    await page.setDefaultTimeout(120000);
    
    // Enable request interception to handle timeouts better
    await page.setRequestInterception(true);
    page.on('request', request => {
      request.continue();
    });
    
    console.log("Navigating to ESPN NBA stats page...");
    await page.goto('https://www.espn.com/nba/stats/player/_/table/offensive/sort/avgPoints/dir/desc', {
      waitUntil: 'networkidle2',
      timeout: 120000
    });
    
    // Wait for the tables to load with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        await page.waitForSelector('.Table__TBODY', { timeout: 30000 });
        break;
      } catch (error) {
        retryCount++;
        console.log(`Retry ${retryCount}/${maxRetries} waiting for table to load...`);
        if (retryCount === maxRetries) {
          throw new Error('Failed to load table after multiple retries');
        }
        await page.reload({ waitUntil: 'networkidle2', timeout: 120000 });
      }
    }
    
    // Load all players by repeatedly clicking "Load More"
    const playerCount = await loadAllPlayers(page);
    console.log(`Successfully loaded all ${playerCount} players`);
    
    console.log("Extracting player data...");
    
    // This is a special approach for ESPN's two-table layout
    const playerData = await page.evaluate(() => {
      // This function safely gets text from an element
      const getText = (element, selector) => {
        if (!element) return null;
        const el = selector ? element.querySelector(selector) : element;
        return el ? el.textContent.trim() : null;
      };
      
      // Get players from left fixed column
      const playerResults = [];
      const playerRows = document.querySelectorAll('.Table--fixed-left .Table__TBODY .Table__TR');
      
      playerRows.forEach((row, index) => {
        // Get player link and extract info
        const playerLink = row.querySelector('a');
        if (!playerLink) return;
        
        const playerName = playerLink.textContent.trim();
        const playerUrl = playerLink.getAttribute('href');
        
        // Extract player ID from URL
        const idMatch = playerUrl ? playerUrl.match(/\/id\/(\d+)\//) : null;
        const playerId = idMatch ? idMatch[1] : null;
        
        // Get team info
        const teamAbbrev = row.querySelector('.athleteCell__teamAbbrev');
        const team = teamAbbrev ? teamAbbrev.textContent.trim() : null;
        
        // Get team logo
        const teamLogo = row.querySelector('img')?.getAttribute('src') || null;
        
        // Get rank from first column if available
        const rankCell = row.querySelector('td:first-child');
        const rank = rankCell ? parseInt(rankCell.textContent.trim()) : index + 1;
        
        playerResults.push({
          name: playerName,
          team: team,
          playerUrl: playerUrl,
          playerId: playerId,
          teamLogo: teamLogo,
          rank: rank,
          rowIndex: index // Store the row index for matching with stats
        });
      });
      
      // Get the stats table headers
      const statsHeaders = [];
      document.querySelectorAll('div.Table__ScrollerWrapper th').forEach(th => {
        let headerText = '';
        if (th.querySelector('div')) {
          headerText = th.querySelector('div').textContent.trim();
        } else if (th.querySelector('a')) {
          const linkText = th.querySelector('a').textContent.trim();
          // Remove any sort indicators
          headerText = linkText.replace(/[▲▼]|svg/g, '').trim();
        } else {
          headerText = th.textContent.trim();
        }
        if (headerText) {
          statsHeaders.push(headerText);
        }
      });
      
      // Get stats from the stats table
      const statsRows = document.querySelectorAll('div.Table__ScrollerWrapper .Table__TBODY .Table__TR');
      
      statsRows.forEach((row, index) => {
        if (index >= playerResults.length) return;
        
        const stats = {};
        let position = null;
        
        // Get all cells in the row
        const cells = row.querySelectorAll('td');
        
        cells.forEach((cell, cellIndex) => {
          if (cellIndex < statsHeaders.length) {
            const headerName = statsHeaders[cellIndex];
            
            if (headerName === 'POS') {
              position = getText(cell, 'div') || getText(cell);
            } else {
              const value = getText(cell);
              
              // Convert numeric values
              if (value !== null && !isNaN(parseFloat(value)) && isFinite(value)) {
                stats[headerName] = parseFloat(value);
              } else if (value !== null) {
                stats[headerName] = value;
              }
            }
          }
        });
        
        // Add stats and position to the corresponding player
        if (playerResults[index]) {
          playerResults[index].position = position;
          playerResults[index].stats = stats;
          delete playerResults[index].rowIndex; // Remove helper property
        }
      });
      
      return playerResults;
    });
    
    // Add current date to each player record
    const now = new Date();
    playerData.forEach(player => {
      player.scrapedDate = now;
    });
    
    // Process a subset of players for development (change to process all in production)
    const PLAYERS_TO_PROCESS = 5; // Limit for faster development cycles
    const playersToProcess = playerData.slice(0, -1);
    
    console.log(`Processing historical data for top ${playersToProcess.length} players...`);
    
    // Process each player to get historical data
    for (let i = 0; i < playersToProcess.length; i++) {
      const player = playersToProcess[i];
      console.log(`Processing player ${i+1}/${playersToProcess.length}: ${player.name}`);
      
      try {
        // Get historical data for this player
        const historicalData = await scrapePlayerHistoricalData(page, player.playerUrl);
        
        // Add historical data to player object
        player.recentGames = historicalData.recentGames;
        player.historicalPerformance = historicalData.historicalPerformance;
        
        console.log(`Successfully processed historical data for ${player.name}`);
        console.log(`Found ${player.recentGames.length} recent games`);
        console.log(`5-game rolling averages - PTS: ${player.historicalPerformance.rollingAvg5.PTS.toFixed(1)}, REB: ${player.historicalPerformance.rollingAvg5.REB.toFixed(1)}, AST: ${player.historicalPerformance.rollingAvg5.AST.toFixed(1)}`);
      } catch (error) {
        console.error(`Error processing historical data for ${player.name}: ${error.message}`);
      }
      
      // Small delay between players to avoid overloading the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // In production, you'd process all players: for (const player of playerData) { ... }
    // But for now, we'll update the playerData array with our processed subset
    for (let i = 0; i < playersToProcess.length; i++) {
      playerData[i] = playersToProcess[i];
    }
    
    // Log sample record to verify data structure
    if (playerData.length > 0) {
      console.log('Sample player data:', JSON.stringify(playerData[0], null, 2));
      
      // Check for position and stats
      const sampleStats = Object.keys(playerData[0].stats || {}).length;
      console.log(`First player has ${sampleStats} stat fields`);
      
      if (sampleStats < 3) {
        console.warn("WARNING: Stats data appears incomplete!");
      }
    }
    
    console.log(`Successfully scraped data for ${playerData.length} players`);
    return playerData;
  } catch (error) {
    console.error('Error scraping ESPN data:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Save player data to MongoDB
 */
async function savePlayerStatsToMongoDB(playerData) {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');
    
    // Clear existing data
    const deleteResult = await PlayerStats.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing records`);
    
    if (playerData.length === 0) {
      console.error('No player data to save!');
      return [];
    }
    
    // Insert new data
    const result = await PlayerStats.insertMany(playerData);
    console.log(`Saved ${result.length} player records to MongoDB`);
    return result;
  } catch (error) {
    console.error('Error saving to MongoDB:', error);
    throw error;
  } finally {
    await closeConnection();
    console.log('MongoDB connection closed');
  }
}

/**
 * Main function to scrape and save data
 */
async function scrapeESPNRankings() {
  try {
    console.log('Starting ESPN NBA player scraper...');
    const playerData = await scrapeESPNPlayersAndStats();
    
    console.log(`Found ${playerData.length} players with stats`);
    await savePlayerStatsToMongoDB(playerData);
    
    return playerData;
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}

// Run directly if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeESPNRankings()
    .then(() => {
      console.log('Scraping completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Scraping failed:', error);
      process.exit(1);
    });
}

export { scrapeESPNRankings };