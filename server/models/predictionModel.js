import mongoose from 'mongoose';

// Define the prediction schema
const predictionSchema = new mongoose.Schema({
    playerId: {
        type: String,
        required: true,
        index: true
    },
    playerName: {
        type: String,
        required: true
    },
    team: {
        type: String,
        required: true
    },
    predictionDate: {
        type: Date,
        default: Date.now
    },
    predictedStats: {
        points: {
            type: Number,
            required: true,
            min: 0
        },
        rebounds: {
            type: Number,
            required: true,
            min: 0
        },
        assists: {
            type: Number,
            required: true,
            min: 0
        },
        blocks: {
            type: Number,
            required: true,
            min: 0
        },
        steals: {
            type: Number,
            required: true,
            min: 0
        }
    },
    actualStats: {
        points: Number,
        rebounds: Number,
        assists: Number,
        blocks: Number,
        steals: Number,
        gameDate: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create indexes for efficient querying
predictionSchema.index({ playerId: 1, predictionDate: -1 });
predictionSchema.index({ isVerified: 1 });

// Create or retrieve the model
let Prediction;
try {
    Prediction = mongoose.model('Prediction');
} catch (error) {
    Prediction = mongoose.model('Prediction', predictionSchema);
}

/**
 * Store a new prediction
 * @param {Object} predictionData - The prediction data to store
 * @returns {Promise<Object>} - The stored prediction
 */
async function storePrediction(predictionData) {
    try {
        const prediction = new Prediction(predictionData);
        await prediction.save();
        return prediction;
    } catch (error) {
        console.error('Error storing prediction:', error);
        throw error;
    }
}

/**
 * Get predictions for a player
 * @param {string} playerId - The player's ID
 * @param {number} limit - Maximum number of predictions to return
 * @returns {Promise<Array>} - Array of predictions
 */
async function getPlayerPredictions(playerId, limit = 10) {
    try {
        return await Prediction.find({ playerId })
            .sort({ predictionDate: -1 })
            .limit(limit);
    } catch (error) {
        console.error('Error getting player predictions:', error);
        throw error;
    }
}

/**
 * Update actual stats for a prediction
 * @param {string} predictionId - The prediction's ID
 * @param {Object} actualStats - The actual game stats
 * @returns {Promise<Object>} - The updated prediction
 */
async function updateActualStats(predictionId, actualStats) {
    try {
        return await Prediction.findByIdAndUpdate(
            predictionId,
            {
                actualStats,
                isVerified: true
            },
            { new: true }
        );
    } catch (error) {
        console.error('Error updating actual stats:', error);
        throw error;
    }
}

/**
 * Get prediction accuracy metrics
 * @param {string} playerId - The player's ID
 * @returns {Promise<Object>} - Accuracy metrics
 */
async function getPredictionAccuracy(playerId) {
    try {
        const verifiedPredictions = await Prediction.find({
            playerId,
            isVerified: true
        });

        const metrics = {
            points: { mae: 0, rmse: 0 },
            rebounds: { mae: 0, rmse: 0 },
            assists: { mae: 0, rmse: 0 },
            blocks: { mae: 0, rmse: 0 },
            steals: { mae: 0, rmse: 0 }
        };

        verifiedPredictions.forEach(prediction => {
            Object.keys(metrics).forEach(stat => {
                const predicted = prediction.predictedStats[stat];
                const actual = prediction.actualStats[stat];
                const error = Math.abs(predicted - actual);
                metrics[stat].mae += error;
                metrics[stat].rmse += error * error;
            });
        });

        // Calculate averages
        const count = verifiedPredictions.length;
        if (count > 0) {
            Object.keys(metrics).forEach(stat => {
                metrics[stat].mae /= count;
                metrics[stat].rmse = Math.sqrt(metrics[stat].rmse / count);
            });
        }

        return metrics;
    } catch (error) {
        console.error('Error getting prediction accuracy:', error);
        throw error;
    }
}

export {
    Prediction,
    storePrediction,
    getPlayerPredictions,
    updateActualStats,
    getPredictionAccuracy
};
