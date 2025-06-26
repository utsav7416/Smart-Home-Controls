import React from 'react';
import { useState, useEffect } from 'react';
import { MapPin, Plus, Brain, TrendingUp, Target, MapIcon, XCircle, ChevronLeft, ChevronRight, Home, Wifi, Thermometer, Camera, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg shadow-lg ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 pb-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, className = '', disabled = false, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 px-10 py-5 bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-500/50 ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

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
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      setError(err.message);
      if (options.onError) {
        options.onError(err);
      }
    } finally {
      setIsPending(false);
    }
  };
  return { mutate, isPending, error };
};

const smartHomeFacts = [
  "Smart geofencing reduces home energy consumption by 34% on average",
  "Automated lighting systems save up to $200 annually per household",
  "Geofencing security systems reduce false alarms by 89%",
  "Smart thermostats adapt to your schedule within 3 days of installation",
  "IoT devices create 127 optimization opportunities daily in modern homes",
  "Geofence automation increases home security response time by 400%"
];

const carouselImages = [
  {
    url: "https://www.smarthomeworld.in/wp-content/uploads/2025/03/4-1024x576.jpg",
    alt: "Modern living room with smart home controls"
  },
  {
    url: "https://d6y5eqdcxq8w3.cloudfront.net/assets/blog/prosource_member_blogs/Smart-Home-Climate-Control-and-Lights.webp",
    alt: "Smart lighting and climate control"
  },
  {
    url: "https://preview.redd.it/869yzxqr5ar51.jpg?width=640&crop=smart&auto=webp&s=762b8d68b17930b1bee6459ef060a24026240a4a",
    alt: "Smart home dashboard interface"
  },
  {
    url: "https://oltdesign.com/wp-content/uploads/2025/02/smart-home-technology.jpg",
    alt: "Connected devices in a smart home"
  },
  {
    url: "https://www.ledyilighting.com/wp-content/uploads/2025/05/Factors-To-Consider-Before-Establishing-Smart-Home-Lighting-1024x683.jpeg",
    alt: "Smart lighting setup in a cozy room"
  }
];

