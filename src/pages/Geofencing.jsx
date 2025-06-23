import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Brain, TrendingUp, Target, MapIcon, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const FLASK_API_URL = process.env.REACT_APP_API_BASE_URL || 'https://smart-home-controls-backend.onrender.com';

let geofencesCache = null;
let geofencesPromise = null;
export function prefetchGeofences() {
  if (!geofencesCache && !geofencesPromise) {
    geofencesPromise = fetch(`${FLASK_API_URL}/api/geofences`)
      .then(res => res.json())
      .then(data => { geofencesCache = data; return data; });
  }
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
      className={`inline-flex items-center justify-center rounded-md text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 px-6 py-2 bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-500/50 ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const fetchGeofences = async () => {
  if (geofencesCache) return geofencesCache;
  const response = await fetch(`${FLASK_API_URL}/api/geofences`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Failed to fetch geofences: ${errorData.error || response.statusText}`);
  }
  const data = await response.json();
  geofencesCache = data;
  return data;
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

const doYouKnowFacts = [
  "Did you know? Geofencing can automate your lights and AC based on your location.",
  "Did you know? Smart zones can reduce your home's energy waste by up to 30%.",
  "Did you know? AI geofencing adapts to your daily routines for comfort and savings.",
  "Did you know? Your smart home learns and optimizes your energy usage over time."
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 37.7749,
    lng: -122.4194,
    radius: 200
  });
  const [showDummyButton, setShowDummyButton] = useState(true);
  const [processingMessage, setProcessingMessage] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [initiateClicked, setInitiateClicked] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const backgrounds = [
    "from-[#232526] to-[#414345]",
    "from-[#283E51] to-[#485563]",
    "from-[#232526] to-[#1a2980]",
    "from-[#0f2027] to-[#2c5364]",
    "from-[#1e3c72] to-[#2a5298]"
  ];

  const { data: geofences, isLoading, error: geofenceError, refetch: refetchGeofences } = useApiData('geofences', fetchGeofences, 30000);
  const { data: stats, error: statsError, refetch: refetchStats } = useApiData('geofence-stats', fetchGeofenceStats, 30000);
  const { data: analytics, error: analyticsError } = useApiData('geofence-analytics', fetchAnalytics, 60000);

  const createMutation = useMutation(createGeofence, {
    onSuccess: (newZone) => {
      geofencesCache = null;
      refetchGeofences();
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
      geofencesCache = null;
      refetchGeofences();
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

  const handleDummyButtonClick = () => {
    setProcessingMessage(true);
    setInitiateClicked(true);
    setTimeout(() => {
      setShowDummyButton(false);
      setProcessingMessage(false);
      setHasLoadedOnce(true);
    }, 3000);
  };

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % doYouKnowFacts.length);
    }, 4000);
    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 6000);
    return () => {
      clearInterval(factInterval);
      clearInterval(bgInterval);
    };
  }, []);

  useEffect(() => {
    prefetchGeofences();
  }, []);

  useEffect(() => {
    if (!showDummyButton && !processingMessage) setHasLoadedOnce(true);
  }, [showDummyButton, processingMessage]);

  const overallError = geofenceError || statsError || analyticsError || createMutation.error || optimizeMutation.error;

  if (((isLoading && !hasLoadedOnce) || showDummyButton) && !hasLoadedOnce) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white overflow-hidden relative">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-400/20 rounded-full animate-pulse"
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
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY_ACzMMPyCEbyYaq8NsBFjD-l1cjwY-jh9fEi9ky1fumk-hmLB81Gq8OBAMEPBIu90ok&usqp=CAU"
              alt="Geofencing Icon"
              className="w-10 h-10 mr-6"
              style={{ objectFit: 'contain' }}
            />
            <div className="text-center max-w-2xl flex-1">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Initializing Geofencing Engine
              </h1>
              <div className="h-16 flex items-center justify-center">
                <p className="text-xl text-green-200 animate-fade-in">
                  {doYouKnowFacts[factIndex]}
                </p>
              </div>
              <p className="text-green-300 mt-2">Location-based automations incoming!</p>
            </div>
            <div style={{ width: 40 }} />
          </div>
          <div className="w-80 h-80 relative mb-12">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-spin" style={{ animationDuration: '8s' }}>
              <div className="absolute w-6 h-6 bg-green-400 rounded-full -top-3 left-1/2 transform -translate-x-1/2 shadow-lg shadow-green-400/50" />
            </div>
            <div className="absolute inset-4 rounded-full border-2 border-emerald-400/40 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
              <div className="absolute w-4 h-4 bg-emerald-400 rounded-full -top-2 left-1/2 transform -translate-x-1/2" />
            </div>
            <div className="absolute inset-8 rounded-full border border-teal-300/50 animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute w-3 h-3 bg-teal-300 rounded-full -top-1.5 left-1/2 transform -translate-x-1/2" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                <Brain className="w-16 h-16 text-green-400 animate-pulse" />
              </div>
            </div>
            <div className="absolute top-0 left-0 w-8 h-8 bg-green-400/80 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-0 left-0 w-7 h-7 bg-teal-400/80 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-cyan-400/80 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
          </div>
          <div className="flex flex-col items-center space-y-6 mt-2 mb-6">
            {processingMessage || initiateClicked ? (
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-green-300">Processing request... Hold on...</span>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
                <Button
                  onClick={handleDummyButtonClick}
                  className="relative bg-gray-900 hover:bg-gray-800 border border-green-400/50 transform hover:scale-105 transition-all duration-300"
                >
                  <Brain className="w-6 h-6 mr-3 animate-pulse" />
                  Initiate Geofencing
                  <span className="ml-3 text-base font-normal text-green-200">Smart zone setup</span>
                </Button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-8 mb-12 w-full max-w-md">
            {[
              { icon: MapPin, label: "Mapping Zones", delay: "0s" },
              { icon: Target, label: "Optimizing Routes", delay: "0.5s" },
              { icon: TrendingUp, label: "Learning Patterns", delay: "1s" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-3">
                <div
                  className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center border border-green-400/30 animate-pulse"
                  style={{ animationDelay: item.delay }}
                >
                  <item.icon className="w-8 h-8 text-green-400" />
                </div>
                <span className="text-sm text-green-300 font-medium">{item.label}</span>
                <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"
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
            <div className="flex items-center space-x-2 text-green-400/60">
              <div className="w-2 h-2 bg-green-400/60 rounded-full animate-ping" />
              <span className="text-sm">Connecting to smart home network...</span>
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
          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }
          .animate-tilt {
            animation: tilt 10s infinite linear;
          }
        `}</style>
      </div>
    );
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
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'bg-green-600 text-white px-4 py-1 text-base' : 'border-green-400/30 text-green-400 bg-transparent px-4 py-1 text-base'}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
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
                <Button
                  onClick={() => optimizeMutation.mutate()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-base"
                  disabled={optimizeMutation.isPending}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Optimize
                </Button>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 text-base"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Zone
                </Button>
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
              <p className="text-green-200 mb-4 text-base leading-relaxed">
                See how your smart zones come alive. On the left, you'll find a showcase of locations & environments.
                Below, you'll find a carousel of images. Each image highlights a different aspect of intelligent living. From seamless lighting control to energy-efficient comfort, these visuals offer a glimpse into the possibilities unlocked by geofencing. Whether you're optimizing your climate, streamlining your routines, or simply enjoying the peace of mind that comes with automation, every zone you create brings your home closer to effortless living.
              </p>
              <ul className="text-green-300 text-sm space-y-1 mb-4">
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
                <Button
                  className="border-green-400 text-green-400 hover:bg-green-900/20 bg-transparent px-4 py-1 text-base"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 px-4 py-1 text-base"
                  onClick={handleCreateSubmit}
                  disabled={
                    createMutation.isPending || !formData.name.trim() || !formData.address.trim() ||
                    isNaN(formData.lat) || isNaN(formData.lng) || isNaN(formData.radius) || formData.radius <= 0
                  }
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Zone'}
                </Button>
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
