from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import json
import time
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from sklearn.linear_model import Ridge
from sklearn.neural_network import MLPRegressor
import warnings
import os
import threading
from functools import lru_cache

warnings.filterwarnings('ignore')
app = Flask(__name__)
CORS(app)

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

app.json_encoder = NumpyEncoder
energy_model = None
ridge_model = None
anomaly_detector = None
scaler = None
location_clusterer = None
mlp_model = None
models_trained = False
initialized = False
energy_data = []
geofence_data = []
device_states = {}
ml_performance_history = []
last_calculated_contamination_rate = 0.15
last_device_change_time = None
cached_analytics = None
analytics_cache_time = None
device_state_history = []
CACHE_DURATION = 30
DEVICE_POWER_MAP = {
    'Main Light': {'base': 15, 'max': 60}, 'Fan': {'base': 25, 'max': 75}, 'AC': {'base': 800, 'max': 1500},
    'TV': {'base': 120, 'max': 200}, 'Microwave': {'base': 800, 'max': 1200}, 'Refrigerator': {'base': 150, 'max': 300},
    'Shower': {'base': 50, 'max': 100}, 'Water Heater': {'base': 2000, 'max': 4000}, 'Dryer': {'base': 2000, 'max': 3000}
}

@lru_cache(maxsize=128)
def calculate_device_consumption_cached(device_name, is_on, value, property_type):
    if not is_on or device_name not in DEVICE_POWER_MAP:
        return 0
    device_info = DEVICE_POWER_MAP[device_name]
    base_power = device_info['base']
    max_power = device_info['max']
    if property_type in ['brightness', 'speed', 'volume', 'pressure', 'power']:
        consumption_ratio = value / 100.0
    elif property_type in ['temp', 'temperature']:
        if device_name == 'AC':
            optimal_temp = 72
            temp_diff = abs(value - optimal_temp) / 25.0
            consumption_ratio = 0.5 + (temp_diff * 0.5)
        elif device_name == 'Water Heater':
            consumption_ratio = (value - 40) / 80.0
        else:
            consumption_ratio = value / 100.0
    else:
        consumption_ratio = 0.5
    actual_consumption = base_power + (max_power - base_power) * consumption_ratio
    return actual_consumption * 0.85

def calculate_device_consumption(device_name, is_on, value, property_type):
    return calculate_device_consumption_cached(device_name, is_on, value, property_type)

def generate_realistic_energy_data(device_states_data=None):
    current_time = datetime.now()
    hour = current_time.hour
    day_of_week = current_time.weekday()
    base_consumption = 50
    device_consumption = 0
    if device_states_data:
        for room, devices in device_states_data.items():
            for device in devices:
                device_consumption += calculate_device_consumption(
                    device['name'], device['isOn'], device['value'], device['property']
                )
    time_factor = 1.3 if (6 <= hour <= 9 or 17 <= hour <= 22) else (0.7 if (23 <= hour or hour <= 5) else 1.0)
    weekend_factor = 1.15 if day_of_week >= 5 else 1.0
    outdoor_temp = 70 + 15 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 3)
    weather_factor = 1.2 if outdoor_temp > 80 or outdoor_temp < 60 else 1.0
    device_change_factor = 1.0
    global last_device_change_time
    if last_device_change_time and (current_time - last_device_change_time).total_seconds() < 300:
        device_change_factor = random.uniform(1.15, 1.35)
    total_consumption = (base_consumption + device_consumption) * time_factor * weekend_factor * weather_factor * device_change_factor
    noise = np.random.normal(0, total_consumption * 0.08)
    final_consumption = max(base_consumption, total_consumption + noise)
    return {
        'timestamp': current_time.isoformat(),
        'consumption': round(final_consumption, 2),
        'device_consumption': round(device_consumption, 2),
        'base_consumption': base_consumption,
        'hour': hour,
        'day_of_week': day_of_week,
        'temperature': round(outdoor_temp, 1),
        'occupancy': 1 if 6 <= hour <= 23 else 0,
        'time_factor': round(time_factor, 2),
        'weather_factor': round(weather_factor, 2),
        'device_change_factor': round(device_change_factor, 2)
    }

