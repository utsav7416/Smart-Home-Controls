import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Brain, Zap, Activity, Target, BarChart3, Cpu, Settings, Shield, Network, Code, Layers, GitBranch } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, Cell } from 'recharts';

const FLASK_API_URL = process.env.REACT_APP_API_BASE_URL || 'https://smart-home-controls-backend.onrender.com';

let analyticsCache = null;
let analyticsPromise = null;
let isInitialLoad = true;

export function prefetchAnalytics() {
  if (!analyticsCache && !analyticsPromise) {
    analyticsPromise = fetch(`${FLASK_API_URL}/api/analytics`)
      .then(res => res.json())
      .then(data => { 
        analyticsCache = data; 
        isInitialLoad = false;
        return data; 
      })
      .catch(error => {
        analyticsPromise = null;
        throw error;
      });
  }
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

const doYouKnowFacts = [
  "Did you know? Our ML models detect energy anomalies early to save you money.",
  "Did you know? AI analyzes your energy spikes and makes tariff optimizations.",
  "Did you know? Machine learning optimizes your home energy usage in real-time.",
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
        &#8592;
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
        onClick={next}
        aria-label="Next"
        style={{ zIndex: 2 }}
      >
        &#8594;
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

export default function Analytics() {
  const { deviceStates, totalDevicePower } = useDeviceSync();
  const [analyticsData, setAnalyticsData] = useState(analyticsCache);
  const [isLoading, setIsLoading] = useState(!analyticsCache);
  const [error, setError] = useState(null);
  const [showDummyButton, setShowDummyButton] = useState(isInitialLoad && !analyticsCache);
  const [processingMessage, setProcessingMessage] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [initiateClicked, setInitiateClicked] = useState(false);

  useEffect(() => {
    if (analyticsCache) {
      setAnalyticsData(analyticsCache);
      setIsLoading(false);
      setShowDummyButton(false);
      return;
    }

    if (!analyticsData && !analyticsPromise) {
      setIsLoading(true);
      prefetchAnalytics()
        .then(data => {
          setAnalyticsData(data);
          setIsLoading(false);
          setShowDummyButton(false);
        })
        .catch(e => {
          setError(e.message);
          setIsLoading(false);
          setShowDummyButton(false);
        });
    } else if (analyticsPromise && !analyticsData) {
      analyticsPromise
        .then(data => {
          setAnalyticsData(data);
          setIsLoading(false);
          setShowDummyButton(false);
        })
        .catch(e => {
          setError(e.message);
          setIsLoading(false);
          setShowDummyButton(false);
        });
    }
  }, []);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % doYouKnowFacts.length);
    }, 4000);
    return () => clearInterval(factInterval);
  }, []);

  const handleDummyButtonClick = () => {
    setProcessingMessage(true);
    setInitiateClicked(true);
    
    setTimeout(() => {
      setShowDummyButton(false);
      setProcessingMessage(false);
      
      if (!analyticsData && !analyticsPromise) {
        setIsLoading(true);
        prefetchAnalytics()
          .then(data => {
            setAnalyticsData(data);
            setIsLoading(false);
          })
          .catch(e => {
            setError(e.message);
            setIsLoading(false);
          });
      }
    }, 1500);
  };

  if ((isLoading && !analyticsData) || (showDummyButton && isInitialLoad)) {
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
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Initializing ML Analytics Engine
              </h1>
              <div className="h-16 flex items-center justify-center">
                <p className="text-xl text-blue-200 animate-fade-in">
                  {doYouKnowFacts[factIndex]}
                </p>
              </div>
              <p className="text-blue-300 mt-2">Get ready for actionable insights!</p>
            </div>
            <div style={{ width: 40 }} />
          </div>
          <div className="flex flex-col items-center space-y-6 mt-2 mb-6" style={{ marginBottom: '2.5rem' }}>
            {processingMessage || initiateClicked ? (
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
                <span className="text-lg font-semibold text-blue-300">Processing request... Hold on...</span>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
                <Button
                  onClick={handleDummyButtonClick}
                  className="relative bg-gray-900 hover:bg-gray-800 border border-blue-400/50 transform hover:scale-105 transition-all duration-300"
                  style={{ marginBottom: '1.5rem' }}
                >
                  <Brain className="w-6 h-6 mr-3 animate-pulse" />
                  Initiate Anomaly/Tariff Analysis
                  <span className="ml-3 text-base font-normal text-blue-200">Quick scan for savings</span>
                </Button>
              </div>
            )}
          </div>
          <div className="w-80 h-80 relative mb-12">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-72 h-72 border-2 border-blue-400/40 animate-spin-slow" style={{
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                animationDuration: '20s'
              }}>
                <div className="absolute w-4 h-4 bg-blue-400 rounded-full -top-2 left-1/2 transform -translate-x-1/2 animate-pulse" />
                <div className="absolute w-4 h-4 bg-cyan-400 rounded-full top-1/4 -right-2 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute w-4 h-4 bg-indigo-400 rounded-full top-3/4 -right-2 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute w-4 h-4 bg-purple-400 rounded-full -bottom-2 left-1/2 transform -translate-x-1/2 animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute w-4 h-4 bg-pink-400 rounded-full top-3/4 -left-2 animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute w-4 h-4 bg-teal-400 rounded-full top-1/4 -left-2 animate-pulse" style={{ animationDelay: '2.5s' }} />
              </div>
              <div className="absolute w-48 h-48 border-2 border-cyan-400/50 animate-spin-reverse" style={{
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                animationDuration: '15s'
              }}>
                <div className="absolute w-3 h-3 bg-cyan-400 rounded-full -top-1.5 left-1/2 transform -translate-x-1/2" />
                <div className="absolute w-3 h-3 bg-blue-400 rounded-full top-1/4 -right-1.5" />
                <div className="absolute w-3 h-3 bg-indigo-400 rounded-full top-3/4 -right-1.5" />
                <div className="absolute w-3 h-3 bg-purple-400 rounded-full -bottom-1.5 left-1/2 transform -translate-x-1/2" />
                <div className="absolute w-3 h-3 bg-pink-400 rounded-full top-3/4 -left-1.5" />
                <div className="absolute w-3 h-3 bg-teal-400 rounded-full top-1/4 -left-1.5" />
              </div>
              <div className="absolute w-24 h-24 border border-indigo-300/60 animate-spin" style={{
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                animationDuration: '10s'
              }}>
                <div className="absolute w-2 h-2 bg-indigo-300 rounded-full -top-1 left-1/2 transform -translate-x-1/2" />
                <div className="absolute w-2 h-2 bg-blue-300 rounded-full top-1/4 -right-1" />
                <div className="absolute w-2 h-2 bg-cyan-300 rounded-full top-3/4 -right-1" />
                <div className="absolute w-2 h-2 bg-purple-300 rounded-full -bottom-1 left-1/2 transform -translate-x-1/2" />
                <div className="absolute w-2 h-2 bg-pink-300 rounded-full top-3/4 -left-1" />
                <div className="absolute w-2 h-2 bg-teal-300 rounded-full top-1/4 -left-1" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/40 to-cyan-600/40 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse-slow border-2 border-blue-400/30">
                  <Brain className="w-10 h-10 text-blue-400 animate-pulse" />
                </div>
              </div>
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-20 bg-gradient-to-t from-transparent via-blue-400/30 to-transparent"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: 'bottom center',
                      transform: `translate(-50%, -100%) rotate(${i * 60}deg)`,
                      animation: `pulse 2s infinite ${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
              <div className="absolute w-3 h-3 bg-blue-400/80 rounded-full animate-float" style={{ top: '10%', left: '20%' }} />
              <div className="absolute w-2 h-2 bg-cyan-400/80 rounded-full animate-float-delay" style={{ top: '20%', right: '15%' }} />
              <div className="absolute w-4 h-4 bg-indigo-400/80 rounded-full animate-float" style={{ bottom: '15%', left: '10%', animationDelay: '1s' }} />
              <div className="absolute w-2 h-2 bg-purple-400/80 rounded-full animate-float-delay" style={{ bottom: '25%', right: '20%' }} />
              <div className="absolute w-3 h-3 bg-pink-400/80 rounded-full animate-float" style={{ top: '60%', left: '5%', animationDelay: '1.5s' }} />
              <div className="absolute w-2 h-2 bg-teal-400/80 rounded-full animate-float-delay" style={{ top: '40%', right: '8%', animationDelay: '0.8s' }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 mb-12 w-full max-w-md">
            {[
              { icon: BarChart3, label: "Processing Data", delay: "0s" },
              { icon: AlertTriangle, label: "Detecting Anomalies", delay: "0.5s" },
              { icon: TrendingUp, label: "Training Models", delay: "1s" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-3">
                <div
                  className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl flex items-center justify-center border border-blue-400/30 animate-pulse"
                  style={{ animationDelay: item.delay }}
                >
                  <item.icon className="w-8 h-8 text-blue-400" />
                </div>
                <span className="text-sm text-blue-300 font-medium">{item.label}</span>
                <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"
                    style={{
                      animationDelay: item.delay,
                      width: '100%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 text-blue-400/60">
              <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-ping" />
              <span className="text-sm">Connecting to analytics servers...</span>
            </div>
          </div>
        </div>
        <style jsx>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes tilt {
              0%, 50%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(1deg); }
              75% { transform: rotate(-1deg); }
            }
            @keyframes spin-slow { from { transform: rotate(0); } to { transform: rotate(360deg); } }
            @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0); } }
            @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            @keyframes float-delay { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes pulse-slow { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
            .animate-fade-in { animation: fade-in 0.8s ease-out; }
            .animate-tilt { animation: tilt 10s infinite linear; }
            .animate-spin-slow { animation: spin-slow 20s infinite linear; }
            .animate-spin-reverse { animation: spin-reverse 15s infinite linear; }
            .animate-float { animation: float 3s ease-in-out infinite; }
            .animate-float-delay { animation: float-delay 3s ease-in-out infinite; }
            .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
            `}</style>

      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-red-400 text-lg">
          Failed to load analytics data: {error}
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

  const AlgorithmCard = ({ algorithm, icon: Icon }) => {
    const [isExpanded, setIsExpanded] = useState(false);
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