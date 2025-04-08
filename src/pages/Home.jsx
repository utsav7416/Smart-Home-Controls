import React, { useState } from 'react';
import { FaHome, FaCouch, FaBed, FaUtensils, FaBriefcase, FaBath } from 'react-icons/fa';
import RoomSelector from '../components/RoomSelector';
import DeviceControl from '../components/DeviceControl';
import EnvironmentStats from '../components/EnvironmentStats';
import HomeCarousel from '../components/HomeCarousel';
import EnergyStats from '../components/EnergyStats';
import SmartRoutines from '../components/SmartRoutines';

function Home() {
  const [selectedRoom, setSelectedRoom] = useState('All Rooms');
  const [tempUnit, setTempUnit] = useState('F');
  const [theme, setTheme] = useState('dark'); 

  const [energyUsage, setEnergyUsage] = useState(24.6);
  const [activeDevices, setActiveDevices] = useState(8);
  const [totalDevices, setTotalDevices] = useState(16);

  const toggleTempUnit = () => {
    setTempUnit(prevUnit => (prevUnit === 'F' ? 'C' : 'F'));
  };

  const rooms = [
    { 
      id: 'all', 
      name: 'All Rooms', 
      icon: FaHome,
      image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    { 
      id: 'living', 
      name: 'Living Room', 
      icon: FaCouch,
      image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bGl2aW5ncm9vbXxlbnwwfHwwfHx8MA%3D%3D"
    },
    { 
      id: 'bedroom', 
      name: 'Bedroom', 
      icon: FaBed,
      image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVkcm9vbXxlbnwwfHwwfHx8MA%3D%3D"
    },
    { 
      id: 'kitchen', 
      name: 'Kitchen', 
      icon: FaUtensils,
      image: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGtpdGNoZW58ZW58MHx8MHx8fDA%3D"
    },
    { 
      id: 'office', 
      name: 'Office', 
      icon: FaBriefcase,
      image: "https://images.unsplash.com/photo-1547586696-ea22b4d4235d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    { 
      id: 'bathroom', 
      name: 'Bathroom', 
      icon: FaBath,
      image: "https://plus.unsplash.com/premium_photo-1661963215502-dc2bc471ab2a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
  ];

  const environmentData = {
    humidity: 42,
    airQuality: 'Good',
    outsideTemp: 78,
    insideTemp: 72,
  };

  const currentRoom = rooms.find(room => room.name === selectedRoom);

  const handleDeviceChange = (updatedDevices) => {
    const activeCount = updatedDevices.filter(device => device.isOn).length;
    const totalCount = updatedDevices.length;
    
    const baseUsage = 5; 
    const deviceConsumption = updatedDevices.reduce((sum, device) => {
      if (device.isOn) {
        let factor = 0.05; 
        switch (device.property) {
          case 'brightness':
            factor = 0.05;
            break;
          case 'speed':
            factor = 0.03;
            break;
          case 'temp':
            factor = 0.1;
            break;
          case 'volume':
            factor = 0.02;
            break;
          case 'pressure':
            factor = 0.04;
            break;
          case 'temperature':
            factor = 0.08;
            break;
          case 'power':
            factor = 0.12;
            break;
          default:
            factor = 0.05;
        }
        return sum + (device.value * factor);
      }
      return sum;
    }, 0);
    
    const usage = baseUsage + deviceConsumption;
    setEnergyUsage(usage.toFixed(1));
    setActiveDevices(activeCount);
    setTotalDevices(totalCount);
  };

  return (
    <main className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-yellow-100 text-black'}`}>
      <HomeCarousel />

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to <span className="gradient-text">SmartHome</span>
        </h1>
        <p className="text-xl">
          Transform your living space into an intelligent sanctuary
        </p>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={toggleTempUnit}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
        >
          Switch to {tempUnit === 'F' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
        </button>
      </div>

      <RoomSelector rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {selectedRoom === 'All Rooms' && (
          <div className="lg:col-span-1">
            <EnvironmentStats data={environmentData} tempUnit={tempUnit} />
          </div>
        )}
        <div className={`lg:col-span-${selectedRoom === 'All Rooms' ? '2' : '1'}`}>
          <img 
            src={currentRoom.image} 
            alt={currentRoom.name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <div className="lg:col-span-2">
          <DeviceControl room={selectedRoom} onDeviceChange={handleDeviceChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <EnergyStats 
          energyUsage={energyUsage} 
          activeDevices={activeDevices} 
          totalDevices={totalDevices} 
        />
        <SmartRoutines />
      </div>
    </main>
  );
}

export default Home;