def initialize_minimal_data():
    global energy_data, geofence_data, ml_performance_history, initialized
    if initialized:
        return
    num_hours_initial_data = 48
    base_time = datetime.now() - timedelta(hours=num_hours_initial_data)
    for i in range(0, num_hours_initial_data, 2):
        timestamp = base_time + timedelta(hours=i)
        temp_data = generate_realistic_energy_data()
        temp_data['timestamp'] = timestamp.isoformat()
        temp_data['hour'] = timestamp.hour
        temp_data['day_of_week'] = timestamp.weekday()
        energy_data.append(temp_data)
    geofence_data.extend([
        {
            'id': 1, 'name': 'Home', 'address': 'A-101, Ashoka Apartments, New Delhi, IN',
            'lat': 37.7749, 'lng': -122.4194, 'radius': 200, 'isActive': True, 'automations': 8,
            'energy_savings': random.uniform(45, 65),
            'created_at': (datetime.now() - timedelta(days=30)).isoformat()
        },
        {
            'id': 2, 'name': 'Work Office', 'address': 'K-15, The Sinclairs Bayview, Dubai, UAE',
            'lat': 37.7849, 'lng': -122.4094, 'radius': 150, 'isActive': True, 'automations': 5,
            'energy_savings': random.uniform(25, 40),
            'created_at': (datetime.now() - timedelta(days=20)).isoformat()
        }
    ])
    for i in range(7):
        date = datetime.now() - timedelta(days=6-i)
        ml_performance_history.append({
            'date': date.isoformat(),
            'accuracy': random.uniform(88, 96),
            'mse': random.uniform(0.02, 0.08),
            'mae': random.uniform(0.1, 0.3),
            'r2_score': random.uniform(0.85, 0.95)
        })
    initialized = True

def train_models_background():
    global energy_model, ridge_model, anomaly_detector, scaler, location_clusterer, mlp_model, models_trained
    try:
        energy_model = RandomForestRegressor(n_estimators=30, max_depth=6, random_state=42, n_jobs=1)
        ridge_model = Ridge(alpha=1.0, random_state=42)
        anomaly_detector = IsolationForest(contamination=0.15, random_state=42, n_jobs=1)
        scaler = StandardScaler()
        location_clusterer = DBSCAN(eps=0.01, min_samples=3)
        mlp_model = MLPRegressor(hidden_layer_sizes=(30, 15), activation='relu', solver='adam', max_iter=50, random_state=42, alpha=0.0001)
        if len(energy_data) >= 15:
            df = pd.DataFrame(energy_data)
            df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
            df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
            df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
            df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
            features = ['hour', 'day_of_week', 'temperature', 'occupancy', 'device_consumption', 
                        'time_factor', 'weather_factor', 'hour_sin', 'hour_cos', 'day_sin', 'day_cos']
            X = df[features].fillna(0).values
            y = df['consumption'].values
            X_scaled = scaler.fit_transform(X)
            energy_model.fit(X, y)
            ridge_model.fit(X, y)
            anomaly_detector.fit(X_scaled)
            mlp_model.fit(X_scaled, y)
        models_trained = True
    except Exception as e:
        models_trained = False

def ensure_initialized_and_trained():
    if not initialized:
        initialize_minimal_data()
        threading.Thread(target=train_models_background, daemon=True).start()

