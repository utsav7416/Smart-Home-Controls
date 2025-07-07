import { useState, useEffect, useCallback } from 'react'

const PROFILE_STORAGE_KEY = 'userProfile'
const EMAIL_ALERTS_STORAGE_KEY = 'emailAlerts'

export default function EmailAlert() {
  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState(() => {
    const s = localStorage.getItem(EMAIL_ALERTS_STORAGE_KEY)
    return s
      ? JSON.parse(s)
      : {
          enabled: true,
          highUsageEnabled: true,
          mediumUsageEnabled: true,
          highUsageThreshold: 10,
          mediumUsageThreshold: 5,
          cooldownPeriod: 30,
          lastAlerts: {},
          accessKey: process.env.REACT_APP_WEB3FORMS_KEY
        }
  })
  const [energyData, setEnergyData] = useState({ total: 0, active: 0 })

  useEffect(() => {
    const p = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (p) setProfile(JSON.parse(p))
  }, [])

  const saveSettings = useCallback(s => {
    localStorage.setItem(EMAIL_ALERTS_STORAGE_KEY, JSON.stringify(s))
    setSettings(s)
  }, [])

  useEffect(() => {
    function update() {
      try {
        const states = JSON.parse(localStorage.getItem('deviceStates') || '{}')
        const power = {
          'Main Light': 60,
          Fan: 75,
          AC: 3500,
          TV: 150,
          Microwave: 1000,
          Refrigerator: 150,
          Shower: 500,
          'Water Heater': 4000,
          Dryer: 3000
        }
        let total = 0,
          active = 0
        Object.values(states).forEach(arr => {
          if (!Array.isArray(arr)) return
          arr.forEach(d => {
            if (d.isOn) {
              active++
              const base = power[d.name] || 100
              let m = 1
              if (['brightness', 'speed', 'pressure', 'power'].includes(d.property)) {
                m = d.value / 100
              } else if (['temp', 'temperature'].includes(d.property)) {
                m =
                  d.name === 'AC'
                    ? Math.abs(72 - d.value) / 20 + 0.5
                    : d.value / 100
              } else if (d.property === 'volume') {
                m = 0.8 + (d.value / 100) * 0.4
              }
              total += (base * m) / 1000
            }
          })
        })
        if (active === 0) active = 4
        if (total === 0) total = 2.5
        setEnergyData({ total: Math.round(total * 100) / 100, active })
      } catch {
        setEnergyData({ total: 2.5, active: 4 })
      }
    }
    update()
    const id = setInterval(update, 5000)
    return () => clearInterval(id)
  }, [])

  const canSend = useCallback(
    type => {
      const last = settings.lastAlerts[type]
      if (!last) return true
      return Date.now() - last > settings.cooldownPeriod * 60000
    },
    [settings]
  )

  const gen = useCallback(
    level => {
      const ts = new Date().toLocaleString()
      const name = profile?.name || 'User'
      const { active, total } = energyData
      if (level === 'high') {
        return {
          subject: '🚨 HIGH ENERGY USAGE ALERT',
          message: `Hi ${name},\n\nHigh energy usage detected:\n⚡ ${active} devices\n⚡ ${total} kWh\n\nTime: ${ts}`
        }
      }
      return {
        subject: '⚠️ MEDIUM ENERGY USAGE ALERT',
        message: `Hi ${name},\n\nMedium energy usage detected:\n⚡ ${active} devices\n⚡ ${total} kWh\n\nTime: ${ts}`
      }
    },
    [energyData, profile]
  )

  const send = useCallback(
    async (level, data) => {
      if (!profile?.email) return
      const c = gen(level)
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: settings.accessKey,
            email: profile.email,
            name: profile.name,
            subject: c.subject,
            message: c.message,
            from_name: 'Smart Home System'
          })
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.message || 'fail')
        const ns = {
          ...settings,
          lastAlerts: { ...settings.lastAlerts, [level]: Date.now() }
        }
        saveSettings(ns)
      } catch {}
    },
    [gen, profile, saveSettings, settings]
  )

  useEffect(() => {
    if (!settings.enabled || !profile?.email) return
    const { active } = energyData
    let lvl = null
    if (active >= settings.highUsageThreshold && settings.highUsageEnabled) {
      lvl = 'high'
    } else if (
      active >= settings.mediumUsageThreshold &&
      settings.mediumUsageEnabled
    ) {
      lvl = 'medium'
    }
    if (lvl && canSend(lvl)) send(lvl, energyData)
  }, [canSend, energyData, profile, send, settings])

  return null
}


