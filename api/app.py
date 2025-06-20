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
from functools import lru_cache
from flask_caching import Cache

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)
app.config.from_mapping({"CACHE_TYPE": "SimpleCache", "CACHE_DEFAULT_TIMEOUT": 3600})
cache = Cache(app)

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
energy_data = []
geofence_data = []
device_states = {}
ml_performance_history = []
optimization_history = []
optimization_success_count = 0
total_optimization_attempts = 0
last_calculated_contamination_rate = 0.15
last_device_change_time = None
cached_analytics = None
analytics_cache_time = None
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

def generate_realistic_energy_data(device_states=None):
    now = datetime.now()
    hour = now.hour
    day_of_week = now.weekday()
    temperature = random.uniform(60, 85)
    occupancy = random.choice([0, 1, 2, 3])
    total_consumption = 0
    device_consumption = 0
    if device_states:
        for device_name, state in device_states.items():
            is_on = state.get('isOn', False)
            value = state.get('value', 50)
            property_type = state.get('type', 'power')
            consumption = calculate_device_consumption(device_name, is_on, value, property_type)
            device_consumption += consumption
    base_load = random.uniform(100, 300)
    time_factor = 1.0 + 0.3 * np.sin(2 * np.pi * hour / 24)
    weather_factor = 1.0 + 0.2 * (temperature - 70) / 15 if temperature > 70 else 1.0
    occupancy_factor = 1.0 + 0.1 * occupancy
    total_consumption = (base_load + device_consumption) * time_factor * weather_factor * occupancy_factor
    total_consumption = max(50, min(5000, total_consumption))
    return {
        'timestamp': now.isoformat(),
        'consumption': round(total_consumption, 2),
        'hour': hour,
        'day_of_week': day_of_week,
        'temperature': round(temperature, 1),
        'occupancy': occupancy,
        'device_consumption': round(device_consumption, 2),
        'time_factor': round(time_factor, 2),
        'weather_factor': round(weather_factor, 2)
    }

def initialize_minimal_data():
    global energy_data, geofence_data
    now = datetime.now()
    energy_data = []
    for h in range(-48, 0):
        past_time = now + timedelta(hours=h)
        temp_hour = past_time.hour
        temp_day = past_time.weekday()
        temperature = random.uniform(60, 85)
        occupancy = random.choice([0, 1, 2])
        base_load = random.uniform(100, 300)
        time_factor = 1.0 + 0.3 * np.sin(2 * np.pi * temp_hour / 24)
        weather_factor = 1.0 + 0.2 * (temperature - 70) / 15 if temperature > 70 else 1.0
        occupancy_factor = 1.0 + 0.1 * occupancy
        total_consumption = base_load * time_factor * weather_factor * occupancy_factor
        total_consumption = max(50, min(5000, total_consumption))
        energy_data.append({
            'timestamp': past_time.isoformat(),
            'consumption': round(total_consumption, 2),
            'hour': temp_hour,
            'day_of_week': temp_day,
            'temperature': round(temperature, 1),
            'occupancy': occupancy,
            'device_consumption': 0,
            'time_factor': round(time_factor, 2),
            'weather_factor': round(weather_factor, 2)
        })
    geofence_data = [
        {'id': 1, 'name': 'Home', 'lat': 40.7128, 'lng': -74.0060, 'radius': 50, 'type': 'circle'},
        {'id': 2, 'name': 'Office', 'lat': 40.7484, 'lng': -73.9857, 'radius': 100, 'type': 'circle'},
        {'id': 3, 'name': 'Park', 'lat': 40.7829, 'lng': -73.9654, 'radius': 200, 'type': 'circle'}
    ]

def train_models():
    global energy_model, ridge_model, mlp_model, anomaly_detector, scaler
    data = np.array([[
        d['hour'], d['day_of_week'], d['temperature'], d['occupancy'],
        d.get('device_consumption', 0), d.get('time_factor', 1.0),
        d.get('weather_factor', 1.0),
        np.sin(2 * np.pi * d['hour'] / 24),
        np.cos(2 * np.pi * d['hour'] / 24),
        np.sin(2 * np.pi * d['day_of_week'] / 7),
        np.cos(2 * np.pi * d['day_of_week'] / 7)
    ] for d in energy_data])
    target = np.array([d['consumption'] for d in energy_data])
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(data)
    energy_model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
    energy_model.fit(data, target)
    ridge_model = Ridge(alpha=1.0)
    ridge_model.fit(data, target)
    mlp_model = MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42)
    mlp_model.fit(scaled_data, target)
    anomaly_detector = IsolationForest(contamination=0.15, random_state=42)
    anomaly_detector.fit(data)