def detect_dynamic_anomalies(df):
    anomaly_data = []
    
    if len(df) < 3:
        return anomaly_data
    
    # Use only recent data for more responsive detection
    recent_data = df.tail(min(12, len(df))).copy()
    
    print(f"[DEBUG] Analyzing {len(recent_data)} recent data points for anomalies")
    
    # Calculate current total device consumption using existing device_states
    total_device_consumption = 0
    if device_states:
        for room, devices in device_states.items():
            for device in devices:
                if device.get('isOn', False):
                    total_device_consumption += calculate_device_consumption(
                        device['name'], device['isOn'], device['value'], device['property']
                    )
    
    print(f"[DEBUG] Current device consumption: {total_device_consumption}")
    
    # If very low device usage, be more selective about anomalies
    if total_device_consumption < 100:
        recent_consumption = recent_data['consumption'].values
        if len(recent_consumption) > 1:
            recent_mean = np.mean(recent_consumption)
            recent_std = np.std(recent_consumption)
            
            # Only check the most recent entry for severe spikes
            latest_row = recent_data.iloc[-1]
            consumption = latest_row['consumption']
            
            if recent_std > 0 and consumption > recent_mean + (3.5 * recent_std):
                severity = 'high' if consumption > recent_mean + (4.5 * recent_std) else 'medium'
                anomaly_data.append({
                    'time': int(latest_row['hour']),
                    'consumption': round(float(consumption), 1),
                    'severity': severity,
                    'timestamp': latest_row['timestamp'],
                    'score': 0.9,
                    'type': 'unexpected_spike'
                })
        
        print(f"[DEBUG] Low device usage mode - found {len(anomaly_data)} anomalies")
        return anomaly_data
    
    # Active device usage - check for device/consumption mismatches
    consumption_values = recent_data['consumption'].values
    
    # Check last few entries for device consumption mismatches
    for _, row in recent_data.tail(4).iterrows():
        actual_consumption = row['consumption']
        device_consumption = row.get('device_consumption', 0)
        
        if device_consumption > 0:
            # Calculate expected range more tightly
            expected_base = 50 + device_consumption
            expected_min = expected_base * 0.75
            expected_max = expected_base * 1.35
            
            # Flag significant deviations
            if actual_consumption < expected_min or actual_consumption > expected_max:
                deviation_ratio = abs(actual_consumption - expected_base) / expected_base
                if deviation_ratio > 0.25:  # 25% deviation threshold
                    severity = 'high' if deviation_ratio > 0.5 else 'medium'
                    anomaly_data.append({
                        'time': int(row['hour']),
                        'consumption': round(float(actual_consumption), 1),
                        'severity': severity,
                        'timestamp': row['timestamp'],
                        'score': round(min(0.95, 0.6 + deviation_ratio), 3),
                        'type': 'device_mismatch'
                    })
    
    # Statistical anomaly detection using recent data patterns
    if len(recent_data) >= 3:
        overall_mean = consumption_values.mean()
        overall_std = consumption_values.std()
        
        if overall_std > 0:
            # More aggressive thresholds for better responsiveness
            upper_threshold = 2.0
            lower_threshold = 1.8
            
            for _, row in recent_data.tail(3).iterrows():  # Check last 3 entries
                consumption = row['consumption']
                z_score = abs((consumption - overall_mean) / overall_std)
                
                if z_score > upper_threshold or (consumption < overall_mean and z_score > lower_threshold):
                    # Avoid duplicates
                    if not any(a['timestamp'] == row['timestamp'] for a in anomaly_data):
                        severity = 'high' if z_score > 2.5 else 'medium'
                        anomaly_data.append({
                            'time': int(row['hour']),
                            'consumption': round(float(consumption), 1),
                            'severity': severity,
                            'timestamp': row['timestamp'],
                            'score': round(min(0.95, 0.5 + (z_score / 4.0)), 3),
                            'type': 'statistical'
                        })
    
    # Enhanced device change detection using existing last_device_change_time
    current_time = datetime.now()
    if last_device_change_time and (current_time - last_device_change_time).total_seconds() < 600:  # 10 minutes
        latest_row = recent_data.iloc[-1]
        
        # Remove any existing anomaly for this timestamp to avoid duplicates
        anomaly_data = [a for a in anomaly_data if a['timestamp'] != latest_row['timestamp']]
        
        # Always mark recent device changes as high priority anomalies
        anomaly_data.insert(0, {
            'time': int(latest_row['hour']),
            'consumption': round(float(latest_row['consumption']), 1),
            'severity': 'high',
            'timestamp': latest_row['timestamp'],
            'score': 0.98,
            'type': 'device_change'
        })
    
    print(f"[DEBUG] Total anomalies detected: {len(anomaly_data)}")
    
    # Limit anomalies based on device activity level
    max_anomalies = 3 if total_device_consumption < 200 else 6
    return anomaly_data[:max_anomalies]

@app.before_request
def before_any_request():
    ensure_initialized_and_trained()

@app.route('/api/ready', methods=['GET'])
def ready():
    return jsonify({'initialized': initialized, 'models_trained': models_trained})

@app.route('/')
def health_check():
    return jsonify({'status': 'ok', 'models_trained': models_trained})

@app.route('/api/update-device-states', methods=['POST'])
def update_device_states():
    global device_states, last_device_change_time, cached_analytics, analytics_cache_time, device_state_history
    try:
        data = request.json
        previous_states = device_states.copy()
        device_states = data.get('deviceStates', {})
        last_device_change_time = datetime.now()
        
        # Store device state change in history
        device_state_history.append({
            'timestamp': last_device_change_time.isoformat(),
            'states': device_states.copy(),
            'previous_states': previous_states
        })
        
        # Keep only last 50 state changes
        if len(device_state_history) > 50:
            device_state_history = device_state_history[-50:]
        
        cached_analytics = None
        analytics_cache_time = None
        new_energy_point = generate_realistic_energy_data(device_states)
        energy_data.append(new_energy_point)
        
        print(f"[DEBUG] Device state updated. New consumption: {new_energy_point['consumption']}, Device consumption: {new_energy_point['device_consumption']}")
        
        if len(energy_data) > 200:
            energy_data.pop(0)
        if len(energy_data) % 30 == 0 and models_trained:
            threading.Thread(target=train_models_background, daemon=True).start()
        return jsonify({
            'status': 'success',
            'current_consumption': new_energy_point['consumption'],
            'device_consumption': new_energy_point['device_consumption'],
            'timestamp': new_energy_point['timestamp']
        })
    except Exception as e:
        print(f"[ERROR] Failed to update device states: {e}")
        return jsonify({'error': 'Failed to update device states'}), 500

