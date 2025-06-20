import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import About from './pages/About';
import Geofencing from './pages/Geofencing';
import Analytics from './pages/Analytics';
import SmartRoutinesDashboard from './pages/SmartRoutinesDashboard';

import { preloadAnalyticsData } from './pages/Analytics';
import { preloadGeofencingData } from './pages/Geofencing';

function App() {
  useEffect(() => {
    const preloadAllData = async () => {
      console.log('🚀 Starting background data preload on app startup...');
      
      try {
        const [analyticsResult, geofencingResult] = await Promise.allSettled([
          preloadAnalyticsData(),
          preloadGeofencingData()
        ]);
        
        console.log('📊 Analytics preload:', analyticsResult.status);
        console.log('🗺️ Geofencing preload:', geofencingResult.status);
        
        if (analyticsResult.status === 'fulfilled') {
          console.log('✅ Analytics data ready for instant access');
        }
        if (geofencingResult.status === 'fulfilled') {
          console.log('✅ Geofencing data ready for instant access');
        }
      } catch (error) {
        console.log('❌ Background preload error:', error);
      }
    };
    
    preloadAllData();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#07051c]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/smart-routines" element={<SmartRoutinesDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/geofencing" element={<Geofencing />} />
          <Route path="/anomaly-analytics" element={<Analytics />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
