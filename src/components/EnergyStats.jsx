import React from 'react';
import { FaBolt, FaPlug } from 'react-icons/fa';

function EnergyStats({ energyUsage, activeDevices, totalDevices }) {
  
  return (
    
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Energy Usage</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <FaBolt className="text-yellow-400 text-3xl mx-auto mb-2" />
          <p className="text-gray-300 mb-1">Energy Today</p>
          <p className="text-2xl font-bold text-white">{energyUsage} kWh</p>
        </div>
        <div className="text-center">
          <FaPlug className="text-green-400 text-3xl mx-auto mb-2" />
          <p className="text-gray-300 mb-1">Active Devices</p>
          <p className="text-2xl font-bold text-white">{activeDevices} / {totalDevices}</p>
        </div>
      </div>
    </div>
  );
}

export default EnergyStats;
