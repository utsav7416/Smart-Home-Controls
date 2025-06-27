import React, { useState, useEffect } from 'react';
import { FaBolt, FaPlug } from 'react-icons/fa';

function EnergyStats() {
  const [energyData, setEnergyData] = useState({
    totalEnergyUsage: 2.5,
    activeDevices: 4,
    totalDevices: 20
  });

  const devicePowerConsumption = {
    'Main Light': 60,
    'Fan': 75,
    'AC': 3500,
    'TV': 150,
    'Microwave': 1000,
    'Refrigerator': 150,
    'Shower': 500, 
    'Water Heater': 4000,
    'Dryer': 3000
  };

  const calculateDeviceEnergy = (device) => {
    if (!device.isOn) return 0;
    
    const basePower = devicePowerConsumption[device.name] || 100;
    let powerMultiplier = 1;

    switch (device.property) {
      case 'brightness':
        powerMultiplier = device.value / 100;
        break;
      case 'speed':
        powerMultiplier = device.value / 100;
        break;
      case 'temp':
      case 'temperature':
        if (device.name === 'AC') {
          powerMultiplier = Math.abs(72 - device.value) / 20 + 0.5;
        } else {
          powerMultiplier = device.value / 100;
        }
        break;
      case 'volume':
        powerMultiplier = 0.8 + (device.value / 100) * 0.4; 
        break;
      case 'pressure':
        powerMultiplier = device.value / 100;
        break;
      case 'power':
        powerMultiplier = device.value / 100;
        break;
      default:
        powerMultiplier = 1;
    }

    return (basePower * powerMultiplier) / 1000;
  };

  const calculateEnergyData = () => {
    try {
      const storedDevices = localStorage.getItem('deviceStates');
      if (storedDevices) {
        const parsedDevices = JSON.parse(storedDevices);
        
        let totalEnergy = 0;
        let activeCount = 0;
        let totalCount = 0;

        Object.values(parsedDevices).forEach(roomDevices => {
          roomDevices.forEach(device => {
            totalCount++;
            if (device.isOn) {
              activeCount++;
              totalEnergy += calculateDeviceEnergy(device);
            }
          });
        });

        if (activeCount === 0) activeCount = 4;
        if (totalEnergy === 0) totalEnergy = 2.5;
        if (totalCount === 0) totalCount = 20;

        setEnergyData({
          totalEnergyUsage: Math.round(totalEnergy * 100) / 100,
          activeDevices: activeCount,
          totalDevices: totalCount
        });
      }
    } catch (error) {
      console.error('Error calculating energy data:', error);
      setEnergyData({
        totalEnergyUsage: 2.5,
        activeDevices: 4,
        totalDevices: 20
      });
    }
  };

  useEffect(() => {
    calculateEnergyData();

    const handleStorageChange = () => {
      calculateEnergyData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    window.addEventListener('deviceStateChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('deviceStateChange', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      calculateEnergyData();
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Energy Usage</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <FaBolt className="text-yellow-400 text-3xl mx-auto mb-2" />
          <p className="text-gray-300 mb-1">Energy Today</p>
          <p className="text-2xl font-bold text-white">
            {energyData.totalEnergyUsage} kWh
          </p>
        </div>
        <div className="text-center">
          <FaPlug className="text-green-400 text-3xl mx-auto mb-2" />
          <p className="text-gray-300 mb-1">Active Devices</p>
          <p className="text-2xl font-bold text-white">
            {energyData.activeDevices} / {energyData.totalDevices}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="text-center">
          <p className="text-gray-300 mb-1">Estimated Cost Today</p>
          <p className="text-lg font-semibold text-green-400">
            ${(energyData.totalEnergyUsage * 0.12).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EnergyStats;
  