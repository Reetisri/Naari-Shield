import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Shield, Users, AlertTriangle, Battery, BatteryCharging, 
  Volume2, Download, Play, Clock, MapPin, Activity, CheckCircle, LogOut
} from 'lucide-react';

// Setup modern animated markers using Tailwind
const userLiveIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center">
           <span class="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-red-500 opacity-75"></span>
           <span class="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white"></span>
         </div>`,
  className: '',
  iconSize: [24, 24],
});

const userHistoryIcon = L.divIcon({
  html: `<div class="h-2 w-2 rounded-full bg-indigo-500 border border-white"></div>`,
  className: '',
  iconSize: [8, 8],
});

// Map component helper to auto-center when coordinates update
function ChangeMapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
}

export default function GuardianDashboard() {
  const { user, logout } = useAuth();
  const socket = useSocket();

  // List of linked women users
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Real-time states for the selected user
  const [isActiveEmergency, setIsActiveEmergency] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null); // { latitude, longitude }
  const [locationHistory, setLocationHistory] = useState([]); // Array of { latitude, longitude, timestamp }
  const [battery, setBattery] = useState({ level: 100, isCharging: false });
  const [risk, setRisk] = useState({ score: 0, level: 'Safe', reasons: [] });
  const [audioUrl, setAudioUrl] = useState('');
  
  // Real-time alarm banner for incoming SOS alerts from ANY linked user
  const [activeSOSAlert, setActiveSOSAlert] = useState(null); // { userId, userName, latitude, longitude }
  
  // SOS Timeline log
  const [timeline, setTimeline] = useState([]);

  const audioRef = useRef(null);

  useEffect(() => {
    fetchLinkedUsers();
  }, []);

  // Re-join socket rooms whenever linked users change (e.g. if newly added)
  useEffect(() => {
    if (socket && linkedUsers.length > 0) {
      const userIds = linkedUsers.map(item => item.user?._id).filter(Boolean);
      if (userIds.length > 0) {
        socket.emit('join_guardian', userIds);
        console.log('Joined rooms for linked users dynamically:', userIds);
      }
    }
  }, [socket, linkedUsers]);

  // Socket listener setup
  useEffect(() => {
    if (!socket || linkedUsers.length === 0) return;

    // Listen for SOS Trigger
    socket.on('sosTriggered', (data) => {
      // Check if trigger is from a linked user
      const isLinked = linkedUsers.some(item => item.user?._id === data.userId);
      if (isLinked) {
        setActiveSOSAlert(data);
        
        // Play warning beep sound if desired or trigger browser notifications
        try {
          const context = new (window.AudioContext || window.webkitAudioContext)();
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.connect(gain);
          gain.connect(context.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, context.currentTime); // High pitch beep
          gain.gain.setValueAtTime(0.5, context.currentTime);
          osc.start();
          osc.stop(context.currentTime + 1.2);
        } catch (e) {}

        // If the triggered user is currently selected, update their active status immediately
        if (selectedUser && selectedUser._id === data.userId) {
          setIsActiveEmergency(true);
          setLiveLocation({ latitude: data.latitude, longitude: data.longitude });
          setLocationHistory([{ latitude: data.latitude, longitude: data.longitude, timestamp: new Date() }]);
          setBattery(prev => ({ ...prev, level: data.batteryLevel }));
          setRisk(prev => ({ ...prev, score: data.riskScore }));
          
          setTimeline(prev => [
            { type: 'sos', message: 'SOS Triggered by User', time: new Date() },
            { type: 'location', message: `Initial GPS Point: ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`, time: new Date() },
            ...prev
          ]);
        }
      }
    });

    // Listen for Location updates
    socket.on('locationUpdated', (data) => {
      if (selectedUser && selectedUser._id === data.userId) {
        setLiveLocation({ latitude: data.latitude, longitude: data.longitude });
        setLocationHistory(prev => [...prev, { latitude: data.latitude, longitude: data.longitude, timestamp: data.timestamp }]);
        
        setTimeline(prev => [
          { type: 'location', message: `GPS Update: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`, time: new Date(data.timestamp) },
          ...prev
        ]);
      }
    });

    // Listen for Battery changes
    socket.on('batteryUpdated', (data) => {
      if (selectedUser && selectedUser._id === data.userId) {
        setBattery({ level: data.batteryLevel, isCharging: data.isCharging });
        
        if (data.batteryLevel <= 15) {
          setTimeline(prev => [
            { type: 'battery', message: `Low Battery Warning: User level at ${data.batteryLevel}%`, time: new Date() },
            ...prev
          ]);
        }
      }
    });

    // Listen for Risk adjustments
    socket.on('riskUpdated', (data) => {
      if (selectedUser && selectedUser._id === data.userId) {
        setRisk({ score: data.riskScore, level: data.level, reasons: data.reasons });
      }
    });

    // Listen for Audio evidence uploaded
    socket.on('audioUploaded', (data) => {
      if (selectedUser && selectedUser._id === data.userId) {
        setAudioUrl(data.audioUrl);
        setTimeline(prev => [
          { type: 'audio', message: 'Emergency Audio Evidence uploaded to Server', time: new Date() },
          ...prev
        ]);
      }
    });

    // Listen for SOS Resolution
    socket.on('sosResolved', (data) => {
      if (selectedUser && selectedUser._id === data.userId) {
        setIsActiveEmergency(false);
        setActiveSOSAlert(null);
        setTimeline(prev => [
          { type: 'resolved', message: 'SOS Alert resolved safely by User', time: new Date() },
          ...prev
        ]);
      }
      
      if (activeSOSAlert && activeSOSAlert.userId === data.userId) {
        setActiveSOSAlert(null);
      }
    });

    return () => {
      socket.off('sosTriggered');
      socket.off('locationUpdated');
      socket.off('batteryUpdated');
      socket.off('riskUpdated');
      socket.off('audioUploaded');
      socket.off('sosResolved');
    };
  }, [socket, selectedUser, linkedUsers, activeSOSAlert]);

  // Fetch users linked to this guardian
  const fetchLinkedUsers = async () => {
    try {
      const res = await axios.get('/api/guardian/list');
      if (res.data.success) {
        setLinkedUsers(res.data.data);
        // Default select first user if exists
        if (res.data.data.length > 0 && !selectedUser) {
          handleSelectUser(res.data.data[0].user);
        }
      }
    } catch (err) {
      console.error('Error fetching linked list:', err);
    }
  };

  // Process selecting a user to monitor
  const handleSelectUser = async (targetUser) => {
    if (!targetUser) return;
    setSelectedUser(targetUser);
    
    // Clear monitoring cache
    setIsActiveEmergency(false);
    setLiveLocation(null);
    setLocationHistory([]);
    setBattery({ level: targetUser.batteryLevel || 100, isCharging: targetUser.isCharging || false });
    setRisk({ score: 0, level: 'Safe', reasons: [] });
    setAudioUrl('');
    setTimeline([]);

    try {
      // 1. Fetch risk metrics
      const riskRes = await axios.get(`/api/risk/current?userId=${targetUser._id}`);
      if (riskRes.data.success) {
        setIsActiveEmergency(riskRes.data.data.isEmergencyActive);
        setBattery({
          level: riskRes.data.data.batteryLevel,
          isCharging: riskRes.data.data.isCharging,
        });
        setRisk(riskRes.data.data.risk);
      }

      // 2. Fetch tracking and history if active emergency exists
      const trackingRes = await axios.get('/api/location/live');
      if (trackingRes.data.success) {
        const activeTrack = trackingRes.data.data.find(item => {
          const emergencyUserId = item.emergency?.userId?._id?.toString() || item.emergency?.userId?.toString();
          return emergencyUserId === targetUser._id.toString();
        });
        if (activeTrack) {
          setIsActiveEmergency(true);
          const historyCoords = activeTrack.history.map(pt => ({
            latitude: pt.latitude,
            longitude: pt.longitude,
            timestamp: pt.timestamp
          }));
          setLocationHistory(historyCoords);
          
          if (historyCoords.length > 0) {
            setLiveLocation(historyCoords[historyCoords.length - 1]);
          }

          if (activeTrack.emergency.audioUrl) {
            setAudioUrl(activeTrack.emergency.audioUrl);
          }

          // Build historical timeline
          const buildTimeline = [
            { type: 'sos', message: 'SOS Triggered', time: new Date(activeTrack.emergency.createdAt) }
          ];

          activeTrack.history.forEach(pt => {
            buildTimeline.push({
              type: 'location',
              message: `GPS tracking logged: ${pt.latitude.toFixed(5)}, ${pt.longitude.toFixed(5)}`,
              time: new Date(pt.timestamp)
            });
          });

          if (activeTrack.emergency.audioUrl) {
            buildTimeline.push({
              type: 'audio',
              message: 'Audio evidence uploaded',
              time: new Date(activeTrack.emergency.createdAt) // approximate
            });
          }

          setTimeline(buildTimeline.reverse());
        }
      }
    } catch (err) {
      console.error('Error initiating user selected tracker:', err);
    }
  };

  const getAudioSource = () => {
    if (!audioUrl) return '';
    // Append server domain if path is relative
    return audioUrl.startsWith('http') ? audioUrl : `${axios.defaults.baseURL}${audioUrl}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-24 pb-12 px-6">
      
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-500" />
          <span className="font-extrabold text-lg bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
            Naari Shield
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-semibold bg-white/5 px-3 py-1.5 rounded-full">
            Role: <strong className="text-indigo-400">{user?.name}</strong> (Guardian Monitor)
          </span>
          <button 
            onClick={logout} 
            className="p-2 hover:bg-red-500/15 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-xl transition-all"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Global Real-time SOS Alert Banner */}
      {activeSOSAlert && (
        <div className="max-w-7xl mx-auto w-full mb-6 p-4 rounded-xl bg-red-950/70 border border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-full text-red-400 animate-ping">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-black text-white uppercase tracking-wider block">CRITICAL SOS ALERT TRIGGERED</span>
              <span className="text-xs text-red-300 block">
                User <strong className="text-white underline">{activeSOSAlert.userName}</strong> has triggered an emergency alert!
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              const target = linkedUsers.find(item => item.user?._id === activeSOSAlert.userId);
              if (target) {
                handleSelectUser(target.user);
              }
              setActiveSOSAlert(null);
            }}
            className="px-5 py-2.5 bg-white text-slate-950 font-bold rounded-lg text-xs hover:bg-slate-200 transition-all active:scale-95 shadow-md shadow-white/5"
          >
            Track Immediately
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Column: Linked Users selection & Maps tracker */}
        <div className="lg:col-span-8 space-y-8 flex flex-col h-full">
          
          {/* User selector tab */}
          <div className="glass p-4 rounded-2xl flex items-center gap-3 overflow-x-auto no-scrollbar border border-white/5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0 border-r border-white/10 pr-3 mr-1">
              <Users className="h-4 w-4 text-purple-400" /> Linked Profiles:
            </div>
            {linkedUsers.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No users have linked you as a guardian.</span>
            ) : (
              linkedUsers.map((item) => {
                const isSelected = selectedUser?._id === item.user?._id;
                return (
                  <button
                    key={item.mappingId}
                    onClick={() => handleSelectUser(item.user)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500 text-white shadow-lg'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        item.user?.batteryLevel < 20 ? 'bg-red-400' : 'bg-green-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        item.user?.batteryLevel < 20 ? 'bg-red-500' : 'bg-green-500'
                      }`}></span>
                    </span>
                    {item.user?.name}
                    <span className="text-[10px] font-medium opacity-60">({item.relationship})</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Leaflet Maps Visualizer Container */}
          <div className="glass p-6 rounded-2xl flex-1 flex flex-col min-h-[450px]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <MapPin className="h-5 w-5 text-indigo-400" /> Live Tracking Map
                </h3>
                <p className="text-xs text-slate-500">Updates dynamically every 10 seconds during active SOS alerts.</p>
              </div>
              {isActiveEmergency ? (
                <span className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 font-extrabold uppercase px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> SOS Beacon Broadcasting
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                  User Idle / Offline
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-900 border border-white/5 rounded-xl relative overflow-hidden min-h-[350px] h-[350px]">
              <MapContainer 
                center={liveLocation && typeof liveLocation.latitude === 'number' && typeof liveLocation.longitude === 'number' && !isNaN(liveLocation.latitude) && !isNaN(liveLocation.longitude) ? [liveLocation.latitude, liveLocation.longitude] : [20.5937, 78.9629]} 
                zoom={liveLocation ? 15 : 5} 
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {liveLocation && typeof liveLocation.latitude === 'number' && typeof liveLocation.longitude === 'number' && !isNaN(liveLocation.latitude) && !isNaN(liveLocation.longitude) && (
                  <>
                    {/* Draw historical path */}
                    <Polyline 
                      positions={locationHistory.map(pt => [pt.latitude, pt.longitude])} 
                      color="#6366f1" 
                      weight={4}
                      opacity={0.8}
                    />

                    {/* Draw dot for each point in history */}
                    {locationHistory.map((pt, idx) => (
                      <Marker 
                        key={idx} 
                        position={[pt.latitude, pt.longitude]} 
                        icon={userHistoryIcon}
                      >
                        <Popup>
                          <div className="text-xs font-mono">
                            Log Time: {new Date(pt.timestamp).toLocaleTimeString()}
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Active marker with ping radar */}
                    <Marker 
                      position={[liveLocation.latitude, liveLocation.longitude]} 
                      icon={userLiveIcon}
                    >
                      <Popup>
                        <div className="text-xs p-1">
                          <strong className="text-purple-600 block">{selectedUser?.name}</strong>
                          <span>Battery: {battery.level}%</span>
                        </div>
                      </Popup>
                    </Marker>
                    
                    <ChangeMapCenter center={[liveLocation.latitude, liveLocation.longitude]} />
                  </>
                )}
              </MapContainer>

              {(!liveLocation || typeof liveLocation.latitude !== 'number' || typeof liveLocation.longitude !== 'number' || isNaN(liveLocation.latitude) || isNaN(liveLocation.longitude)) && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 bg-slate-950/80 backdrop-blur-sm">
                  <MapPin className="h-10 w-10 text-slate-700 animate-bounce mb-3" />
                  <span className="text-sm font-semibold text-slate-400 block">No live location data available.</span>
                  <span className="text-xs text-slate-600 block mt-1">Select a linked user, or wait for them to trigger SOS.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry card, Audio player, Timeline */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Telemetry Panel */}
          {selectedUser && (
            <div className="glass p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider block">Telemetry: {selectedUser.name}</h3>
                <span className="text-xs text-slate-500">Active feeds monitor</span>
              </div>

              {/* Grid status */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Risk score */}
                <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Risk score</span>
                  <div className="my-2">
                    <span className="text-2xl font-black text-white block">{risk.score} <span className="text-xs text-slate-500">/ 100</span></span>
                    <span className={`text-[10px] font-bold uppercase ${
                      risk.level === 'High Risk' ? 'text-red-400' : risk.level === 'Moderate' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {risk.level}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        risk.score > 60 ? 'bg-red-500' : risk.score > 30 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                </div>

                {/* Battery level */}
                <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Battery Capacity</span>
                  <div className="my-2">
                    <span className="text-2xl font-black text-white flex items-baseline gap-1">
                      {battery.level}%
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase">
                      {battery.isCharging ? 'Charging' : 'Discharging'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        battery.level <= 15 ? 'bg-red-500' : battery.level <= 40 ? 'bg-yellow-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${battery.level}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Factors */}
              {risk.reasons && risk.reasons.length > 0 && (
                <div className="p-3 bg-slate-900 border border-white/5 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Risk explanation:</span>
                  {risk.reasons.map((r, idx) => (
                    <span key={idx} className="text-xs text-red-300 block">• {r}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audio Evidence Panel */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Volume2 className="h-5 w-5 text-purple-400" /> Audio Evidence
            </h3>

            {audioUrl ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 border border-white/5 rounded-xl flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-purple-500/10 rounded-full text-purple-400 animate-pulse">
                    <Volume2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Emergency Audio File Uploaded</span>
                    <span className="text-[10px] text-slate-500 block">Encrypted WebM source format</span>
                  </div>
                  <audio
                    ref={audioRef}
                    src={getAudioSource()}
                    controls
                    className="w-full mt-2"
                  />
                </div>
                <div className="flex gap-3">
                  <a
                    href={getAudioSource()}
                    download="evidence.webm"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-200 transition-all text-xs flex items-center justify-center gap-1.5 shadow-md shadow-white/5"
                  >
                    <Download className="h-3.5 w-3.5" /> Download WebM
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-950/20 border border-white/5 border-dashed rounded-xl text-center flex flex-col items-center">
                <Volume2 className="h-7 w-7 text-slate-700 mb-2" />
                <span className="text-xs text-slate-400 block font-semibold">No Audio Uploaded</span>
                <span className="text-[10px] text-slate-600 block mt-1">Audio will capture automatically when SOS triggers.</span>
              </div>
            )}
          </div>

          {/* Emergency Logs Timeline */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-indigo-400" /> SOS Activity Timeline
            </h3>

            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
              {timeline.length === 0 ? (
                <span className="text-xs text-slate-500 italic block text-center py-4">No active tracking log.</span>
              ) : (
                timeline.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-indigo-600/30 pl-4 space-y-1 relative pb-2 last:pb-0">
                    <div className={`absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ${
                      item.type === 'sos' ? 'bg-red-500' : item.type === 'battery' ? 'bg-yellow-500' : item.type === 'audio' ? 'bg-purple-500' : 'bg-indigo-500'
                    }`} />
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-200 block">{item.message}</span>
                      <span className="text-[9px] text-slate-500">
                        {item.time ? new Date(item.time).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
