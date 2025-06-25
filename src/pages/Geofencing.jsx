import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Brain, TrendingUp, Target, MapIcon, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const FLASK_API_URL = process.env.REACT_APP_API_BASE_URL || 'https://smart-home-controls-backend.onrender.com';

let geofencesCache = null, geofencesPromise = null, hasInitiatedGeofences = false;

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
  <button 
    className={`inline-flex items-center justify-center rounded-md text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 px-10 py-5 bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-500/50 ${className}`} 
    onClick={onClick} 
    disabled={disabled} 
    {...props}
  >
    {children}
  </button>
);

const doYouKnowFacts = [
  "Did you know? Geofencing can automate your lights and AC based on your location.",
  "Did you know? Smart zones can reduce your home's energy waste by up to 30%.",
  "Did you know? AI geofencing adapts to your daily routines for comfort and savings."
];

const carouselImages = [
  { url: "https://www.smarthomeworld.in/wp-content/uploads/2025/03/4-1024x576.jpg", alt: "Modern living room with smart home controls" },
  { url: "https://d6y5eqdcxq8w3.cloudfront.net/assets/blog/prosource_member_blogs/Smart-Home-Climate-Control-and-Lights.webp", alt: "Smart lighting and climate control" },
  { url: "https://preview.redd.it/869yzxqr5ar51.jpg?width=640&crop=smart&auto=webp&s=762b8d68b17930b1bee6459ef060a24026240a4a", alt: "Smart home dashboard interface" }
];

