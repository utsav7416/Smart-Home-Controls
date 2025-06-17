import React, { useState, useEffect } from 'react'
import { FaLightbulb, FaFan, FaTv, FaThermometerHalf, FaChartBar } from 'react-icons/fa'
import { MdKitchen, MdHotTub, MdShower, MdMicrowave } from 'react-icons/md'

const ICON_MAP = {
  'Main Light': FaLightbulb,
  Fan: FaFan,
  AC: FaThermometerHalf,
  TV: FaTv,
  Microwave: MdMicrowave,
  Refrigerator: MdKitchen,
  Shower: MdShower,
  'Water Heater': MdHotTub,
  Dryer: FaFan,
}

function CalendarHeatmap({ data, deviceName, room }) {
  const getLast5DaysData = () => {
    const today = new Date()
    const last5 = []
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().split('T')[0]
      last5.push({
        date: key,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        count: data[key]?.count || 0,
      })
    }
    return last5
  }

  const days = getLast5DaysData()
  const total = days.reduce((s, d) => s + d.count, 0)

  const getIntensityColor = count => {
    if (count === 0) return '#1f2937'
    if (count >= 1 && count < 5) return '#22c55e'
    if (count >= 5 && count < 10) return '#eab308'
    if (count >= 10) return '#ef4444'
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
      <div className="flex items-center gap-2 mb-4">
        <FaChartBar className="w-4 h-4 text-emerald-400" />
        <h4 className="text-sm font-semibold text-white">{deviceName} Usage Activity</h4>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Track your device usage patterns over the last 5 days. Green = low activity, Yellow = medium, Red = high activity.
      </p>
      <div className="grid grid-cols-5 gap-2 mb-3">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-10 h-10 rounded-lg border border-gray-700 transition-all hover:scale-110 hover:border-emerald-400 cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: getIntensityColor(d.count) }}
              title={`${d.dayName}, ${d.dayNumber}: ${d.count} actions`}
            >
              <span className="text-xs text-white font-medium">{d.count}</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">{d.dayName}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <span>Less activity</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm border border-gray-700" style={{ backgroundColor: '#1f2937' }} />
          <div className="w-3 h-3 rounded-sm border border-gray-700" style={{ backgroundColor: '#22c55e' }} />
          <div className="w-3 h-3 rounded-sm border border-gray-700" style={{ backgroundColor: '#22c55e' }} />
          <div className="w-3 h-3 rounded-sm border border-gray-700" style={{ backgroundColor: '#eab308' }} />
          <div className="w-3 h-3 rounded-sm border border-gray-700" style={{ backgroundColor: '#ef4444' }} />
          <div className="w-3 h-3 rounded-sm border border-gray-700" style={{ backgroundColor: '#ef4444' }} />
        </div>
        <span>More activity</span>
      </div>
      <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-300">Total actions (5 days):</span>
          <span className="text-emerald-400 font-semibold">{total}</span>
        </div>
      </div>
    </div>
  )
}

