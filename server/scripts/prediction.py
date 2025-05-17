import pickle
import sys
import os
import pandas as pd
import xgboost as xgb
import numpy as np
from dotenv import load_dotenv, find_dotenv
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, explained_variance_score
from sklearn.preprocessing import StandardScaler
from IPython.display import display
import requests  # Add requests library for HTTP calls
import pymongo
from datetime import datetime
# Add the parent directory to the Python path

def get_player_statistics(player_id):
    try:
        response = requests.get(f'http://localhost:5005/api/predictions/player/{player_id}')
        response.raise_for_status()  
        # Raise an exception for bad status codes
        stats = response.json()
        return stats
    except requests.exceptions.RequestException as e:
        print(f"Error fetching player statistics: {e}")
        return None
"""
    Normalise the data to be used for the model
"""
def normalize_player_data(player_id):
    # Get player data from API
    player_data = get_player_statistics(player_id)
    
    if player_data is None:
        return None
        
    # Convert JSON data to pandas DataFrames
    # Store player basic info
    player_info = {
        'name': player_data['name'],
        'team': player_data['team'],
        'position': player_data['position'],
        'playerId': player_data['playerId']
    }
    player_info_df = pd.DataFrame([player_info])
    
    # Convert other data to DataFrames
    player_avg_stats = pd.DataFrame([player_data['stats']])
    player_rolling_avg_five = pd.DataFrame([player_data['historicalPerformance']['rollingAvg5']])
    player_recent_performances = pd.DataFrame(player_data['recentGames'])
    
    return {
        'player_info': player_info_df,
        'average_stats': player_avg_stats,
        'rolling_averages': player_rolling_avg_five,
        'recent_performances': player_recent_performances
    }

def fetch_all_players_data():
    """
    Fetch training data for all players.
    In a real application, this would query your database or API for all player data.
    """
    try:
        response = requests.get('http://localhost:5005/api/predictions/allPlayers')
        response.raise_for_status()
        all_players = response.json()
        # Process all players data into a single DataFrame
        all_data = []
        
        for player in all_players:
            try:
                # Get player info
                player_info = {
                    'name': player.get('name', ''),
                    'team': player.get('team', ''),
                    'position': player.get('position', ''),
                    'playerId': player.get('playerId', '')
                }
                
                # Get player stats
                avg_stats = player.get('stats', {})
                rolling_avg = player.get('historicalPerformance', {}).get('rollingAvg5', {})
                
                # Combine all features
                player_features = {**player_info, **avg_stats, **rolling_avg}
                
                # Add target variables (next game performance)
                # Note: In a real implementation, you would have the actual next game stats
                # Here we're assuming the most recent game is the "next game" for demonstration
                recent_games = player.get('recentGames', [])
                if recent_games and len(recent_games) > 0:
                    next_game = recent_games[0]  # Most recent game
                    player_features['NEXT_PTS'] = next_game.get('points', 0)
                    player_features['NEXT_REB'] = next_game.get('rebounds', 0)
                    player_features['NEXT_AST'] = next_game.get('assists', 0)
                    player_features['NEXT_BLK'] = next_game.get('blocks', 0)
                    player_features['NEXT_STL'] = next_game.get('steals', 0)
                    all_data.append(player_features)
            except Exception as e:
                print(f"Error processing player data: {e}")
                continue
        
        return pd.DataFrame(all_data)
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching all players data: {e}")
        return None

def prepare_features(player_df):
    """
    Prepare features for the model from player data.
    """
    # Select numerical features only
    numerical_features = player_df.select_dtypes(include=['number']).columns.tolist()
    print(numerical_features)
    # Remove target variables and non-predictive features
    features_to_exclude = ['playerId', 'NEXT_PTS', 'NEXT_REB', 'NEXT_AST', 'NEXT_BLK', 'NEXT_STL']
    features = [f for f in numerical_features if f not in features_to_exclude]
    
    return features

