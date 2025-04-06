import React from 'react';

function RoomSelector({ rooms, selectedRoom, onSelectRoom }) {
  return (
    <div className="flex overflow-x-auto space-x-4 mb-8 pb-4">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelectRoom(room.name)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-full whitespace-nowrap transition-colors ${
            selectedRoom === room.name
              ? 'bg-indigo-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <room.icon className="text-xl" />
          <span>{room.name}</span>
        </button>
      ))}
    </div>
  );
}

export default RoomSelector;