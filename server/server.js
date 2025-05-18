import express from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import path from 'path';
import { getAllPlayerStats } from '../server/src/api.js';
import cors from 'cors';
import predictionRoutes from './routes/predictionRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(cors()); // Enable cors for client-server APIs
app.use(express.json()); // Enable simple data extraction for RESTful API data
app.use(bodyParser.json()); // Parse JSON bodies

// Routes
app.use('/api/predictions', predictionRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/ping', (req, res) => {
  return res.send('pong');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: err.message 
  });
});

// Start the server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`>>> Node Express Server listening on port: ${PORT}`);
}); 
