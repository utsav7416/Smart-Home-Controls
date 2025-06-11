import React, { useState, useEffect } from 'react';
import { FaHome, FaCouch, FaBed, FaUtensils, FaBriefcase, FaBath, FaClock, FaCalendarAlt } from 'react-icons/fa';
import RoomSelector from '../components/RoomSelector';
import DeviceControl from '../components/DeviceControl';
import EnvironmentStats from '../components/EnvironmentStats';
import HomeCarousel from '../components/HomeCarousel';
import EnergyStats from '../components/EnergyStats';
import SmartRoutines from '../components/SmartRoutines';

function Home() {
  const [selectedRoom, setSelectedRoom] = useState('All Rooms');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [energyUsage, setEnergyUsage] = useState(24.6);
  const [activeDevices, setActiveDevices] = useState(8);
  const [totalDevices, setTotalDevices] = useState(16);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const day = date.getDate();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' :
                   day % 10 === 2 && day !== 12 ? 'nd' :
                   day % 10 === 3 && day !== 13 ? 'rd' : 'th';

    return formattedDate.replace(/\d+/, `${day}${suffix}`);
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
      image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVkcm9vbXxlbnwwfHwwfHx8MA%3D"
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      icon: FaUtensils,
      image: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGtpdGNoZW58ZW52cnwwfHwwfHx8MA%3D%3D"
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
    <main className="container mx-auto px-4 py-8 bg-black text-white min-h-screen">
      <HomeCarousel />

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to <span className="gradient-text">SmartHome</span>
        </h1>
        <p className="text-xl mb-6">
          Transform your living space into an intelligent sanctuary
        </p>

        <div className="relative w-full max-w-[50rem] mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-800 to-teal-900 p-6 shadow-2xl transition-all duration-500 hover:shadow-green-500/50 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-600/30 via-transparent to-teal-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-500/10 rounded-full blur-xl animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out z-0"></div>
          <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-teal-400/10 rounded-full blur-xl animate-float-delay opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out z-0"></div>

          <div className="flex justify-between items-center text-white relative z-10">
            <div className="text-left flex flex-col items-start animate-fade-in-left">
              <div className="text-4xl md:text-6xl font-mono font-extrabold tracking-wider text-white drop-shadow-white-glow">
                {formatTime(currentTime)}
              </div>
              <div className="text-base md:text-lg font-medium opacity-90 mt-2 flex items-center text-green-300">
                <FaClock className="inline-block mr-2 text-xl" /> Live Time
              </div>
            </div>
            <div className="text-right flex flex-col items-end animate-fade-in-right">
              <div className="text-lg md:text-xl font-medium opacity-90 mb-2 flex items-center text-teal-200">
                <FaCalendarAlt className="inline-block mr-2 text-xl" /> Today is:
              </div>
              <div className="text-2xl md:text-3xl font-semibold drop-shadow-lg text-white">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoomSelector rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {selectedRoom === 'All Rooms' && (
          <div className="lg:col-span-1">
            <EnvironmentStats data={environmentData} tempUnit={'F'} />
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