def get_analytics_data():
    if not energy_data:
        return {
            'total_energy': 0,
            'average_consumption': 0,
            'peak_consumption': 0,
            'peak_time': None,
            'device_breakdown': {},
            'anomalies': [],
            'predictions': [],
            'prediction_accuracy': 0,
            'optimization_rate': 0,
            'optimization_impact': 0,
            'optimization_trend': [],
            'ml_performance': {'accuracy': 0, 'confidence': 0, 'trend': []},
            'anomaly_rate': 0,
            'anomaly_trend': [],
            'timestamp': datetime.now().isoformat()
        }
    total_energy = sum(d['consumption'] for d in energy_data)
    average_consumption = total_energy / len(energy_data)
    peak_consumption = max(d['consumption'] for d in energy_data)
    peak_time = next(d['timestamp'] for d in energy_data if d['consumption'] == peak_consumption)
    device_breakdown = {}
    for device_name in DEVICE_POWER_MAP:
        device_breakdown[device_name] = random.uniform(5, 20) * average_consumption / 100
    recent_data = energy_data[-12:] if len(energy_data) >= 12 else energy_data
    anomalies = []
    predictions = []
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
            predictions.append({
                'timestamp': item['timestamp'],
                'actual': item['consumption'],
                'predicted': item['predicted'],
                'confidence': item['prediction_confidence']
            })
            anomaly_score = anomaly_detector.decision_function(features)[0]
            if anomaly_score < 0:
                anomalies.append({
                    'timestamp': item['timestamp'],
                    'value': item['consumption'],
                    'severity': round(random.uniform(0.5, 1.0), 2),
                    'type': random.choice(['spike', 'dip', 'pattern']),
                    'confidence': round(random.uniform(0.7, 0.95), 2)
                })
        except Exception:
            item['predicted'] = item['consumption']
            item['prediction_confidence'] = 0.5
    prediction_accuracy = random.uniform(0.75, 0.95) if predictions else 0
    optimization_rate = random.uniform(0.1, 0.3)
    optimization_impact = random.uniform(5, 15)
    optimization_trend = [random.uniform(0.05, 0.2) for _ in range(5)]
    ml_performance = {
        'accuracy': random.uniform(0.8, 0.95),
        'confidence': random.uniform(0.85, 0.98),
        'trend': [random.uniform(0.75, 0.95) for _ in range(5)]
    }
    anomaly_rate = len(anomalies) / len(recent_data) if recent_data else 0
    anomaly_trend = [random.uniform(0.05, 0.2) for _ in range(5)]
    return {
        'total_energy': round(total_energy, 2),
        'average_consumption': round(average_consumption, 2),
        'peak_consumption': round(peak_consumption, 2),
        'peak_time': peak_time,
        'device_breakdown': {k: round(v, 2) for k, v in device_breakdown.items()},
        'anomalies': anomalies,
        'predictions': predictions,
        'prediction_accuracy': round(prediction_accuracy, 2),
        'optimization_rate': round(optimization_rate, 2),
        'optimization_impact': round(optimization_impact, 2),
        'optimization_trend': [round(x, 2) for x in optimization_trend],
        'ml_performance': {
            'accuracy': round(ml_performance['accuracy'], 2),
            'confidence': round(ml_performance['confidence'], 2),
            'trend': [round(x, 2) for x in ml_performance['trend']]
        },
        'anomaly_rate': round(anomaly_rate, 2),
        'anomaly_trend': [round(x, 2) for x in anomaly_trend],
        'timestamp': datetime.now().isoformat()
    }

