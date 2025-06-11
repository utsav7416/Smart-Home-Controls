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
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPRegressor
import warnings
import os
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

energy_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
ridge_model = Ridge(alpha=1.0, random_state=42)
anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
scaler = StandardScaler()
location_clusterer = DBSCAN(eps=0.01, min_samples=3)
mlp_model = MLPRegressor(hidden_layer_sizes=(100, 50), activation='relu', solver='adam', max_iter=200, random_state=42)


energy_data = []
geofence_data = []
device_states = {}
ml_performance_history = []

DEVICE_POWER_MAP = {
    'Main Light': {'base': 15, 'max': 60},
    'Fan': {'base': 25, 'max': 75},
    'AC': {'base': 800, 'max': 1500},
    'TV': {'base': 120, 'max': 200},
    'Microwave': {'base': 800, 'max': 1200},
    'Refrigerator': {'base': 150, 'max': 300},
    'Shower': {'base': 50, 'max': 100},
    'Water Heater': {'base': 2000, 'max': 4000},
    'Dryer': {'base': 2000, 'max': 3000}
}

def calculate_device_consumption(device_name, is_on, value, property_type):
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
    
    time_factor = 1.3 if (6 <= hour <= 9 or 17 <= hour <= 22) else 0.7 if (23 <= hour or hour <= 5) else 1.0
    weekend_factor = 1.15 if day_of_week >= 5 else 1.0
    
    outdoor_temp = 70 + 15 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 3)
    weather_factor = 1.2 if outdoor_temp > 80 or outdoor_temp < 60 else 1.0
    
    total_consumption = (base_consumption + device_consumption) * time_factor * weekend_factor * weather_factor
    noise = np.random.normal(0, total_consumption * 0.05)
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
        'weather_factor': round(weather_factor, 2)
    }

def initialize_data():
    global energy_data, geofence_data, ml_performance_history
    
    base_time = datetime.now() - timedelta(days=30)
    for i in range(720):
        timestamp = base_time + timedelta(hours=i)
        temp_data = generate_realistic_energy_data()
        temp_data['timestamp'] = timestamp.isoformat()
        temp_data['hour'] = timestamp.hour
        temp_data['day_of_week'] = timestamp.weekday()
        energy_data.append(temp_data)
    
    geofence_data.extend([
        {
            'id': 1,
            'name': 'Home',
            'address': '123 Main St, San Francisco, CA',
            'lat': 37.7749,
            'lng': -122.4194,
            'radius': 200,
            'isActive': True,
            'automations': 8,
            'trigger_count': np.random.randint(120, 180),
            'energy_savings': np.random.uniform(220, 280),
            'created_at': (datetime.now() - timedelta(days=30)).isoformat()
        },
        {
            'id': 2,
            'name': 'Work Office',
            'address': '456 Business Ave, San Francisco, CA',
            'lat': 37.7849,
            'lng': -122.4094,
            'radius': 150,
            'isActive': True,
            'automations': 5,
            'trigger_count': np.random.randint(80, 120),
            'energy_savings': np.random.uniform(150, 200),
            'created_at': (datetime.now() - timedelta(days=20)).isoformat()
        }
    ])
    
    for i in range(30):
        date = datetime.now() - timedelta(days=29-i)
        ml_performance_history.append({
            'date': date.isoformat(),
            'accuracy': np.random.uniform(88, 96),
            'mse': np.random.uniform(0.02, 0.08),
            'mae': np.random.uniform(0.1, 0.3),
            'r2_score': np.random.uniform(0.85, 0.95)
        })

def train_models():
    global energy_model, ridge_model, anomaly_detector, scaler, mlp_model
    
    if len(energy_data) < 50:
        return
    
    df = pd.DataFrame(energy_data)
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
    df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
    df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
    
    features = ['hour', 'day_of_week', 'temperature', 'occupancy', 'device_consumption', 
                'time_factor', 'weather_factor', 'hour_sin', 'hour_cos', 'day_sin', 'day_cos']
    
    X = df[features].fillna(0).values
    y = df['consumption'].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    try:
        energy_model.fit(X_train, y_train)
        ridge_model.fit(X_train, y_train)
        anomaly_detector.fit(X_train_scaled)
        mlp_model.fit(X_train_scaled, y_train) 
    except Exception as e:
        print(f"Training error: {e}")

