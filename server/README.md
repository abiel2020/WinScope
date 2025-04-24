# WinScope 

The WinScope is an backend application that handles data scraping, processing, and storage for fantasy sports analytics. It primarily focuses on gathering and processing ESPN rankings and statistics data.

## Features

- ESPN rankings data scraping
- HTML data processing
- MongoDB integration for data storage
- Scheduled automatic data updates
- Prediction routes for fantasy sports analytics

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

## Usage

The server provides several commands for different operations:

### Scraping Live Data
```bash
node index.js scrape
```
This command scrapes live data from ESPN and displays the results.

### Processing Local HTML Files
```bash
node index.js process [filepath]
```
Process a local HTML file containing ESPN data. If no filepath is provided, it defaults to `data/espn_data.html`.

### Processing Stats HTML Files
```bash
node index.js process-stats [filepath]
```
Process a local HTML file containing ESPN statistics. If no filepath is provided, it defaults to `data/espn_stats.html`.

### Setting Up Scheduled Scraping
```bash
node index.js schedule
```
Sets up a daily cron job to automatically scrape data at midnight.

## Directory Structure

- `index.js` - Main server entry point
- `routes/` - API routes including prediction routes
- `scrapers/` - Data scraping modules
- `utils/` - Utility functions for data processing
- `data/` - Directory for storing scraped HTML files

## Data Storage

The application uses MongoDB to store processed data. Make sure your MongoDB instance is running and the connection string in the `.env` file is correct.





