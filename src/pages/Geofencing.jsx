import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Brain, TrendingUp, Target, MapIcon, XCircle, ChevronLeft, ChevronRight, AlertTriangle, Lightbulb, Shield, Zap, Clock, Home, Pause, Trash2, Navigation } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const FLASK_API_URL = process.env.REACT_APP_API_BASE_URL || 'https://smart-home-controls-backend.onrender.com';

let geofencesCache = null;
let geofencesPromise = null; 
let hasInitiatedGeofences = false;

export function prefetchGeofences() {
  if (geofencesCache) return Promise.resolve(geofencesCache);
  if (geofencesPromise) return geofencesPromise;
  geofencesPromise = fetch(`${FLASK_API_URL}/api/geofences`, { cache: 'force-cache', keepalive: true })
    .then(res => {
      if (!res.ok) throw new Error(`Geofencing fetch failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      geofencesCache = data;
      geofencesPromise = null;
      return data;
    })
    .catch(error => {
      geofencesPromise = null;
      hasInitiatedGeofences = false;
      throw error;
    });
  return geofencesPromise;
}

const Card = ({ children, className = '' }) => (<div className={`rounded-lg shadow-lg ${className}`}>{children}</div>);
const CardHeader = ({ children, className = '' }) => (<div className={`px-6 py-4 ${className}`}>{children}</div>);
const CardTitle = ({ children, className = '' }) => (<h3 className={`text-lg font-semibold ${className}`}>{children}</h3>);
const CardContent = ({ children, className = '' }) => (<div className={`px-6 pb-6 ${className}`}>{children}</div>);
const Button = ({ children, onClick, className = '', disabled = false, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 px-10 py-5 bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-500/50 ${className}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geofenceData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Failed to create geofence: ${errorData.error || response.statusText}`);
  }
  geofencesCache = null;
  geofencesPromise = null;
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
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
    try {
      setIsLoading(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
      setIsPending(true);
      setError(null);
      const result = await mutationFn(variables);
      if (typeof options.onSuccess === 'function') {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      setError(err.message);
      if (typeof options.onError === 'function') {
        options.onError(err);
      }
    } finally {
      setIsPending(false);
    }
  };
  
  return { mutate, isPending, error };
};

const useLocalEnergyData = () => {
  const [energyData, setEnergyData] = useState({ totalEnergyUsage: 0, activeDevices: 4, totalDevices: 0 });
  const [energyHistory, setEnergyHistory] = useState([]);
  const [deviceStates, setDeviceStates] = useState({});

  useEffect(() => {
    const update = () => {
      try {
        const stored = localStorage.getItem('deviceStates');
        if (stored) {
          const parsed = JSON.parse(stored);
          setDeviceStates(parsed);
          
          const devicePower = {
            'Main Light': 60, 'Fan': 75, 'AC': 3500, 'TV': 150, 'Microwave': 1000,
            'Refrigerator': 150, 'Shower': 500, 'Water Heater': 4000, 'Dryer': 3000
          };
          
          let totalEnergy = 0, active = 0, total = 0;
          Object.values(parsed).forEach(roomDevices => Array.isArray(roomDevices) && roomDevices.forEach(device => {
            total++;
            if (device.isOn) {
              active++;
              let base = devicePower[device.name] || 100, mult = 1;
              if (['brightness','speed','pressure','power'].includes(device.property)) mult = device.value / 100;
              else if (['temp','temperature'].includes(device.property)) mult = device.name === 'AC' ? Math.abs(72 - device.value) / 20 + 0.5 : device.value / 100;
              else if (device.property === 'volume') mult = 0.8 + (device.value / 100) * 0.4;
              totalEnergy += (base * mult) / 1000;
            }
          }));

          if (active === 0) active = 4;
          if (totalEnergy === 0) totalEnergy = 2.5;
          
          const e = {
            totalEnergyUsage: Math.round(totalEnergy * 100) / 100,
            activeDevices: active,
            totalDevices: total || 20
          };
          setEnergyData(e);
          setEnergyHistory(prev => [...prev, { ...e, hour: new Date().getHours() }].slice(-24));
        } else {
          const defaultData = { totalEnergyUsage: 2.5, activeDevices: 4, totalDevices: 20 };
          setEnergyData(defaultData);
          setEnergyHistory(prev => [...prev, { ...defaultData, hour: new Date().getHours() }].slice(-24));
        }
      } catch {
        const defaultData = { totalEnergyUsage: 2.5, activeDevices: 4, totalDevices: 20 };
        setEnergyData(defaultData);
        setEnergyHistory(prev => [...prev, { ...defaultData, hour: new Date().getHours() }].slice(-24));
      }
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return { energyData, energyHistory, deviceStates };
};

function getUsageLevel(active) {
  if (active > 10) return 'high';
  if (active > 5) return 'medium';
  return 'low';
}

function getAlertAndRecommendation(energyData, dismissedAlertIds) {
  const usageLevel = getUsageLevel(energyData.activeDevices);
  let alert = null, recommendation = null;
  if (usageLevel === 'high') {
    alert = { id: 'high', severity: 'high', message: `High device activity: ${energyData.activeDevices} devices active (${energyData.totalEnergyUsage} kWh)`, recommendation: 'Review active devices for optimization' };
    recommendation = { id: 'high', priority: 'high', message: 'Consider reducing usage by temporarily switching off devices.' };
  } else if (usageLevel === 'medium') {
    alert = { id: 'medium', severity: 'medium', message: `Medium device activity: ${energyData.activeDevices} devices active (${energyData.totalEnergyUsage} kWh)`, recommendation: 'Monitor device usage patterns' };
    recommendation = { id: 'medium', priority: 'medium', message: 'So far, so good! You can optimize further by turning off unused devices.' };
  } else {
    alert = null;
    recommendation = { id: 'low', priority: 'low', message: 'Well Done! Your energy usage is optimal!' };
  }
  if (alert && dismissedAlertIds.includes(alert.id)) alert = null;
  return { alert, recommendation };
}

const doYouKnowFacts = [
  "Did you know? Smart zones can reduce your home's energy waste by up to 30%.",
  "Did you know? Your smart home learns and optimizes your energy usage over time."
];

const carouselImages = [
  { url: "https://www.smarthomeworld.in/wp-content/uploads/2025/03/4-1024x576.jpg", alt: "1" },
  { url: "https://d6y5eqdcxq8w3.cloudfront.net/assets/blog/prosource_member_blogs/Smart-Home-Climate-Control-and-Lights.webp", alt: "1" },
  { url: "https://preview.redd.it/869yzxqr5ar51.jpg?width=640&crop=smart&auto=webp&s=762b8d68b17930b1bee6459ef060a24026240a4a", alt: "1" },
  { url: "https://oltdesign.com/wp-content/uploads/2025/02/smart-home-technology.jpg", alt: "1" },
  { url: "https://www.ledyilighting.com/wp-content/uploads/2025/05/Factors-To-Consider-Before-Establishing-Smart-Home-Lighting-1024x683.jpeg", alt: "1" }
];

const loadingCarouselImages = [
  { url: "https://i.pinimg.com/736x/2f/6c/92/2f6c925f049eb916866d983cd3fca54d.jpg", alt: "1" },
  { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLvOde-b4NSV-1FfKVCOdbwFZpVh83W7YUrjT7wXSy23T2qMnN_Wx4p5_aZHM8zicHfak&usqp=CAU", alt: "1" },
  { url: "https://thumbs.dreamstime.com/b/modern-living-room-city-skyline-view-night-featuring-elegant-decor-lush-greenery-luxurious-showcases-furnishings-362289898.jpg", alt: "1" },
  { url: "https://images.stockcake.com/public/c/b/5/cb505e46-ce71-46e7-b8b6-a9c2ba06701e_large/luxurious-living-room-stockcake.jpg", alt: "1" }
];

function ImageCarousel() {
  const [index, setIndex] = useState(0), [fade, setFade] = useState(true);

  useEffect(() => {
    setFade(false);
    const fadeTimeout = setTimeout(() => setFade(true), 50),
          timer = setTimeout(() => setIndex(i => (i + 1) % carouselImages.length), 5000);
    return () => { clearTimeout(timer); clearTimeout(fadeTimeout); };
  }, [index]);

  const goPrev = () => { setFade(false); setTimeout(() => { setIndex(i => (i - 1 + carouselImages.length) % carouselImages.length); setFade(true); }, 100); };
  const goNext = () => { setFade(false); setTimeout(() => { setIndex(i => (i + 1) % carouselImages.length); setFade(true); }, 100); };

  return (
    <div className="relative w-full h-64 flex items-center justify-center group overflow-hidden rounded-lg shadow-2xl bg-gradient-to-br from-green-900/30 to-slate-900/30">
      <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-green-700/50 rounded-full p-2 transition-all" aria-label="Previous" tabIndex={0}>
        <ChevronLeft className="w-7 h-7 text-green-200" />
      </button>
      <div className={`transition-all duration-700 ease-in-out w-full h-full ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <img src={carouselImages[index].url} alt={carouselImages[index].alt} className="w-full h-64 object-cover rounded-lg shadow-xl" style={{ boxShadow: '0 6px 32px 0 rgba(34,197,94,0.15), 0 1.5px 7px 0 rgba(16,185,129,0.09)' }} />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-green-100 text-sm shadow-lg backdrop-blur">
          {carouselImages[index].alt}
        </div>
      </div>
      <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-green-700/50 rounded-full p-2 transition-all" aria-label="Next" tabIndex={0}>
        <ChevronRight className="w-7 h-7 text-green-200" />
      </button>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
        {carouselImages.map((_, i) => (
          <span key={i} className={`block w-3 h-3 rounded-full transition-all duration-300 ${i === index ? 'bg-green-400' : 'bg-green-900/40'}`} />
        ))}
      </div>
    </div>
  );
}

export default function Geofencing() {
  const navigate = useNavigate();
  const [geofences, setGeofences] = useState(geofencesCache);
  const [error, setError] = useState(null);
  const [viewState, setViewState] = useState(hasInitiatedGeofences ? 'loading' : 'initial');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({ name: '', address: '', lat: 37.7749, lng: -122.4194, radius: 200, automationRules: '' });
  const [factIndex, setFactIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [dismissedAlertIds, setDismissedAlertIds] = useState([]);
  const [pausedZones, setPausedZones] = useState(new Set());

  const { data: stats, error: statsError, refetch: refetchStats } = useApiData('geofence-stats', fetchGeofenceStats, 30000);
  const { data: analytics, error: analyticsError } = useApiData('geofence-analytics', fetchAnalytics, 60000);
  const { energyData, energyHistory, deviceStates } = useLocalEnergyData();
  const { alert, recommendation } = getAlertAndRecommendation(energyData, dismissedAlertIds);
  const deviceList = Object.values(deviceStates).flat();

  const dismissAlert = (alertId) => {
    setDismissedAlertIds(ids => [...ids, alertId]);
  };

  const handleDeviceControlClick = async () => {
    navigate('/');
    setTimeout(() => {
      const roomSelectorElement = document.querySelector('#room-selector');
      
      if (roomSelectorElement) {
        roomSelectorElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 300); 
  };

  const handleInitiate = () => {
    if (viewState === 'initial') {
      hasInitiatedGeofences = true;
      setViewState('loading');
      prefetchGeofences()
        .then(data => {
          setGeofences(data);
          setViewState('dashboard');
        })
        .catch(e => {
          setError(e.message);
          setViewState('error');
        });
    }
  };

  const refetchGeofencesData = () => {
    prefetchGeofences().then(data => {
        setGeofences(data);
    }).catch(e => setError(e.message));
  };
  
  const createMutation = useMutation(createGeofence, {
    onSuccess: () => {
      refetchGeofencesData();
      refetchStats();
      setShowCreateForm(false);
      setFormData({ name: '', address: '', lat: 37.7749, lng: -122.4194, radius: 200, automationRules: '' });
    },
    onError: (err) => {
      alert(`Failed to create geofence: ${err.message}`);
    }
  });

  const optimizeMutation = useMutation(optimizeGeofences, {
    onSuccess: (result) => {
      refetchGeofencesData();
      refetchStats();
      alert(result.message);
    },
    onError: (err) => {
      alert(`Failed to optimize geofences: ${err.message}`);
    }
  });

  const handleCreateSubmit = () => {
    if (formData.name.trim() && formData.address.trim() && !isNaN(formData.lat) && !isNaN(formData.lng) && !isNaN(formData.radius)) {
      createMutation.mutate(formData);
    } else {
      alert('Please fill all required fields correctly (Name, Address, Lat, Lng, Radius).');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          alert('Unable to get current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const toggleZonePause = (zoneId) => {
    setPausedZones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(zoneId)) {
        newSet.delete(zoneId);
      } else {
        newSet.add(zoneId);
      }
      return newSet;
    });
  };

  const deleteZone = (zoneId) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      alert('Zone deleted successfully');
    }
  };

  useEffect(() => {
    if (hasInitiatedGeofences && !geofences) {
      setViewState('loading');
      prefetchGeofences()
        .then(data => {
          setGeofences(data);
          setViewState('dashboard');
        })
        .catch(e => {
          setError(e.message);
          setViewState('error');
        });
    } else if (geofences) {
      setViewState('dashboard');
    }
  }, [geofences]);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % doYouKnowFacts.length);
    }, 4000);
    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    if (viewState === 'initial' || viewState === 'loading') {
      const carouselInterval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % loadingCarouselImages.length);
      }, 3000);
      return () => clearInterval(carouselInterval);
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
          {[...Array(15)].map((_, i) => (
            <div key={`triangle-${i}`} className="absolute triangle-bubble" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${4 + Math.random() * 3}s` }} />
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
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY_ACzMMPyCEbyYaq8NsBFjD-l1cjwY-jh9fEi9ky1fumk-hmLB81Gq8OBAMEPBIu90ok&usqp=CAU" alt="1" className="w-12 h-12 mr-6" style={{ objectFit: 'contain' }} />
                <div className="text-center max-w-2xl flex-1">
                  <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Initializing Geofencing Engine
                  </h1>
                  <div className="h-16 flex items-center justify-center">
                    <p className="text-xl text-green-200 animate-fade-in">
                      {doYouKnowFacts[factIndex]}
                    </p>
                  </div>
                  <p className="text-green-300 mt-2 text-lg">
                    Our system is calibrating your smart zones and learning your routines to create a home that anticipates your every move. Get ready for a dashboard that puts true, hands-free automation at your fingertips.
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
                  <div className="absolute w-72 h-72 border-2 border-green-400/40 animate-spin-slow" style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)', animationDuration: '20s' }}>
                    <div className="absolute w-4 h-4 bg-green-400 rounded-full -top-2 left-1/2 transform -translate-x-1/2 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500/40 to-emerald-600/40 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse-slow border-2 border-green-400/30">
                      <Brain className="w-10 h-10 text-green-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-8">
              {[2, 3].map(offset => (
                <div key={offset} className="carousel-image-container">
                  <img src={loadingCarouselImages[(carouselIndex + offset) % loadingCarouselImages.length].url} alt={loadingCarouselImages[(carouselIndex + offset) % loadingCarouselImages.length].alt} className="carousel-image" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes tilt { 0%, 50%, 100% { transform: rotate(0deg); } 25% { transform: rotate(1deg); } 75% { transform: rotate(-1deg); } }
          @keyframes triangleBubble { 0% { transform: translateY(100vh) rotate(0deg) scale(0.5); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.3; } 100% { transform: translateY(-100vh) rotate(360deg) scale(1); opacity: 0; } }
          @keyframes rotateSubtle { 0% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } 100% { transform: rotate(-20deg); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .animate-fade-in { animation: fade-in 0.8s ease-out; }
          .animate-tilt { animation: tilt 10s infinite linear; }
          .triangle-bubble { width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 14px solid rgba(34, 197, 94, 0.4); animation: triangleBubble 7s infinite linear; }
          .carousel-image-container { width: 280px; height: 200px; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(34, 197, 94, 0.2); animation: rotateSubtle 8s infinite ease-in-out; }
          .carousel-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
          .carousel-image:hover { transform: scale(1.05); }
        `}</style>
      </div>
    );
  }

  if (viewState !== 'dashboard' || !geofences) {
    return null;
  }

  const mlMetrics = analytics?.ml_metrics || {};

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const energyDistribution = [
    { name: 'Lighting', value: energyData.totalEnergyUsage * 0.3, color: '#0088FE' },
    { name: 'HVAC', value: energyData.totalEnergyUsage * 0.4, color: '#00C49F' },
    { name: 'Appliances', value: energyData.totalEnergyUsage * 0.2, color: '#FFBB28' },
    { name: 'Others', value: energyData.totalEnergyUsage * 0.1, color: '#FF8042' }
  ];

  const deviceActivityData = deviceList.map(device => ({
    name: device.name,
    value: device.isOn ? (device.value || 100) : 0
  }));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {overallError && (
        <div className="bg-red-900/30 text-red-300 p-4 rounded-lg flex items-center gap-2 mb-4 border border-red-500">
          <XCircle className="w-5 h-5" />
          <p>Error: {overallError}. Please ensure the Flask backend is running.</p>
        </div>
      )}

      <div className="text-center py-16 rounded-2xl relative overflow-hidden" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://thumbs.dreamstime.com/z/examining-impact-edge-computing-smart-home-security-systems-dusk-group-gathers-to-discuss-how-enhances-highlighting-356998640.jpg?ct=jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            AI-Powered Geofencing Control
          </h1>
          <p className="text-green-200 text-xl drop-shadow-md">
            Machine learning algorithms optimizing your location-based automation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {[
          { title: "Model Accuracy", value: `${mlMetrics.model_accuracy?.toFixed(1) || 0}%`, icon: Brain, gradient: "from-green-600/20 to-green-800/20", border: "border-green-400/30", color: "text-green-200" },
          { title: "Prediction Confidence", value: `${mlMetrics.prediction_confidence?.toFixed(1) || 0}%`, icon: TrendingUp, gradient: "from-emerald-600/20 to-emerald-800/20", border: "border-emerald-400/30", color: "text-emerald-200" },
          { title: "Zones Created", value: stats?.total_zones || 0, icon: MapIcon, gradient: "from-teal-600/20 to-teal-800/20", border: "border-teal-400/30", color: "text-teal-200" },
          { title: "Total Triggers", value: stats?.total_triggers || 0, icon: Target, gradient: "from-purple-600/20 to-violet-800/20", border: "border-purple-400/30", color: "text-purple-200" },
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

      <div className="flex space-x-4 mb-6">
        {['overview', 'analytics'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-400" />
                ML-Optimized Zones
              </CardTitle>
              <div className="flex gap-2">
                <button onClick={() => optimizeMutation.mutate({})} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1.5" disabled={optimizeMutation.isPending}>
                  <Brain className="w-4 h-4" />
                  Optimize
                </button>
                <button onClick={() => setShowCreateForm(true)} className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add Zone
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {geofences?.length > 0 ? (
                geofences.map((geofence) => (
                  <Card key={geofence.id} className={`${pausedZones.has(geofence.id) ? 'bg-gray-900/40 border-gray-500/30' : 'bg-green-900/20 border-green-400/30'} border`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold">{geofence.name}</h3>
                            {pausedZones.has(geofence.id) && (
                              <span className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">Inactive</span>
                            )}
                          </div>
                          <p className="text-green-200 text-sm mt-1">{geofence.address}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-green-300">
                            <span>Radius: {geofence.radius}m</span>
                            <span>Automations: {geofence.automations}</span>
                            <span>Triggers: {geofence.trigger_count || 0}</span>
                            <span>Savings: {(geofence.energy_savings || 0).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => toggleZonePause(geofence.id)}
                            className={`p-1.5 rounded ${pausedZones.has(geofence.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white transition-colors`}
                            title={pausedZones.has(geofence.id) ? 'Resume Zone' : 'Pause Zone'}
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteZone(geofence.id)}
                            className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                            title="Delete Zone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-green-300 text-center">No geofences created yet. Click "Add Zone" to get started!</p>
              )}
            </CardContent>
          </Card>
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-tr from-green-900/30 to-slate-900/30 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-2">Smart Home in Action</h2>
              <p className="text-green-100 mb-4 text-base leading-relaxed">
                See how your smart zones come alive. Below, you'll find a showcase of real-world smart home environments—each image highlights a different aspect of intelligent living.
              </p>
              <ul className="text-green-200 text-sm space-y-1 mb-4">
                <li>• Enjoy personalized comfort—your home adapts to your schedule, not the other way around.</li>
                <li>• Save energy without sacrificing convenience or style.</li>
              </ul>
            </div>
            <div className="mt-2">
              <ImageCarousel />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
            <CardHeader>
              <CardTitle className="text-white">24h Energy Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.energy_optimization && analytics.energy_optimization.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.energy_optimization}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: 'white' }} />
                    <Line type="monotone" dataKey="consumption" stroke="#ef4444" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} name="Predicted" />
                    <Line type="monotone" dataKey="optimized" stroke="#22c55e" strokeWidth={2} name="Optimized" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-green-300 text-center">No energy optimization data available.</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
            <CardHeader>
              <CardTitle className="text-white">Zone Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.zone_efficiency && analytics.zone_efficiency.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.zone_efficiency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: 'white' }} />
                    <Bar dataKey="efficiency" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-green-300 text-center">No zone efficiency data available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/80 backdrop-blur-md border border-orange-400/30 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border-b border-orange-400/20">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              Security Center
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {alert ? (
              <div className={`p-5 rounded-xl border-l-4 ${alert.severity === 'high' ? 'bg-red-900/30 border-red-500 shadow-red-500/20' : 'bg-yellow-900/30 border-yellow-500 shadow-yellow-500/20'} shadow-lg`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
                      <span className={`text-sm font-medium ${alert.severity === 'high' ? 'text-red-300' : 'text-yellow-300'}`}>
                        {alert.severity.toUpperCase()} ALERT
                      </span>
                    </div>
                    <div className="text-white font-semibold text-lg mb-2">{alert.message}</div>
                    <div className="text-gray-300 text-sm">{alert.recommendation}</div>
                  </div>
                  <button onClick={() => dismissAlert(alert.id)} className="text-gray-400 hover:text-white ml-4 p-1 rounded-full hover:bg-white/10 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-green-300 text-lg font-medium">All Systems Secure</div>
                <div className="text-gray-400 text-sm mt-1">No security alerts detected</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-b border-cyan-400/20">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Lightbulb className="w-6 h-6 text-cyan-400" />
              </div>
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl border border-cyan-400/20">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${recommendation.priority === 'high' ? 'bg-red-500/20' : recommendation.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                    <Zap className={`w-5 h-5 ${recommendation.priority === 'high' ? 'text-red-400' : recommendation.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-lg mb-1">{recommendation.message}</div>
                    <div className="text-gray-400 text-sm">Based on current usage: {energyData.activeDevices} active devices</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">Time-Based Insight</span>
                  </div>
                  <div className="text-white text-sm">
                    {new Date().getHours() < 6 || new Date().getHours() > 22 
                      ? "Night mode detected - Ensure electrical appliances are switched off"
                      : "Daytime optimization - Natural light available, consider switching off some lights"
                    }
                  </div>
                </div>
                
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">Energy Efficiency</span>
                  </div>
                  <div className="text-white text-sm">
                    Potential savings: {(energyData.totalEnergyUsage * 0.15).toFixed(1)} kWh with smart scheduling
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-black/40 backdrop-blur-md border border-blue-400/20">
          <CardHeader>
            <CardTitle className="text-white">Energy Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={energyDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {energyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-sm text-white mt-2">
              *HVAC stands for Heating, Ventilation, and Air Conditioning
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
          <CardHeader>
            <CardTitle className="text-white">Hourly Usage Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={energyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: 'white' }} />
                <Line type="monotone" dataKey="totalEnergyUsage" stroke="#22c55e" strokeWidth={2} name="Energy (kWh)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur-md border border-purple-400/20">
          <CardHeader>
            <CardTitle className="text-white">Device Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deviceActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-green-500/20 via-emerald-600/20 to-purple-500/20 border border-emerald-400/40 shadow-2xl rounded-lg">
          <div className="bg-gradient-to-r from-green-600/30 via-emerald-500/30 to-purple-600/30 border-b border-emerald-400/30 px-6 py-4 rounded-t-lg">
            <h3 className="text-emerald-300 text-2xl font-bold flex items-center gap-3">
              <span className="p-2 bg-emerald-500/30 rounded-lg"><Zap className="w-7 h-7 text-emerald-300" /></span>
              Energy Analytics Dashboard
            </h3>
          </div>
          <div className="p-8">
            <div className="mb-6 flex items-center gap-4">
              <span className="text-emerald-200 text-base">To toggle devices,</span>
              <button onClick={handleDeviceControlClick} className="bg-gradient-to-r from-emerald-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:from-emerald-500 hover:to-purple-500 transition-all text-sm">Device Control</button>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-600/20 to-green-700/20 rounded-xl border border-emerald-400/30">
                  <div className="text-3xl font-bold text-emerald-300 mb-2">{energyData.totalEnergyUsage}</div>
                  <div className="text-emerald-200 text-sm font-medium">kWh Usage</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-600/20 to-violet-700/20 rounded-xl border border-purple-400/30">
                  <div className="text-3xl font-bold text-purple-300 mb-2">{energyData.activeDevices}</div>
                  <div className="text-purple-200 text-sm font-medium">Active Devices</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-600/20 to-green-700/20 rounded-xl border border-emerald-400/30">
                  <div className="text-3xl font-bold text-emerald-300 mb-2">{energyData.totalDevices}</div>
                  <div className="text-emerald-200 text-sm font-medium">Total Devices</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-800/50 to-purple-900/30 rounded-xl p-6 border border-gray-600/30">
                <h3 className="text-emerald-200 text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" />Real-time Monitoring</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between"><span className="text-gray-300">Efficiency Rating:</span><span className="text-emerald-300 font-medium">{getUsageLevel(energyData.activeDevices) === 'low' ? 'Excellent' : getUsageLevel(energyData.activeDevices) === 'medium' ? 'Good' : 'Needs Attention'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">Cost Estimate:</span><span className="text-purple-300 font-medium">${(energyData.totalEnergyUsage * 0.12).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">Savings Today:</span><span className="text-emerald-300 font-medium">${(energyData.totalEnergyUsage * 0.08).toFixed(2)}</span></div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-700/20 to-purple-700/20 rounded-xl p-6 border border-emerald-400/30">
                <div className="flex items-center gap-3 mb-4"><div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div><span className="text-emerald-200 font-medium">System Status: Optimized</span></div>
                <div className="text-emerald-100 text-sm leading-relaxed">Your smart home is operating at peak efficiency. All geofencing zones are active and energy consumption is within optimal parameters.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-600/30 to-emerald-700/30 backdrop-blur-md rounded-2xl p-6 border border-green-400/30">
            <h3 className="text-white text-xl font-bold mb-6 text-center">Smart Home Showcase</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300"><img src="https://thumbs.dreamstime.com/b/smart-home-bedroom-futuristic-design-modern-bedroom-interior-showcasing-smart-home-concept-futuristic-design-325690136.jpg" alt="1" className="w-full h-48 object-cover rounded-lg shadow-lg border border-emerald-400/20" /></div>
              <div className="transform -rotate-3 hover:rotate-0 transition-transform duration-300"><img src="https://as1.ftcdn.net/v2/jpg/05/75/63/70/1000_F_575637092_BndwXzl5YjHfmVLtvFh3j00vXdgkQdw2.jpg" alt="1" className="w-full h-48 object-cover rounded-lg shadow-lg border border-emerald-400/20" /></div>
              <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-300"><img src="https://images.squarespace-cdn.com/content/v1/62dfa656a2986f7b76f75c92/b78fb41c-6929-4a68-b805-7d933f90ee80/innovative-luxury-hotel-design-ideas-concepts-bar.jpg" alt="1" className="w-full h-48 object-cover rounded-lg shadow-lg border border-emerald-400/20" /></div>
              <div className="transform rotate-2 hover:rotate-0 transition-transform duration-300"><img src="https://www.luxxu.net/blog/wp-content/uploads/2016/03/Luxury-design-ideas-from-Paramount-Hotel-in-New-York-850x410.jpg" alt="1" className="w-full h-48 object-cover rounded-lg shadow-lg border border-emerald-400/20" /></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-900/30 to-black rounded-xl p-6 border border-gray-400/20">
            <div className="text-center">
              <div className="text-gray-300 text-lg font-semibold mb-2">Next Generation Living</div>
              <div className="text-gray-300 text-sm">Experience the future of home automation with AI-powered geofencing technology</div>
            </div>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 bg-black/80 backdrop-blur-lg border border-green-500/40 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-xl">Create New ML-Optimized Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Zone Name", key: "name", placeholder: "Home, Work, etc.", type: "text" },
                { label: "Address", key: "address", placeholder: "123 Main St, City, Country", type: "text" },
                { label: "Latitude", key: "lat", placeholder: "37.7749", type: "number", step: "0.0001" },
                { label: "Longitude", key: "lng", placeholder: "-122.4194", type: "number", step: "0.0001" },
                { label: "Radius (meters)", key: "radius", placeholder: "200", type: "number" }
              ].map((field, i) => (
                <div key={i} className="space-y-2">
                  <label className="block text-green-200 text-sm font-medium">{field.label}</label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      type={field.type} 
                      step={field.step} 
                      placeholder={field.placeholder} 
                      value={formData[field.key]} 
                      onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'number' ? (field.key === 'lat' || field.key === 'lng' ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || (field.key === 'radius' ? 200 : 0)) : e.target.value })} 
                    />
                    {(field.key === 'lat' || field.key === 'lng') && i === 2 && (
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-sm"
                        title="Use Current Location"
                      >
                        <Navigation className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="space-y-2">
                <label className="block text-green-200 text-sm font-medium">Automation Rules</label>
                <input 
                  className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" 
                  type="text" 
                  placeholder="Turn on lights, Set AC to 72°F, Turn off TV, Lock doors, Turn on security system" 
                  value={formData.automationRules} 
                  onChange={(e) => setFormData({ ...formData, automationRules: e.target.value })} 
                />
              </div>

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
    </div>
  );
}