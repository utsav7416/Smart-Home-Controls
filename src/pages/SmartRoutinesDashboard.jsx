import React, { useState, useEffect } from 'react';
import { Sun, Moon, Edit3, Trash2, Plus, Clock, Calendar, CheckCircle2, StickyNote } from 'lucide-react';

const storage = {
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
    { id: 1, text: 'Complete workout by 6 AM', completed: false },
    { id: 2, text: 'Meditate for 10 minutes', completed: true },
  ]
};

function SmartRoutinesDashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [routines, setRoutines] = useState(storage.routines);
  const [notes, setNotes] = useState(storage.notes);
  const [newNote, setNewNote] = useState('');

  const [newRoutine, setNewRoutine] = useState({
    name: '',
    time: '',
    days: '',
    icon: 'Sun',
    color: 'indigo'
  });

  const iconMap = {
    Sun: Sun,
    Moon: Moon,
    Clock: Clock,
    Calendar: Calendar
  };

  const colorMap = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  useEffect(() => {
    storage.routines = routines;
    storage.notes = notes;
  }, [routines, notes]);

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
      setRoutines([...routines, { ...newRoutine, id: newId }]);
    }
    setEditingIndex(null);
    setNewRoutine({ name: '', time: '', days: '', icon: 'Sun', color: 'indigo' });
  };

  const addNote = () => {
    if (newNote.trim()) {
      const newId = Math.max(...notes.map(n => n.id), 0) + 1;
      setNotes([...notes, { id: newId, text: newNote.trim(), completed: false }]);
      setNewNote('');
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

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2C2C] via-[#3A1B3A] to-[#1A2C2C] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Smart Routines
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Build better habits with intelligent routine management. Create, track, and optimize your daily routines for maximum productivity and well-being.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Your Routines</h2>
                  <p className="text-slate-400">Manage your daily habits and schedules</p>
                </div>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditingIndex(null);
                    setNewRoutine({ name: '', time: '', days: '', icon: 'Sun', color: 'indigo' });
                  }}
                  className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl hover:bg-indigo-600/30 transition-all duration-200 border border-indigo-500/30"
                >
                  {isEditing ? 'Done' : 'Edit'}
                </button>
              </div>

              {isEditing && editingIndex !== null && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-medium mb-3">
                    {editingIndex < routines.length ? 'Edit Routine' : 'Add New Routine'}
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Routine Name"
                      value={newRoutine.name}
                      onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <input
                      type="time"
                      value={newRoutine.time}
                      onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <input
                      type="text"
                      placeholder="Days (e.g., Weekdays, Every day, Mon-Fri)"
                      value={newRoutine.days}
                      onChange={(e) => setNewRoutine({ ...newRoutine, days: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newRoutine.icon}
                        onChange={(e) => setNewRoutine({ ...newRoutine, icon: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        <option value="Sun">Sun</option>
                        <option value="Moon">Moon</option>
                        <option value="Clock">Clock</option>
                        <option value="Calendar">Calendar</option>
                      </select>
                      <select
                        value={newRoutine.color}
                        onChange={(e) => setNewRoutine({ ...newRoutine, color: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        <option value="indigo">Indigo</option>
                        <option value="amber">Amber</option>
                        <option value="emerald">Emerald</option>
                        <option value="rose">Rose</option>
                        <option value="purple">Purple</option>
                      </select>
                    </div>
                    <button
                      onClick={handleSave}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
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
                    <div key={routine.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-xl border ${colorMap[routine.color]} mr-4`}>
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{routine.name}</h3>
                          <p className="text-slate-400 text-sm">
                            {formatTime(routine.time)} • {routine.days}
                          </p>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(index)}
                            className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-all duration-200"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isEditing && editingIndex === null && (
                  <button
                    onClick={() => setEditingIndex(routines.length)}
                    className="w-full flex items-center justify-center space-x-2 p-4 bg-white/5 rounded-xl border border-dashed border-white/20 text-indigo-400 hover:text-indigo-300 hover:bg-white/10 transition-all duration-200"
                  >
                    <Plus size={20} />
                    <span>Add New Routine</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center mb-6">
                <StickyNote className="text-amber-400 mr-3" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Quick Notes</h2>
                  <p className="text-slate-400 text-sm">Track your daily tasks</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Complete task by 5 AM..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNote()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <button
                    onClick={addNote}
                    className="p-2 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/30 transition-all duration-200 border border-amber-500/30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <button
                      onClick={() => toggleNote(note.id)}
                      className={`mt-0.5 transition-all duration-200 ${
                        note.completed
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <span className={`flex-1 text-sm ${
                      note.completed
                        ? 'text-slate-400 line-through'
                        : 'text-white'
                    }`}>
                      {note.text}
                    </span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <StickyNote size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes yet. Add your first task!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Today's Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Active Routines</span>
                  <span className="text-indigo-400 font-medium">{routines.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Completed Tasks</span>
                  <span className="text-emerald-400 font-medium">
                    {notes.filter(n => n.completed).length}/{notes.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: notes.length > 0 ? `${(notes.filter(n => n.completed).length / notes.length) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center mt-8">
          <img
            src="https://img.freepik.com/premium-photo/secluded-cabin-forest-blending-smart-home-technology-with-beauty-nature-this-ecofriendly-retreat-offers-contemporary-design-sustainable-living-peacefulwoodland-setting_924727-44886.jpg"
            alt="Secluded Cabin"
            className="w-full md:w-1/2 rounded-lg shadow-md object-cover h-64"
          />
          <img
            src="https://ml9yftkh0gk2.i.optimole.com/cb:kjVW.6ef/w:322/h:220/q:mauto/ig:avif/https://esyncsecurity.com/wp-content/uploads/smart-surveillance-system-transforming-security-in-chennai-mjy.jpg"
            alt="Smart Surveillance System"
            className="w-full md:w-1/2 rounded-lg shadow-md object-cover h-64"
          />
        </div>
      </div>
    </div>
  );
}

export default SmartRoutinesDashboard;