def train_prediction_models(save_models=True):
    """
    Train RandomForest models to predict PTS, REB, AST, and BLK.
    
    Args:
        save_models (bool): Whether to save the trained models to disk
        
    Returns:
        dict: Dictionary containing the trained models and scaler
    """
    # Fetch data for all players
    print("Fetching data for all players...")
    all_players_df = fetch_all_players_data()
    
    if all_players_df is None or len(all_players_df) == 0:
        print("Error: Could not fetch player data for training")
        return None
    
    print(f"Training models on {len(all_players_df)} player records")
    
    # Prepare features
    features = prepare_features(all_players_df)
    print(f"Using {len(features)} features for prediction")
    
    # Check if we have the target variables
    if 'NEXT_PTS' not in all_players_df.columns:
        print("Error: Target variables not found in the dataset")
        return None
    
    # Scale features
    X = all_players_df[features]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Define target stats
    targets = ['PTS', 'REB', 'AST', 'BLK', 'STL']
    target_columns = ['NEXT_' + stat for stat in targets]
    
    # Train a model for each stat
    models = {}
    performance = {}
    
    for i, target in enumerate(targets):
        target_col = target_columns[i]
        
        if target_col not in all_players_df.columns:
            print(f"Warning: {target_col} not found in dataset. Skipping.")
            continue
            
        y = all_players_df[target_col]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # Train RandomForestRegressor
        model1 = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        model2 = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=10,
            learning_rate=0.1,
            random_state=42
        )
        model1.fit(X_train, y_train)
        model2.fit(X_train, y_train)
        # Evaluate
        y_pred_RFR = model1.predict(X_test)
        y_pred_XGB = model2.predict(X_test)
        
        # Calculate metrics for RandomForestRegressor
        rmse_rfr = np.sqrt(mean_squared_error(y_test, y_pred_RFR))
        mae_rfr = mean_absolute_error(y_test, y_pred_RFR)
        r2_rfr = r2_score(y_test, y_pred_RFR)
        evs_rfr = explained_variance_score(y_test, y_pred_RFR)
        
        # Calculate metrics for XGBRegressor
        rmse_xgb = np.sqrt(mean_squared_error(y_test, y_pred_XGB))
        mae_xgb = mean_absolute_error(y_test, y_pred_XGB)
        r2_xgb = r2_score(y_test, y_pred_XGB)
        evs_xgb = explained_variance_score(y_test, y_pred_XGB)
        
        # Compare models and store the best one
        if rmse_rfr < rmse_xgb and mae_rfr < mae_xgb:
            best_model = model1
            best_metrics = {
                'RMSE': rmse_rfr,
                'MAE': mae_rfr,
                'R2': r2_rfr,
                'Explained Variance': evs_rfr,
                'model_type': 'RandomForestRegressor'
            }
        else:
            best_model = model2
            best_metrics = {
                'RMSE': rmse_xgb,
                'MAE': mae_xgb,
                'R2': r2_xgb,
                'Explained Variance': evs_xgb,
                'model_type': 'XGBRegressor'
            }
        
        # Store performance metrics
        performance[target] = best_metrics
        
        # Get feature importance from the best model
        importance = best_model.feature_importances_
        feature_importance = pd.DataFrame({
            'Feature': features,
            'Importance': importance
        }).sort_values('Importance', ascending=False)
        
        print(f"\n{target} Model Performance:")
        print(f"Best Model: {best_metrics['model_type']}")
        print(f"RMSE: {best_metrics['RMSE']:.2f}")
        print(f"MAE: {best_metrics['MAE']:.2f}")
        print(f"R² Score: {best_metrics['R2']:.2f}")
        print(f"Explained Variance: {best_metrics['Explained Variance']:.2f}")
        print(f"\nTop 5 important features for {target}:")
        print(feature_importance.head(5).to_string(index=False))
        
        # Store best model
        models[target] = best_model
    
    # Save models and scaler if requested
    if save_models:
        # Create directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Save scaler
        with open('models/scaler.pkl', 'wb') as f:
            pickle.dump(scaler, f)
        
        # Save each model
        for target, model in models.items():
            with open(f'models/model_{target}.pkl', 'wb') as f:
                pickle.dump(model, f)
        
        print("\nModels saved to 'models/' directory")
    
    return {
        'models': models,
        'scaler': scaler,
        'features': features,
        'performance': performance
    }

