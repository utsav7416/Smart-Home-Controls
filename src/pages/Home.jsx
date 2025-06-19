import React, { useState, useEffect, useRef } from 'react';
import { FaHome, FaCouch, FaBed, FaUtensils, FaBriefcase, FaBath, FaClock, FaCalendarAlt } from 'react-icons/fa';
import RoomSelector from '../components/RoomSelector';
import DeviceControl from '../components/DeviceControl';
import EnvironmentStats from '../components/EnvironmentStats';
import HomeCarousel from '../components/HomeCarousel';
import EnergyStats from '../components/EnergyStats';

function Home() {
  const [selectedRoom, setSelectedRoom] = useState('All Rooms');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [energyUsage, setEnergyUsage] = useState(24.6);
  const [activeDevices, setActiveDevices] = useState(8);
  const [totalDevices, setTotalDevices] = useState(16);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [heatmapData, setHeatmapData] = useState({});
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedHeatmapData = JSON.parse(window.localStorage?.getItem('smartHomeHeatmapData') || '{}');
    setHeatmapData(savedHeatmapData);
  }, []);

  useEffect(() => {
    if (Object.keys(heatmapData).length > 0) {
      window.localStorage?.setItem('smartHomeHeatmapData', JSON.stringify(heatmapData));
    }
  }, [heatmapData]);

  useEffect(() => {
    if (emergencyActive) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (!oscillatorRef.current) {
        oscillatorRef.current = audioContextRef.current.createOscillator();
        oscillatorRef.current.type = 'sine';
        oscillatorRef.current.frequency.setValueAtTime(880, audioContextRef.current.currentTime);
        oscillatorRef.current.connect(audioContextRef.current.destination);
        oscillatorRef.current.start();
      }
    } else {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [emergencyActive]);

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
    return formattedDate;
  };

  const rooms = [
  {
    id: 'all',
    name: 'All Rooms',
    icon: FaHome,
    images: [
      "https://miro.medium.com/v2/resize:fit:1200/1*IZfPiiLy0JeDTf_yxnf4AQ.jpeg", 
      "https://images.squarespace-cdn.com/content/v1/62d704c68efed3295c893226/1658261003959-302B2EG3QZLT1QEY2FYL/smarthome02.jpeg" 
    ]
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
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzY2FybHR5c2R8Mnx8YmVkcm9vbXxlbnwwfHwwfHx8MA%3D"
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: FaUtensils,
    image: "https://jumanji.livspace-cdn.com/magazine/wp-content/uploads/sites/2/2022/05/25153058/AdobeStock_290534151-1.jpeg"
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
    image: "https://plus.unsplash.com/premium_photo-1661963215502-dc2bc471ab2a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxz"
  }
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
          case 'brightness': factor = 0.05; break;
          case 'speed': factor = 0.03; break;
          case 'temp': factor = 0.1; break;
          case 'volume': factor = 0.02; break;
          case 'pressure': factor = 0.04; break;
          case 'temperature': factor = 0.08; break;
          case 'power': factor = 0.12; break;
          default: factor = 0.05;
        }
        return sum + (device.value * factor);
      }
      return sum;
    }, 0);
    const usage = baseUsage + deviceConsumption;
    setEnergyUsage(usage.toFixed(1));
    setActiveDevices(activeCount);
    setTotalDevices(totalCount);

    const today = new Date().toDateString();
    const currentHour = new Date().getHours();
    const activityLevel = Math.min(activeCount * 2 + Math.floor(usage / 5), 10);
    
    setHeatmapData(prev => ({
      ...prev,
      [today]: {
        ...prev[today],
        [currentHour]: activityLevel
      }
    }));
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

        <div className="mt-8">
          <button
            onClick={() => setEmergencyActive(true)}
            className="w-full md:w-2/5 mx-auto block
                       bg-red-700 hover:bg-red-600
                       text-white text-xl md:text-3xl font-bold
                       py-4 px-8 rounded-full
                       shadow-lg transform transition-all duration-300
                       hover:scale-105 active:scale-95
                       border-2 border-red-400 animate-pulse-slow"
          >
            Activate Emergency
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSWgpqhO9T1j7eU_CqQooRWnxrFiqKfL_LMw&s"
            alt="1"
            className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          />
          <img
            src="https://i.pinimg.com/736x/19/98/e2/1998e2348d8feede91e9094a2f81a402.jpg"
            alt="2"
            className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          />
          <img
            src="https://thumbs.dreamstime.com/b/modern-smart-home-apartment-night-view-stylish-showcasing-comfortable-living-space-large-windows-offering-stunning-368499538.jpg"
            alt="3"
            className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          />
          <img
            src="https://thumbs.dreamstime.com/b/living-room-boasts-modern-aesthetic-stunning-city-sunset-view-pink-led-lighting-accents-372979994.jpg"
            alt="4"
            className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 md:col-span-2 lg:col-span-1"
          />
          <img
            src="https://img.freepik.com/premium-photo/futuristic-smart-home-diverse-connected-devices-digital-icons-seamless-integration_951586-139549.jpg?ga=GA1.1.355402728.1750275417&semt=ais_hybrid&w=740"
            alt="5"
            className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 md:col-span-2 lg:col-span-1"
          />
          <img
            src="https://thumbs.dreamstime.com/b/futuristic-smart-kitchens-innovative-appliances-collection-high-tech-featuring-modern-automated-systems-sustainable-353602406.jpg?w=992"
            alt="6"
            className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 md:col-span-2 lg:col-span-1"
          />
        </div>

        {emergencyActive && (
          <div className="fixed inset-0 bg-red-900 bg-opacity-90 flex flex-col items-center justify-center z-50 animate-pulse-fast">
            <div className="bg-white rounded-3xl p-10 text-center shadow-red-glow animate-bounce-slow">
              <h2 className="text-5xl font-extrabold mb-6 text-red-700 animate-fade-in-up">EMERGENCY ACTIVE!</h2>
              <p className="text-2xl text-red-600 mb-8 animate-fade-in-up delay-200">Immediate attention required.</p>
              <button
                onClick={() => setEmergencyActive(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-full text-xl shadow-lg transition duration-300 animate-scale-in delay-400"
              >
                Deactivate Emergency
              </button>
            </div>
          </div>
        )}
      </div>

      <RoomSelector rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {selectedRoom === 'All Rooms' && (
          <div className="lg:col-span-1">
            <EnvironmentStats data={environmentData} tempUnit={'F'} />
          </div>
        )}
        <div className={`${selectedRoom === 'All Rooms' ? 'lg:col-span-2' : 'lg:col-span-1'} flex-shrink-0`}>
          {selectedRoom === 'All Rooms' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="w-full h-64 md:h-72 lg:h-80 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-900 to-teal-700 p-6 text-white text-2xl font-semibold text-center leading-relaxed shadow-lg">
                <p>
                  Navigate to different rooms and their controls via the upper room navbar (Kitchen, Bathroom, Living Room, Office). Adjust power and lights accordingly (microwave, AC, heater, etc.) and view usage details, energy saved, active devices, and cost at the bottom by scrolling down.
                </p>
              </div>
              {currentRoom.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`All Room ${idx + 1}`}
                  className="w-full h-[500px] object-cover rounded-xl flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full min-h-[400px]">
              <img
                src={currentRoom.image}
                alt={currentRoom.name}
                className="w-full h-full object-cover rounded-xl flex-shrink-0"
              />
            </div>
          )}
        </div>
        <div className={`${selectedRoom === 'All Rooms' ? 'lg:col-span-1' : 'lg:col-span-2'} flex-shrink-0`}>
          <DeviceControl 
            room={selectedRoom} 
            onDeviceChange={handleDeviceChange}
            heatmapData={heatmapData}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <EnergyStats
            energyUsage={energyUsage}
            activeDevices={activeDevices}
            totalDevices={totalDevices}
          />
          <p className="mt-4 text-xl font-semibold bg-gradient-to-r from-white to-green-600 bg-clip-text text-transparent">
            Monitor your home's energy in real time, track active devices, and optimize consumption for a smarter, greener living space.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://thumbs.dreamstime.com/b/exploring-future-smart-homes-iot-cozy-room-featuring-tv-lush-green-plant-image-showcases-modern-equipped-357647550.jpg?w=768"
            alt="Cozy smart home with TV and plant"
            className="w-full h-48 object-cover rounded-lg shadow-md"
          />
          <img
            src="https://thumbs.dreamstime.com/b/experience-iot-living-modern-smart-home-stunning-forest-views-your-cozy-room-innovative-integrates-technology-357457898.jpg?w=768"
            alt="Modern smart home with forest view"
            className="w-full h-48 object-cover rounded-lg shadow-md"
          />
          <img
            src="https://thumbs.dreamstime.com/b/exploring-future-iot-long-walkway-integrating-smart-homes-home-automation-experience-seamless-integration-357459918.jpg?w=768"
            alt="Walkway integrating smart home automation"
            className="w-full h-48 object-cover rounded-lg shadow-md"
          />
          <img
            src="https://thumbs.dreamstime.com/b/exploring-future-smart-homes-house-green-roof-integrating-iot-technology-urban-living-environments-image-356852611.jpg?w=992"
            alt="Smart home with green roof"
            className="w-full h-48 object-cover rounded-lg shadow-md"
          />
        </div>
      </div>
    </main>
  );
}

export default Home;