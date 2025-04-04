import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCog, FaBell, FaUser } from 'react-icons/fa';

function Navbar() {
  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <FaHome className="text-3xl text-indigo-400" />
            <span className="text-2xl font-bold text-white">SmartHome</span>
          </Link>
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-white hover:text-indigo-400 transition-colors">
              <FaHome className="text-xl" />
              <span>Dashboard</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-2 text-white hover:text-indigo-400 transition-colors">
              <FaCog className="text-xl" />
              <span>Settings</span>
            </Link>
            <Link to="/notifications" className="flex items-center space-x-2 text-white hover:text-indigo-400 transition-colors">
              <FaBell className="text-xl" />
              <span>Notifications</span>
            </Link>
            <Link to="/profile" className="flex items-center space-x-2 bg-indigo-600 px-4 py-2 rounded-full text-white hover:bg-indigo-700 transition-colors">
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