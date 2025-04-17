#!/bin/bash

# Set path to your project directory
PROJECT_DIR="/Users/abielyemane/development/WinScope/server"

# Navigate to project directory
cd $PROJECT_DIR

# Run the scraper
node index.js scrape >> $PROJECT_DIR/logs/scraper.log 2>&1