import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Brain, Zap, Activity, Target, BarChart3, Cpu, Settings, Shield, Network, Code, Layers, GitBranch } from 'lucide-react';
import { useState, useEffect } from 'react';

const FLASK_API_URL = process.env.REACT_APP_API_BASE_URL || 'https://smart-home-controls-backend.onrender.com';

const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const useDeviceSync = () => {
  const [deviceStates, setDeviceStates] = useState({});
  const [totalDevicePower, setTotalDevicePower] = useState(0);

  const DEVICE_POWER_MAP = {
    'Main Light': { base: 15, max: 60 },
    'Fan': { base: 25, max: 75 },
    'AC': { base: 800, max: 1500 },
    'TV': { base: 120, max: 200 },
    'Microwave': { base: 800, max: 1200 },
    'Refrigerator': { base: 150, max: 300 },
    'Shower': { base: 50, max: 100 },
    'Water Heater': { base: 2000, max: 4000 },
    'Dryer': { base: 2000, max: 3000 }
  };

  const calculateDevicePower = (deviceName, isOn, value, property) => {
    if (!isOn || !DEVICE_POWER_MAP[deviceName]) return 0;

    const { base, max } = DEVICE_POWER_MAP[deviceName];
    let ratio = 0.5;

    if (property === 'brightness' || property === 'speed' || property === 'volume' || property === 'pressure' || property === 'power') {
      ratio = value / 100;
    } else if (property === 'temp' || property === 'temperature') {
      if (deviceName === 'AC') {
        const tempDiff = Math.abs(value - 72) / 25;
        ratio = 0.5 + (tempDiff * 0.5);
      } else if (deviceName === 'Water Heater') {
        ratio = (value - 40) / 80;
      } else {
        ratio = value / 100;
      }
    }

    return base + (max - base) * ratio;
  };

  useEffect(() => {
    const handleDeviceChange = () => {
      const storedDevices = localStorage.getItem('deviceStates');
      if (storedDevices) {
        const devices = JSON.parse(storedDevices);
        setDeviceStates(devices);

        let total = 0;
        Object.values(devices).forEach((roomDevices) => {
          roomDevices.forEach((device) => {
            total += calculateDevicePower(device.name, device.isOn, device.value, device.property);
          });
        });
        setTotalDevicePower(total);
      }
    };

    handleDeviceChange();
    window.addEventListener('storage', handleDeviceChange);

    return () => window.removeEventListener('storage', handleDeviceChange);
  }, []);

  return { deviceStates, totalDevicePower };
};

const fetchAnalyticsData = async () => {
  const response = await fetch(`${FLASK_API_URL}/api/analytics`);
  if (!response.ok) throw new Error('Failed to fetch analytics data');
  return await response.json();
};