function ImageCarousel() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setFade(false);
    const fadeTimeout = setTimeout(() => setFade(true), 50);
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimeout);
    };
  }, [index]);

  const goPrev = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
      setFade(true);
    }, 100);
  };

  const goNext = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % carouselImages.length);
      setFade(true);
    }, 100);
  };

  return (
    <div className="relative w-full h-64 flex items-center justify-center group overflow-hidden rounded-lg shadow-2xl bg-gradient-to-br from-green-900/30 to-slate-900/30">
      <button
        onClick={goPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-green-700/50 rounded-full p-2 transition-all"
        aria-label="Previous"
        tabIndex={0}
      >
        <ChevronLeft className="w-7 h-7 text-green-200" />
      </button>
      <div className={`transition-all duration-700 ease-in-out w-full h-full ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <img
          src={carouselImages[index].url}
          alt={carouselImages[index].alt}
          className="w-full h-64 object-cover rounded-lg shadow-xl"
          style={{
            boxShadow: '0 6px 32px 0 rgba(34,197,94,0.15), 0 1.5px 7px 0 rgba(16,185,129,0.09)'
          }}
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-green-100 text-sm shadow-lg backdrop-blur">
          {carouselImages[index].alt}
        </div>
      </div>
      <button
        onClick={goNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-green-700/50 rounded-full p-2 transition-all"
        aria-label="Next"
        tabIndex={0}
      >
        <ChevronRight className="w-7 h-7 text-green-200" />
      </button>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
        {carouselImages.map((_, i) => (
          <span
            key={i}
            className={`block w-3 h-3 rounded-full transition-all duration-300 ${i === index ? 'bg-green-400' : 'bg-green-900/40'}`}
          />
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
  const [buildingStage, setBuildingStage] = useState(0);
  const [devicesVisible, setDevicesVisible] = useState([]);

  const { data: stats, error: statsError, refetch: refetchStats } = useApiData('geofence-stats', fetchGeofenceStats, 30000);
  const { data: analytics, error: analyticsError } = useApiData('geofence-analytics', fetchAnalytics, 60000);

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
      setFormData({ name: '', address: '', lat: 37.7749, lng: -122.4194, radius: 200 });
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
      setFactIndex((prev) => (prev + 1) % smartHomeFacts.length);
    }, 4000);
    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    if (viewState === 'initial' || viewState === 'loading') {
      const buildingInterval = setInterval(() => {
        setBuildingStage(prev => (prev + 1) % 5);
      }, 1200);
      
      const deviceInterval = setInterval(() => {
        setDevicesVisible(prev => {
          if (prev.length < 6) {
            return [...prev, prev.length];
          }
          return [];
        });
      }, 800);

      return () => {
        clearInterval(buildingInterval);
        clearInterval(deviceInterval);
      };
    }
  }, [viewState]);

  const overallError = error || statsError || analyticsError || createMutation.error || optimizeMutation.error;
  
  if (viewState === 'initial' || viewState === 'loading') {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 select-none">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center space-y-12 z-10 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-green-300 mb-4 smart-home-title">
              Smart Home Geofencing
            </h1>
            <div className="h-16 flex items-center justify-center mb-6">
              <p className="text-2xl text-emerald-200 animate-fade font-medium">
                {smartHomeFacts[factIndex]}
              </p>
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full pulse-bar"></div>
          </div>

          <div className="flex items-center justify-center gap-16 w-full">
            <div className="relative">
              <svg width="300" height="240" viewBox="0 0 300 240" className="house-svg">
                <defs>
                  <linearGradient id="houseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                
                <path d="M50 180 L150 80 L250 180 Z" 
                      className={`house-roof ${buildingStage >= 1 ? 'animate-draw' : 'opacity-0'}`}
                      fill="none" stroke="url(#houseGrad)" strokeWidth="3" />
                
                <rect x="70" y="140" width="160" height="80" 
                      className={`house-walls ${buildingStage >= 2 ? 'animate-draw' : 'opacity-0'}`}
                      fill="none" stroke="url(#houseGrad)" strokeWidth="3" />
                
                <rect x="90" y="160" width="30" height="40" 
                      className={`house-door ${buildingStage >= 3 ? 'animate-draw' : 'opacity-0'}`}
                      fill="none" stroke="url(#houseGrad)" strokeWidth="2" />
                
                <rect x="140" y="160" width="25" height="25" 
                      className={`house-window ${buildingStage >= 4 ? 'animate-draw' : 'opacity-0'}`}
                      fill="none" stroke="url(#houseGrad)" strokeWidth="2" />
                
                <rect x="180" y="160" width="25" height="25" 
                      className={`house-window ${buildingStage >= 4 ? 'animate-draw' : 'opacity-0'}`}
                      fill="none" stroke="url(#houseGrad)" strokeWidth="2" />

                <circle cx="150" cy="120" r="60" 
                        className="geofence-zone-1" 
                        fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeDasharray="5,5" />
                <circle cx="150" cy="120" r="90" 
                        className="geofence-zone-2" 
                        fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" strokeDasharray="8,4" />
              </svg>

              {[
                { icon: Thermometer, x: 60, y: 40, delay: 0 },
                { icon: Lightbulb, x: 240, y: 60, delay: 200 },
                { icon: Camera, x: 280, y: 140, delay: 400 },
                { icon: Wifi, x: 20, y: 140, delay: 600 },
                { icon: Home, x: 150, y: 20, delay: 800 },
                { icon: MapPin, x: 150, y: 280, delay: 1000 }
              ].map((device, index) => (
                <div
                  key={index}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                    devicesVisible.includes(index) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  style={{ left: device.x, top: device.y }}
                >
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-400/50 smart-device">
                    <device.icon className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div className="absolute inset-0 w-12 h-12 rounded-full border border-emerald-400/30 animate-ping"></div>
                </div>
              ))}
            </div>

            <div className="flex flex-col space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: Brain, label: "AI Learning Patterns", desc: "Analyzing daily routines" },
                  { icon: Target, label: "Zone Optimization", desc: "Maximizing efficiency" },
                  { icon: TrendingUp, label: "Energy Monitoring", desc: "Real-time insights" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 bg-emerald-900/20 p-4 rounded-xl border border-emerald-400/20 home-feature">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-emerald-200 font-semibold">{item.label}</h3>
                      <p className="text-emerald-300/70 text-sm">{item.desc}</p>
                    </div>
                    <div className="w-16 h-2 bg-emerald-900/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full progress-bar"></div>
                    </div>
                  </div>
                ))}
              </div>

              {viewState === 'loading' ? (
                <div className="flex flex-col items-center space-y-4 mt-8">
                  <div className="flex space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-emerald-300">Initializing smart zones...</span>
                </div>
              ) : (
                <div className="relative group mt-8">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                  <button 
                    onClick={handleInitiate} 
                    className="relative px-12 py-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xl tracking-wide transform hover:scale-105 transition-all duration-300 w-full"
                  >
                    <Home className="inline-block w-6 h-6 mr-3"/>
                    Initialize Smart Zones
                    <span className="block text-sm font-normal text-emerald-200 mt-1">Begin home automation setup</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-3 text-emerald-400/60">
              <div className="w-2 h-2 bg-emerald-400/60 rounded-full animate-ping"></div>
              <span className="text-sm">Connecting to home automation network...</span>
            </div>
          </div>
        </div>

        <style jsx="true">{`
          .smart-home-title {
            text-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
            animation: titleGlow 3s ease-in-out infinite alternate;
          }
          
          @keyframes titleGlow {
            from { filter: brightness(1); }
            to { filter: brightness(1.2); }
          }
          
          .animate-draw {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: draw 1.5s ease-in-out forwards;
          }
          
          @keyframes draw {
            to { stroke-dashoffset: 0; }
          }
          
          .geofence-zone-1 {
            animation: expandZone 2s ease-in-out infinite;
          }
          
          .geofence-zone-2 {
            animation: expandZone 2s ease-in-out infinite 0.5s;
          }
          
          @keyframes expandZone {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          
          .smart-device {
            animation: devicePulse 2s ease-in-out infinite;
          }
          
          @keyframes devicePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          .home-feature {
            animation: slideIn 0.8s ease-out forwards;
            transform: translateX(20px);
            opacity: 0;
          }
          
          .home-feature:nth-child(1) { animation-delay: 0.2s; }
          .home-feature:nth-child(2) { animation-delay: 0.4s; }
          .home-feature:nth-child(3) { animation-delay: 0.6s; }
          
          @keyframes slideIn {
            to { transform: translateX(0); opacity: 1; }
          }
          
          .progress-bar {
            animation: fillProgress 2s ease-in-out infinite;
          }
          
          @keyframes fillProgress {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
          
          .pulse-bar {
            animation: pulseWidth 3s ease-in-out infinite;
          }
          
          @keyframes pulseWidth {
            0%, 100% { width: 8rem; }
            50% { width: 12rem; }
          }
          
          .animate-fade {
            animation: fadeContent 1s ease-out;
          }
          
          @keyframes fadeContent {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }
  
  if (viewState === 'error') {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-red-400 text-lg">
          Failed to load geofencing data: {error}
        </div>
      </div>
    );
  }

  if (viewState !== 'dashboard' || !geofences) {
    return null;
  }

  const mlMetrics = analytics?.ml_metrics || {};

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {overallError && (
        <div className="bg-red-900/30 text-red-300 p-4 rounded-lg flex items-center gap-2 mb-4 border border-red-500">
          <XCircle className="w-5 h-5" />
          <p>Error: {overallError}. Please ensure the Flask backend is running.</p>
        </div>
      )}
      <div
        className="text-center py-16 rounded-2xl relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://thumbs.dreamstime.com/z/examining-impact-edge-computing-smart-home-security-systems-dusk-group-gathers-to-discuss-how-enhances-highlighting-356998640.jpg?ct=jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
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
        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-md border border-green-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Model Accuracy</p>
                <p className="text-3xl font-bold text-white">{mlMetrics.model_accuracy?.toFixed(1) || 0}%</p>
              </div>
              <Brain className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 backdrop-blur-md border border-emerald-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm">Prediction Confidence</p>
                <p className="text-3xl font-bold text-white">{mlMetrics.prediction_confidence?.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-600/20 to-teal-800/20 backdrop-blur-md border border-teal-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-200 text-sm">Zones Created</p>
                <p className="text-3xl font-bold text-white">{stats?.total_zones || 0}</p>
              </div>
              <MapIcon className="w-8 h-8 text-teal-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-md border border-purple-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Triggers</p>
                <p className="text-3xl font-bold text-white">{stats?.total_triggers || 0}</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-lime-600/20 to-lime-800/20 backdrop-blur-md border border-lime-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lime-200 text-sm">Optimization Success</p>
                <p className="text-3xl font-bold text-white">{mlMetrics.optimization_success_count?.toFixed(1) || 0}%</p>
              </div>
              <Brain className="w-8 h-8 text-lime-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex space-x-4 mb-6">
        {['overview', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
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
                <button
                  onClick={() => optimizeMutation.mutate()}
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1.5"
                  disabled={optimizeMutation.isPending}
                >
                  <Brain className="w-4 h-4" />
                  Optimize
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Zone
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {geofences?.length > 0 ? (
                geofences.map((geofence) => (
                  <Card key={geofence.id} className="bg-green-900/20 border border-green-400/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{geofence.name}</h3>
                          <p className="text-green-200 text-sm mt-1">{geofence.address}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-green-300">
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
                <p className="text-green-300 text-center">No geofences created yet. Click "Add Zone" to get started!</p>
              )}
            </CardContent>
          </Card>
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-tr from-green-900/30 to-slate-900/30 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-2">Smart Home in Action</h2>
              <p className="text-green-100 mb-4 text-base leading-relaxed">
                See how your smart zones come alive. On the right, you'll find a showcase of real-world smart home environments—each image highlights a different aspect of intelligent living. From seamless lighting control to energy-efficient comfort, these visuals offer a glimpse into the possibilities unlocked by geofencing. Whether you're optimizing your climate, streamlining your routines, or simply enjoying the peace of mind that comes with automation, every zone you create brings your home closer to effortless living.
              </p>
              <ul className="text-green-200 text-sm space-y-1 mb-4">
                <li>• Instantly adjust lighting and temperature as you move from room to room.</li>
                <li>• Enjoy personalized comfort—your home adapts to your schedule, not the other way around.</li>
                <li>• Save energy without sacrificing convenience or style.</li>
                <li>• Every image below represents a real scenario powered by smart geofencing.</li>
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
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 bg-black/80 backdrop-blur-lg border border-green-500/40 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-xl">Create New ML-Optimized Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <label className="block text-green-200 text-sm font-medium">Zone Name</label>
                <input
                  className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Home, Work, etc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-green-200 text-sm font-medium">Address</label>
                <input
                  className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="123 Main St, City, Country"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-green-200 text-sm font-medium">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="37.7749"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-green-200 text-sm font-medium">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="-122.4194"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-green-200 text-sm font-medium">Radius (meters)</label>
                <input
                  type="number"
                  className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="200"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) || 200 })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  onClick={handleCreateSubmit}
                  disabled={
                    createMutation.isPending || !formData.name.trim() || !formData.address.trim() ||
                    isNaN(formData.lat) || isNaN(formData.lng) || isNaN(formData.radius) || formData.radius <= 0
                  }
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Zone'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <style jsx>{`
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}



