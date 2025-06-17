import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCog, FaFileContract, FaUser, FaInfoCircle, FaMapMarkerAlt, FaChartLine, FaEnvelope } from 'react-icons/fa';

function Navbar() {
 return (
   <nav className="bg-gradient-to-r from-black to-blue-800 border-b border-slate-200 shadow-lg">
     <div className="container mx-auto px-4">
       <div className="flex items-center justify-between h-20">
         <Link to="/" className="flex items-center space-x-3">
           <FaHome className="text-3xl text-indigo-400" />
           <span className="text-2xl font-bold text-white">SmartHome</span>
         </Link>
         
         <div className="flex items-center space-x-8">
           <Link to="/" className="flex items-center space-x-2 text-white hover:text-indigo-400 transition-colors">
             <FaHome className="text-xl" />
             <span>Dashboard</span>
           </Link>
           <Link to="/smart-routines" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
             <FaCog className="text-xl" />
             <span>Smart Routines</span>
           </Link>
           <Link to="/geofencing" className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors">
             <FaMapMarkerAlt className="text-xl" />
             <span>Geofencing</span>
           </Link>
           <Link to="/anomaly-analytics" className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors">
             <FaChartLine className="text-xl" />
             <span>Anomaly Analytics</span>
           </Link>
           <Link to="/about" className="flex items-center space-x-2 text-white hover:text-indigo-400 transition-colors">
             <FaInfoCircle className="text-xl" />
             <span>About</span>
           </Link>
           <Link to="/contact" className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors">
             <FaEnvelope className="text-xl" />
             <span>Contact</span>
           </Link>
           <Link to="/terms" className="flex items-center space-x-2 text-white hover:text-indigo-400 transition-colors">
             <FaFileContract className="text-xl" />
             <span>Terms of Service</span>
           </Link>
           <Link to="/profile" className="flex items-center space-x-2 bg-black px-4 py-2 rounded-full text-white hover:bg-gray-800 transition-colors">
             <FaUser className="text-xl" />
             <span>Profile</span>
           </Link>
         </div>
       </div>
     </div>
   </nav>
 );
}

export default Navbar;