function DeviceControl({ room }) {
  const baseDevices = {
    'Living Room': [
      { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
      { id: 2, name: 'Fan', isOn: false, property: 'speed', value: 50 },
      { id: 3, name: 'AC', isOn: false, property: 'temp', value: 72 },
      { id: 4, name: 'TV', isOn: false, property: 'volume', value: 30 },
    ],
    Bedroom: [
      { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
      { id: 2, name: 'Fan', isOn: false, property: 'speed', value: 50 },
      { id: 3, name: 'AC', isOn: false, property: 'temp', value: 72 },
      { id: 4, name: 'TV', isOn: false, property: 'volume', value: 30 },
    ],
    Office: [
      { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
      { id: 2, name: 'Fan', isOn: false, property: 'speed', value: 50 },
      { id: 3, name: 'AC', isOn: false, property: 'temp', value: 72 },
      { id: 4, name: 'TV', isOn: false, property: 'volume', value: 30 },
    ],
    Kitchen: [
      { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
      { id: 2, name: 'Microwave', isOn: false, property: 'temp', value: 50 },
      { id: 3, name: 'AC', isOn: false, property: 'temp', value: 72 },
      { id: 4, name: 'Refrigerator', isOn: false, property: 'power', value: 80 },
    ],
    Bathroom: [
      { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
      { id: 2, name: 'Shower', isOn: false, property: 'pressure', value: 50 },
      { id: 3, name: 'Water Heater', isOn: false, property: 'temperature', value: 60 },
      { id: 4, name: 'Dryer', isOn: false, property: 'speed', value: 60 },
    ],
  }

  const addIcons = list => list.map(d => ({ ...d, icon: ICON_MAP[d.name] || null }))
  const [allDeviceStates, setAllDeviceStates] = useState(() => {
    const saved = localStorage.getItem('deviceStates')
    return saved
      ? JSON.parse(saved)
      : Object.fromEntries(Object.entries(baseDevices).map(([k, v]) => [k, addIcons(v)]))
  })
  const [usageData, setUsageData] = useState(() => {
    const saved = localStorage.getItem('deviceUsageData')
    return saved ? JSON.parse(saved) : {}
  })
  const [showHeatmap, setShowHeatmap] = useState({})

  useEffect(() => {
    localStorage.setItem('deviceStates', JSON.stringify(allDeviceStates))
    window.dispatchEvent(new Event('deviceStateChange'))
  }, [allDeviceStates])

  useEffect(() => {
    localStorage.setItem('deviceUsageData', JSON.stringify(usageData))
  }, [usageData])

  const current = allDeviceStates[room] || []

  const recordUsage = (name, type, val = null) => {
    const day = new Date().toISOString().split('T')[0]
    const key = `${room}-${name}`
    setUsageData(prev => {
      const next = { ...prev }
      next[key] = { ...(next[key] || {}) }
      next[key][day] = {
        count: (next[key][day]?.count || 0) + 1,
        actions: [...(next[key][day]?.actions || []), { time: new Date().toISOString(), type, value: val }],
      }
      return next
    })
  }

  const toggleDevice = id => {
    const dev = current.find(d => d.id === id)
    const updated = current.map(d => (d.id === id ? { ...d, isOn: !d.isOn } : d))
    setAllDeviceStates(s => ({ ...s, [room]: addIcons(updated) }))
    recordUsage(dev.name, 'toggle', !dev.isOn)
  }

  const updateValue = (id, prop, val) => {
    const dev = current.find(d => d.id === id)
    const updated = current.map(d => (d.id === id ? { ...d, [prop]: val } : d))
    setAllDeviceStates(s => ({ ...s, [room]: addIcons(updated) }))
    recordUsage(dev.name, 'adjust', val)
  }

  const toggleHeatmap = key => setShowHeatmap(s => ({ ...s, [key]: !s[key] }))

  const getSliderStyle = (v, min, max) => {
    const p = ((v - min) / (max - min)) * 100
    return { background: `linear-gradient(90deg, #10b981 ${p}%, #374151 ${p}%)` }
  }

  const renderControls = dev => {
    if (!dev.isOn) return null
    let [min, max] = [0, 100]
    if (['brightness', 'speed', 'volume', 'pressure', 'power'].includes(dev.property)) {
      ;[min, max] = [0, 100]
    } else if (dev.property === 'temp') {
      ;[min, max] = [dev.name === 'Water Heater' ? 40 : 60, dev.name === 'Water Heater' ? 120 : 85]
    } else if (dev.property === 'temperature') {
      ;[min, max] = [40, 120]
    }
    const label = ['temp', 'temperature'].includes(dev.property) ? `${dev.value}°F` : `${dev.value}%`
    const minLabel = ['temp', 'temperature'].includes(dev.property) ? `${min}°F` : dev.property === 'volume' ? 'Mute' : 'Low'
    const maxLabel = ['temp', 'temperature'].includes(dev.property) ? `${max}°F` : dev.property === 'volume' ? 'Max' : 'High'
    return (
      <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
        <label className="text-sm font-medium text-gray-200 mb-2 block">
          {dev.property === 'brightness' && 'Brightness Control'}
          {dev.property === 'speed' && 'Fan Speed Control'}
          {dev.property === 'temp' && 'Temperature Control'}
          {dev.property === 'temperature' && 'Water Temperature Control'}
          {dev.property === 'volume' && 'Volume Control'}
          {dev.property === 'pressure' && 'Water Pressure Control'}
          {dev.property === 'power' && 'Power Level Control'}
        </label>
        <input
          type="range"
          min={min}
          max={max}
          value={dev.value}
          onChange={e => updateValue(dev.id, 'value', parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
          style={getSliderStyle(dev.value, min, max)}
        />
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{minLabel}</span>
          <span className="font-semibold text-emerald-400">{label}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-950 rounded-xl shadow-2xl text-white border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        {room} Smart Controls
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {current.map(dev => {
          const key = `${room}-${dev.name}`
          const data = usageData[key] || {}
          const hasData = Object.keys(data).length > 0
          return (
            <div key={dev.id} className="bg-gray-900 p-5 rounded-xl border border-gray-700 hover:border-gray-600 transition-all shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  {dev.icon && <dev.icon className={`w-7 h-7 transition-colors ${dev.isOn ? 'text-emerald-400' : 'text-gray-500'}`} />}
                  <div>
                    <span className="font-semibold text-lg">{dev.name}</span>
                    <p className="text-xs text-gray-400">{dev.isOn ? 'Currently active' : 'Currently off'}</p>
                  </div>
                  {hasData && (
                    <button
                      onClick={() => toggleHeatmap(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        showHeatmap[key]
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
                      }`}
                    >
                      <FaChartBar className="w-4 h-4" />
                      {showHeatmap[key] ? 'Hide Analytics' : 'View Analytics'}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => toggleDevice(dev.id)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    dev.isOn ? 'bg-emerald-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg ${
                      dev.isOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {renderControls(dev)}
              {showHeatmap[key] && hasData && (
                <div className="mt-4">
                  <CalendarHeatmap data={data} deviceName={dev.name} room={room} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DeviceControl