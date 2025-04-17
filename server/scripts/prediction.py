import pickle
import sys
import os
import pandas as pd
import xgboost as xgb
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler
from IPython.display import display
from sklearn.metrics import mean_squared_error, mean_absolute_error
import requests  # Add requests library for HTTP calls
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

def analyze_player_performance(player_id):
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
    
    # Remove target variables and non-predictive features
    features_to_exclude = ['playerId', 'NEXT_PTS', 'NEXT_REB', 'NEXT_AST', 'NEXT_BLK']
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
    targets = ['PTS', 'REB', 'AST', 'BLK']
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
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        
        # Store performance metrics
        performance[target] = {
            'RMSE': rmse,
            'MAE': mae
        }
        
        # Get feature importance
        importance = model.feature_importances_
        feature_importance = pd.DataFrame({
            'Feature': features,
            'Importance': importance
        }).sort_values('Importance', ascending=False)
        
        print(f"\n{target} Model Performance:")
        print(f"RMSE: {rmse:.2f}, MAE: {mae:.2f}")
        print(f"Top 5 important features for {target}:")
        print(feature_importance.head(5).to_string(index=False))
        
        # Store model
        models[target] = model
    
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


def predict_player_next_game(player_id):
    """
    Predict a player's performance for their next game.
    
    Args:
        player_id: The ID of the player to predict for
        
    Returns:
        dict: Predicted stats for the player's next game
    """
    # Get player data
    player_data = analyze_player_performance(player_id)
    
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
            # If feature is missing, use 0 (you might want a better strategy)
            feature_values.append(0)
    
    # Scale features
    player_features_scaled = scaler.transform([feature_values])
    
    # Make predictions
    predictions = {}
    
    for stat, model in models.items():
        pred_value = model.predict(player_features_scaled)[0]
        predictions[stat] = max(0, pred_value)  # Ensure non-negative predictions
    
    return predictions

def display_player_prediction(player_id):
    """
    Display a player's performance prediction in a readable format.
    """
    # Get player info
    player_data = analyze_player_performance(player_id)
    
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
    print(f"Points: {predictions['PTS']:.1f}")
    print(f"Rebounds: {predictions['REB']:.1f}")
    print(f"Assists: {predictions['AST']:.1f}")
    print(f"Blocks: {predictions['BLK']:.1f}")
    
    # Show recent performance for comparison
    recent_games = player_data['recent_performances']
    if len(recent_games) > 0:
        print("\nRecent Performance (most recent game):")
        recent = recent_games.iloc[0]
        print(f"Points: {recent.get('points', 0)}")
        print(f"Rebounds: {recent.get('rebounds', 0)}")
        print(f"Assists: {recent.get('assists', 0)}")
        print(f"Blocks: {recent.get('blocks', 0)}")

def store_player_prediction(player_id, player_data):
    
    return None

if __name__ == "__main__":
    # Example usage
    if len(sys.argv) > 1:
        # If command line arguments provided
        if sys.argv[1] == "train":
            # Train models
            print("Training prediction models...")
            train_prediction_models()
        elif sys.argv[1] == "predict" and len(sys.argv) > 2:
            # Predict for a specific player
            player_id = int(sys.argv[2])
            display_player_prediction(player_id)
        else:
            print("Usage: python prediction.py [train|predict player_id]")
    else:
        # Example usage
        print("\n=== Player Analysis ===")
        player_data = analyze_player_performance(4278073)
        # store_prediction(player_id, player_data)
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
            # display_player_prediction(player_id)
        else:
            print("No player data available")
        # all_players = fetch_all_players_data()
        # print(all_players.to_string(index=False))

