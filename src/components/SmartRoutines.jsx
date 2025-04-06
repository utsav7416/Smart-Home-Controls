import React, { useState } from 'react';
import { FaSun, FaMoon, FaPencilAlt, FaTrash, FaPlus } from 'react-icons/fa';

function SmartRoutines() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [routines, setRoutines] = useState([
    {
      name: 'Morning Routine',
      time: '7:00 AM',
      days: 'Weekdays',
      icon: FaSun,
    },
    {
      name: 'Bedtime Mode',
      time: '10:30 PM',
      days: 'Every day',
      icon: FaMoon,
    },
  ]);

  const [newRoutine, setNewRoutine] = useState({
    name: '',
    time: '',
    days: '',
    icon: FaSun,
  });

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewRoutine(routines[index]);
  };

  const handleDelete = (index) => {
    setRoutines(routines.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (editingIndex < routines.length) {
      // Update an existing routine
      setRoutines(
        routines.map((routine, index) =>
          index === editingIndex ? newRoutine : routine
        )
      );
    } else {
      // Add a new routine
      setRoutines([...routines, newRoutine]);
    }
    setEditingIndex(null);
    setNewRoutine({ name: '', time: '', days: '', icon: FaSun });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Smart Routines</h2>
        <button 
          onClick={() => {
            setIsEditing(!isEditing);
            setEditingIndex(null);
            setNewRoutine({ name: '', time: '', days: '', icon: FaSun });
          }}
          className="text-indigo-400 hover:text-indigo-300"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {isEditing && editingIndex !== null && (
        <div className="mb-4 p-4 bg-white/5 rounded-lg">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Routine Name"
              value={newRoutine.name}
              onChange={(e) => setNewRoutine({...newRoutine, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
            />
            <input
              type="time"
              value={newRoutine.time}
              onChange={(e) => setNewRoutine({...newRoutine, time: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
            />
            <input
              type="text"
              placeholder="Days (e.g., Weekdays, Every day)"
              value={newRoutine.days}
              onChange={(e) => setNewRoutine({...newRoutine, days: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
            />
            <button
              onClick={handleSave}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              Save Routine
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {routines.map((routine, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center">
              <routine.icon className="text-2xl text-indigo-400 mr-4" />
              <div>
                <h3 className="text-white font-medium">{routine.name}</h3>
                <p className="text-gray-400 text-sm">
                  {routine.time} • {routine.days}
                </p>
              </div>
            </div>
            {isEditing && (
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleEdit(index)}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  <FaPencilAlt />
                </button>
                <button 
                  onClick={() => handleDelete(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        ))}

        {isEditing && editingIndex === null && (
          <button
            onClick={() => setEditingIndex(routines.length)}
            className="w-full flex items-center justify-center space-x-2 p-4 bg-white/5 rounded-lg text-indigo-400 hover:text-indigo-300"
          >
            <FaPlus />
            <span>Add New Routine</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default SmartRoutines;
