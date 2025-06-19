import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// --- Device definitions ---
const DEVICES = [
  { id: 'lights', label: 'Lights', watt: 60 },
  { id: 'heater', label: 'Heater', watt: 1500 },
  { id: 'tv', label: 'TV', watt: 150 },
  { id: 'toasterMixer', label: 'Toaster & Mixer', watt: 1200 }
]

const COLORS = ['#10b981', '#f59e42', '#6366f1', '#f43f5e']

// --- Energy Flow Chart (static SVG, easy to extend) ---
function EnergyFlowChart({ activeDevices }) {
  // Map device to position and color
  const deviceMap = {
    lights: { x: 60, y: 170, color: COLORS[0] },
    heater: { x: 140, y: 60, color: COLORS[1] },
    tv: { x: 230, y: 170, color: COLORS[2] },
    toasterMixer: { x: 140, y: 260, color: COLORS[3] }
  }
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-white mb-4">Energy Flow / Distribution</h2>
      <svg width={320} height={340} style={{ background: '#18181b', borderRadius: 16, width: '100%', maxWidth: 350 }}>
        {/* Central node */}
        <circle cx={160} cy={160} r={36} fill="#22223b" stroke="#10b981" strokeWidth={3} />
        <text x={160} y={165} textAnchor="middle" fill="#fff" fontSize={16} fontWeight="bold">Home</text>
        {/* Device nodes and lines */}
        {DEVICES.map((d, i) => {
          const dev = deviceMap[d.id]
          // Draw line from home to device
          return (
            <g key={d.id}>
              <line
                x1={160}
                y1={160}
                x2={dev.x}
                y2={dev.y}
                stroke={dev.color}
                strokeWidth={activeDevices[d.id] ? 5 : 2}
                opacity={activeDevices[d.id] ? 1 : 0.3}
              />
              <circle
                cx={dev.x}
                cy={dev.y}
                r={22}
                fill={activeDevices[d.id] ? dev.color : '#374151'}
                stroke="#22223b"
                strokeWidth={2}
              />
              <text
                x={dev.x}
                y={dev.y + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize={13}
                fontWeight={activeDevices[d.id] ? 'bold' : 'normal'}
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// --- Pie Chart of Device Usage ---
function DeviceUsagePie({ devices }) {
  // Only include devices that are ON
  const data = DEVICES
    .filter(d => devices[d.id])
    .map((d, i) => ({
      name: d.label,
      value: d.watt,
      color: COLORS[i % COLORS.length]
    }))
  // If none are on, show all as 0 for legend consistency
  const pieData = data.length > 0 ? data : DEVICES.map((d, i) => ({
    name: d.label, value: 0.01, color: COLORS[i % COLORS.length]
  }))
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-white mb-4">Device Energy Usage Share</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={35}
            label={({ name, percent }) =>
              percent > 0 ? `${name} (${Math.round(percent * 100)}%)` : ''
            }
            isAnimationActive={false}
          >
            {pieData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ color: '#d1d5db', fontSize: 14 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// --- Main EnvironmentStats component ---
export default function EnvironmentStats() {
  const [devices, setDevices] = useState(() => {
    const stored = localStorage.getItem('devices')
    return stored
      ? JSON.parse(stored)
      : DEVICES.reduce((acc, d) => ({ ...acc, [d.id]: false }), {})
  })
  const [history, setHistory] = useState([])

  useEffect(() => {
    localStorage.setItem('devices', JSON.stringify(devices))
  }, [devices])

  useEffect(() => {
    const record = () => {
      const now = new Date()
      const load = Object.entries(devices).reduce((sum, [id, on]) => {
        if (!on) return sum
        const watt = DEVICES.find(d => d.id === id).watt
        return sum + watt / 1000
      }, 0)
      setHistory(h => [
        ...h.slice(-59),
        {
          time: now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
          load: +load.toFixed(2)
        }
      ])
    }
    record()
    const iv = setInterval(record, 10000)
    return () => clearInterval(iv)
  }, [devices])

  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      {/* --- Other Ideas Section --- */}
      <DeviceUsagePie devices={devices} />
      <EnergyFlowChart activeDevices={devices} />

      {/* --- Your original Device Power Controls --- */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Device Power Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEVICES.map(d => (
            <button
              key={d.id}
              onClick={() =>
                setDevices(dev => ({ ...dev, [d.id]: !dev[d.id] }))
              }
              className={`flex items-center justify-between w-full p-4 rounded-xl border border-white/20 transition
                ${devices[d.id]
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              `}
            >
              <span className="text-lg font-medium">{d.label}</span>
              <span className="text-sm">
                {devices[d.id] ? 'ON' : 'OFF'} - {d.watt} W
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* --- Your original Power Consumption Over Time Chart --- */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Power Consumption Over Time</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={history} margin={{ top: 10, right: 30, left: -20, bottom: 30 }}>
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              tick={{ fill: '#d1d5db', fontSize: 12 }}
              label={{ value: 'Time (HH:MM)', position: 'insideBottom', offset: -20, fill: '#9ca3af' }}
            />
            <YAxis
              stroke="#9ca3af"
              domain={[0, 'dataMax']}
              tick={{ fill: '#d1d5db', fontSize: 12 }}
              label={{ value: 'Load (kW)', angle: -90, position: 'insideLeft', dy: -10, fill: '#9ca3af' }}
            />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} labelStyle={{ color: '#9ca3af' }} />
            <Legend verticalAlign="top" wrapperStyle={{ color: '#d1d5db', fontSize: 14 }} />
            <Line type="monotone" dataKey="load" name="Load" stroke="#10b981" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
