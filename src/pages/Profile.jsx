import React, { useState, useRef } from 'react'
import { FaUser, FaEnvelope, FaPhone, FaHome, FaCamera, FaEdit, FaSave, FaCheck } from 'react-icons/fa'

const LOCAL_STORAGE_KEY = 'userProfile'

export default function Profile() {
  const fileInputRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [errors, setErrors] = useState({ email: '', phone: '' })
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      try { return JSON.parse(stored) }
      catch { localStorage.removeItem(LOCAL_STORAGE_KEY) }
    }
    return {
      name: 'Utsav Choudhary',
      email: 'utsavchoudhary2005@gmail.com',
      phone: '+91 88268 34155',
      address: '77, Sannaiyat Lines, Delhi Cantonment',
      image: '/profileimage.jpg'
    }
  })

  const validate = (field, value) => {
    if (field === 'email')
      setErrors(e => ({ ...e, email: value.includes('@') ? '' : 'Invalid email' }))
    if (field === 'phone') {
      const valid = /^[0-9+\-\s()]+$/.test(value)
      setErrors(e => ({ ...e, phone: valid ? '' : 'Invalid phone' }))
    }
  }

  const handleChange = (field, value) => {
    setProfile(p => ({ ...p, [field]: value }))
    validate(field, value)
  }

  const handleSave = () => {
    if (errors.email || errors.phone) return
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile))
    setIsSaved(true)
    setIsEditing(false)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleImageUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setProfile(p => ({ ...p, image: reader.result }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://thumbs.dreamstime.com/z/smart-home-security-system-monitoring-bedroom-city-view-night-futuristic-featuring-holographic-interface-wall-362001639.jpg?ct=jpeg"
          alt="Smart Home Security System"
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90" />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                My Profile
              </span>
            </h1>
            <p className="text-gray-400 text-xl">Manage your smart home identity</p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-6 rounded-full" />
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600/20 via-emerald-600/20 to-green-600/20 p-8 border-b border-white/10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt="User Profile"
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/20 shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-xl border-4 border-white/20">
                      {profile.name
                        .split(' ')
                        .map(n => n?.[0])
                        .join('')}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-teal-600 to-emerald-600 p-3 rounded-full text-white hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                  >
                    <FaCamera className="text-sm" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{profile.name}</h2>
                  <p className="text-gray-400 text-lg mb-4">Smart Home Pioneer</p>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                      <span className="text-green-400 text-sm font-medium">● Online</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditing(!isEditing)
                        setIsSaved(false)
                      }}
                      className="px-4 py-2 bg-teal-500/20 border border-teal-500/30 rounded-full hover:bg-teal-500/30 transition-all duration-300 text-teal-400 text-sm font-medium flex items-center gap-2"
                    >
                      <FaEdit />
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: 'Full Name', icon: <FaUser />, field: 'name', type: 'text' },
                  { label: 'Email Address', icon: <FaEnvelope />, field: 'email', type: 'email' },
                  { label: 'Phone Number', icon: <FaPhone />, field: 'phone', type: 'tel' },
                  { label: 'Home Address', icon: <FaHome />, field: 'address', type: 'text' }
                ].map(({ label, icon, field, type }) => (
                  <div key={field} className="space-y-3">
                    <label className="block text-gray-300 font-medium text-sm uppercase tracking-wide">
                      {label}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div
                        className={`relative flex items-center bg-white/5 border rounded-xl px-4 py-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ${
                          errors?.[field] ? 'border-red-500' : 'border-white/10'
                        }`}
                      >
                        {icon}
                        <input
                          type={type}
                          value={profile?.[field] || ''}
                          onChange={e => handleChange(field, e.target.value)}
                          disabled={!isEditing}
                          className="bg-transparent text-white text-lg w-full ml-2 focus:outline-none disabled:cursor-not-allowed placeholder-gray-500"
                          placeholder={`Enter your ${label.toLowerCase()}`}
                        />
                      </div>
                    </div>
                    {errors?.[field] && <p className="text-red-500 text-xs ml-2">{errors?.[field]}</p>}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={handleSave}
                    disabled={Boolean(errors.email || errors.phone)}
                    className="relative group px-12 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                  >
                    {isSaved ? (
                      <>
                        <FaCheck className="animate-bounce" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
              {isSaved && !isEditing && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 font-medium">
                    <FaCheck className="animate-pulse" /> Profile updated!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}