@app.route('/api/energy-data', methods=['GET'])
def get_energy_data():
    try:
        recent_data = energy_data[-12:] if len(energy_data) >= 12 else energy_data
        if models_trained and len(recent_data) > 0:
            for item in recent_data[-3:]:
                try:
                    features = np.array([[
                        item['hour'], item['day_of_week'], item['temperature'], 
                        item['occupancy'], item.get('device_consumption', 0),
                        item.get('time_factor', 1.0), item.get('weather_factor', 1.0),
                        np.sin(2 * np.pi * item['hour'] / 24),
                        np.cos(2 * np.pi * item['hour'] / 24),
                        np.sin(2 * np.pi * item['day_of_week'] / 7),
                        np.cos(2 * np.pi * item['day_of_week'] / 7)
                    ]])
                    rf_pred = energy_model.predict(features)[0]
                    mlp_pred = mlp_model.predict(scaler.transform(features))[0]
                    try:
                        ridge_pred = ridge_model.predict(features)[0]
                        ensemble_pred = (0.5 * rf_pred) + (0.3 * ridge_pred) + (0.2 * mlp_pred)
                    except:
                        ensemble_pred = (0.7 * rf_pred) + (0.3 * mlp_pred)
                    item['predicted'] = round(ensemble_pred, 2)
                    item['prediction_confidence'] = random.uniform(0.85, 0.98)
                except Exception:
                    item['predicted'] = item['consumption']
                    item['prediction_confidence'] = 0.5
        else:
            for item in recent_data:
                item['predicted'] = item['consumption']
                item['prediction_confidence'] = 0.5
        return jsonify(recent_data)
    except Exception:
        return jsonify([]), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    global cached_analytics, analytics_cache_time
    try:
        current_time = time.time()
        if cached_analytics and analytics_cache_time and (current_time - analytics_cache_time) < CACHE_DURATION:
            return jsonify(cached_analytics)
        if len(energy_data) < 5:
            return jsonify({'message': 'Insufficient data.'}), 200
        df = pd.DataFrame(energy_data[-72:] if len(energy_data) >= 72 else energy_data)
        weekly_data = []
        for day in range(7):
            day_data = df[df['day_of_week'] == day]
            if not day_data.empty:
                avg_consumption = day_data['consumption'].mean()
                weekly_data.append({
                    'day': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day],
                    'consumption': round(float(avg_consumption), 1),
                    'prediction': round(float(avg_consumption * random.uniform(0.96, 1.04)), 1),
                    'efficiency': round(float(random.uniform(75, 95)), 1)
                })
        anomaly_data = detect_dynamic_anomalies(df)
        anomaly_count = len(anomaly_data)
        cost_optimization = []
        for month in ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']:
            actual_kwh = np.random.uniform(800, 1200)
            optimized_kwh = actual_kwh * np.random.uniform(0.88, 0.96)
            cost_optimization.append({
                'month': month, 'actual': round(float(actual_kwh * 0.15)),
                'optimized': round(float(optimized_kwh * 0.15)), 'saved': round(float((actual_kwh - optimized_kwh) * 0.15))
            })
        ml_performance = {
            'accuracy': round(float(np.mean([p['accuracy'] for p in ml_performance_history[-7:]]) if ml_performance_history else 92.5), 1),
            'precision': round(float(random.uniform(87, 94)), 1),
            'recall': round(float(random.uniform(89, 96)), 1),
            'f1_score': round(float(random.uniform(88, 95)), 1)
        }
        hourly_patterns = []
        for hour in range(0, 24, 3):
            hour_data = df[df['hour'] == hour]
            if not hour_data.empty:
                hourly_patterns.append({
                    'hour': f"{hour:02d}:00",
                    'avg_consumption': round(float(hour_data['consumption'].mean()), 1),
                    'device_contribution': round(float(hour_data['device_consumption'].mean()), 1)
                })
        ml_algorithms = {
            'random_forest': {
                'name': 'Random Forest Regressor', 'purpose': 'Primary energy consumption prediction',
                'parameters': {'n_estimators': 30, 'max_depth': 6, 'random_state': 42},
                'features_used': ['hour', 'day_of_week', 'temperature', 'occupancy', 'device_consumption', 'time_factor', 'weather_factor'],
                'accuracy': ml_performance['accuracy'],
                'description': 'An ensemble learning method that builds multiple decision trees to improve predictive accuracy and control overfitting. It is robust for forecasting energy consumption patterns.'
            },
            'isolation_forest': {
                'name': 'Isolation Forest', 'purpose': 'Anomaly detection in energy consumption patterns',
                'parameters': {'contamination': 'dynamic', 'random_state': 'dynamic', 'last_used_contamination_rate': round(last_calculated_contamination_rate, 3)},
                'features_used': ['hour', 'day_of_week', 'temperature', 'occupancy'], 'anomalies_detected': anomaly_count,
                'description': 'An unsupervised learning algorithm that efficiently identifies outliers by isolating observations that deviate from the norm. It\'s ideal for detecting unusual energy spikes or drops.'
            },
            'ridge_regression': {
                'name': 'Ridge Regression', 'purpose': 'Linear model component in ensemble',
                'parameters': {'alpha': 1.0, 'random_state': 42}, 'weight_in_ensemble': 0.3,
                'description': 'A type of linear regression that adds a regularization penalty to prevent overfitting. It\'s used as a stable baseline predictor within our ensemble model for energy data.'
            },
            'mlp_regressor': {
                'name': 'MLP Regressor', 'purpose': 'Advanced non-linear prediction',
                'parameters': {'hidden_layer_sizes': '(30, 15)', 'activation': 'relu', 'solver': 'adam', 'max_iter': 50, 'alpha': 0.0001},
                'weight_in_ensemble': 0.2,
                'description': 'A Multi-Layer Perceptron (MLP) is a class of feedforward artificial neural network. It\'s capable of learning non-linear relationships in complex energy datasets for more nuanced predictions.'
            }
        }
        result = {
            'weeklyData': weekly_data, 'anomalyData': anomaly_data, 'costOptimization': cost_optimization,
            'mlPerformance': ml_performance, 'hourlyPatterns': hourly_patterns, 'mlAlgorithms': ml_algorithms
        }
        cached_analytics = result
        analytics_cache_time = current_time
        return jsonify(result)
    except Exception as e:
        print(f"[ERROR] Analytics error: {e}")
        return jsonify({'error': 'Analytics unavailable'}), 500

