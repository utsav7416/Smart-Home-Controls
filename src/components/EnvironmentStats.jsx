import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'

const DEVICES = [
  { id: 'lights', label: 'Lights', watt: 60 },
  { id: 'heater', label: 'Heater', watt: 1500 },
  { id: 'tv', label: 'TV', watt: 150 },
  { id: 'plug', label: 'Other', watt: 200 }
]

export default function EnvironmentStats() {
  const [devices, setDevices] = useState(
    DEVICES.reduce((acc, d) => ({ ...acc, [d.id]: false }), {})
  )
  const [history, setHistory] = useState([])

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
          time: now.toLocaleTimeString('en-US', { hour12: false }).slice(0,5),
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
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Device Power Controls
        </h2>
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

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Power Consumption Over Time
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={history}
            margin={{ top: 10, right: 30, left: -20, bottom: 30 }}
          >
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              tick={{ fill: '#d1d5db', fontSize: 12 }}
              label={{
                value: 'Time (HH:MM)',
                position: 'insideBottom',
                offset: -20,
                fill: '#9ca3af'
              }}
            />
            <YAxis
              stroke="#9ca3af"
              domain={[0, 'dataMax']}
              tick={{ fill: '#d1d5db', fontSize: 12 }}
              label={{
                value: 'Load (kW)',
                angle: -90,
                position: 'insideLeft',
                dy: -10,
                fill: '#9ca3af'
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                color: '#fff'
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ color: '#d1d5db', fontSize: 14 }}
            />
            <Line
              type="monotone"
              dataKey="load"
              name="Load"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}