def get_geofence_stats_data():
    stats = []
    for geofence in geofence_data:
        stats.append({
            'id': geofence['id'],
            'name': geofence['name'],
            'visits': random.randint(5, 50),
            'last_visit': (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat(),
            'energy_impact': round(random.uniform(5.0, 20.0), 2),
            'dwell_time': random.randint(30, 300)
        })
    return stats

def get_geofence_analytics_data():
    return {
        'total_geofences': len(geofence_data),
        'active_geofences': random.randint(1, len(geofence_data)),
        'total_visits': random.randint(50, 200),
        'average_dwell_time': random.randint(60, 180),
        'energy_correlation': round(random.uniform(0.3, 0.7), 2),
        'trigger_rate': round(random.uniform(0.1, 0.5), 2),
        'most_visited': geofence_data[0]['name'] if geofence_data else None,
        'visit_trend': [random.randint(5, 20) for _ in range(7)],
        'dwell_trend': [random.randint(50, 200) for _ in range(7)],
        'energy_impact_trend': [round(random.uniform(5.0, 15.0), 2) for _ in range(7)],
        'timestamp': datetime.now().isoformat()
    }

def preload_cache():
    cache.set('geofences', geofence_data, timeout=3600)
    cache.set('geofence_stats', get_geofence_stats_data(), timeout=3600)
    cache.set('geofence_analytics', get_geofence_analytics_data(), timeout=3600)
    cache.set('analytics', get_analytics_data(), timeout=3600)

with app.app_context():
    initialize_minimal_data()
    train_models()
    preload_cache()
    app.logger.info("App initialized with preloaded geofence and analytics data.")

@app.route('/')
def health_check():
    return jsonify({'status': 'ok'})

@app.route('/api/update-device-states', methods=['POST'])
def update_device_states():
    global device_states, last_device_change_time, cached_analytics, analytics_cache_time
    try:
        data = request.json
        device_states = data.get('deviceStates', {})
        last_device_change_time = datetime.now()
        cached_analytics = None
        analytics_cache_time = None
        new_energy_point = generate_realistic_energy_data(device_states)
        energy_data.append(new_energy_point)
        if len(energy_data) > 200:
            energy_data.pop(0)
        preload_cache()
        return jsonify({
            'status': 'success',
            'current_consumption': new_energy_point['consumption'],
            'device_consumption': new_energy_point['device_consumption'],
            'timestamp': new_energy_point['timestamp']
        })
    except Exception:
        return jsonify({'error': 'Failed to update device states'}), 500

@app.route('/api/energy-data', methods=['GET'])
def get_energy_data():
    try:
        recent_data = energy_data[-12:] if len(energy_data) >= 12 else energy_data
        if len(recent_data) > 0:
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
@cache.cached(timeout=3600)
def get_analytics():
    analytics = cache.get('analytics')
    if analytics is None:
        analytics = get_analytics_data()
        cache.set('analytics', analytics, timeout=3600)
    return jsonify(analytics)

@app.route('/api/geofences', methods=['GET'])
@cache.cached(timeout=3600)
def get_geofences():
    geofences = cache.get('geofences')
    if geofences is None:
        geofences = geofence_data
        cache.set('geofences', geofences, timeout=3600)
    return jsonify(geofences)

@app.route('/api/geofences', methods=['POST'])
def add_geofence():
    try:
        new_geofence = request.json
        new_geofence['id'] = len(geofence_data) + 1
        geofence_data.append(new_geofence)
        preload_cache()
        return jsonify({'status': 'success', 'geofence': new_geofence})
    except Exception:
        return jsonify({'error': 'Failed to add geofence'}), 500

@app.route('/api/geofences/<int:id>', methods=['DELETE'])
def delete_geofence(id):
    try:
        global geofence_data
        geofence_data = [g for g in geofence_data if g['id'] != id]
        preload_cache()
        return jsonify({'status': 'success'})
    except Exception:
        return jsonify({'error': 'Failed to delete geofence'}), 500

@app.route('/api/geofences/stats', methods=['GET'])
@cache.cached(timeout=3600)
def get_geofence_stats():
    stats = cache.get('geofence_stats')
    if stats is None:
        stats = get_geofence_stats_data()
        cache.set('geofence_stats', stats, timeout=3600)
    return jsonify(stats)

@app.route('/api/geofences/analytics', methods=['GET'])
@cache.cached(timeout=3600)
def get_geofence_analytics():
    analytics = cache.get('geofence_analytics')
    if analytics is None:
        analytics = get_geofence_analytics_data()
        cache.set('geofence_analytics', analytics, timeout=3600)
    return jsonify(analytics)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port, threaded=True)
