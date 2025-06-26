import React from 'react';
import { useState, useEffect } from 'react';
import { MapPin, Plus, Brain, TrendingUp, Target, MapIcon, XCircle, ChevronLeft, ChevronRight, Shield, AlertTriangle, Lightbulb, Clock, Zap, Activity, Eye, Home } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import EnergyStats from '../components/EnergyStats';

const FLASK_API_URL = process.env.REACT_APP_API_BASE_URL || 'https://smart-home-controls-backend.onrender.com';

let geofencesCache = null;
let geofencesPromise = null;
let hasInitiatedGeofences = false;

export function prefetchGeofences() {
  if (geofencesCache) return Promise.resolve(geofencesCache);
  if (geofencesPromise) return geofencesPromise;
  geofencesPromise = fetch(`${FLASK_API_URL}/api/geofences`, { cache: 'force-cache', keepalive: true })
    .then(res => { if (!res.ok) throw new Error(`Geofencing fetch failed: ${res.status}`); return res.json(); })
    .then(data => { geofencesCache = data; geofencesPromise = null; return data; })
    .catch(error => { geofencesPromise = null; hasInitiatedGeofences = false; throw error; });
  return geofencesPromise;
}

const Card = ({ children, className = '' }) => <div className={`rounded-lg shadow-lg ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`px-6 py-4 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ children, className = '' }) => <div className={`px-6 pb-6 ${className}`}>{children}</div>;

const Button = ({ children, onClick, className = '', disabled = false, ...props }) => (
  <button className={`inline-flex items-center justify-center rounded-md text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 px-10 py-5 bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-500/50 ${className}`} onClick={onClick} disabled={disabled} {...props}>
    {children}
  </button>
);

const fetchGeofenceStats = async () => {
  const response = await fetch(`${FLASK_API_URL}/api/geofences/stats`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Failed to fetch stats: ${errorData.error || response.statusText}`);
  }
  return await response.json();
};

const createGeofence = async (geofenceData) => {
  const response = await fetch(`${FLASK_API_URL}/api/geofences`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geofenceData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Failed to create geofence: ${errorData.error || response.statusText}`);
  }
  geofencesCache = null; geofencesPromise = null;
  return await response.json();
};

const fetchAnalytics = async () => {
  const response = await fetch(`${FLASK_API_URL}/api/geofences/analytics`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Failed to fetch analytics: ${errorData.error || response.statusText}`);
  }
  return await response.json();
};

const optimizeGeofences = async () => {
  const response = await fetch(`${FLASK_API_URL}/api/geofences/optimize`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Failed to optimize geofences: ${errorData.error || response.statusText}`);
  }
  return await response.json();
};

const useApiData = (key, fetchFn, refetchInterval = 30000) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try { setIsLoading(true); const result = await fetchFn(); setData(result); setError(null); }
    catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchData();
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [key, refetchInterval]);

  return { data, isLoading, error, refetch: fetchData };
};

const useMutation = (mutationFn, options = {}) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (variables) => {
    try {
      setIsPending(true); setError(null);
      const result = await mutationFn(variables);
      if (options.onSuccess) options.onSuccess(result);
      return result;
    } catch (err) {
      setError(err.message);
      if (options.onError) options.onError(err);
    } finally { setIsPending(false); }
  };
  return { mutate, isPending, error };
};

