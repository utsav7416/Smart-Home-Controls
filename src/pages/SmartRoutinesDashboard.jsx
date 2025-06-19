import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Edit3, Trash2, Plus, Calendar, CheckCircle2, StickyNote, Mic, MicOff, Play, Square } from 'lucide-react';

const defaultStorage = {
  routines: [
    {
      id: 1,
      name: 'Morning Routine',
      time: '07:00',
      days: 'Weekdays',
      icon: 'Sun',
      color: 'amber'
    },
    {
      id: 2,
      name: 'Bedtime Mode',
      time: '22:30',
      days: 'Every day',
      icon: 'Moon',
      color: 'indigo'
    },
  ],
  notes: [
    { id: 1, text: 'Complete workout by 6 AM', completed: false, type: 'text' },
    { id: 2, text: 'Meditate for 10 minutes', completed: true, type: 'text' },
  ],
  voiceNotes: [],
};

function SmartRoutinesDashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [notes, setNotes] = useState([]);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);

  const icons = ['Sun', 'Moon', 'Calendar'];
  const colors = ['indigo', 'amber', 'green', 'rose', 'purple'];

  const getRandomIcon = () => icons[Math.floor(Math.random() * icons.length)];
  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const [newRoutine, setNewRoutine] = useState({
    name: '',
    time: '',
    days: '',
    icon: getRandomIcon(),
    color: getRandomColor()
  });

  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  const loadFromStorage = (key, defaultValue) => {
    try {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : defaultValue;
    } catch (error) {
      console.error('Error loading from local storage:', error);
      return defaultValue;
    }
  };

  useEffect(() => {
    const loadedRoutines = loadFromStorage('routines', defaultStorage.routines);
    const loadedNotes = loadFromStorage('notes', defaultStorage.notes);
    const loadedVoiceNotes = loadFromStorage('voiceNotes', defaultStorage.voiceNotes);
    
    setRoutines(loadedRoutines);
    setNotes(loadedNotes);
    setVoiceNotes(loadedVoiceNotes);
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      saveToStorage('routines', routines);
    }
  }, [routines, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      saveToStorage('notes', notes);
    }
  }, [notes, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      saveToStorage('voiceNotes', voiceNotes);
    }
  }, [voiceNotes, isDataLoaded]);

  const iconMap = {
    Sun: Sun,
    Moon: Moon,
    Calendar: Calendar
  };

  const colorMap = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewRoutine(routines[index]);
  };

  const handleDelete = (index) => {
    setRoutines(routines.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (editingIndex !== null && editingIndex < routines.length) {
      setRoutines(
        routines.map((routine, index) =>
          index === editingIndex ? { ...newRoutine, id: routine.id } : routine
        )
      );
    } else {
      const newId = Math.max(...routines.map(r => r.id), 0) + 1;
      setRoutines([...routines, { ...newRoutine, id: newId, icon: getRandomIcon(), color: getRandomColor() }]);
    }
    setEditingIndex(null);
    setNewRoutine({ name: '', time: '', days: '', icon: getRandomIcon(), color: getRandomColor() });
  };

  const addNote = () => {
    if (newNote.trim()) {
      const newId = Math.max(...notes.map(n => n.id), 0) + 1;
      setNotes([...notes, { id: newId, text: newNote.trim(), completed: false, type: 'text' }]);
      setNewNote('');
    }
  };

  const addVoiceNote = () => {
    if (audioBlob) {
      const newId = Math.max(...voiceNotes.map(n => n.id), 0) + 1;
      const audioUrl = URL.createObjectURL(audioBlob);
      setVoiceNotes([...voiceNotes, { id: newId, text: 'Voice Note', audioUrl, timestamp: new Date().toLocaleString(), playbackSpeed: 1 }]);
      setAudioBlob(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playVoiceNote = (id, audioUrl, speed) => {
    if (audioRef.current) {
      if (currentPlayingId === id) {
        audioRef.current.pause();
        setCurrentPlayingId(null);
        setIsPlaying(false);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = speed;
        audioRef.current.play();
        setCurrentPlayingId(id);
        setIsPlaying(true);
        audioRef.current.onended = () => {
          setCurrentPlayingId(null);
          setIsPlaying(false);
        };
      }
    }
  };

  const handleSpeedChange = (id, newSpeed) => {
    setVoiceNotes(voiceNotes.map(note =>
      note.id === id ? { ...note, playbackSpeed: newSpeed } : note
    ));
    if (currentPlayingId === id && audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const toggleNote = (id) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, completed: !note.completed } : note
    ));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const deleteVoiceNote = (id) => {
    setVoiceNotes(voiceNotes.filter(note => note.id !== id));
    if (currentPlayingId === id) {
      audioRef.current.pause();
      setCurrentPlayingId(null);
      setIsPlaying(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-950 to-lime-950">
        <div className="text-white text-xl">Loading your routines...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 font-sans text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://thumbs.dreamstime.com/b/exploring-future-smart-homes-iot-revolutionizing-your-lawn-care-automation-image-showcases-lush-being-357455920.jpg?w=992)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/70 to-lime-950/70"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-green-500/8 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-teal-500/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />

      <div className={`max-w-6xl mx-auto relative z-10`}> 
        <div className="text-center mb-16 pt-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 bg-gradient-to-r from-green-300 via-teal-300 to-lime-300 bg-clip-text text-transparent">
            Smart Routines
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
            Craft your day, effortlessly. Our intelligent routine management system helps you build <span className="font-semibold text-blue-300">better habits</span>, track your progress, and optimize your daily schedule for maximum <span className="font-semibold text-blue-300">productivity and well-being</span>.
          </p>
          <div className="mt-4 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg inline-block">
            <span className="text-blue-300 text-lg font-extrabold">✓ Data automatically saved - your changes persist across sessions</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Your Routines</h2>
                <p className="text-gray-300 text-sm">Manage your daily habits and schedules</p>
              </div>
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setEditingIndex(null);
                  setNewRoutine({ name: '', time: '', days: '', icon: getRandomIcon(), color: getRandomColor() });
                }}
                className="px-4 py-2 bg-black/30 text-green-300 rounded-xl hover:bg-black/40 transition-all duration-200 border border-green-500/20 backdrop-blur-xl"
              >
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>

            {isEditing && editingIndex !== null && (
              <div className="mb-6 p-4 bg-black/30 rounded-xl border border-white/20 backdrop-blur-xl">
                <h3 className="text-white font-medium mb-3 text-lg">
                  {editingIndex < routines.length ? 'Edit Routine' : 'Add New Routine'}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter routine name"
                    value={newRoutine.name}
                    onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                    className="w-full bg-black/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500/50 backdrop-blur-xl"
                  />
                  <input
                    type="time"
                    value={newRoutine.time}
                    onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
                    className="w-full bg-black/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-green-500/50 backdrop-blur-xl"
                  />
                  <input
                    type="text"
                    placeholder="Enter days (e.g., Weekdays, Every day, Mon-Fri)"
                    value={newRoutine.days}
                    onChange={(e) => setNewRoutine({ ...newRoutine, days: e.target.value })}
                    className="w-full bg-black/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500/50 backdrop-blur-xl"
                  />
                  <button
                    onClick={handleSave}
                    className="w-full bg-black/50 text-green-300 py-3 rounded-lg hover:bg-black/60 transition-all duration-200 font-medium border border-green-500/20"
                  >
                    Save Routine
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {routines.map((routine, index) => {
                const IconComponent = iconMap[routine.icon];
                return (
                  <div key={routine.id} className="flex items-center justify-between p-4 bg-black/25 rounded-xl border border-green-500/20 hover:bg-black/35 transition-all duration-200 backdrop-blur-xl">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl border ${colorMap[routine.color]} mr-4`}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg mb-1">{routine.name}</h3>
                        <p className="text-gray-300 text-sm">
                          {formatTime(routine.time)} • {routine.days}
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {isEditing && editingIndex === null && (
                <button
                  onClick={() => setEditingIndex(routines.length)}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-black/25 rounded-xl border border-dashed border-green-500/30 text-green-400 hover:text-green-300 hover:bg-black/35 transition-all duration-200 backdrop-blur-xl"
                >
                  <Plus size={20} />
                  <span>Add New Routine</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-amber-500/15 rounded-xl border border-amber-500/20 mr-3">
                <StickyNote className="text-amber-400" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Quick Notes</h2>
                <p className="text-gray-300 text-sm">Track your daily tasks</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Add your task or note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNote()}
                  className="flex-1 bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50 backdrop-blur-xl"
                />
                <button
                  onClick={addNote}
                  className="p-2 bg-black/50 text-amber-400 rounded-lg hover:bg-black/60 transition-all duration-200 border border-amber-500/20"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="flex items-start space-x-3 p-3 bg-black/25 rounded-lg border border-white/20 hover:bg-black/35 transition-all duration-200 backdrop-blur-xl">
                  <button
                    onClick={() => toggleNote(note.id)}
                    className={`mt-0.5 transition-all duration-200 ${
                      note.completed
                        ? 'text-green-400 hover:text-green-300'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <div className="flex-1">
                    <span className={`${
                      note.completed
                        ? 'text-gray-400 line-through'
                        : 'text-white'
                    }`}>
                      {note.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-400 hover:text-red-300 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <StickyNote size={32} className="mx-auto mb-3 opacity-50" />
                  <p>No notes yet. Add your first task!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-green-500/15 rounded-xl border border-green-500/20 mr-3">
                <Mic className="text-green-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Voice Notes</h2>
                <p className="text-gray-300 text-xs">Record your thoughts</p>
              </div>
            </div>

            <div className="flex space-x-2 mb-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isRecording
                    ? 'bg-black/50 text-red-400 border border-red-500/20'
                    : 'bg-black/50 text-green-400 border border-green-500/20'
                }`}
              >
                {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                <span className="text-xs">{isRecording ? 'Stop' : 'Record'}</span>
              </button>
              {audioBlob && (
                <button
                  onClick={addVoiceNote}
                  className="px-3 py-2 bg-black/50 text-blue-400 rounded-lg hover:bg-black/60 transition-all duration-200 border border-blue-500/20 text-xs"
                >
                  Save
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {voiceNotes.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <Mic size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No voice notes yet</p>
                </div>
              )}
              {voiceNotes.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-2 bg-black/25 rounded-lg border border-white/20 hover:bg-black/35 transition-all duration-200 backdrop-blur-xl">
                  <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => playVoiceNote(note.id, note.audioUrl, note.playbackSpeed)}
                        className="p-1 bg-black/50 text-green-400 rounded-full hover:bg-black/60 transition-all duration-200"
                      >
                        {currentPlayingId === note.id ? <Square size={12} /> : <Play size={12} />}
                      </button>
                      <span className="text-white text-xs">{note.text}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{note.timestamp}</span>
                    <div className="flex items-center mt-1">
                      <span className="text-gray-400 text-xs mr-2">Speed:</span>
                      {[0.5, 1, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(note.id, speed)}
                          className={`px-2 py-0.5 rounded-md text-xs transition-all duration-200 mr-1 ${
                            note.playbackSpeed === speed
                              ? 'bg-green-600 text-white'
                              : 'bg-black/50 text-gray-300 hover:bg-black/60'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteVoiceNote(note.id)}
                    className="text-red-400 hover:text-red-300 transition-all duration-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
            <h3 className="text-2xl font-semibold text-white mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Today's Progress</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg backdrop-blur-xl">
                  <span className="text-gray-300 text-sm mb-2">Active Routines</span>
                  <span className="text-green-400 font-bold text-3xl">{routines.length}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg backdrop-blur-xl">
                  <span className="text-gray-300 text-sm mb-2">Completed Tasks</span>
                  <span className="text-green-400 font-bold text-3xl">
                    {notes.filter(n => n.completed).length}/{notes.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Daily Progress</span>
                  <span className="text-green-400 font-medium">
                    {notes.length > 0 ? Math.round((notes.filter(n => n.completed).length / notes.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-4 rounded-full transition-all duration-700"
                    style={{
                      width: notes.length > 0 ? `${(notes.filter(n => n.completed).length / notes.length) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-black/20 rounded-lg">
                  <div className="text-amber-400 font-semibold text-lg">{voiceNotes.length}</div>
                  <div className="text-gray-400 text-xs">Voice Notes</div>
                </div>
                <div className="p-3 bg-black/20 rounded-lg">
                  <div className="text-blue-400 font-semibold text-lg">{notes.filter(n => !n.completed).length}</div>
                  <div className="text-gray-400 text-xs">Pending</div>
                </div>
                <div className="p-3 bg-black/20 rounded-lg">
                  <div className="text-green-400 font-semibold text-lg">{notes.filter(n => n.completed).length}</div>
                  <div className="text-gray-400 text-xs">Done</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="w-full rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://img.freepik.com/premium-photo/secluded-cabin-forest-blending-smart-home-technology-with-beauty-nature-this-ecofriendly-retreat-offers-contemporary-design-sustainable-living-peacefulwoodland-setting_924727-44886.jpg"
              alt="Secluded Cabin"
              className="w-full h-64 object-cover"
            />
          </div>
          <div className="w-full rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://ml9yftkh0gk2.i.optimole.com/cb:kjVW.6ef/w:322/h:220/q:mauto/ig:avif/https://esyncsecurity.com/wp-content/uploads/smart-surveillance-system-transforming-security-in-chennai-mjy.jpg"
              alt="Smart Surveillance System"
              className="w-full h-64 object-cover"
            />
          </div>
          <div className="w-full rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://atsmarthomesg.com/wp-content/uploads/2024/10/smart-light-dimming-and-brightness-control.png"
              alt="Smart Light Dimming and Brightness Control"
              className="w-full h-64 object-cover"
            />
          </div>
          <div className="w-full rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://ueeshop.ly200-cdn.com/u_file/UPAC/UPAC480/2002/photo/441c133573.jpg"
              alt="Smart Home Technology"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartRoutinesDashboard;