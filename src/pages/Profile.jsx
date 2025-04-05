import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaHome, FaCamera } from 'react-icons/fa';

function Profile() {
  // Lazy initialization: load profile from localStorage or use defaults.
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile
      ? JSON.parse(savedProfile)
      : {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Smart Street, Tech City',
          image: null, // no image by default
        };
  });

  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef(null);

  // Save profile to localStorage when "Save Changes" is clicked.
  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Trigger file input click when camera button is pressed.
  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  // Handle image upload and convert to base64.
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <button 
                onClick={handleCameraClick}
                className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white hover:bg-indigo-700 transition-colors"
              >
                <FaCamera />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">{profile.name}</h2>
            <p className="text-gray-400">Smart Home Owner</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Full Name</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                <FaUser className="text-indigo-400 mr-3" />
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-transparent text-white w-full focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                <FaEnvelope className="text-indigo-400 mr-3" />
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-transparent text-white w-full focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Phone</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                <FaPhone className="text-indigo-400 mr-3" />
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-transparent text-white w-full focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Address</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                <FaHome className="text-indigo-400 mr-3" />
                <input 
                  type="text" 
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="bg-transparent text-white w-full focus:outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isSaved ? 'Changes Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
