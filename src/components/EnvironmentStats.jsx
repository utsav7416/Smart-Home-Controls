import React from 'react';
import { FaThermometerHalf, FaTint, FaWind } from 'react-icons/fa';

function EnvironmentStats({ data, tempUnit }) {
  
  const parseTemp = (temp) => parseFloat(temp);

  const toCelsius = (tempF) => ((parseTemp(tempF) - 32) * 5 / 9).toFixed(1);

  const outsideTemp =
    tempUnit === 'C'
      ? `${toCelsius(data.outsideTemp)}°C`
      : `${parseTemp(data.outsideTemp)}°F`;

  const insideTemp =
    tempUnit === 'C'
      ? `${toCelsius(data.insideTemp)}°C`
      : `${parseTemp(data.insideTemp)}°F`;

  const stats = [
    {
      icon: FaTint,
      label: 'Humidity',
      value: `${data.humidity}%`,
      color: 'text-blue-400',
    },
    {
      icon: FaWind,
      label: 'Air Quality',
      value: data.airQuality,
      color: 'text-green-400',
    },
    {
      icon: FaThermometerHalf,
      label: 'Outside',
      value: outsideTemp,
      color: 'text-orange-400',
    },
    {
      icon: FaThermometerHalf,
      label: 'Temperature',
      value: insideTemp,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <div className="flex flex-col items-center">
            <stat.icon className={`text-4xl ${stat.color} mb-2`} />
            <h3 className="text-lg font-medium text-gray-300">{stat.label}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EnvironmentStats;