function ImageCarousel() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  
  useEffect(() => {
    setFade(false);
    const fadeTimeout = setTimeout(() => setFade(true), 50);
    const timer = setTimeout(() => setIndex(prev => (prev + 1) % carouselImages.length), 3500);
    return () => { clearTimeout(timer); clearTimeout(fadeTimeout); };
  }, [index]);
  
  const goPrev = () => { setFade(false); setTimeout(() => { setIndex(prev => (prev - 1 + carouselImages.length) % carouselImages.length); setFade(true); }, 100); };
  const goNext = () => { setFade(false); setTimeout(() => { setIndex(prev => (prev + 1) % carouselImages.length); setFade(true); }, 100); };
  
  return (
    <div className="relative w-full h-56 flex items-center justify-center group overflow-hidden rounded-lg shadow-2xl bg-gradient-to-br from-green-900/30 to-slate-900/30">
      <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-green-700/50 rounded-full p-2 transition-all" aria-label="Previous" tabIndex={0}>
        <ChevronLeft className="w-7 h-7 text-green-200" />
      </button>
      
      <div className={`transition-all duration-700 ease-in-out w-full h-full ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <img src={carouselImages[index].url} alt={carouselImages[index].alt} className="w-full h-56 object-cover rounded-lg shadow-xl" />
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

function Curtain({ revealed, duration = 1200 }) {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none" style={{ display: revealed ? 'none' : 'block' }}>
      <div className="absolute inset-0 flex">
        <div className="curtain-panel curtain-left" style={{
          width: '50%', height: '100%', background: 'linear-gradient(120deg,#0f172a 60%,#22d3ee 100%)',
          transform: revealed ? 'translateX(-100%)' : 'translateX(0)', transition: `transform ${duration}ms cubic-bezier(.77,0,.18,1)`
        }} />
        <div className="curtain-panel curtain-right" style={{
          width: '50%', height: '100%', background: 'linear-gradient(-120deg,#0f172a 60%,#22d3ee 100%)',
          transform: revealed ? 'translateX(100%)' : 'translateX(0)', transition: `transform ${duration}ms cubic-bezier(.77,0,.18,1)`
        }} />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
              Initializing Geofencing Engine
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-green-100 mt-2">
              Adaptive Smart Zones & ML-Driven Location Automation
            </h2>
          </div>
          
          <div className="w-80 h-80 relative mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-spin" style={{ animationDuration: '7s' }}>
              <div className="absolute w-6 h-6 bg-green-400 rounded-full -top-3 left-1/2 transform -translate-x-1/2 shadow-lg shadow-green-400/50" />
            </div>
            <div className="absolute inset-4 rounded-full border-2 border-emerald-400/40 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
              <div className="absolute w-4 h-4 bg-emerald-400 rounded-full -top-2 left-1/2 transform -translate-x-1/2" />
            </div>
            <div className="absolute inset-8 rounded-full border border-teal-300/50 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute w-3 h-3 bg-teal-300 rounded-full -top-1.5 left-1/2 transform -translate-x-1/2" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                <Brain className="w-16 h-16 text-green-400 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="w-full max-w-xs">
            <ImageCarousel />
          </div>
          
          <div className="mt-8 text-lg text-green-200">
            {doYouKnowFacts[0]}
          </div>
        </div>
      </div>
      
      <style>{`
        .curtain-panel { position: relative; }
        .curtain-left { border-top-right-radius: 3vw; border-bottom-right-radius: 3vw; }
        .curtain-right { border-top-left-radius: 3vw; border-bottom-left-radius: 3vw; }
      `}</style>
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
  const [curtainRevealed, setCurtainRevealed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('curtainRevealed_geofence')) || false; } catch { return false; }
  });

  const { data: stats, error: statsError, refetch: refetchStats } = useApiData('geofence-stats', fetchGeofenceStats, 30000);
  const { data: analytics, error: analyticsError } = useApiData('geofence-analytics', fetchAnalytics, 60000);

  useEffect(() => {
    if (!curtainRevealed && viewState === 'initial') {
      setTimeout(() => {
        setCurtainRevealed(true);
        localStorage.setItem('curtainRevealed_geofence', 'true');
      }, 1200);
    }
  }, [curtainRevealed, viewState]);

  const handleInitiate = () => {
    if (viewState === 'initial') {
      hasInitiatedGeofences = true;
      setViewState('loading');
      prefetchGeofences()
        .then(data => { setGeofences(data); setViewState('dashboard'); })
        .catch(e => { setError(e.message); setViewState('error'); });
    }
  };

  const refetchGeofencesData = () => {
    prefetchGeofences().then(data => setGeofences(data)).catch(e => setError(e.message));
  };

  const createMutation = useMutation(createGeofence, {
    onSuccess: () => {
      refetchGeofencesData();
      refetchStats();
      setShowCreateForm(false);
      setFormData({ name: '', address: '', lat: 37.7749, lng: -122.4194, radius: 200 });
    }
  });

  const optimizeMutation = useMutation(optimizeGeofences, {
    onSuccess: (result) => { refetchGeofencesData(); refetchStats(); alert(result.message); }
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
        .then(data => { setGeofences(data); setViewState('dashboard'); })
        .catch(e => { setError(e.message); setViewState('error'); });
    } else if (geofences) {
      setViewState('dashboard');
    }
  }, [geofences]);

  const overallError = error || statsError || analyticsError || createMutation.error || optimizeMutation.error;

  if (!curtainRevealed) {
    return <Curtain revealed={curtainRevealed} duration={1200} />;
  }

  if (viewState === 'initial' || viewState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white overflow-hidden flex flex-col items-center justify-center">
        <div className="w-80 h-80 relative mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-spin" style={{ animationDuration: '7s' }}>
            <div className="absolute w-6 h-6 bg-green-400 rounded-full -top-3 left-1/2 transform -translate-x-1/2 shadow-lg shadow-green-400/50" />
          </div>
          <div className="absolute inset-4 rounded-full border-2 border-emerald-400/40 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
            <div className="absolute w-4 h-4 bg-emerald-400 rounded-full -top-2 left-1/2 transform -translate-x-1/2" />
          </div>
          <div className="absolute inset-8 rounded-full border border-teal-300/50 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute w-3 h-3 bg-teal-300 rounded-full -top-1.5 left-1/2 transform -translate-x-1/2" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Brain className="w-16 h-16 text-green-400 animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="mb-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
            Initializing Geofencing Engine
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-green-100 mt-2">
            Adaptive Smart Zones & ML-Driven Location Automation
          </h2>
        </div>
        
        <div className="w-full max-w-xs mb-6">
          <ImageCarousel />
        </div>
        
        <div className="text-lg text-green-200 mb-8">
          {doYouKnowFacts[0]}
        </div>
        
        <Button onClick={handleInitiate} className="bg-green-700 hover:bg-green-800 border border-green-400/50">
          <Brain className="w-6 h-6 mr-3 animate-pulse" />
          Initiate Geofencing
          <span className="ml-3 text-base font-normal text-green-200">Smart zone setup</span>
        </Button>
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
    <div className="p-6 space-y-6 animate-fade-in">
      {overallError && (
        <div className="bg-red-900/30 text-red-300 p-4 rounded-lg flex items-center gap-2 mb-4 border border-red-500">
          <XCircle className="w-5 h-5" />
          <p>Error: {overallError}. Please ensure the Flask backend is running.</p>
        </div>
      )}
      
      <div className="text-center py-16 rounded-2xl relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('https://thumbs.dreamstime.com/z/examining-impact-edge-computing-smart-home-security-systems-dusk-group-gathers-to-discuss-how-enhances-highlighting-356998640.jpg?ct=jpeg')`,
          backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
        }}>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">AI-Powered Geofencing Control</h1>
          <p className="text-green-200 text-xl drop-shadow-md">Machine learning algorithms optimizing your location-based automation</p>
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
        {['overview', 'analytics'].map(tab => (
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
                <button onClick={() => optimizeMutation.mutate()} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1.5" disabled={optimizeMutation.isPending}>
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
              {geofences?.length > 0 ? geofences.map(geofence => (
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
              )) : (
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
                <li>• Instantly adjust lighting and temperature as you move from room to room.</li>
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
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #22d3ee', borderRadius: '8px', color: 'white' }} />
                    <Line type="monotone" dataKey="consumption" stroke="#ef4444" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} name="Predicted" />
                    <Line type="monotone" dataKey="optimized" stroke="#22d3ee" strokeWidth={2} name="Optimized" />
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
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #22d3ee', borderRadius: '8px', color: 'white' }} />
                    <Bar dataKey="efficiency" fill="#22d3ee" radius={[4, 4, 0, 0]} />
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
                <input className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Home, Work, etc." value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              
              <div className="space-y-4">
                <label className="block text-green-200 text-sm font-medium">Address</label>
                <input className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="123 Main St, City, Country" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-green-200 text-sm font-medium">Latitude</label>
                  <input type="number" step="0.0001" className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="37.7749" value={formData.lat} onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })} />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-green-200 text-sm font-medium">Longitude</label>
                  <input type="number" step="0.0001" className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="-122.4194" value={formData.lng} onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-green-200 text-sm font-medium">Radius (meters)</label>
                <input type="number" className="w-full p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="200" value={formData.radius} onChange={e => setFormData({ ...formData, radius: parseInt(e.target.value) || 200 })} />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50" onClick={handleCreateSubmit} disabled={createMutation.isPending || !formData.name.trim() || !formData.address.trim() || isNaN(formData.lat) || isNaN(formData.lng) || isNaN(formData.radius) || formData.radius <= 0}>
                  {createMutation.isPending ? 'Creating...' : 'Create Zone'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <style>{`
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
