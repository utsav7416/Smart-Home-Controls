import { useState, useEffect } from 'react';
import { MapPin, Plus, Clock, Zap, Brain, TrendingUp, Target, MapIcon, XCircle, Shield, Battery, Wifi, Settings } from 'lucide-react';
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
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8'
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

const fetchGeofences = async () => {
  console.log('Fetching from:', `${FLASK_API_URL}/api/geofences`);
  const response = await fetch(`${FLASK_API_URL}/api/geofences`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Failed to fetch geofences: ${errorData.error || response.statusText}`);
  }
  return await response.json();
};

const fetchGeofenceStats = async () => {
  console.log('Fetching from:', `${FLASK_API_URL}/api/geofences/stats`);
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
  return await response.json();
};

const fetchAnalytics = async () => {
  console.log('Fetching analytics from:', `${FLASK_API_URL}/api/geofences/analytics`);
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
      console.error(`Error fetching ${key}:`, err.message);
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
      console.error("Mutation error:", err.message);
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

  const { data: geofences, isLoading, error: geofenceError, refetch: refetchGeofences } = useApiData('geofences', fetchGeofences, 30000);
  const { data: stats, error: statsError, refetch: refetchStats } = useApiData('geofence-stats', fetchGeofenceStats, 30000);
  const { data: analytics, error: analyticsError } = useApiData('geofence-analytics', fetchAnalytics, 60000);

  const createMutation = useMutation(createGeofence, {
    onSuccess: () => {
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

  const overallError = geofenceError || statsError || analyticsError || createMutation.error || optimizeMutation.error;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Loading ML-powered geofencing data...This may take some time... Your patience is appreciated</div>
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
          <p className="text-green-200 text-xl drop-shadow-md mb-6">
            Machine learning algorithms optimizing your location-based automation
          </p>
          <p className="text-green-100 text-lg drop-shadow-md max-w-4xl mx-auto">
            Experience the future of smart home automation with our advanced geofencing technology. 
            Our AI-driven system learns your patterns, predicts your needs, and optimizes energy consumption 
            automatically based on your location and movement patterns.
          </p>
        </div>
      </div>

      {/* Feature Introduction Section */}
      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-md border border-green-400/20">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Revolutionary Smart Home Geofencing</h2>
            <p className="text-green-200 text-lg max-w-4xl mx-auto">
              Transform your home into an intelligent ecosystem that responds to your presence. Our machine learning algorithms 
              continuously analyze your location patterns to create the perfect environment before you even arrive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="bg-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">AI Learning</h3>
              <p className="text-green-300 text-sm">Advanced algorithms learn your daily routines and preferences</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Energy Optimization</h3>
              <p className="text-green-300 text-sm">Automatically optimize heating, cooling, and lighting systems</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Smart Security</h3>
              <p className="text-green-300 text-sm">Intelligent security responses based on occupancy patterns</p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Predictive Automation</h3>
              <p className="text-green-300 text-sm">Anticipate needs and prepare your home environment in advance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-md border border-green-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Model Accuracy</p>
                <p className="text-3xl font-bold text-white">{mlMetrics.model_accuracy?.toFixed(1) || 0}%</p>
                <p className="text-green-300 text-xs mt-1">Prediction reliability</p>
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
                <p className="text-emerald-300 text-xs mt-1">Algorithm certainty</p>
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
                <p className="text-teal-300 text-xs mt-1">Active geofences</p>
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
                <p className="text-purple-300 text-xs mt-1">Automation events</p>
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
                <p className="text-lime-300 text-xs mt-1">Energy savings rate</p>
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
            className={activeTab === tab ? 'bg-green-600 text-white' : 'border-green-400/30 text-green-400'}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
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
                    <Brain className="w-4 h-4 mr-2" />
                    Optimize
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
                <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4 mb-4">
                  <p className="text-green-200 text-sm mb-2">
                    <strong>Smart Zone Management:</strong> Create intelligent geographical boundaries that trigger automated responses. 
                    Each zone uses machine learning to optimize energy consumption, security settings, and comfort preferences based on your patterns.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-green-300">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      Real-time monitoring
                    </span>
                    <span className="flex items-center gap-1">
                      <Battery className="w-3 h-3" />
                      Energy optimization
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Predictive automation
                    </span>
                  </div>
                </div>
                
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
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
                    <p className="text-green-300 text-center mb-2">No geofences created yet</p>
                    <p className="text-green-400 text-sm text-center">Click "Add Zone" to create your first intelligent automation zone!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
              <CardHeader>
                <CardTitle className="text-white">How Smart Geofencing Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="text-white font-semibold">Location Detection</h4>
                      <p className="text-green-300 text-sm">Advanced GPS and network-based positioning tracks your movement with precision while respecting privacy.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="text-white font-semibold">Pattern Learning</h4>
                      <p className="text-green-300 text-sm">AI algorithms analyze your daily routines, arrival times, and preferences to build predictive models.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="text-white font-semibold">Smart Automation</h4>
                      <p className="text-green-300 text-sm">Automatically adjust temperature, lighting, security, and other systems based on your predicted needs.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">4</div>
                    <div>
                      <h4 className="text-white font-semibold">Continuous Optimization</h4>
                      <p className="text-green-300 text-sm">The system learns from every interaction, continuously improving efficiency and comfort.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Image Section */}
          <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Smart Home Technology Showcase</CardTitle>
              <p className="text-green-300 text-center mt-2">
                Experience the cutting-edge integration of AI-powered automation and intelligent home security systems
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-_eF4UTYx2njHANYE9Y0wopBnqMknNcNRiw&s"
                    alt="Smart Home Security System"
                    className="w-full h-80 object-cover rounded-xl shadow-2xl border border-green-400/20"
                  />
                  <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Advanced Security Integration</h3>
                    <p className="text-green-300 text-sm">
                      Our geofencing technology seamlessly integrates with state-of-the-art security systems, 
                      providing intelligent threat detection and automated response protocols. When you're away, 
                      the system heightens security measures, and when you return, it seamlessly disarms to welcome you home.
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-green-400">
                      <span>• Facial Recognition</span>
                      <span>• Motion Detection</span>
                      <span>• Smart Alerts</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <img
                    src="https://d6y5eqdcxq8w3.cloudfront.net/assets/blog/prosource_member_blogs/Smart-Home-Climate-Control-and-Lights.webp"
                    alt="Smart Home Climate Control and Lighting"
                    className="w-full h-80 object-cover rounded-xl shadow-2xl border border-green-400/20"
                  />
                  <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Intelligent Climate & Lighting Control</h3>
                    <p className="text-blue-300 text-sm">
                      Experience unprecedented comfort with AI-driven climate and lighting management. The system learns 
                      your preferences for different times of day and weather conditions, automatically adjusting temperature, 
                      humidity, and lighting to create the perfect ambiance while maximizing energy efficiency.
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-blue-400">
                      <span>• Adaptive Lighting</span>
                      <span>• Climate Prediction</span>
                      <span>• Energy Optimization</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 backdrop-blur-md border border-green-400/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white text-center mb-6">Why Choose AI-Powered Geofencing?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-3">Reduce Energy Costs</h3>
                  <p className="text-green-300 text-sm leading-relaxed">
                    Save up to 30% on energy bills through intelligent automation that ensures your home systems 
                    only operate when needed, learning from your patterns to eliminate waste.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-3">Enhanced Security</h3>
                  <p className="text-blue-300 text-sm leading-relaxed">
                    Intelligent security responses that adapt to your presence, automatically arming systems when you leave 
                    and creating the perfect welcome environment when you return home.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-3">Effortless Living</h3>
                  <p className="text-purple-300 text-sm leading-relaxed">
                    Experience true home automation that anticipates your needs, from pre-heating your home before arrival 
                    to adjusting lighting based on time of day and weather conditions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Introduction */}
          <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Advanced Analytics Dashboard</h2>
              <p className="text-green-300 mb-4">
                Dive deep into your smart home's performance with comprehensive analytics powered by machine learning. 
                Monitor energy optimization, track prediction accuracy, and discover patterns in your home automation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3">
                  <h4 className="text-white font-semibold text-sm">Energy Optimization</h4>
                  <p className="text-green-300 text-xs mt-1">Real-time and predictive energy consumption analysis</p>
                </div>
                <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-3">
                  <h4 className="text-white font-semibold text-sm">Zone Efficiency</h4>
                  <p className="text-blue-300 text-xs mt-1">Performance metrics for each geofenced area</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-3">
                  <h4 className="text-white font-semibold text-sm">ML Model Performance</h4>
                  <p className="text-purple-300 text-xs mt-1">Track prediction accuracy and learning progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
                <CardHeader>
                  <CardTitle className="text-white">24h Energy Optimization</CardTitle>
                  <p className="text-green-300 text-sm">
                    Compare actual consumption vs. AI predictions and optimized usage patterns
                  </p>
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
                        <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} name="Predicted" />
                        <Line type="monotone" dataKey="optimized" stroke="#22c55e" strokeWidth={2} name="Optimized" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
                      <p className="text-green-300 text-center">No energy optimization data available.</p>
                      <p className="text-green-400 text-sm text-center mt-2">Data will appear as the system learns your patterns</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-md border border-green-400/20">
                <CardHeader>
                  <CardTitle className="text-white">Zone Efficiency</CardTitle>
                  <p className="text-green-300 text-sm">
                    Performance metrics showing how well each geofenced zone is optimized
                  </p>
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
                    <div className="text-center py-12">
                      <Target className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
                      <p className="text-green-300 text-center">No zone efficiency data available.</p>
                      <p className="text-green-400 text-sm text-center mt-2">Create geofences to see efficiency metrics</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-md border border-green-400/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">ML Model Accuracy Over Time</CardTitle>
                  <p className="text-green-300 text-sm">
                    Track how the machine learning model's prediction accuracy improves as it learns from your behavior
                  </p>
                </CardHeader>
                <CardContent>
                  {analytics.prediction_accuracy && analytics.prediction_accuracy.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.prediction_accuracy}>
                        <defs>
                          <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#22c55e"
                          fillOpacity={1}
                          fill="url(#accuracyGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
                      <p className="text-green-300 text-center">No prediction accuracy data available.</p>
                      <p className="text-green-400 text-sm text-center mt-2">Historical accuracy data will appear as the model trains</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-black/90 backdrop-blur-md border border-green-400/30 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Create New ML-Optimized Zone</CardTitle>
              <p className="text-green-300 text-sm">
                Define a geographical area where smart automation will learn and optimize your home environment
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-green-200 text-sm block mb-1">Zone Name</label>
                <input
                  className="w-full p-2 bg-green-900/20 border border-green-400/30 rounded text-white placeholder-green-400/50"
                  placeholder="e.g., Home, Work, Gym"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-green-200 text-sm block mb-1">Address</label>
                <input
                  className="w-full p-2 bg-green-900/20 border border-green-400/30 rounded text-white placeholder-green-400/50"
                  placeholder="Enter full address for accurate positioning"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-green-200 text-sm block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full p-2 bg-green-900/20 border border-green-400/30 rounded text-white placeholder-green-400/50"
                    placeholder="37.7749"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-green-200 text-sm block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full p-2 bg-green-900/20 border border-green-400/30 rounded text-white placeholder-green-400/50"
                    placeholder="-122.4194"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-green-200 text-sm block mb-1">Detection Radius (meters)</label>
                <input
                  type="number"
                  className="w-full p-2 bg-green-900/20 border border-green-400/30 rounded text-white placeholder-green-400/50"
                  placeholder="200"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) || 200 })}
                />
                <p className="text-green-400/70 text-xs mt-1">Recommended: 100-500m for optimal performance</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1 border-green-400/30 text-green-400 hover:bg-green-900/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSubmit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={
                    createMutation.isPending ||
                    !formData.name.trim() ||
                    !formData.address.trim() ||
                    isNaN(formData.lat) ||
                    isNaN(formData.lng) ||
                    isNaN(formData.radius) ||
                    formData.radius <= 0
                  }
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Zone'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}