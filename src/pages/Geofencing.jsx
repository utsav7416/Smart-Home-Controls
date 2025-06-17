import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Clock, Zap, Brain, TrendingUp, Target, MapIcon, XCircle, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

const FLASK_API_URL = process.env.REACT_APP_API_BASE_URL || 'https://smart-home-controls-backend.onrender.com';

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 pb-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Toast = ({ message, type = 'info', onClose }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300 ${
    type === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' :
    type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' :
    'bg-blue-900/90 border-blue-500 text-blue-100'
  }`}>
    <div className="flex items-center gap-2">
      {type === 'error' && <XCircle className="w-5 h-5" />}
      {type === 'success' && <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">✓</div>}
      {type === 'info' && <div className="w-5 h-5 rounded-full bg-blue-500" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/70 hover:text-white">×</button>
    </div>
  </div>
);

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP ${response.status}: ${errorData.error || errorData.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }
    throw error;
  }
};

const fetchGeofences = async () => {
  console.log('Fetching geofences from:', `${FLASK_API_URL}/api/geofences`);
  return await fetchWithTimeout(`${FLASK_API_URL}/api/geofences`);
};

const fetchGeofenceStats = async () => {
  console.log('Fetching stats from:', `${FLASK_API_URL}/api/geofences/stats`);
  return await fetchWithTimeout(`${FLASK_API_URL}/api/geofences/stats`);
};

const createGeofence = async (geofenceData) => {
  return await fetchWithTimeout(`${FLASK_API_URL}/api/geofences`, {
    method: 'POST',
    body: JSON.stringify(geofenceData)
  });
};

const fetchAnalytics = async () => {
  console.log('Fetching analytics from:', `${FLASK_API_URL}/api/geofences/analytics`);
  return await fetchWithTimeout(`${FLASK_API_URL}/api/geofences/analytics`);
};

const optimizeGeofences = async () => {
  return await fetchWithTimeout(`${FLASK_API_URL}/api/geofences/optimize`, {
    method: 'POST',
    body: JSON.stringify({})
  });
};

const useApiData = (key, fetchFn, refetchInterval = 30000) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async (isRetry = false) => {
    try {
      if (!isRetry) setIsLoading(true);
      setError(null);
      
      const result = await fetchFn();
      setData(result);
      setRetryCount(0);
      
      console.log(`Successfully fetched ${key}:`, result);
    } catch (err) {
      console.error(`Error fetching ${key}:`, err.message);
      setError(err.message);
      
      // Auto-retry logic with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData(true);
        }, delay);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (refetchInterval) {
      const interval = setInterval(() => fetchData(true), refetchInterval);
      return () => clearInterval(interval);
    }
  }, [key, refetchInterval]);

  return { data, isLoading, error, refetch: () => fetchData(false), retryCount };
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
      console.error("Mutation error:", err.message);
      setError(err.message);
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
};

const loadingQuotes = [
  "Our geofencing elves are busy at work, brewing up some geofencing magic! Hold on...",
  "Don't wander off! We're busy setting up invisible boundaries to keep your smart devices in line.",
  "Please wait while we convince your thermostat that it's okay to save energy, even when you're just stepping out for milk.",
  "Calculating optimal geofence parameters using advanced ML algorithms...",
  "Analyzing location patterns and energy consumption data...",
];

export default function Geofencing() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 37.7749,
    lng: -122.4194,
    radius: 200
  });
  const [formErrors, setFormErrors] = useState({});

  const { data: geofences, isLoading, error: geofenceError, refetch: refetchGeofences, retryCount } = useApiData('geofences', fetchGeofences, 30000);
  const { data: stats, error: statsError, refetch: refetchStats } = useApiData('geofence-stats', fetchGeofenceStats, 30000);
  const { data: analytics, error: analyticsError, refetch: refetchAnalytics } = useApiData('geofence-analytics', fetchAnalytics, 60000);

  const createMutation = useMutation(createGeofence, {
    onSuccess: (result) => {
      refetchGeofences();
      refetchStats();
      setShowCreateForm(false);
      setFormData({ name: '', address: '', lat: 37.7749, lng: -122.4194, radius: 200 });
      setFormErrors({});
      showToast(`Zone "${result.name}" created successfully!`, 'success');
    },
    onError: (err) => {
      showToast(`Failed to create zone: ${err.message}`, 'error');
    }
  });

  const optimizeMutation = useMutation(optimizeGeofences, {
    onSuccess: (result) => {
      refetchGeofences();
      refetchStats();
      refetchAnalytics();
      showToast(result.message || 'Geofences optimized successfully!', 'success');
    },
    onError: (err) => {
      showToast(`Optimization failed: ${err.message}`, 'error');
    }
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Zone name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Zone name must be at least 2 characters';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (isNaN(formData.lat) || formData.lat < -90 || formData.lat > 90) {
      errors.lat = 'Latitude must be between -90 and 90';
    }
    
    if (isNaN(formData.lng) || formData.lng < -180 || formData.lng > 180) {
      errors.lng = 'Longitude must be between -180 and 180';
    }
    
    if (isNaN(formData.radius) || formData.radius < 50 || formData.radius > 5000) {
      errors.radius = 'Radius must be between 50 and 5000 meters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = () => {
    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  const overallError = geofenceError || statsError || analyticsError;

  if (isLoading && !geofences) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen flex-col bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <div className="text-white text-lg mb-4">
            Loading ML-powered geofencing data...
            {retryCount > 0 && ` (Retry ${retryCount}/3)`}
          </div>
          <p className="text-green-300 text-md italic animate-pulse max-w-md">
            {loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)]}
          </p>
        </div>
      </div>
    );
  }

  const mlMetrics = analytics?.ml_metrics || {};

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {overallError && (
        <div className="bg-red-900/30 text-red-300 p-4 rounded-lg flex items-center gap-2 mb-4 border border-red-500/50 backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Connection Error</p>
            <p className="text-sm text-red-200 mt-1">
              {overallError} - Please ensure the Flask backend is running and accessible.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              refetchGeofences();
              refetchStats();
              refetchAnalytics();
            }}
            className="border-red-400/50 text-red-300 hover:bg-red-900/50"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div
        className="text-center py-16 rounded-2xl relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://thumbs.dreamstime.com/z/examining-impact-edge-computing-smart-home-security-systems-dusk-group-gathers-to-discuss-how-enhances-highlighting-356998640.jpg?ct=jpeg')`,
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
                <p className="text-3xl font-bold text-white">{mlMetrics.model_accuracy?.toFixed(1) || '0.0'}%</p>
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
                <p className="text-3xl font-bold text-white">{mlMetrics.prediction_confidence?.toFixed(1) || '0.0'}%</p>
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
                <p className="text-3xl font-bold text-white">{mlMetrics.optimization_success_count?.toFixed(1) || '0.0'}%</p>
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
            variant={activeTab === tab ? 'default' : 'outline'}
            className={activeTab === tab ? 'bg-green-600 text-white hover:bg-green-700' : 'border-green-400/30 text-green-400 hover:bg-green-900/20'}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                  disabled={optimizeMutation.isPending}
                >
                  {optimizeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  {optimizeMutation.isPending ? 'Optimizing...' : 'Optimize'}
                </Button>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Zone
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {geofences && geofences.length > 0 ? (
                geofences.map((geofence) => (
                  <Card key={geofence.id} className="bg-green-900/20 border border-green-400/30 hover:bg-green-900/30 transition-colors">
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
                <div className="text-center py-8">
                  <MapPin className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
                  <p className="text-green-300 text-center">No geofences created yet.</p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Zone
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <img
              src="https://www.smarthomeworld.in/wp-content/uploads/2025/03/4-1024x576.jpg"
              alt="Smart Home Security"
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <img
              src="https://d6y5eqdcxq8w3.cloudfront.net/assets/blog/prosource_member_blogs/Smart-Home-Climate-Control-and-Lights.webp"
              alt="Smart Home Climate Control"
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line type="monotone" dataKey="consumption" stroke="#ef4444" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="optimized" stroke="#22c55e" strokeWidth={2} name="Optimized" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
                  <p className="text-green-300">No energy optimization data available.</p>
                </div>
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="efficiency" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
                  <p className="text-green-300">No zone efficiency data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900/95 backdrop-blur-md border border-green-400/30 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Create New ML-Optimized Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-green-200 text-sm block mb-1">Zone Name *</label>
                <input
                  className={`w-full p-3 bg-green-900/20 border rounded text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                    formErrors.name ? 'border-red-400' : 'border-green-400/30'
                  }`}
                  placeholder="e.g., Home, Work, Gym"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
              </div>
              
              <div>
                <label className="text-green-200 text-sm block mb-1">Address *</label>
                <input
                  className={`w-full p-3 bg-green-900/20 border rounded text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                    formErrors.address ? 'border-red-400' : 'border-green-400/30'
                  }`}
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                {formErrors.address && <p className="text-red-400 text-xs mt-1">{formErrors.address}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-green-200 text-sm block mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    className={`w-full p-3 bg-green-900/20 border rounded text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                      formErrors.lat ? 'border-red-400' : 'border-green-400/30'
                    }`}
                    placeholder="37.7749"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                  />
                  {formErrors.lat && <p className="text-red-400 text-xs mt-1">{formErrors.lat}</p>}
                </div>
                
                <div>
                  <label className="text-green-200 text-sm block mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    className={`w-full p-3 bg-green-900/20 border rounded text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                      formErrors.lng ? 'border-red-400' : 'border-green-400/30'
                    }`}
                    placeholder="-122.4194"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                  />
                  {formErrors.lng && <p className="text-red-400 text-xs mt-1">{formErrors.lng}</p>}
                </div>
              </div>
              
              <div>
                <label className="text-green-200 text-sm block mb-1">Radius (meters) *</label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  className={`w-full p-3 bg-green-900/20 border rounded text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                    formErrors.radius ? 'border-red-400' : 'border-green-400/30'
                  }`}
                  placeholder="200"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) || 200 })}
                />
                {formErrors.radius && <p className="text-red-400 text-xs mt-1">{formErrors.radius}</p>}
                <p className="text-green-300/70 text-xs mt-1">Recommended: 100-500 meters for optimal performance</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormErrors({});
                  }}
                  variant="outline"
                  className="flex-1 border-green-400/30 text-green-400 hover:bg-green-900/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSubmit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Zone'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
