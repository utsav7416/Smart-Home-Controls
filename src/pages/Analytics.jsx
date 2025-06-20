import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Brain, Zap, Activity, Target, BarChart3, Cpu, Settings, Shield, Network, Code, Layers, GitBranch } from 'lucide-react';
import { useState, useEffect } from 'react';

const FLASK_API_URL = process.env.REACT_APP_API_BASE_URL || 'https://smart-home-controls-backend.onrender.com';

const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border border-gray-800 bg-black ${className}`}>
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
    'Main Light': {'base': 15, 'max': 60}, 'Fan': {'base': 25, 'max': 75}, 'AC': {'base': 800, 'max': 1500},
    'TV': {'base': 120, 'max': 200}, 'Microwave': {'base': 800, 'max': 1200}, 'Refrigerator': {'base': 150, 'max': 300},
    'Shower': {'base': 50, 'max': 100}, 'Water Heater': {'base': 2000, 'max': 4000}, 'Dryer': {'base': 2000, 'max': 3000}
  }

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

export const preloadAnalyticsData = async () => {
  try {
    console.log('🚀 Preloading analytics data in background...');
    const response = await fetch(`${FLASK_API_URL}/api/analytics`);
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('preloaded_analytics', JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      console.log('✅ Analytics data preloaded successfully');
      return data;
    }
  } catch (error) {
    console.log('❌ Analytics preload failed:', error);
  }
  return null;
};

const fetchAnalyticsData = async () => {
  const preloaded = localStorage.getItem('preloaded_analytics');
  if (preloaded) {
    try {
      const { data, timestamp } = JSON.parse(preloaded);
      const age = Date.now() - timestamp;
      if (age < 300000) { 
        console.log('📦 Using preloaded analytics data');
        return data;
      }
    } catch (e) {
      console.log('🗑️ Clearing invalid preloaded data');
      localStorage.removeItem('preloaded_analytics');
    }
  }

  console.log('🔄 Fetching fresh analytics data');
  const response = await fetch(`${FLASK_API_URL}/api/analytics`);
  if (!response.ok) throw new Error('Failed to fetch analytics data');
  return await response.json();
};

const AlgorithmCard = ({ algorithm, icon: Icon }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-950 rounded-md flex items-center justify-center">
                <Icon className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white text-lg font-medium">{algorithm.name}</h3>
                <p className="text-green-400 text-sm">{algorithm.purpose}</p>
              </div>
            </div>
            <div className="bg-green-950 text-green-300 px-2 py-1 rounded text-xs font-medium">
              ACTIVE
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {algorithm?.name === "Random Forest Regressor" && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{algorithm.accuracy}%</div>
                  <div className="text-xs text-gray-400">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{algorithm.parameters.n_estimators}</div>
                  <div className="text-xs text-gray-400">Trees</div>
                </div>
              </>
            )}
            {algorithm?.name === "Isolation Forest" && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{algorithm.anomalies_detected}</div>
                <div className="text-xs text-gray-400">Anomalies Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {(algorithm.parameters.last_used_contamination_rate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Contamination Rate</div>
              </div>
            </>
          )}
            {algorithm?.name === "MLP Regressor" && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{algorithm.parameters.hidden_layer_sizes?.length || 0}</div>
                  <div className="text-xs text-gray-400">Hidden Layers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{algorithm.weight_in_ensemble}</div>
                  <div className="text-xs text-gray-400">Ensemble Weight</div>
                </div>
              </>
            )}
            {algorithm?.name === "Ridge Regression" && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{algorithm.parameters.alpha}</div>
                  <div className="text-xs text-gray-400">Alpha (α)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{algorithm.weight_in_ensemble}</div>
                  <div className="text-xs text-gray-400">Ensemble Weight</div>
                </div>
              </>
            )}
          </div>

          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            {algorithm.description}
          </p>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-gray-700"
          >
            <Settings className="w-4 h-4" />
            {isExpanded ? 'Hide Parameters' : 'View Parameters'}
          </button>

          {isExpanded && (
            <div className="mt-6 space-y-4">
              <div className="bg-gray-800 rounded-md p-4 border border-gray-700">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Parameters
                </h4>
                <div className="space-y-2">
                  {Object.entries(algorithm.parameters || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-green-400 text-xs font-mono">{key}:</span>
                      <span className="text-green-300 text-xs font-mono bg-gray-950 px-2 py-1 rounded">
                        {Array.isArray(value) ? `[${value.join(', ')}]` : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">Performance</span>
                  </div>
                  <div className="text-blue-400 font-mono text-sm">
                    {algorithm?.name === "Random Forest Regressor" ? `${algorithm?.accuracy}% Accuracy` :
                      algorithm?.name === "Isolation Forest" ? `${algorithm?.anomalies_detected} Detected` :
                      algorithm?.name === "MLP Regressor" ? `${algorithm?.parameters?.max_iter} Max Iter, α = ${algorithm?.parameters?.alpha}` :
                      `α = ${algorithm?.parameters?.alpha}`}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm font-medium">Status</span>
                  </div>
                  <div className="text-purple-400 font-mono text-sm">
                    Processing
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
      <div className="p-6 flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-white text-lg flex items-center gap-3">
          <Brain className="w-6 h-6 animate-pulse" />
          Loading ML analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-black text-white">
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
    <div className="p-6 space-y-6 animate-fade-in bg-black text-white">
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
          <p className="text-gray-300 text-xl mb-4">
            Real-time machine learning algorithms analyzing your energy consumption patterns
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-base text-gray-400">
            <span>• Anomaly Detection Active</span>
            <span>• Predictive Modeling Enabled</span>
            <span>• Cost Optimization Running</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-950/20 to-green-900/20 backdrop-blur-md border border-green-800/30">
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

        <Card className="bg-gradient-to-br from-red-950/20 to-red-900/20 backdrop-blur-md border border-red-800/30">
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

        <Card className="bg-gradient-to-br from-blue-950/20 to-blue-900/20 backdrop-blur-md border border-blue-800/30">
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

        <Card className="bg-gradient-to-br from-purple-950/20 to-purple-900/20 backdrop-blur-md border border-purple-800/30">
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

      <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-md border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Real-Time Anomaly Detection ({anomaliesDetected} detected)
          </CardTitle>
          <p className="text-gray-400 text-sm">Live anomaly detection using Isolation Forest algorithm</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={anomalyData}>
              <CartesianGrid strokeDashArray="3 3" stroke="#333333" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>High severity: {anomalyData.filter((a) => a.severity === 'high').length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Medium severity: {anomalyData.filter((a) => a.severity === 'medium').length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-md border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5" />
            AI-Powered Machine Learning Pipeline
          </CardTitle>
          <p className="text-gray-400 text-sm">An advanced ensemble working together to optimize your energy consumption</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AlgorithmCard
              algorithm={mlAlgorithms.random_forest}
              icon={GitBranch}
            />
            <AlgorithmCard
              algorithm={mlAlgorithms.isolation_forest}
              icon={Shield}
            />
            <AlgorithmCard
              algorithm={mlAlgorithms.mlp_regressor}
              icon={Layers}
            />
            <AlgorithmCard
              algorithm={mlAlgorithms.ridge_regression}
              icon={TrendingUp}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-900 to-black backdrop-blur-md border border-gray-800">
       <CardHeader>
         <CardTitle className="text-white flex items-center gap-2">
           <BarChart3 className="w-5 h-5" />
           Weekly Consumption vs ML Predictions (Device-Adjusted)
         </CardTitle>
         <p className="text-gray-400 text-sm">Comparing actual energy consumption with machine learning predictions, adjusted for current device usage</p>
       </CardHeader>
       <CardContent>
         <div className="flex gap-4">
           <div className="w-[70%]">
             <ResponsiveContainer width="100%" height={400}>
               <BarChart data={adjustedWeeklyData} barCategoryGap="20%">
                 <CartesianGrid strokeDashArray="3 3" stroke="#333333" />
                 <XAxis dataKey="day" stroke="#9ca3af" />
                 <YAxis stroke="#9ca3af" />
                 <Tooltip
                   contentStyle={{
                     backgroundColor: 'rgba(0, 0, 0, 0.9)',
                     border: '1px solid rgba(255, 255, 255, 0.1)',
                     borderRadius: '8px',
                     color: 'white'
                   }}
                 />
                 <Bar dataKey="consumption" fill="#60a5fa" name="Actual Consumption (kWh)" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="prediction" fill="#22c55e" name="ML Prediction (kWh)" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <div className="w-[30%]">
             <img 
               src="https://uppcsmagazine.com/wp-content/uploads/2025/05/output-80.jpg"
               alt="Smart Home Analytics"
               className="w-full h-[400px] object-cover rounded-lg"
             />
           </div>
         </div>
       </CardContent>
     </Card>

     <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-md border border-gray-800">
       <CardHeader>
         <CardTitle className="text-white flex items-center gap-2">
           <Activity className="w-5 h-5" />
           24-Hour Energy Consumption Patterns (Live Device Impact)
         </CardTitle>
         <p className="text-gray-400 text-sm">Detailed hourly analysis showing peak, average, and minimum consumption patterns with real-time device contribution</p>
       </CardHeader>
       <CardContent>
         <div className="flex gap-4">
           <div className="w-[70%]">
             <ResponsiveContainer width="100%" height={350}>
               <AreaChart data={adjustedHourlyPatterns}>
                 <defs>
                   <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDashArray="3 3" stroke="#333333" />
                 <XAxis dataKey="hour" stroke="#9ca3af" />
                 <YAxis stroke="#9ca3af" />
                 <Tooltip
                   contentStyle={{
                     backgroundColor: 'rgba(0, 0, 0, 0.9)',
                     border: '1px solid rgba(255, 255, 255, 0.1)',
                     borderRadius: '8px',
                     color: 'white'
                   }}
                 />
                 <Area type="monotone" dataKey="avg_consumption" stroke="#8b5cf6" fillOpacity={1}
                   fill="url(#hourlyGradient)" strokeWidth={2} name="Average Consumption" />
                 <Area type="monotone" dataKey="device_contribution" stroke="#f59e0b" fill="#f59e0b"
                   fillOpacity={0.3} strokeWidth={2} name="Device Contribution" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
           <div className="w-[30%]">
             <img 
               src="https://img.freepik.com/premium-photo/smart-home-neon-sign-plant-living-room-interior-design-ai-generated-image_210643-1209.jpg" 
               alt="Smart Home Interior" 
               className="w-full h-[350px] object-cover rounded-lg"
             />
           </div>
         </div>
       </CardContent>
     </Card>
    </div>
  );
}