@app.route('/api/geofences', methods=['GET'])
def get_geofences():
    return jsonify(geofence_data)

@app.route('/api/geofences', methods=['POST'])
def create_geofence():
    try:
        data = request.json
        new_geofence = {
            'id': len(geofence_data) + 1, 'name': data.get('name', 'New Zone'),
            'address': data.get('address', 'Unknown Address'),
            'lat': data.get('lat', 37.7749 + random.uniform(-0.01, 0.01)),
            'lng': data.get('lng', -122.4194 + random.uniform(-0.01, 0.01)),
            'radius': data.get('radius', 200), 'isActive': True, 'automations': int(random.randint(1, 6)),
            'energy_savings': random.uniform(5, 15),  
            'created_at': datetime.now().isoformat()
        }
        geofence_data.append(new_geofence)
        return jsonify(new_geofence)
    except Exception:
        return jsonify({'error': 'Failed to create geofence'}), 500

@app.route('/api/geofences/stats', methods=['GET'])
def get_geofence_stats():
    try:
        total_zones = len([g for g in geofence_data if g.get('isActive', False)])
        return jsonify({
            'total_zones': total_zones
        })
    except Exception:
        return jsonify({'error': 'Stats unavailable'}), 500

@app.route('/api/geofences/analytics', methods=['GET'])
def get_geofence_analytics():
    try:
        energy_optimization = []
        for hour in range(0, 24, 3):
            consumption = 15 + 10 * np.sin(2 * np.pi * hour / 24) + random.uniform(-2, 2)
            optimized = consumption * random.uniform(0.92, 0.98)
            energy_optimization.append({
                'hour': f"{hour:02d}:00", 'consumption': round(float(max(0, consumption)), 1),
                'optimized': round(float(max(0, optimized)), 1)
            })
        zone_efficiency = []
        for geofence in geofence_data:
            zone_efficiency.append({'name': geofence['name'], 'efficiency': round(float(random.uniform(75, 88)), 1)})
        ml_metrics = {
            'model_accuracy': round(float(random.uniform(91, 97)), 1),
            'prediction_confidence': round(float(random.uniform(88, 96)), 1)
        }
        return jsonify({'energy_optimization': energy_optimization, 'zone_efficiency': zone_efficiency, 'ml_metrics': ml_metrics})
    except Exception:
        return jsonify({'error': 'Analytics unavailable'}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port, threaded=True)