def load_prediction_models():
    """
    Load trained models from disk.
    
    Returns:
        dict: Dictionary containing the trained models and scaler
    """
    try:
        # Check if models directory exists
        if not os.path.isdir('models'):
            print("Models directory not found. Training new models...")
            return train_prediction_models()
        
        # Load scaler
        with open('models/scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
            
        # Load models
        targets = ['PTS', 'REB', 'AST', 'BLK']
        models = {}
        
        for target in targets:
            model_path = f'models/model_{target}.pkl'
            
            if not os.path.isfile(model_path):
                print(f"Model for {target} not found. Training new models...")
                return train_prediction_models()
                
            with open(model_path, 'rb') as f:
                models[target] = pickle.load(f)
        
        # Load features list (you might want to store this separately in a real app)
        # For now, we'll just get it from one of the models
        features = prepare_features(fetch_all_players_data())
        
        return {
            'models': models,
            'scaler': scaler,
            'features': features
        }
        
    except Exception as e:
        print(f"Error loading models: {e}")
        print("Training new models...")
        return train_prediction_models()

def store_prediction_in_mongodb(player_data, predictions):
    """
    Store player predictions in MongoDB.
    
    Args:
        player_data (dict): Player information and stats
        predictions (dict): Predicted stats
        models (dict): Trained models
        
    Returns:
        str: MongoDB document ID if successful, None otherwise
    """
    try:
        load_dotenv(find_dotenv())

        # Connect to MongoDB with proper SSL settings
        client = pymongo.MongoClient(
            os.getenv('MONGODB_URI'),
            tls=True,
            tlsAllowInvalidCertificates=False,
            serverSelectionTimeoutMS=5000
        )
        db = client['test']
        dbs = client.list_database_names()
        print("databases", dbs)

        predictions_collection = db['Predictions']
        player_stats_collection = db['playerstats']
        # Prepare prediction document
        prediction_doc = {
            'playerId': str(player_data['player_info']['playerId'].values[0]),
            'playerName': player_data['player_info']['name'].values[0],
            'team': player_data['player_info']['team'].values[0],
            'predictionDate': datetime.now(),
            'predictedStats': {
                'points': float(predictions.get('PTS', 0)),
                'rebounds': float(predictions.get('REB', 0)),
                'assists': float(predictions.get('AST', 0)),
                'blocks': float(predictions.get('BLK', 0)),
                'steals': float(predictions.get('STL', 0))
            },
            'isVerified': False
        }
        stats = player_stats_collection.find_one({'playerId': str(player_data['player_info']['playerId'].values[0])})
        print(stats)
        # Store prediction in MongoDB
        result = predictions_collection.insert_one(prediction_doc)
        print(f"Prediction stored in MongoDB with ID: {result.inserted_id}")
        return str(result.inserted_id)
        
    except Exception as e:
        print(f"Error storing prediction in MongoDB: {e}")
        return None
    finally:
        client.close()

def predict_player_next_game(player_id):
    """
    Predict a player's performance for their next game.
    
    Args:
        player_id: The ID of the player to predict for
        
    Returns:
        dict: Predicted stats for the player's next game
    """
    # Get player data
    player_data = normalize_player_data(player_id)
    
    if player_data is None:
        print(f"Could not fetch data for player {player_id}")
        return None
    
    # Load models
    model_data = load_prediction_models()
    
    if model_data is None:
        print("Could not load prediction models")
        return None
    
    models = model_data['models']
    scaler = model_data['scaler']
    feature_list = model_data['features']
    
    # Prepare player features
    player_features = {}
    
    # Add average stats
    for col in player_data['average_stats'].columns:
        player_features[col] = player_data['average_stats'][col].values[0]
    
    # Add rolling averages
    for col in player_data['rolling_averages'].columns:
        player_features[col] = player_data['rolling_averages'][col].values[0]
    
    # Filter to only include numerical features in the feature list
    feature_values = []
    for feature in feature_list:
        if feature in player_features:
            feature_values.append(player_features[feature])
        else:
            feature_values.append(0)
    
    # Scale features
    player_features_scaled = scaler.transform([feature_values])
    
    # Make predictions
    predictions = {}
    
    for stat, model in models.items():
        pred_value = model.predict(player_features_scaled)[0]
        predictions[stat] = max(0, pred_value)  # Ensure non-negative predictions
    
    # Store predictions in MongoDB
    store_prediction_in_mongodb(player_data, predictions)
    
    return predictions

def display_player_prediction(player_id):
    """
    Display a player's performance prediction in a readable format.
    """
    # Get player info
    player_data = normalize_player_data(player_id)
    if player_data:
            print("\nPlayer Info")
            print(player_data['player_info'].to_string(index=False))
            print("\nAverage Stats:")
            print(player_data['average_stats'].to_string(index=False))
            print("\nRolling Averages (Last 5):")
            print(player_data['rolling_averages'].to_string(index=False))
            print("\nRecent Performances:")
            print(player_data['recent_performances'].to_string(index=False))

             # Make predictions
            print("\n=== Performance Prediction ===")
    
    if player_data is None:
        print(f"Could not fetch data for player {player_id}")
        return
    
    player_name = player_data['player_info']['name'].values[0]
    player_team = player_data['player_info']['team'].values[0]
    
    # Get predictions
    predictions = predict_player_next_game(player_id)
    
    if predictions is None:
        print("Could not generate predictions")
        return
    
    # Display results
    print(f"\n=== Next Game Predictions for {player_name} ({player_team}) ===")
    print(f"Points: {predictions.get('PTS', 0):.1f}")
    print(f"Rebounds: {predictions.get('REB', 0):.1f}")
    print(f"Assists: {predictions.get('AST', 0):.1f}")
    print(f"Blocks: {predictions.get('BLK', 0):.1f}")
    print(f"Steals: {predictions.get('STL', 0):.1f}")
    
    # Show recent performance for comparison
    recent_games = player_data['recent_performances']
    if len(recent_games) > 0:
        print("\nRecent Performance (most recent game):")
        recent = recent_games.iloc[0]
        print(f"Points: {recent.get('points', 0)}")
        print(f"Rebounds: {recent.get('rebounds', 0)}")
        print(f"Assists: {recent.get('assists', 0)}")
        print(f"Blocks: {recent.get('blocks', 0)}")
        print(f"Steals: {recent.get('steals', 0)}")



if __name__ == "__main__":
    # Example usage
    if len(sys.argv) > 1:
        # If command line arguments provided
        if sys.argv[1] == "train":
            # Train models
            print("Training prediction models...")
            train_prediction_models()
        elif sys.argv[1] == "predict":
            all_players = fetch_all_players_data()
            print(all_players)
            for _, player in all_players.iterrows():
                display_player_prediction(player['playerId'])
            # Predict for a specific player
            # player_id = int(sys.argv[2])
            # display_player_prediction(player_id)
        else:
            print("Usage: python prediction.py [train|predict player_id]")
    else:
        # Example usage
        print("\n=== Player Analysis ===")
        player_data = normalize_player_data(4278073)
        if player_data:
            print("\nPlayer Info")
            print(player_data['player_info'].to_string(index=False))
            print("\nAverage Stats:")
            print(player_data['average_stats'].to_string(index=False))
            print("\nRolling Averages (Last 5):")
            print(player_data['rolling_averages'].to_string(index=False))
            print("\nRecent Performances:")
            print(player_data['recent_performances'].to_string(index=False))

             # Make predictions
            print("\n=== Performance Prediction ===")
        else:
            print("No player data available")

