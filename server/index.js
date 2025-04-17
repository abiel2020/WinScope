import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cron from 'node-cron';
import { scrapeESPNRankings } from '../server/scrapers/espnScraper.js';
import { processESPNHtml, saveToMongoDB } from '../server/utils/processHtml.js';
import mongoose from 'mongoose';
import 'dotenv/config';
import predictionRoutes from './routes/predictionRoutes.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set recommended Mongoose option
mongoose.set('strictQuery', false);

// Create directories if they don't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Command-line argument parsing
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'scrape':
        // Scrape live data from ESPN
        console.log('Starting live scraping from ESPN...');
        const playerData = await scrapeESPNRankings();
        console.log(`Successfully scraped data for ${playerData.length} players`);
        process.exit(0);
        break;
        
      case 'process':
        // Process a local HTML file
        const filePath = args[1] || path.join(__dirname, 'data', 'espn_data.html');
        console.log(`Processing local HTML file: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          process.exit(1);
        }
        
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const processedData = await processESPNHtml(htmlContent);
        await saveToMongoDB(processedData);
        console.log(`Successfully processed data for ${processedData.length} players`);
        process.exit(0);
        break;
        
      case 'process-stats':
        // Process a local stats HTML file
        const statsFilePath = args[1] || path.join(__dirname, 'data', 'espn_stats.html');
        console.log(`Processing stats HTML file: ${statsFilePath}`);
        
        if (!fs.existsSync(statsFilePath)) {
          console.error(`File not found: ${statsFilePath}`);
          process.exit(1);
        }
        
        // Dynamic import in ES modules
        const processStatsModule = await import('./utils/processStatsHtml.js');
        const { processESPNStatsHtml } = processStatsModule;
        
        const statsHtmlContent = fs.readFileSync(statsFilePath, 'utf8');
        const statsData = await processESPNStatsHtml(statsHtmlContent);
        console.log(`Successfully processed stats for ${statsData.length} players`);
        process.exit(0);
        break;
        
      case 'schedule':
        // Set up a cron job to run daily at midnight
        console.log('Setting up scheduled scraping...');
        cron.schedule('0 0 * * *', async () => {
          console.log(`Running scheduled scrape at ${new Date().toISOString()}`);
          try {
            await scrapeESPNRankings();
            console.log('Scheduled scraping completed successfully');
          } catch (error) {
            console.error('Scheduled scraping failed:', error);
          }
        });
        console.log('Scraper scheduled to run daily at midnight');
        // Keep process alive
        process.stdin.resume();
        break;
        
      default:
        console.log('ESPN Stats Scraper');
        console.log('------------------');
        console.log('Available commands:');
        console.log('  scrape         - Scrape live data from ESPN');
        console.log('  process        - Process a local HTML file (optional path argument)');
        console.log('  process-stats  - Process a local stats HTML file (optional path argument)');
        console.log('  schedule       - Set up daily automatic scraping');
        process.exit(0);
    }
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Run the main function if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// ES module exports
export { main };