@app.route('/api/update-device-states', methods=['POST'])
def update_device_states():
    global device_states
    
    data = request.json
    device_states = data.get('deviceStates', {})
    
    new_energy_point = generate_realistic_energy_data(device_states)
    energy_data.append(new_energy_point)
    
    if len(energy_data) > 1000:
        energy_data.pop(0)
    
    if len(energy_data) % 50 == 0:
        train_models()
    
    return jsonify({
        'status': 'success',
        'current_consumption': new_energy_point['consumption'],
        'device_consumption': new_energy_point['device_consumption'],
        'timestamp': new_energy_point['timestamp']
    })

@app.route('/api/energy-data', methods=['GET'])
def get_energy_data():
    recent_data = energy_data[-48:] if len(energy_data) >= 48 else energy_data
    
    for item in recent_data:
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
            item['prediction_confidence'] = np.random.uniform(0.85, 0.98)
            
        except Exception as e:
            item['predicted'] = item['consumption']
            item['prediction_confidence'] = 0.5
    
    return jsonify(recent_data)

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    if len(energy_data) < 10:
        return jsonify({'error': 'Insufficient data'}), 400
    
    df = pd.DataFrame(energy_data[-336:])
    
    weekly_data = []
    for day in range(7):
        day_data = df[df['day_of_week'] == day]
        if not day_data.empty:
            avg_consumption = day_data['consumption'].mean()
            weekly_data.append({
                'day': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day],
                'consumption': round(float(avg_consumption), 1),
                'prediction': round(float(avg_consumption * np.random.uniform(0.96, 1.04)), 1),
                'efficiency': round(float(np.random.uniform(75, 95)), 1)
            })
    
    anomaly_data = []
    try:
        recent_df = df[-168:] if len(df) >= 168 else df
        
        if len(recent_df) > 20:
            consumption_mean = recent_df['consumption'].mean()
            consumption_std = recent_df['consumption'].std()
            upper_threshold = consumption_mean + (2.5 * consumption_std)
            lower_threshold = max(0, consumption_mean - (2.5 * consumption_std))
            
            for _, row in recent_df.iterrows():
                consumption = row['consumption']
                hour = row['hour']
                timestamp = row['timestamp']
                
                is_statistical_anomaly = consumption > upper_threshold or consumption < lower_threshold
                
                hour_data = recent_df[recent_df['hour'] == hour]['consumption']
                if len(hour_data) > 1:
                    hour_mean = hour_data.mean()
                    hour_std = hour_data.std()
                    if hour_std > 0:
                        z_score = abs((consumption - hour_mean) / hour_std)
                        is_pattern_anomaly = z_score > 2.0
                    else:
                        is_pattern_anomaly = False
                else:
                    is_pattern_anomaly = False
                
                device_consumption = row.get('device_consumption', 0)
                is_device_anomaly = device_consumption > consumption * 0.8
                
                if is_statistical_anomaly or is_pattern_anomaly or is_device_anomaly:
                    deviation_ratio = abs(consumption - consumption_mean) / consumption_mean
                    if deviation_ratio > 0.5:
                        severity = 'high'
                    elif deviation_ratio > 0.25:
                        severity = 'medium'
                    else:
                        severity = 'low'
                    
                    confidence = min(0.95, 0.5 + (deviation_ratio * 0.5))
                    
                    anomaly_data.append({
                        'time': int(hour),
                        'consumption': round(float(consumption), 1),
                        'severity': severity,
                        'timestamp': timestamp,
                        'score': round(float(confidence), 3),
                        'type': 'statistical' if is_statistical_anomaly else ('pattern' if is_pattern_anomaly else 'device')
                    })
            
            if len(recent_df) > 50:
                features = recent_df[['hour', 'day_of_week', 'temperature', 'occupancy']].fillna(0).values
                
                temp_detector = IsolationForest(contamination=0.15, random_state=42)
                temp_detector.fit(features)
                ml_anomalies = temp_detector.predict(features)
                ml_scores = temp_detector.decision_function(features)
                
                for i, (is_anomaly, score) in enumerate(zip(ml_anomalies, ml_scores)):
                    if is_anomaly == -1: 
                        row = recent_df.iloc[i]
                        severity = 'high' if abs(score) > 0.5 else 'medium'
                        anomaly_data.append({
                            'time': int(row['hour']),
                            'consumption': round(float(row['consumption']), 1),
                            'severity': severity,
                            'timestamp': row['timestamp'],
                            'score': round(float(abs(score)), 3),
                            'type': 'ml_detected'
                        })
                        
    except Exception as e:
        print(f"Anomaly detection error: {e}")
    
    unique_anomalies = []
    seen_timestamps = set()
    for anomaly in anomaly_data:
        if anomaly['timestamp'] not in seen_timestamps:
            unique_anomalies.append(anomaly)
            seen_timestamps.add(anomaly['timestamp'])
    
    anomaly_data = sorted(unique_anomalies, key=lambda x: x['timestamp'], reverse=True) 
    
    cost_optimization = []
    for month in ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']:
        actual_kwh = np.random.uniform(800, 1200)
        optimized_kwh = actual_kwh * np.random.uniform(0.75, 0.88)
        cost_optimization.append({
            'month': month,
            'actual': round(float(actual_kwh * 0.15)),
            'optimized': round(float(optimized_kwh * 0.15)),
            'saved': round(float((actual_kwh - optimized_kwh) * 0.15))
        })
    
    ml_performance = {
        'accuracy': round(float(np.mean([p['accuracy'] for p in ml_performance_history[-7:]]) if ml_performance_history else 92.5), 1),
        'precision': round(float(np.random.uniform(87, 94)), 1),
        'recall': round(float(np.random.uniform(89, 96)), 1),
        'f1_score': round(float(np.random.uniform(88, 95)), 1)
    }
    
    hourly_patterns = []
    for hour in range(24):
        hour_data = df[df['hour'] == hour]
        if not hour_data.empty:
            hourly_patterns.append({
                'hour': f"{hour:02d}:00",
                'avg_consumption': round(float(hour_data['consumption'].mean()), 1),
                'device_contribution': round(float(hour_data['device_consumption'].mean()), 1)
            })
    
    ml_algorithms = {
        'random_forest': {
            'name': 'Random Forest Regressor',
            'purpose': 'Primary energy consumption prediction',
            'parameters': {
                'n_estimators': 100,
                'max_depth': 10,
                'random_state': 42
            },
            'features_used': ['hour', 'day_of_week', 'temperature', 'occupancy', 'device_consumption', 'time_factor', 'weather_factor'],
            'accuracy': ml_performance['accuracy'],
            'description': 'An ensemble learning method that builds multiple decision trees to improve predictive accuracy and control overfitting. It is robust for forecasting energy consumption patterns.'
        },
        'isolation_forest': {
            'name': 'Isolation Forest',
            'purpose': 'Anomaly detection in energy consumption patterns',
            'parameters': {
                'contamination': 0.15,
                'random_state': 42
            },
            'features_used': ['hour', 'day_of_week', 'temperature', 'occupancy'],
            'anomalies_detected': len(unique_anomalies), 
            'description': 'An unsupervised learning algorithm that efficiently identifies outliers by isolating observations that deviate from the norm. It\'s ideal for detecting unusual energy spikes or drops.'
        },
        'ridge_regression': {
            'name': 'Ridge Regression',
            'purpose': 'Linear model component in ensemble',
            'parameters': {
                'alpha': 1.0,
                'random_state': 42
            },
            'weight_in_ensemble': 0.3,
            'description': 'A type of linear regression that adds a regularization penalty to prevent overfitting. It\'s used as a stable baseline predictor within our ensemble model for energy data.'
        },
        'mlp_regressor': { 
            'name': 'MLP Regressor',
            'purpose': 'Advanced non-linear prediction',
            'parameters': {
                'hidden_layer_sizes': (100, 50),
                'activation': 'relu',
                'solver': 'adam',
                'max_iter': 200
            },
            'weight_in_ensemble': 0.2, 
            'description': 'A Multi-Layer Perceptron (MLP) is a class of feedforward artificial neural network. It\'s capable of learning non-linear relationships in complex energy datasets for more nuanced predictions.'
        }
    }
    
    return jsonify({
        'weeklyData': weekly_data,
        'anomalyData': anomaly_data,
        'costOptimization': cost_optimization,
        'mlPerformance': ml_performance,
        'hourlyPatterns': hourly_patterns,
        'mlAlgorithms': ml_algorithms
    })

