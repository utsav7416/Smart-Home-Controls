import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import About from './pages/About';
import Geofencing, { prefetchGeofences } from './pages/Geofencing';
import Analytics, { prefetchAnalytics } from './pages/Analytics';
import SmartRoutinesDashboard from './pages/SmartRoutinesDashboard';

let prefetched = false;
function triggerPrefetch() {
  if (!prefetched) {
    prefetched = true;
    Promise.all([
      prefetchGeofences(),
      prefetchAnalytics()
    ]);
  }
}

triggerPrefetch();

function App() {
  useEffect(() => {
    triggerPrefetch();
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