const useRealTimeEnergyData = () => {
  const [energyData, setEnergyData] = useState({ totalEnergyUsage: 0, activeDevices: 0, totalDevices: 0 });
  const [deviceStates, setDeviceStates] = useState({});
  const [energyHistory, setEnergyHistory] = useState([]);

  useEffect(() => {
    const updateEnergyData = () => {
      try {
        const storedDevices = localStorage.getItem('deviceStates');
        if (storedDevices) {
          const parsedDevices = JSON.parse(storedDevices);
          setDeviceStates(parsedDevices);
          
          const devicePowerConsumption = {
            'Main Light': 60, 'Fan': 75, 'AC': 3500, 'TV': 150, 'Microwave': 1000,
            'Refrigerator': 150, 'Shower': 500, 'Water Heater': 4000, 'Dryer': 3000
          };

          const calculateDeviceEnergy = (device) => {
            if (!device.isOn) return 0;
            const basePower = devicePowerConsumption[device.name] || 100;
            let powerMultiplier = 1;
            switch (device.property) {
              case 'brightness': case 'speed': case 'pressure': case 'power': powerMultiplier = device.value / 100; break;
              case 'temp': case 'temperature': powerMultiplier = device.name === 'AC' ? Math.abs(72 - device.value) / 20 + 0.5 : device.value / 100; break;
              case 'volume': powerMultiplier = 0.8 + (device.value / 100) * 0.4; break;
              default: powerMultiplier = 1;
            }
            return (basePower * powerMultiplier) / 1000;
          };
          
          let totalEnergy = 0, activeCount = 0, totalCount = 0;
          Object.values(parsedDevices).forEach(roomDevices => {
            roomDevices.forEach(device => {
              totalCount++;
              if (device.isOn) { activeCount++; totalEnergy += calculateDeviceEnergy(device); }
            });
          });

          const newEnergyData = { totalEnergyUsage: Math.round(totalEnergy * 100) / 100, activeDevices: activeCount, totalDevices: totalCount };
          setEnergyData(newEnergyData);
          setEnergyHistory(prev => [...prev, { ...newEnergyData, timestamp: Date.now(), hour: new Date().getHours() }].slice(-24));
        }
      } catch (error) {
        console.error('Error calculating energy data:', error);
      }
    };

    updateEnergyData();
    const handleStorageChange = () => updateEnergyData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('deviceStateChange', handleStorageChange);
    const interval = setInterval(updateEnergyData, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('deviceStateChange', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return { energyData, deviceStates, energyHistory };
};

const useSmartSuggestions = (energyData, deviceStates, setSecurityAlerts) => {
  const [suggestions, setSuggestions] = useState([]);
  const [previousEnergyUsage, setPreviousEnergyUsage] = useState(0);

  useEffect(() => {
    const generateSuggestions = () => {
      const newSuggestions = [];
      const currentHour = new Date().getHours();
      const energyChange = energyData.totalEnergyUsage - previousEnergyUsage;
      const deviceUtilization = energyData.totalDevices > 0 ? energyData.activeDevices / energyData.totalDevices : 0;

      if (energyData.activeDevices >= 10) {
        newSuggestions.push({
          id: `high-device-usage-${Date.now()}`,
          type: 'high_device_usage',
          priority: 'high',
          title: 'High Device Usage Detected',
          message: `${energyData.activeDevices} devices active (${energyData.totalEnergyUsage} kWh). Consider reducing usage.`,
          action: 'optimize_devices',
          confidence: 95,
          potentialSaving: Math.round(energyData.totalEnergyUsage * 0.20 * 100) / 100,
          icon: Zap
        });
      } else if (energyData.activeDevices >= 5) {
        newSuggestions.push({
          id: `medium-device-usage-${Date.now()}`,
          type: 'medium_device_usage',
          priority: 'medium',
          title: 'Medium Device Usage',
          message: `${energyData.activeDevices} devices active (${energyData.totalEnergyUsage} kWh). Monitor for optimization.`,
          action: 'monitor_devices',
          confidence: 80,
          potentialSaving: Math.round(energyData.totalEnergyUsage * 0.10 * 100) / 100,
          icon: Activity
        });
      }

      if (energyChange > 1.0 && energyData.totalEnergyUsage > 3.0) {
        const highPowerDevices = Object.values(deviceStates).flat().filter(d => d.isOn && ['AC', 'Water Heater', 'Dryer', 'Microwave'].includes(d.name));
        if (highPowerDevices.length > 0) {
          newSuggestions.push({
            id: `energy-spike-${Date.now()}`,
            type: 'energy_spike',
            priority: 'high',
            title: 'Energy Spike Detected',
            message: `Energy increased by ${energyChange.toFixed(2)} kWh. High-power devices: ${highPowerDevices.map(d => d.name).join(', ')}.`,
            action: 'review_devices',
            confidence: 90,
            devices: highPowerDevices.map(d => d.name),
            icon: AlertTriangle
          });
        }
      }

      if (deviceUtilization > 0.7 && (currentHour >= 23 || currentHour <= 6)) {
        newSuggestions.push({
          id: `night-mode-${Date.now()}`,
          type: 'night_optimization',
          priority: 'medium',
          title: 'Night Mode Recommendation',
          message: `${energyData.activeDevices} devices active during night hours. Enable night mode?`,
          action: 'enable_night_mode',
          confidence: 85,
          potentialSaving: Math.round(energyData.totalEnergyUsage * 0.30 * 100) / 100,
          icon: Home
        });
      }

      if (energyData.totalEnergyUsage < 1.0 && energyData.activeDevices < 2) {
        newSuggestions.push({
          id: `away-mode-${Date.now()}`,
          type: 'away_mode',
          priority: 'low',
          title: 'Away Mode Opportunity',
          message: `Low activity detected: ${energyData.totalEnergyUsage} kWh. Enable away mode?`,
          action: 'enable_away_mode',
          confidence: 95,
          potentialSaving: Math.round(energyData.totalEnergyUsage * 0.80 * 100) / 100,
          icon: Eye
        });
      }

      setSuggestions(newSuggestions);
      setPreviousEnergyUsage(energyData.totalEnergyUsage);
    };

    const generateSecurityAlerts = () => {
      const alerts = [];
      const currentHour = new Date().getHours();
      const isNightTime = currentHour >= 22 || currentHour <= 6;
      
      if (energyData.activeDevices >= 10) {
        alerts.push({
          type: 'high_device_activity',
          severity: 'high',
          message: `High device activity: ${energyData.activeDevices} devices active (${energyData.totalEnergyUsage} kWh)`,
          timestamp: Date.now(),
          recommendation: 'Review active devices for optimization'
        });
      } else if (energyData.activeDevices >= 5) {
        alerts.push({
          type: 'medium_device_activity',
          severity: 'medium',
          message: `Medium device activity: ${energyData.activeDevices} devices active (${energyData.totalEnergyUsage} kWh)`,
          timestamp: Date.now(),
          recommendation: 'Monitor device usage patterns'
        });
      }

      if (isNightTime && energyData.totalEnergyUsage > 4.0) {
        alerts.push({
          type: 'unusual_night_activity',
          severity: 'medium',
          message: `High energy usage at night: ${energyData.totalEnergyUsage} kWh`,
          timestamp: Date.now(),
          recommendation: 'Review active devices for unexpected usage'
        });
      }

      setSecurityAlerts(alerts.slice(-2));
    };

    generateSuggestions();
    generateSecurityAlerts();
  }, [energyData.totalEnergyUsage, energyData.activeDevices, deviceStates, previousEnergyUsage, setSecurityAlerts]);

  return { suggestions };
};

const doYouKnowFacts = [
  "Did you know? Smart zones can reduce your home's energy waste by up to 30%.",
  "Did you know? Your smart home learns and optimizes your energy usage over time."
];

const carouselImages = [
  { url: "https://www.smarthomeworld.in/wp-content/uploads/2025/03/4-1024x576.jpg", alt: "Modern living room with smart home controls" },
  { url: "https://d6y5eqdcxq8w3.cloudfront.net/assets/blog/prosource_member_blogs/Smart-Home-Climate-Control-and-Lights.webp", alt: "Smart lighting and climate control" },
  { url: "https://preview.redd.it/869yzxqr5ar51.jpg?width=640&crop=smart&auto=webp&s=762b8d68b17930b1bee6459ef060a24026240a4a", alt: "Smart home dashboard interface" },
  { url: "https://oltdesign.com/wp-content/uploads/2025/02/smart-home-technology.jpg", alt: "Connected devices in a smart home" }
];

const loadingCarouselImages = [
  { url: "https://i.pinimg.com/736x/2f/6c/92/2f6c925f049eb916866d983cd3fca54d.jpg", alt: "Smart Home Interior 1" },
  { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLvOde-b4NSV-1FfKVCOdbwFZpVh83W7YUrjT7wXSy23T2qMnN_Wx4p5_aZHM8zicHfak&usqp=CAU", alt: "Smart Home Interior 2" },
  { url: "https://thumbs.dreamstime.com/b/modern-living-room-city-skyline-view-night-featuring-elegant-decor-lush-greenery-luxurious-showcases-furnishings-362289898.jpg", alt: "Smart Home Interior 3" }
];

function ImageCarousel() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setFade(false);
    const fadeTimeout = setTimeout(() => setFade(true), 50);
    const timer = setTimeout(() => setIndex((prev) => (prev + 1) % carouselImages.length), 5000);
    return () => { clearTimeout(timer); clearTimeout(fadeTimeout); };
  }, [index]);

  const goPrev = () => { setFade(false); setTimeout(() => { setIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length); setFade(true); }, 100); };
  const goNext = () => { setFade(false); setTimeout(() => { setIndex((prev) => (prev + 1) % carouselImages.length); setFade(true); }, 100); };

  return (
    <div className="relative w-full h-80 flex items-center justify-center group overflow-hidden rounded-xl shadow-2xl bg-gradient-to-br from-green-900/30 to-slate-900/30 border border-green-400/20">
      <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-green-700/60 rounded-full p-3 transition-all duration-300 hover:scale-110" aria-label="Previous">
        <ChevronLeft className="w-8 h-8 text-green-200" />
      </button>
      <div className={`transition-all duration-700 ease-in-out w-full h-full ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <img src={carouselImages[index].url} alt={carouselImages[index].alt} className="w-full h-80 object-cover rounded-xl shadow-xl" />
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 px-6 py-3 rounded-full text-green-100 text-base shadow-lg backdrop-blur-sm border border-green-400/30">
          {carouselImages[index].alt}
        </div>
      </div>
      <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-green-700/60 rounded-full p-3 transition-all duration-300 hover:scale-110" aria-label="Next">
        <ChevronRight className="w-8 h-8 text-green-200" />
      </button>
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-3">
        {carouselImages.map((_, i) => (
          <span key={i} className={`block w-4 h-4 rounded-full transition-all duration-300 ${i === index ? 'bg-green-400 scale-125' : 'bg-green-900/40'}`} />
        ))}
      </div>
    </div>
  );
}

export default function Geofencing() {
  const [geofences, setGeofences] = useState(geofencesCache);
  const [error, setError] = useState(null);
  const [viewState, setViewState] = useState(hasInitiatedGeofences ? 'loading' : 'initial');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({ name: '', address: '', lat: 37.7749, lng: -122.4194, radius: 200 });
  const [factIndex, setFactIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);

  const { energyData, deviceStates, energyHistory } = useRealTimeEnergyData();
  const { suggestions } = useSmartSuggestions(energyData, deviceStates, setSecurityAlerts);
  const { data: stats, error: statsError, refetch: refetchStats } = useApiData('geofence-stats', fetchGeofenceStats, 30000);
  const { data: analytics, error: analyticsError } = useApiData('geofence-analytics', fetchAnalytics, 60000);

  const handleInitiate = () => {
    if (viewState === 'initial') {
      hasInitiatedGeofences = true;
      setViewState('loading');
      prefetchGeofences()
        .then(data => { setGeofences(data); setViewState('dashboard'); })
        .catch(e => { setError(e.message); setViewState('error'); });
    }
  };

  const refetchGeofencesData = () => prefetchGeofences().then(data => setGeofences(data)).catch(e => setError(e.message));
  
  const createMutation = useMutation(createGeofence, {
    onSuccess: () => {
      refetchGeofencesData(); refetchStats(); setShowCreateForm(false);
      setFormData({ name: '', address: '', lat: 37.7749, lng: -122.4194, radius: 200 });
    },
    onError: (err) => alert(`Failed to create geofence: ${err.message}`)
  });

  const optimizeMutation = useMutation(optimizeGeofences, {
    onSuccess: (result) => { refetchGeofencesData(); refetchStats(); alert(result.message); },
    onError: (err) => alert(`Failed to optimize geofences: ${err.message}`)
  });

  const handleCreateSubmit = () => {
    if (formData.name.trim() && formData.address.trim() && !isNaN(formData.lat) && !isNaN(formData.lng) && !isNaN(formData.radius)) {
      createMutation.mutate(formData);
    } else {
      alert('Please fill all required fields correctly.');
    }
  };

  const implementSuggestion = (suggestion) => {
    alert(`Implementing: ${suggestion.title} - ${suggestion.message}`);
  };

  const dismissAlert = (alertId) => {
    setSecurityAlerts(prev => prev.filter(alert => alert.timestamp !== alertId));
  };

  useEffect(() => {
    if (hasInitiatedGeofences && !geofences) {
      setViewState('loading');
      prefetchGeofences()
        .then(data => { setGeofences(data); setViewState('dashboard'); })
        .catch(e => { setError(e.message); setViewState('error'); });
    } else if (geofences) {
      setViewState('dashboard');
    }
  }, [geofences]);

  useEffect(() => {
    const factInterval = setInterval(() => setFactIndex((prev) => (prev + 1) % doYouKnowFacts.length), 4000);
    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    if (viewState === 'initial' || viewState === 'loading') {
      const carouselInterval = setInterval(() => setCarouselIndex((prev) => (prev + 1) % loadingCarouselImages.length), 3000);
      return () => clearInterval(carouselInterval);
    }
  }, [viewState]);

  useEffect(() => {
    if (viewState === 'initial' || viewState === 'loading') {
      setTimeout(() => setTitleVisible(true), 300);
      setTimeout(() => setSubtitleVisible(true), 800);
      setTimeout(() => setTextVisible(true), 1300);
    }
  }, [viewState]);

  const overallError = error || statsError || analyticsError || createMutation.error || optimizeMutation.error;
  
  if (viewState === 'initial' || viewState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white overflow-hidden relative">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-green-400/20 rounded-full animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 2}s` }} />
          ))}
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <div className="flex items-center justify-between w-full max-w-7xl">
            <div className="flex flex-col space-y-8">
              {[0, 1].map(offset => (
                <div key={offset} className="carousel-image-container">
                  <img src={loadingCarouselImages[(carouselIndex + offset) % loadingCarouselImages.length].url} alt={loadingCarouselImages[(carouselIndex + offset) % loadingCarouselImages.length].alt} className="carousel-image" />
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center space-y-8 mx-16">
              <div className="flex flex-row items-center justify-center w-full mb-8">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY_ACzMMPyCEbyYaq8NsBFjD-l1cjwY-jh9fEi9ky1fumk-hmLB81Gq8OBAMEPBIu90ok&usqp=CAU" alt="Geofencing Icon" className="w-12 h-12 mr-6" style={{ objectFit: 'contain' }} />
                <div className="text-center max-w-2xl flex-1">
                  <h1 className={`text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent transition-all duration-1000 ${titleVisible ? 'curtain-reveal' : 'curtain-hidden'}`}>
                    Initializing Geofencing Engine
                  </h1>
                  <div className="h-16 flex items-center justify-center">
                    <p className={`text-xl text-green-200 transition-all duration-800 ${subtitleVisible ? 'curtain-reveal-delayed' : 'curtain-hidden'}`}>
                      {doYouKnowFacts[factIndex]}
                    </p>
                  </div>
                  <p className={`text-green-300 mt-2 text-lg transition-all duration-1000 ${textVisible ? 'curtain-reveal-slow' : 'curtain-hidden'}`}>
                    Our system is calibrating your smart zones and learning your routines to create a home that anticipates your every move.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-6 mt-4 mb-6">
                {viewState === 'loading' ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-green-300">Processing request, this may take a while...</span>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
                    <Button onClick={handleInitiate} className="relative bg-gray-900 hover:bg-gray-800 border border-green-400/50 transform hover:scale-105 transition-all duration-300 px-16 py-8 text-2xl">
                      <Brain className="w-8 h-8 mr-4 animate-pulse" />
                      Initiate Geofencing
                      <span className="ml-4 text-lg font-normal text-green-200">Smart zone setup</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="w-80 h-80 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  {[
                    { size: 'w-72 h-72', duration: '20s', dots: 6, dotSize: 'w-4 h-4' },
                    { size: 'w-48 h-48', duration: '15s', dots: 6, dotSize: 'w-3 h-3' },
                    { size: 'w-24 h-24', duration: '10s', dots: 6, dotSize: 'w-2 h-2' }
                  ].map((ring, idx) => (
                    <div key={idx} className={`absolute ${ring.size} border-2 ${idx === 0 ? 'border-green-400/40 animate-spin-slow' : idx === 1 ? 'border-emerald-400/50 animate-spin-reverse' : 'border-teal-300/60 animate-spin'}`} style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)', animationDuration: ring.duration }}>
                      {[...Array(ring.dots)].map((_, i) => (
                        <div key={i} className={`absolute ${ring.dotSize} bg-green-400 rounded-full`} style={{
                          top: i === 0 ? '-8px' : i === 1 || i === 2 ? '25%' : i === 3 ? '100%' : '75%',
                          left: i === 0 || i === 3 ? '50%' : i === 1 || i === 4 ? '100%' : '-8px',
                          transform: (i === 0 || i === 3) ? 'translateX(-50%)' : ''
                        }} />
                      ))}
                    </div>
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500/40 to-emerald-600/40 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse-slow border-2 border-green-400/30">
                      <Brain className="w-10 h-10 text-green-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-8">
              {[2, 0].map(offset => (
                <div key={offset} className="carousel-image-container">
                  <img src={loadingCarouselImages[(carouselIndex + offset) % loadingCarouselImages.length].url} alt={loadingCarouselImages[(carouselIndex + offset) % loadingCarouselImages.length].alt} className="carousel-image" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <style jsx>{`
          .curtain-hidden { opacity: 0; transform: translateY(30px) scale(0.95); clip-path: inset(0 100% 0 0); }
          .curtain-reveal { opacity: 1; transform: translateY(0) scale(1); clip-path: inset(0 0% 0 0); }
          .curtain-reveal-delayed { opacity: 1; transform: translateY(0) scale(1); clip-path: inset(0 0% 0 0); transition-delay: 0.3s; }
          .curtain-reveal-slow { opacity: 1; transform: translateY(0) scale(1); clip-path: inset(0 0% 0 0); transition-delay: 0.6s; }
          @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes tilt { 0%, 50%, 100% { transform: rotate(0deg); } 25% { transform: rotate(1deg); } 75% { transform: rotate(-1deg); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .animate-fade-in { animation: fade-in 0.8s ease-out; }
          .animate-tilt { animation: tilt 10s infinite linear; }
          .carousel-image-container { width: 280px; height: 200px; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(34, 197, 94, 0.2); }
          .carousel-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
          .carousel-image:hover { transform: scale(1.05); }
        `}</style>
      </div>
    );
  }
  
  if (viewState === 'error') {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-red-400 text-lg">Failed to load geofencing data: {error}</div>
      </div>
    );
  }

  if (viewState !== 'dashboard' || !geofences) return null;

  const mlMetrics = analytics?.ml_metrics || {};

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }}>
        <EnergyStats />
      </div>

      {overallError && (
        <div className="bg-red-900/30 text-red-300 p-4 rounded-lg flex items-center gap-2 mb-4 border border-red-500">
          <XCircle className="w-5 h-5" />
          <p>Error: {overallError}. Please ensure the Flask backend is running.</p>
        </div>
      )}

      <div className="text-center py-20 rounded-2xl relative overflow-hidden" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://thumbs.dreamstime.com/z/examining-impact-edge-computing-smart-home-security-systems-dusk-group-gathers-to-discuss-how-enhances-highlighting-356998640.jpg?ct=jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="relative z-10">
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">AI-Powered Geofencing Control</h1>
          <p className="text-green-200 text-2xl drop-shadow-md">Machine learning algorithms optimizing your location-based automation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
          { title: "Model Accuracy", value: `${mlMetrics.model_accuracy?.toFixed(1) || 0}%`, icon: Brain, gradient: "from-green-600/20 to-green-800/20", border: "border-green-400/30", color: "text-green-200" },
          { title: "Prediction Confidence", value: `${mlMetrics.prediction_confidence?.toFixed(1) || 0}%`, icon: TrendingUp, gradient: "from-emerald-600/20 to-emerald-800/20", border: "border-emerald-400/30", color: "text-emerald-200" },
          { title: "Zones Created", value: stats?.total_zones || 0, icon: MapIcon, gradient: "from-teal-600/20 to-teal-800/20", border: "border-teal-400/30", color: "text-teal-200" },
          { title: "Total Triggers", value: stats?.total_triggers || 0, icon: Target, gradient: "from-purple-600/20 to-purple-800/20", border: "border-purple-400/30", color: "text-purple-200" },
          { title: "Optimization Success", value: `${mlMetrics.optimization_success_count?.toFixed(1) || 0}%`, icon: Brain, gradient: "from-lime-600/20 to-lime-800/20", border: "border-lime-400/30", color: "text-lime-200" }
        ].map((metric, i) => (
          <Card key={i} className={`bg-gradient-to-br ${metric.gradient} backdrop-blur-md border ${metric.border}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${metric.color} text-sm`}>{metric.title}</p>
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color.replace('text-', 'text-').replace('/20', '400')}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-xl">
                <MapPin className="w-6 h-6 text-green-400" />
                ML-Optimized Zones
              </CardTitle>
              <div className="flex gap-3">
                <button onClick={() => optimizeMutation.mutate()} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2" disabled={optimizeMutation.isPending}>
                  <Brain className="w-4 h-4" />
                  Optimize
                </button>
                <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Zone
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {geofences?.length > 0 ? (
                geofences.map((geofence) => (
                  <Card key={geofence.id} className="bg-green-900/20 border border-green-400/30">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{geofence.name}</h3>
                          <p className="text-green-200 text-sm mt-1">{geofence.address}</p>
                          <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-green-300">
                            <span>Radius: {geofence.radius}m</span>
                            <span>Automations: {geofence.automations}</span>
                            <span>Triggers: {geofence.trigger_count || 0}</span>
                            <span>Savings: {(geofence.energy_savings || 0).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-green-300 text-center py-8">No geofences created yet. Click "Add Zone" to get started!</p>
              )}
            </CardContent>
          </Card>

          <div className="bg-gradient-to-tr from-green-900/30 to-slate-900/30 rounded-xl p-8 shadow-xl border border-green-400/20">
            <h2 className="text-3xl font-bold text-white mb-4">Smart Home in Action</h2>
            <p className="text-green-100 mb-6 text-lg leading-relaxed">
              See how your smart zones come alive. Below, you'll find a showcase of real-world smart home environments—each image highlights a different aspect of intelligent living.
            </p>
            <ul className="text-green-200 text-base space-y-2 mb-6">
              <li>• Enjoy personalized comfort—your home adapts to your schedule, not the other way around.</li>
              <li>• Save energy without sacrificing convenience or style.</li>
            </ul>
            <ImageCarousel />
          </div>
        </div>

        <div className="space-y-6">
          {securityAlerts.length > 0 && (
            <Card className="bg-red-900/20 backdrop-blur-md border border-red-400/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Security Alerts ({securityAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.timestamp} className={`p-5 rounded-lg border ${alert.severity === 'high' ? 'bg-red-900/40 border-red-500' : 'bg-yellow-900/40 border-yellow-500'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium text-base">{alert.message}</p>
                        <p className="text-gray-300 text-sm mt-2">{alert.recommendation}</p>
                        <p className="text-gray-400 text-xs mt-3">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <button onClick={() => dismissAlert(alert.timestamp)} className="text-gray-400 hover:text-white ml-4 p-1">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-blue-400" />
                AI Suggestions ({suggestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.length > 0 ? suggestions.map((suggestion) => (
                <div key={suggestion.id} className={`p-5 rounded-lg border ${suggestion.priority === 'high' ? 'bg-orange-900/40 border-orange-500' : suggestion.priority === 'medium' ? 'bg-blue-900/40 border-blue-500' : 'bg-green-900/40 border-green-500'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <suggestion.icon className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-base">{suggestion.title}</h4>
                        <p className="text-gray-300 text-sm mt-2">{suggestion.message}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs">
                          <span className="text-blue-300">Confidence: {suggestion.confidence}%</span>
                          {suggestion.potentialSaving && (
                            <span className="text-green-300">Saving: {suggestion.potentialSaving} kWh</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => implementSuggestion(suggestion)} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md ml-4 flex-shrink-0">
                      Implement
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-gray-300 text-center py-6">No suggestions available. Your energy usage is optimal!</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Device Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.values(deviceStates).flat().map((device, i) => {
                  const devicePowerConsumption = {
                    'Main Light': 60, 'Fan': 75, 'AC': 3500, 'TV': 150, 'Microwave': 1000,
                    'Refrigerator': 150, 'Shower': 500, 'Water Heater': 4000, 'Dryer': 3000
                  };
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${device.isOn ? 'bg-green-400' : 'bg-gray-600'}`} />
                      <span className="text-white text-xs font-medium">{device.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${device.isOn ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                        {device.isOn ? `${device.value || 100}%` : 'OFF'}
                      </span>
                    </div>
                  );
                })}
                {Object.values(deviceStates).flat().length === 0 && (
                  <p className="text-gray-400 text-center py-4 w-full">No device data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-black/40 backdrop-blur-md border border-blue-400/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Live Energy Usage Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={energyHistory}>
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: 'white' }} />
              <Area type="monotone" dataKey="totalEnergyUsage" stroke="#3b82f6" fillOpacity={1} fill="url(#energyGradient)" strokeWidth={2} name="Energy Usage (kWh)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-gray-300 text-sm">Current: {energyData.totalEnergyUsage} kWh | Active: {energyData.activeDevices}/{energyData.totalDevices} devices</p>
          </div>
        </CardContent>
      </Card>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 bg-black/80 backdrop-blur-lg border border-green-500/40 shadow-lg">
            <CardHeader><CardTitle className="text-white text-xl">Create New ML-Optimized Zone</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Zone Name", key: "name", placeholder: "Home, Work, etc.", type: "text" },
                { label: "Address", key: "address", placeholder: "123 Main St, City, Country", type: "text" },
                { label: "Latitude", key: "lat", placeholder: "37.7749", type: "number", step: "0.0001" },
                { label: "Longitude", key: "lng", placeholder: "-122.4194", type: "number", step: "0.0001" },
                { label: "Radius (meters)", key: "radius", placeholder: "200", type: "number" }
              ].map((field, i) => (
                <div key={i} className="space-y-4">
                  <label className="block text-green-200 text-sm font-medium">{field.label}</label>
                  <input
                    className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    type={field.type}
                    step={field.step}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'number' ? (field.key === 'lat' || field.key === 'lng' ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || (field.key === 'radius' ? 200 : 0)) : e.target.value })}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-4">
                <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600" onClick={() => setShowCreateForm(false)}>Cancel</button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50" onClick={handleCreateSubmit} disabled={createMutation.isPending || !formData.name.trim() || !formData.address.trim() || isNaN(formData.lat) || isNaN(formData.lng) || isNaN(formData.radius) || formData.radius <= 0}>
                  {createMutation.isPending ? 'Creating...' : 'Create Zone'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <style jsx>{`
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(55, 65, 81, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 197, 94, 0.5); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.7); }
      `}</style>
    </div>
  );
}