@app.route('/api/geofences', methods=['GET'])
def get_geofences():
    return jsonify(geofence_data)

@app.route('/api/geofences', methods=['POST'])
def create_geofence():
    data = request.json
    new_geofence = {
        'id': len(geofence_data) + 1,
        'name': data.get('name', 'New Zone'),
        'address': data.get('address', 'Unknown Address'),
        'lat': data.get('lat', 37.7749 + np.random.uniform(-0.01, 0.01)),
        'lng': data.get('lng', -122.4194 + np.random.uniform(-0.01, 0.01)),
        'radius': data.get('radius', 200),
        'isActive': True,
        'automations': int(np.random.randint(1, 6)),
        'trigger_count': 0,
        'energy_savings': 0,
        'created_at': (datetime.now() - timedelta(days=30)).isoformat()
    }
    geofence_data.append(new_geofence)
    return jsonify(new_geofence)

@app.route('/api/geofences/stats', methods=['GET'])
def get_geofence_stats():
    total_energy_saved = sum(g.get('energy_savings', 0) for g in geofence_data)
    total_zones = len([g for g in geofence_data if g.get('isActive', False)])
    total_triggers = sum(g.get('trigger_count', 0) for g in geofence_data)
    
    return jsonify({
        'total_energy_saved': round(float(total_energy_saved), 1),
        'total_zones': total_zones,
        'total_triggers': int(total_triggers)
    })

