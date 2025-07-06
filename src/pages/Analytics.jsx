import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, AlertTriangle, Brain, Zap, Activity, Target, BarChart3, Cpu, Settings, Shield, Network, Code, Layers, GitBranch, Lightbulb, Leaf, Clock, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const FLASK_API_URL = process.env.REACT_APP_API_BASE_URL || 'https://smart-home-controls-backend.onrender.com';

let analyticsCache = null;
let analyticsPromise = null;
let hasInitiatedAnalytics = false;

export function prefetchAnalytics() {
  if (analyticsCache) return Promise.resolve(analyticsCache);
  if (analyticsPromise) return analyticsPromise;
  analyticsPromise = fetch(`${FLASK_API_URL}/api/analytics`, { cache: 'no-cache' })
    .then(res => {
      if (!res.ok) throw new Error(`Analytics fetch failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      analyticsCache = data;
      analyticsPromise = null;
      return data;
    })
    .catch(error => {
      analyticsPromise = null;
      hasInitiatedAnalytics = false;
      throw error;
    });
  return analyticsPromise;
}

const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border border-gray-800 bg-black ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, className = '', disabled = false, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 px-10 py-5 bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-500/50 ${className}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const useDeviceSync = () => {
  const [deviceStates, setDeviceStates] = useState({});
  const [totalDevicePower, setTotalDevicePower] = useState(0);
  const [devicePowerBreakdown, setDevicePowerBreakdown] = useState([]);
  
  const DEVICE_POWER_MAP = {
    'Main Light': {'base': 15, 'max': 60}, 'Fan': {'base': 25, 'max': 75}, 'AC': {'base': 800, 'max': 1500},
    'TV': {'base': 120, 'max': 200}, 'Microwave': {'base': 800, 'max': 1200}, 'Refrigerator': {'base': 150, 'max': 300},
    'Shower': {'base': 50, 'max': 100}, 'Water Heater': {'base': 2000, 'max': 4000}, 'Dryer': {'base': 2000, 'max': 3000}
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
    return (base + (max - base) * ratio) * 0.85;
  };

  const syncDeviceStates = async () => {
    const storedDevices = localStorage.getItem('deviceStates');
    if (storedDevices) {
      const devices = JSON.parse(storedDevices);
      setDeviceStates(devices);
      
      try {
        await fetch(`${FLASK_API_URL}/api/update-device-states`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceStates: devices })
        });
      } catch (error) {
        console.error('Failed to sync device states:', error);
      }
      
      let total = 0;
      const breakdown = [];
      
      Object.values(devices).forEach((roomDevices) => {
        roomDevices.forEach((device) => {
          const power = calculateDevicePower(device.name, device.isOn, device.value, device.property);
          total += power;
          if (power > 0) {
            breakdown.push({
              name: device.name,
              power: Math.round(power),
              percentage: 0
            });
          }
        });
      });
      
      breakdown.forEach(device => {
        device.percentage = total > 0 ? Math.round((device.power / total) * 100) : 0;
      });
      
      setTotalDevicePower(total);
      setDevicePowerBreakdown(breakdown);
    }
  };

  useEffect(() => {
    syncDeviceStates();
    const interval = setInterval(syncDeviceStates, 2000);
    window.addEventListener('storage', syncDeviceStates);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncDeviceStates);
    };
  }, []);

  return { deviceStates, totalDevicePower, devicePowerBreakdown };
};

const doYouKnowFacts = [
  "Did you know? Our ML models detect energy anomalies early to save you money.",
  "Did you know? AI analyzes your energy spikes and makes tariff optimizations.",
  "Did you know? Machine learning optimizes your home energy usage in real-time.",
];

const activityFeed = [
  "✓ Connected to analytics server",
  "⚡ Loading your energy data",
  "🧠 Random Forest model: Training...",
  "🌲 Running Isolation Forest for Anomaly Detection",
  "📊 Generating predictions...",
  "💡 Calculating savings opportunities..."
];

const carouselImages = [
  {
    url: "https://img.freepik.com/premium-photo/realistic-3d-illustration-modern-bedroom-night-city-view-interior-design-apartment-luxury-home-architecture-bed-decor-urban_1088041-51665.jpg",
    alt: "1"
  },
  {
    url: "https://img.freepik.com/free-photo/indoor-design-luxury-resort_23-2150497286.jpg?semt=ais_hybrid&w=740",
    alt: "2"
  },
  {
    url: "https://img.freepik.com/premium-photo/modern-bedroom-interior-design-with-forest-view-3d-illustration_1233553-83781.jpg?w=360",
    alt: "3"
  }
];

const loadingCarouselImages = [
  {
    url: "https://illustrarch.com/wp-content/uploads/2024/04/Sustainable_Architectural_Solutions_for_Smart_Homes_8.jpg",
    alt: "1"
  },
  {
    url: "https://64.media.tumblr.com/0ded6a5da5aa5db5f5a1764744fa132b/05266ec9d5a051e9-11/s1280x1920/d4a5020ae8cdd7309933e68c5260024a89346551.jpg",
    alt: "2"
  },
  {
    url: "https://images.unsplash.com/photo-1514803400321-3ca29fc47334?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHNtYXJ0JTIwaG9tZXxlbnwwfHwwfHx8MA%3D%3D",
    alt: "3"
  },
  {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQHoFDkjhWSYwiur6Qt_OuwyMrrJ3h5Lz8Cw&s",
    alt: "4"
  },
  {
    url: "https://www.iotworlds.com/wp-content/uploads/2023/01/iotworlds-smart-lighting-system-using-iot.png",
    alt: "5"
  }
];

function Carousel({ images }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);
  
  const prev = () => setIndex((index - 1 + images.length) % images.length);
  const next = () => setIndex((index + 1) % images.length);
  
  return (
    <div className="relative w-full h-[280px] flex items-center justify-center">
      <img 
        src={images[index].url} 
        alt={images[index].alt} 
        className="w-full h-[280px] object-cover rounded-lg transition-all duration-700"
        style={{ maxWidth: '100%', maxHeight: '280px' }}
      />
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
        onClick={prev}
        aria-label="Previous"
        style={{ zIndex: 2 }}
      >
        ←
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
        onClick={next}
        aria-label="Next"
        style={{ zIndex: 2 }}
      >
        →
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((img, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === index ? 'bg-blue-400' : 'bg-gray-500'}`}
            style={{ display: 'inline-block' }}
          ></span>
        ))}
      </div>
    </div>
  );
}

function LiveActivityFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedItems, setDisplayedItems] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < activityFeed.length) {
        setDisplayedItems(prev => [...prev, activityFeed[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-w-md overflow-hidden">
      <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
        <Activity className="w-5 h-5 animate-pulse" />
        Processing Status
      </h3>
      <div className="space-y-2 max-h-48">
        {displayedItems.map((item, index) => (
          <div
            key={index}
            className="text-sm text-gray-300 animate-fade-in flex items-center gap-2 p-2 bg-gray-800/50 rounded"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function EnergyEfficiencyRecommender({ devicePowerBreakdown, totalDevicePower, analyticsData }) {
  const calculateRealTimeEfficiencyMetrics = () => {
    const deviceCount = devicePowerBreakdown.length;
    const currentHour = new Date().getHours();
    const isOnPeak = currentHour >= 17 && currentHour <= 22;
    const powerKW = totalDevicePower / 1000;
    
    const deviceUtilization = Math.min(100, Math.max(15, (deviceCount / 9) * 100));
    const peakHourOptimization = isOnPeak ? Math.max(30, 90 - (powerKW * 15)) : Math.min(95, 70 + (powerKW * 5));
    const temperatureControl = powerKW > 3 ? Math.max(25, 85 - (powerKW * 8)) : Math.min(95, 65 + (powerKW * 10));
    const standbyReduction = Math.min(90, 40 + (deviceCount * 6));
    const loadBalancing = Math.min(95, 50 + Math.max(0, 45 - (powerKW * 5)));
    const timeOfUse = isOnPeak ? Math.max(25, 70 - (powerKW * 10)) : Math.min(95, 75 + (powerKW * 3));
    const seasonalAdjustment = Math.min(90, 55 + (deviceCount * 4));
    const occupancyControl = Math.min(85, 45 + (deviceCount * 5));
    
    return {
      deviceUtilization,
      peakHourOptimization,
      temperatureControl,
      standbyReduction,
      loadBalancing,
      timeOfUse,
      seasonalAdjustment,
      occupancyControl
    };
  };

  const metrics = calculateRealTimeEfficiencyMetrics();
  
  const radarData = [
    { subject: 'Device Utilization', current: Math.round(metrics.deviceUtilization), optimal: 85, fullMark: 100 },
    { subject: 'Peak Hour Opt.', current: Math.round(metrics.peakHourOptimization), optimal: 90, fullMark: 100 },
    { subject: 'Temperature Control', current: Math.round(metrics.temperatureControl), optimal: 88, fullMark: 100 },
    { subject: 'Standby Reduction', current: Math.round(metrics.standbyReduction), optimal: 92, fullMark: 100 },
    { subject: 'Load Balancing', current: Math.round(metrics.loadBalancing), optimal: 87, fullMark: 100 },
    { subject: 'Time-of-Use', current: Math.round(metrics.timeOfUse), optimal: 85, fullMark: 100 },
    { subject: 'Seasonal Adj.', current: Math.round(metrics.seasonalAdjustment), optimal: 83, fullMark: 100 },
    { subject: 'Occupancy Control', current: Math.round(metrics.occupancyControl), optimal: 89, fullMark: 100 }
  ];

  const efficiencyBars = [
    { name: 'Device Utilization', value: Math.round(metrics.deviceUtilization) },
    { name: 'Peak Hour Optimization', value: Math.round(metrics.peakHourOptimization) },
    { name: 'Temperature Control', value: Math.round(metrics.temperatureControl) },
    { name: 'Standby Power Reduction', value: Math.round(metrics.standbyReduction) },
    { name: 'Load Balancing', value: Math.round(metrics.loadBalancing) },
    { name: 'Time-of-Use', value: Math.round(metrics.timeOfUse) },
    { name: 'Seasonal Adjustment', value: Math.round(metrics.seasonalAdjustment) },
    { name: 'Occupancy Control', value: Math.round(metrics.occupancyControl) }
  ];

  const recommendations = [
    ...(metrics.deviceUtilization < 60 ? [{ 
      type: 'Immediate', 
      action: 'Reduce active devices during low-usage periods', 
      impact: 'High', 
      savings: `$${Math.round(12 + (totalDevicePower * 0.002))}-${Math.round(18 + (totalDevicePower * 0.003))}/month` 
    }] : []),
    ...(metrics.peakHourOptimization < 70 ? [{ 
      type: 'Scheduled', 
      action: 'Shift high-power devices to off-peak hours', 
      impact: 'High', 
      savings: `$${Math.round(25 + (totalDevicePower * 0.004))}-${Math.round(35 + (totalDevicePower * 0.005))}/month` 
    }] : []),
    ...(metrics.temperatureControl < 75 ? [{ 
      type: 'Behavioral', 
      action: 'Optimize AC temperature settings', 
      impact: 'Medium', 
      savings: `$${Math.round(15 + (totalDevicePower * 0.003))}-${Math.round(22 + (totalDevicePower * 0.004))}/month` 
    }] : []),
    ...(metrics.standbyReduction < 80 ? [{ 
      type: 'System', 
      action: 'Enable smart power strips for standby reduction', 
      impact: 'Medium', 
      savings: `$${Math.round(8 + (totalDevicePower * 0.001))}-${Math.round(12 + (totalDevicePower * 0.002))}/month` 
    }] : []),
    { 
      type: 'Scheduled', 
      action: 'Enable weather-responsive automation', 
      impact: 'Medium', 
      savings: `$${Math.round(10 + (totalDevicePower * 0.002))}-${Math.round(15 + (totalDevicePower * 0.003))}/month` 
    }
  ];

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 85) return '#22c55e';
    if (efficiency >= 70) return '#eab308';
    if (efficiency >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getRecommendationColor = (type) => {
    switch(type) {
      case 'Immediate': return '#ef4444';
      case 'Scheduled': return '#f59e0b';
      case 'Behavioral': return '#3b82f6';
      case 'System': return '#8b5cf6';
      case 'Upgrade': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Real-Time Efficiency Radar Analysis
          </h4>
          <div className="text-sm text-gray-400 mb-2">
            Active Devices: {devicePowerBreakdown.length} | Total Power: {(totalDevicePower/1000).toFixed(2)}kW
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" className="text-xs" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} />
              <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Optimal" dataKey="optimal" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Live Efficiency Metrics Breakdown
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={efficiencyBars} 
              layout="horizontal" 
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                stroke="#9CA3AF" 
                tick={{ fontSize: 10 }} 
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
                formatter={(value) => [`${value}%`, 'Efficiency']}
                labelFormatter={(label) => `Metric: ${label}`}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} stroke="#ffffff" strokeWidth={0.5}>
                {efficiencyBars.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getEfficiencyColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Smart Energy Recommendations (Based on Current Usage)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: getRecommendationColor(rec.type) + '20',
                    color: getRecommendationColor(rec.type)
                  }}
                >
                  {rec.type}
                </span>
                <span className="text-xs text-gray-400">{rec.impact} Impact</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{rec.action}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-400 font-medium">{rec.savings}</span>
                <Leaf className="w-4 h-4 text-green-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { deviceStates, totalDevicePower, devicePowerBreakdown } = useDeviceSync();
  const [analyticsData, setAnalyticsData] = useState(analyticsCache);
  const [error, setError] = useState(null);
  const [factIndex, setFactIndex] = useState(0);
  const [viewState, setViewState] = useState(hasInitiatedAnalytics ? 'loading' : 'initial');
  const expandedStatesRef = useRef({});
  const [curtain, setCurtain] = useState({title:false, subtitle:false, desc:false});

  const handleInitiate = () => {
    if (viewState === 'initial') {
      hasInitiatedAnalytics = true;
      setViewState('loading');
      analyticsCache = null;
      prefetchAnalytics()
        .then(data => { setAnalyticsData(data); setViewState('dashboard'); })
        .catch(e => { setError(e.message); setViewState('error'); });
    }
  };

  useEffect(() => {
    if (hasInitiatedAnalytics && !analyticsData) {
      setViewState('loading');
      prefetchAnalytics()
        .then(data => { setAnalyticsData(data); setViewState('dashboard'); })
        .catch(e => { setError(e.message); setViewState('error'); });
    } else if (analyticsData) {
      setViewState('dashboard');
    }
  }, [analyticsData]);

  useEffect(() => {
    if (viewState === 'dashboard') {
      const interval = setInterval(() => {
        analyticsCache = null;
        prefetchAnalytics()
          .then(data => setAnalyticsData(data))
          .catch(e => console.error('Analytics refresh failed:', e));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [viewState]);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % doYouKnowFacts.length);
    }, 4000);
    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    if (viewState === 'initial' || viewState === 'loading') {
      const t1 = setTimeout(()=>setCurtain(v=>({...v,title:true})), 300);
      const t2 = setTimeout(()=>setCurtain(v=>({...v,subtitle:true})), 800);
      const t3 = setTimeout(()=>setCurtain(v=>({...v,desc:true})), 1300);
      return ()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);}
    }
  }, [viewState]);

  if (viewState === 'initial' || viewState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white overflow-hidden relative">
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <div className="flex flex-row items-center justify-center w-full mb-8">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4Iw-ps9v75UC9kcr-NLTe3aL-PwT2bsX6ZA&s" 
              alt="Analytics Icon" 
              className="w-10 h-10 mr-6" 
              style={{ objectFit: 'contain' }}
            />
            <div className="text-center max-w-2xl flex-1">
              <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-1000 ${curtain.title?'curtain-reveal':'curtain-hidden'}`}>
                Initializing ML Analytics Engine
              </h1>
              <div className="h-16 flex items-center justify-center">
                <p className={`text-xl text-blue-200 transition-all duration-800 ${curtain.subtitle?'curtain-reveal-delayed':'curtain-hidden'}`}>
                  {doYouKnowFacts[factIndex]}
                </p>
              </div>
              <p className={`text-blue-300 mt-2 text-lg transition-all duration-1000 ${curtain.desc?'curtain-reveal-slow':'curtain-hidden'}`}>
                Our AI is diving deep into your energy data, searching for hidden patterns and savings opportunities. Prepare for a detailed breakdown of your home's energy DNA.
              </p>
            </div>
            <div style={{ width: 40 }} />
          </div>

          <div className="flex flex-col items-center space-y-6 mt-2 mb-6" style={{ marginBottom: '2.5rem' }}>
            {viewState === 'loading' ? (
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-blue-300">Processing request, this may take a while...</span>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/40 to-cyan-600/40 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 animate-tilt" />
                
                <Button
                  onClick={handleInitiate}
                  className="relative bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-700 hover:to-blue-800 border border-blue-400/30 transform hover:scale-105 transition-all duration-300 text-2xl px-16 py-8 shadow-lg shadow-blue-500/30 font-black tracking-wide"
                  style={{ marginBottom: '1.5rem' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-md" />
                  <Brain className="w-8 h-8 mr-4 animate-pulse" />
                  <span className="relative z-10">Initiate Anomaly/Tariff Analysis</span>
                  <span className="ml-4 text-lg font-normal text-blue-200 relative z-10">⚡ Quick scan for savings</span>
                </Button>
              </div>
            )}
          </div>

          {viewState === 'loading' && (
            <div className="mb-8">
              <LiveActivityFeed />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            <Carousel images={loadingCarouselImages} />
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 col-span-1 md:col-span-2 lg:col-span-2">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">AI Processing Pipeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Random Forest Model</div>
                    <div className="text-xs text-gray-400">Training on consumption patterns</div>
                  </div>
                  <div className="text-xs text-green-400">Active</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Isolation Forest</div>
                    <div className="text-xs text-gray-400">Detecting anomalies</div>
                  </div>
                  <div className="text-xs text-blue-400">Processing</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-900 rounded-full flex items-center justify-center">
                    <Network className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Neural Network</div>
                    <div className="text-xs text-gray-400">Deep pattern analysis</div>
                  </div>
                  <div className="text-xs text-purple-400">Training</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-red-400 text-lg">
          Failed to load analytics data: {error}
        </div>
      </div>
    );
  }

  if (viewState !== 'dashboard' || !analyticsData) {
    return null;
  }

  const { weeklyData = [], anomalyData = [], costOptimization = [], mlPerformance = {}, hourlyPatterns = [], mlAlgorithms = {}, currentDeviceStats = {} } = analyticsData;

  const adjustedWeeklyData = weeklyData.map(item => ({
    ...item,
    consumption: item.consumption + (totalDevicePower * 0.001),
    prediction: item.prediction + (totalDevicePower * 0.0009)
  }));

  const adjustedHourlyPatterns = hourlyPatterns.map(item => ({
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

  const AlgorithmCard = ({ algorithm, icon: Icon }) => {
    const algorithmKey = algorithm?.name || 'unknown';
    const isExpanded = expandedStatesRef.current[algorithmKey] || false;
    
    const toggleExpanded = () => {
      expandedStatesRef.current[algorithmKey] = !isExpanded;
      setAnalyticsData({...analyticsData});
    };

    if (!algorithm) return null;

    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-black to-black border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
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
              <div className="bg-green-950 text-green-300 px-2 py-1 rounded text-xs font-medium">ACTIVE</div>
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

            <p className="text-gray-300 text-sm mb-6 leading-relaxed">{algorithm.description}</p>

            <button
              onClick={toggleExpanded}
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
                    <div className="text-purple-400 font-mono text-sm">Processing</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
                <p className="text-3xl font-bold text-white">${totalSavings.toFixed(2)}</p>
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
            <Lightbulb className="w-5 h-5" />
            Smart Energy Saving Recommender System
          </CardTitle>
          <p className="text-gray-400 text-sm">
            AI-powered efficiency analysis with real-time recommendations based on your current device usage patterns
          </p>
        </CardHeader>
        <CardContent>
          <EnergyEfficiencyRecommender 
            devicePowerBreakdown={devicePowerBreakdown}
            totalDevicePower={totalDevicePower}
            analyticsData={analyticsData}
          />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-md border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Real-Time Anomaly Detection ({anomaliesDetected} detected)
          </CardTitle>
          <p className="text-gray-400 text-sm">Live anomaly detection using Isolation Forest algorithm</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-[60%]">
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
                      <Cell key={`cell-${index}`} fill={entry.severity === 'high' ? '#ef4444' : '#f59e0b'} />
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
            </div>
            <div className="w-[40%] flex items-center justify-center">
              <Carousel images={carouselImages} />
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
            <AlgorithmCard algorithm={mlAlgorithms.random_forest} icon={GitBranch} />
            <AlgorithmCard algorithm={mlAlgorithms.isolation_forest} icon={Shield} />
            <AlgorithmCard algorithm={mlAlgorithms.mlp_regressor} icon={Layers} />
            <AlgorithmCard algorithm={mlAlgorithms.ridge_regression} icon={TrendingUp} />
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