const AlgorithmCard = ({ algorithm, icon: Icon, gradientFrom, gradientTo, borderColor, iconBg, iconColor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl border ${borderColor} overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center ring-2 ring-white/20`}>
              <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-1">{algorithm?.name}</h3>
              <p className={`text-sm font-medium ${iconColor.replace('text-', 'text-').replace('-400', '-300')}`}>
                {algorithm?.purpose}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30">
              ACTIVE
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {algorithm?.name === "Random Forest Regressor" && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{algorithm?.accuracy}%</div>
                <div className="text-xs text-gray-300">Accuracy Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{algorithm?.parameters?.n_estimators}</div>
                <div className="text-xs text-gray-300">Decision Trees</div>
              </div>
            </>
          )}
          {algorithm?.name === "Isolation Forest" && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{algorithm?.anomalies_detected}</div>
                <div className="text-xs text-gray-300">Anomalies Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{(algorithm?.parameters?.contamination * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-300">Contamination Rate</div>
              </div>
            </>
          )}
          {algorithm?.name === "Multi-Layer Perceptron" && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{algorithm?.parameters?.hidden_layer_sizes?.length || 0}</div>
                <div className="text-xs text-gray-300">Hidden Layers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{algorithm?.weight_in_ensemble}</div>
                <div className="text-xs text-gray-300">Ensemble Weight</div>
              </div>
            </>
          )}
          {algorithm?.name === "Ridge Regression" && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{algorithm?.parameters?.alpha}</div>
                <div className="text-xs text-gray-300">Alpha (α)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{algorithm?.weight_in_ensemble}</div>
                <div className="text-xs text-gray-300">Ensemble Weight</div>
              </div>
            </>
          )}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          {algorithm?.description}
        </p>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30 flex items-center justify-center gap-2`}
        >
          <Settings className="w-4 h-4" />
          {isExpanded ? 'Hide Parameters' : 'View Parameters'}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Model Parameters
              </h4>
              <div className="space-y-2">
                {Object.entries(algorithm?.parameters || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs font-mono">{key}:</span>
                    <span className="text-white text-xs font-mono bg-gray-800/50 px-2 py-1 rounded">
                      {Array.isArray(value) ? `[${value.join(', ')}]` : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-xs font-semibold">Performance</span>
                </div>
                <div className="text-blue-300 text-sm font-mono">
                  {algorithm?.name === "Random Forest Regressor" ? `${algorithm?.accuracy}% Accuracy` :
                   algorithm?.name === "Isolation Forest" ? `${algorithm?.anomalies_detected} Detected` :
                   algorithm?.name === "Multi-Layer Perceptron" ? `${algorithm?.parameters?.max_iter} Max Iter` :
                   `α = ${algorithm?.parameters?.alpha}`}
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-xs font-semibold">Status</span>
                </div>
                <div className="text-purple-300 text-sm font-mono">
                  Real-time Processing
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Analytics() {
  const { deviceStates, totalDevicePower } = useDeviceSync();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAnalyticsData();
        setAnalyticsData(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-white text-lg flex items-center gap-3">
          <Brain className="w-6 h-6 animate-pulse" />
          Loading ML analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-red-400 text-lg">
          Failed to connect to Flask backend. Make sure your Flask server is running on {FLASK_API_URL}
        </div>
      </div>
    );
  }

  const {
    weeklyData = [],
    anomalyData = [],
    costOptimization = [],
    mlPerformance = {},
    hourlyPatterns = [],
    mlAlgorithms = {}
  } = analyticsData || {};

  const adjustedWeeklyData = weeklyData.map((item) => ({
    ...item,
    consumption: item.consumption + (totalDevicePower * 0.001),
    prediction: item.prediction + (totalDevicePower * 0.0009)
  }));

  const adjustedHourlyPatterns = hourlyPatterns.map((item) => ({
    ...item,
    avg_consumption: item.avg_consumption + (totalDevicePower * 0.001),
    device_contribution: totalDevicePower * 0.001
  }));

  const predictionAccuracy = adjustedWeeklyData.length > 0
    ? adjustedWeeklyData.reduce((sum, item) => {
        const accuracy = 100 - Math.abs(item.consumption - item.prediction) / item.consumption * 100;
        return sum + Math.max(0, accuracy);
      }, 0) / adjustedWeeklyData.length
    : 0;

  const anomaliesDetected = anomalyData.length;
  const totalSavings = costOptimization.reduce((sum, item) => sum + item.saved, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="relative text-center py-8">
        <img
          src="https://t3.ftcdn.net/jpg/05/33/85/52/360_F_533855273_pPxfrx0yPJoXsoO7dQHPxbm0M9DvUEb8.jpg"
          alt="Smart Home"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 mx-auto max-w-3xl bg-black/70 backdrop-blur-sm rounded-xl p-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Advanced Energy Analytics & ML Insights
          </h1>
          <p className="text-blue-200 text-xl mb-4">
            Real-time machine learning algorithms analyzing your energy consumption patterns
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-base text-blue-300">
            <span>• Anomaly Detection Active</span>
            <span>• Predictive Modeling Enabled</span>
            <span>• Cost Optimization Running</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-md border border-green-400/30">
          <CardContent className="p-6 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">ML Prediction Accuracy</p>
                <p className="text-3xl font-bold text-white">{predictionAccuracy.toFixed(1)}%</p>
                <p className="text-green-300 text-xs mt-1">Ensemble Model</p>
              </div>
              <Brain className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-md border border-red-400/30">
          <CardContent className="p-6 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-medium">Anomalies Detected</p>
                <p className="text-3xl font-bold text-white">{anomaliesDetected}</p>
                <p className="text-red-300 text-xs mt-1">Isolation Forest</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-md border border-blue-400/30">
          <CardContent className="p-6 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Current Device Load</p>
                <p className="text-3xl font-bold text-white">{(totalDevicePower/1000).toFixed(2)}kW</p>
                <p className="text-blue-300 text-xs mt-1">Live Consumption</p>
              </div>
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-md border border-purple-400/30">
          <CardContent className="p-6 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total Savings</p>
                <p className="text-3xl font-bold text-white">${totalSavings}</p>
                <p className="text-purple-300 text-xs mt-1">This Month</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Real-Time Anomaly Detection ({anomaliesDetected} detected)
          </CardTitle>
          <p className="text-gray-300 text-sm">Live anomaly detection using Isolation Forest algorithm</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={anomalyData}>
              <CartesianGrid strokeDashArray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Scatter dataKey="consumption" name="Consumption">
                {anomalyData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.severity === 'high' ? '#ef4444' : '#f59e0b'}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>High severity: {anomalyData.filter((a) => a.severity === 'high').length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Medium severity: {anomalyData.filter((a) => a.severity === 'medium').length}</span>
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-white font-semibold">Last detected:</span>
              {anomalyData.length > 0 ? ` ${new Date(anomalyData[0].timestamp).toLocaleTimeString()}` : ' None'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5" />
            AI-Powered Machine Learning Pipeline
          </CardTitle>
          <p className="text-gray-300 text-sm">Advanced ensemble of ML algorithms working together to optimize your energy consumption</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlgorithmCard
              algorithm={mlAlgorithms.random_forest}
              icon={GitBranch}
              gradientFrom="from-emerald-500/10"
              gradientTo="to-green-600/10"
              borderColor="border-emerald-500/30"
              iconBg="bg-emerald-500/20"
              iconColor="text-emerald-400"
            />

            <AlgorithmCard
              algorithm={mlAlgorithms.isolation_forest}
              icon={Shield}
              gradientFrom="from-red-500/10"
              gradientTo="to-rose-600/10"
              borderColor="border-red-500/30"
              iconBg="bg-red-500/20"
              iconColor="text-red-400"
            />

            <AlgorithmCard
              algorithm={mlAlgorithms.mlp_regressor}
              icon={Layers}
              gradientFrom="from-purple-500/10"
              gradientTo="to-indigo-600/10"
              borderColor="border-purple-500/30"
              iconBg="bg-purple-500/20"
              iconColor="text-purple-400"
            />

            <AlgorithmCard
              algorithm={mlAlgorithms.ridge_regression}
              icon={TrendingUp}
              gradientFrom="from-amber-500/10"
              gradientTo="to-orange-600/10"
              borderColor="border-amber-500/30"
              iconBg="bg-amber-500/20"
              iconColor="text-amber-400"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Weekly Consumption vs ML Predictions (Device-Adjusted)
          </CardTitle>
          <p className="text-gray-300 text-sm">Comparing actual energy consumption with machine learning predictions, adjusted for current device usage</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={adjustedWeeklyData}>
              <CartesianGrid strokeDashArray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Line
                type="monotone"
                dataKey="consumption"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 6 }}
                name="Actual Consumption (kWh)"
              />
              <Line
                type="monotone"
                dataKey="prediction"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDashArray="5 5"
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                name="ML Prediction (kWh)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            24-Hour Energy Consumption Patterns (Live Device Impact)
          </CardTitle>
          <p className="text-gray-300 text-sm">Detailed hourly analysis showing peak, average, and minimum consumption patterns with real-time device contribution</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={adjustedHourlyPatterns}>
              <defs>
                <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDashArray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Area
                type="monotone"
                dataKey="avg_consumption"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#hourlyGradient)"
                strokeWidth={2}
                name="Average Consumption"
              />
              <Area
                type="monotone"
                dataKey="device_contribution"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Device Contribution"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            AI-Powered Cost Optimization
          </CardTitle>
          <p className="text-gray-300 text-sm">Machine learning optimization showing potential cost savings through smart energy management</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={costOptimization}>
              <CartesianGrid strokeDashArray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Bar dataKey="actual" fill="#ef4444" radius={[4, 4, 0, 0]} name="Actual Cost ($)" />
              <Bar dataKey="optimized" fill="#22c55e" radius={[4, 4, 0, 0]} name="Optimized Cost ($)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-red-400">${costOptimization.reduce((sum, item) => sum + item.actual, 0)}</div>
              <div className="text-sm text-gray-300">Total Actual Cost</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">${costOptimization.reduce((sum, item) => sum + item.optimized, 0)}</div>
              <div className="text-sm text-gray-300">Optimized Cost</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-400">${totalSavings}</div>
              <div className="text-sm text-gray-300">Total Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}