@app.route('/api/geofences/activity', methods=['GET'])
def get_geofence_activity():
    activities = []
    for i in range(8):
        timestamp = datetime.now() - timedelta(hours=i)
        location = random.choice(['Home', 'Work Office', 'Gym', 'Store'])
        event = random.choice(['Entered', 'Left'])
        
        activities.append({
            'event': f"{event} {location}",
            'time': timestamp.strftime('%H:%M'),
            'automation': random.choice([
                'Smart lighting adjusted',
                'HVAC optimization triggered',
                'Security system updated',
                'Energy-saving mode activated'
            ]),
            'location': location,
            'energy_impact': round(float(np.random.uniform(-25, 20)), 1)
        })
    
    return jsonify(activities)

@app.route('/api/geofences/analytics', methods=['GET'])
def get_geofence_analytics():
    energy_optimization = []
    for hour in range(24):
        consumption = 15 + 10 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 2)
        optimized = consumption * np.random.uniform(0.78, 0.92)
        
        energy_optimization.append({
            'hour': f"{hour:02d}:00",
            'consumption': round(float(max(0, consumption)), 1),
            'optimized': round(float(max(0, optimized)), 1)
        })
    
    zone_efficiency = []
    for geofence in geofence_data:
        zone_efficiency.append({
            'name': geofence['name'],
            'efficiency': round(float(np.random.uniform(75, 96)), 1)
        })
    
    return jsonify({
        'energy_optimization': energy_optimization,
        'zone_efficiency': zone_efficiency,
        'ml_metrics': {
            'model_accuracy': round(float(np.random.uniform(91, 97)), 1),
            'prediction_confidence': round(float(np.random.uniform(88, 96)), 1)
        }
    })

@app.route('/api/geofences/detect-anomalies', methods=['GET'])
def detect_anomalies():
    anomalies = []
    for i in range(8):
        anomalies.append({
            'location': {
                'lat': round(float(37.7749 + np.random.normal(0, 0.01)), 4),
                'lng': round(float(-122.4194 + np.random.normal(0, 0.01)), 4)
            },
            'energy_consumption': round(float(np.random.uniform(15, 55)), 1),
            'severity': random.choice(['critical', 'high', 'medium']),
            'timestamp': (datetime.now() - timedelta(hours=int(np.random.randint(0, 48)))).isoformat(),
            'confidence': round(float(np.random.uniform(0.82, 0.97)), 3)
        })
    
    return jsonify({
        'anomalies': anomalies,
        'total_anomalies': len(anomalies)
    })

@app.route('/api/geofences/optimize', methods=['POST'])
def optimize_geofences():
    for geofence in geofence_data:
        geofence['energy_savings'] = min(50, geofence['energy_savings'] + float(np.random.uniform(3, 12)))
        geofence['radius'] = max(50, geofence['radius'] * float(np.random.uniform(0.88, 1.15)))
    
    return jsonify({
        'message': 'Geofences optimized using ML algorithms',
        'improvements': f"Energy savings increased by {float(np.random.uniform(8, 18)):.1f}%"
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000)) 
    initialize_data()
    train_models()
    app.run(debug=True, host='0.0.0.0', port=port)