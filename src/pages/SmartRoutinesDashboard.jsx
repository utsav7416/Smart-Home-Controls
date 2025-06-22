import { Sun, Moon, Calendar, CheckCircle2, StickyNote, Mic, MicOff, Play, Square, Edit3, Trash2, Plus } from "lucide-react";
import React, { useState, useRef } from "react";

const icons = [Sun, Moon, Calendar];
const iconColors = [
  "text-yellow-400",
  "text-indigo-400",
  "text-green-400",
  "text-rose-400",
  "text-purple-400",
  "text-amber-400",
];
const bgColors = [
  "bg-yellow-100",
  "bg-indigo-100",
  "bg-green-100",
  "bg-rose-100",
  "bg-purple-100",
  "bg-amber-100",
];

export default function SmartRoutinesDashboard() {
  const [routines, setRoutines] = useState([
    { id: 1, name: "Morning Routine", time: "07:00", days: "Weekdays", icon: 0, color: 0 },
    { id: 2, name: "Bedtime Mode", time: "22:30", days: "Every day", icon: 1, color: 1 },
  ]);
  const [notes, setNotes] = useState([
    { id: 1, text: "Complete workout by 6 AM", completed: false },
    { id: 2, text: "Meditate for 10 minutes", completed: true },
  ]);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [routineForm, setRoutineForm] = useState({ name: "", time: "", days: "", icon: 0, color: 0 });
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);

  function formatTime(time) {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  }

  function handleAddNote() {
    if (!newNote.trim()) return;
    setNotes([...notes, { id: Date.now(), text: newNote.trim(), completed: false }]);
    setNewNote("");
  }

  function handleToggleNote(id) {
    setNotes(notes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n)));
  }

  function handleDeleteNote(id) {
    setNotes(notes.filter((n) => n.id !== id));
  }

  function handleEditRoutine(r) {
    setEditingRoutine(r.id);
    setRoutineForm({ name: r.name, time: r.time, days: r.days, icon: r.icon, color: r.color });
    setShowRoutineForm(true);
  }

  function handleDeleteRoutine(id) {
    setRoutines(routines.filter((r) => r.id !== id));
  }

  function handleRoutineFormChange(e) {
    const { name, value } = e.target;
    setRoutineForm((f) => ({ ...f, [name]: value }));
  }

  function handleRoutineFormSave() {
    if (!routineForm.name || !routineForm.time || !routineForm.days) return;
    if (editingRoutine) {
      setRoutines(
        routines.map((r) =>
          r.id === editingRoutine
            ? { ...r, ...routineForm, icon: Number(routineForm.icon), color: Number(routineForm.color) }
            : r
        )
      );
    } else {
      setRoutines([...routines, { id: Date.now(), ...routineForm, icon: Number(routineForm.icon), color: Number(routineForm.color) }]);
    }
    setEditingRoutine(null);
    setRoutineForm({ name: "", time: "", days: "", icon: 0, color: 0 });
    setShowRoutineForm(false);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {}
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  function saveVoiceNote() {
    if (audioBlob) {
      setVoiceNotes([...voiceNotes, { id: Date.now(), url: URL.createObjectURL(audioBlob), timestamp: new Date().toLocaleString() }]);
      setAudioBlob(null);
    }
  }

  function playVoiceNote(id, url) {
    if (currentPlayingId === id) {
      audioRef.current.pause();
      setCurrentPlayingId(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play();
      setCurrentPlayingId(id);
      audioRef.current.onended = () => setCurrentPlayingId(null);
    }
  }

  function deleteVoiceNote(id) {
    setVoiceNotes(voiceNotes.filter((v) => v.id !== id));
    if (currentPlayingId === id && audioRef.current) {
      audioRef.current.pause();
      setCurrentPlayingId(null);
    }
  }

  function handleSpeedChange(s) {
    setPlaybackSpeed(s);
    if (audioRef.current) {
      audioRef.current.playbackRate = s;
    }
  }

  const progress = notes.length > 0 ? Math.round((notes.filter((n) => n.completed).length / notes.length) * 100) : 0;

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden" style={{
      backgroundImage: "url(https://wallpapers.com/images/featured/green-nature-background-e1kbkjzwa2ehmmmz.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed"
    }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
      <audio ref={audioRef} style={{ display: "none" }} />
      <div className="relative z-10 max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent mb-2 drop-shadow-lg">
          Smart Routines
        </h1>
        <div className="text-center text-lg text-white mb-1 drop-shadow-md">
          Plan, automate, and track your daily life with ease.
        </div>
        <div className="text-center text-base text-green-100 mb-8 drop-shadow-md">
          Fresh, colorful, and productive—your smart routine assistant.
        </div>
        <div className="flex justify-center gap-4 mb-10">
          {[
            { text: "PLAN", icon: Sun, color: "bg-yellow-200/90", ic: "text-yellow-600" },
            { text: "EXECUTE", icon: Calendar, color: "bg-green-200/90", ic: "text-green-600" },
            { text: "TRACK", icon: CheckCircle2, color: "bg-lime-200/90", ic: "text-lime-600" },
            { text: "OPTIMIZE", icon: Moon, color: "bg-indigo-200/90", ic: "text-indigo-600" },
            { text: "ACHIEVE", icon: StickyNote, color: "bg-amber-200/90", ic: "text-amber-600" },
          ].map((b, i) => (
            <div
              key={b.text}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold shadow-xl ${b.color} text-black text-lg animate-bounce${i + 1} backdrop-blur-sm`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "2.2s",
                animationIterationCount: "infinite",
              }}
            >
              <b.icon size={20} className={b.ic} />
              {b.text}
            </div>
          ))}
        </div>
        <div className="bg-black/50 backdrop-blur-xl rounded-3xl border border-emerald-400/30 shadow-2xl relative overflow-hidden mb-12">
          <div className="p-7 md:p-10">
            <div className="flex items-center mb-4">
              <Sun className="text-amber-400 mr-3" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Your Daily Routines
                </h2>
                <div className="text-green-200 text-base">
                  Smart scheduling for consistent habits.
                </div>
                <div className="text-green-100 text-sm mt-1">
                  Automate your day with routines tailored to your lifestyle.<br />
                  Set times, pick icons, and let your day flow naturally.
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 mb-4">
              {routines.map((r) => {
                const Icon = icons[r.icon];
                return (
                  <div
                    key={r.id}
                    className={`flex items-center px-6 py-6 rounded-xl shadow-md border border-emerald-400/20 bg-black/30 hover:bg-emerald-900/20 transition-all duration-200 backdrop-blur-md`}
                  >
                    <div
                      className={`mr-4 p-2 rounded-lg ${bgColors[r.color]} ${iconColors[r.color]} border border-emerald-100`}
                    >
                      <Icon size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">
                        {r.name}
                      </div>
                      <div className="text-green-200 text-xs mb-2">
                        {formatTime(r.time)} &bull; {r.days}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-emerald-300 hover:text-emerald-100"
                        onClick={() => handleEditRoutine(r)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="text-red-400 hover:text-red-600"
                        onClick={() => handleDeleteRoutine(r.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                className="flex items-center px-6 py-6 rounded-xl border-2 border-dashed border-emerald-400/40 text-white hover:bg-emerald-900/20 font-medium backdrop-blur-md"
                onClick={() => {
                  setEditingRoutine(null);
                  setRoutineForm({ name: "", time: "", days: "", icon: 0, color: 0 });
                  setShowRoutineForm(true);
                }}
              >
                <Plus size={24} className="mr-3" />
                Add Routine
              </button>
            </div>
            {showRoutineForm && (
              <div className="bg-emerald-900/30 border border-emerald-400/40 rounded-xl p-4 mb-2 backdrop-blur-md">
                <div className="flex flex-col md:flex-row gap-3 mb-2">
                  <input
                    className="flex-1 px-3 py-2 rounded border border-emerald-400/40 bg-black/40 text-white placeholder-gray-300 backdrop-blur-sm"
                    placeholder="Routine Name"
                    name="name"
                    value={routineForm.name}
                    onChange={handleRoutineFormChange}
                  />
                  <input
                    className="flex-1 px-3 py-2 rounded border border-emerald-400/40 bg-black/40 text-white backdrop-blur-sm"
                    type="time"
                    name="time"
                    value={routineForm.time}
                    onChange={handleRoutineFormChange}
                  />
                  <input
                    className="flex-1 px-3 py-2 rounded border border-emerald-400/40 bg-black/40 text-white placeholder-gray-300 backdrop-blur-sm"
                    placeholder="Days (e.g. Weekdays)"
                    name="days"
                    value={routineForm.days}
                    onChange={handleRoutineFormChange}
                  />
                </div>
                <div className="flex gap-2 mb-2">
                  {icons.map((Icon, i) => (
                    <button
                      key={i}
                      className={`p-2 rounded ${routineForm.icon == i ? "bg-emerald-300/80" : "bg-black/40"} border backdrop-blur-sm`}
                      onClick={() =>
                        setRoutineForm((f) => ({ ...f, icon: i }))
                      }
                      type="button"
                    >
                      <Icon size={20} />
                    </button>
                  ))}
                  {bgColors.map((bg, i) => (
                    <button
                      key={i}
                      className={`w-6 h-6 rounded-full border-2 ml-1 ${bg} ${
                        routineForm.color == i
                          ? "border-emerald-400"
                          : "border-emerald-400/40"
                      }`}
                      onClick={() =>
                        setRoutineForm((f) => ({ ...f, color: i }))
                      }
                      type="button"
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded bg-emerald-400 text-white font-semibold"
                    onClick={handleRoutineFormSave}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-200/90 text-emerald-800 font-semibold"
                    onClick={() => setShowRoutineForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-black/50 backdrop-blur-xl rounded-3xl border border-amber-400/30 shadow-2xl relative overflow-hidden mb-8">
            <div className="p-7 md:p-10">
              <div className="flex items-center mb-4">
                <StickyNote className="text-amber-400 mr-3" size={28} />
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Quick Notes
                  </h2>
                  <div className="text-amber-200 text-base">
                    Capture thoughts instantly
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 px-3 py-2 rounded border border-amber-400/40 bg-black/40 text-white placeholder-gray-300 backdrop-blur-sm"
                  placeholder="What's on your mind?"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                />
                <button
                  className="px-3 py-2 rounded bg-amber-400 text-white font-semibold"
                  onClick={handleAddNote}
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {notes.length === 0 && (
                  <div className="text-amber-300 text-center py-8">
                    <StickyNote className="mx-auto mb-2" size={32} />
                    No notes yet.
                  </div>
                )}
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-400/30 bg-black/30 backdrop-blur-sm"
                  >
                    <button
                      className={`${
                        n.completed
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                      onClick={() => handleToggleNote(n.id)}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <span
                      className={`flex-1 ${
                        n.completed
                          ? "line-through text-gray-300"
                          : "text-white"
                      }`}
                    >
                      {n.text}
                    </span>
                    <button
                      className="text-red-400 hover:text-red-600"
                      onClick={() => handleDeleteNote(n.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-xl rounded-3xl border border-green-400/30 shadow-2xl relative overflow-hidden mb-8">
            <div className="p-7 md:p-10">
              <div className="flex items-center mb-4">
                <Mic className="text-green-400 mr-3" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Voice Notes
                  </h2>
                  <div className="text-green-200 text-base">
                    Record your ideas and reminders hands-free
                  </div>
                </div>
              </div>
              <div className="text-green-100 text-lg mb-3">
                Easily capture voice memos for your routines, tasks, or anything on your mind.<br />
                Playback at your chosen speed and stay organized.
              </div>
              <div className="flex gap-2 mb-4">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-green-400 text-white font-semibold ${
                    isRecording ? "bg-green-600" : ""
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
                {audioBlob && (
                  <button
                    className="px-4 py-2 rounded bg-green-600 text-white font-semibold"
                    onClick={saveVoiceNote}
                  >
                    Save
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {voiceNotes.length === 0 && (
                  <div className="text-green-300 text-center py-8">
                    <Mic className="mx-auto mb-2" size={32} />
                    No voice notes yet.
                  </div>
                )}
                {voiceNotes.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-2 px-3 py-3 rounded-lg border border-green-400/30 bg-black/30 backdrop-blur-sm"
                  >
                    <button
                      className="text-green-400"
                      onClick={() => playVoiceNote(v.id, v.url)}
                    >
                      {currentPlayingId === v.id ? (
                        <Square size={20} />
                      ) : (
                        <Play size={20} />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        Voice Note
                      </div>
                      <div className="text-green-300 text-xs">
                        {v.timestamp}
                      </div>
                    </div>
                    <div className="flex gap-1 items-center">
                      {[0.5, 1, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          className={`px-2 py-1 rounded text-xs ${
                            playbackSpeed === s
                              ? "bg-green-400 text-white"
                              : "bg-green-200/80 text-green-700"
                          }`}
                          onClick={() => handleSpeedChange(s)}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                    <button
                      className="text-red-400 hover:text-red-600"
                      onClick={() => deleteVoiceNote(v.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-xl rounded-3xl border border-blue-400/30 shadow-2xl relative overflow-hidden mb-12 mt-8">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Today's Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-900/30 rounded-2xl p-6 border border-emerald-400/30 text-center backdrop-blur-lg">
                <div className="text-emerald-400 font-bold text-3xl mb-2">{routines.length}</div>
                <div className="text-emerald-200 font-medium">Active Routines</div>
              </div>
              <div className="bg-blue-900/30 rounded-2xl p-6 border border-blue-400/30 text-center backdrop-blur-lg">
                <div className="text-blue-400 font-bold text-3xl mb-2">
                  {notes.filter(n => n.completed).length}/{notes.length}
                </div>
                <div className="text-blue-200 font-medium">Tasks Complete</div>
              </div>
              <div className="bg-amber-900/30 rounded-2xl p-6 border border-amber-400/30 text-center backdrop-blur-lg">
                <div className="text-amber-400 font-bold text-3xl mb-2">{voiceNotes.length}</div>
                <div className="text-amber-200 font-medium">Voice Notes</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-xl">Daily Progress</span>
                <span className="text-emerald-400 font-bold text-xl">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-4 overflow-hidden backdrop-blur-md">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-400 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${progress}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-12 mt-8">
          <h2 className="text-4xl font-bold text-white mb-10 text-center bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent drop-shadow-lg">
            Smart Home Integration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                src: "https://img.freepik.com/premium-photo/secluded-cabin-forest-blending-smart-home-technology-with-beauty-nature-this-ecofriendly-retreat-offers-contemporary-design-sustainable-living-peacefulwoodland-setting_924727-44886.jpg",
                title: "Eco-Smart Cabin",
              },
              {
                src: "https://ml9yftkh0gk2.i.optimole.com/cb:kjVW.6ef/w:322/h:220/q:mauto/ig:avif/https://esyncsecurity.com/wp-content/uploads/smart-surveillance-system-transforming-security-in-chennai-mjy.jpg",
                title: "Advanced Security",
              },
              {
                src: "https://atsmarthomesg.com/wp-content/uploads/2024/10/smart-light-dimming-and-brightness-control.png",
                title: "Intelligent Lighting",
              },
              {
                src: "https://ueeshop.ly200-cdn.com/u_file/UPAC/UPAC480/2002/photo/441c133573.jpg",
                title: "Connected Living",
              }
            ].map((item, index) => (
              <div key={index} className="group relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-bold text-xl mb-2 drop-shadow-lg">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bounce1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes bounce2 { 0%,100%{transform:translateY(0)} 60%{transform:translateY(-10px)} }
        @keyframes bounce3 { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-15px)} }
        @keyframes bounce4 { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-9px)} }
        @keyframes bounce5 { 0%,100%{transform:translateY(0)} 70%{transform:translateY(-14px)} }
        .animate-bounce1 { animation: bounce1 2.2s infinite; }
        .animate-bounce2 { animation: bounce2 2.2s infinite; }
        .animate-bounce3 { animation: bounce3 2.2s infinite; }
        .animate-bounce4 { animation: bounce4 2.2s infinite; }
        .animate-bounce5 { animation: bounce5 2.2s infinite; }
      `}</style>
    </div>
  );
}