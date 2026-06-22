import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Shield, AlertTriangle, Battery, BatteryCharging, 
  Mic, MicOff, Users, Plus, Trash2, History, CheckCircle, 
  MapPin, LogOut, Radio, Loader2
} from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const socket = useSocket();

  // Local states
  const [isSosTriggered, setIsSosTriggered] = useState(false);
  const [battery, setBattery] = useState({ level: 100, isCharging: false });
  const [gpsCoords, setGpsCoords] = useState(null);
  const [riskData, setRiskData] = useState({ score: 0, level: 'Safe', reasons: [] });
  
  // Lists
  const [guardians, setGuardians] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Forms & Actions states
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSpeechListening, setIsSpeechListening] = useState(false);

  // References for periodic loops
  const gpsIntervalRef = useRef(null);
  const batteryIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioLoopTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentEmergencyIdRef = useRef(null);
  const isSosTriggeringRef = useRef(false);

  // Fetch initial profile-specific details
  useEffect(() => {
    fetchGuardians();
    fetchEmergencyHistory();
    fetchRiskScore();
    setupBatteryAPI();
    setupSpeechRecognition();

    return () => {
      stopTracking();
      stopSpeechRecognition();
    };
  }, []);

  // Set up socket updates for battery changes
  useEffect(() => {
    if (socket && user) {
      socket.emit('batteryUpdated', {
        userId: user._id,
        batteryLevel: battery.level,
        isCharging: battery.isCharging,
      });
      // Trigger risk score calculation update
      fetchRiskScore();
    }
  }, [battery, socket]);

  // Fetch linked guardians
  const fetchGuardians = async () => {
    try {
      const res = await axios.get('/api/guardian/list');
      if (res.data.success) {
        setGuardians(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching guardians:', err);
    }
  };

  // Fetch SOS logs history
  const fetchEmergencyHistory = async () => {
    try {
      const res = await axios.get('/api/emergency/history');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  // Calculate current risk score
  const fetchRiskScore = async () => {
    try {
      const res = await axios.get('/api/risk/current');
      if (res.data.success) {
        setRiskData(res.data.data.risk);

        // Restore SOS active state if backend indicates an active emergency and tracking hasn't started yet
        if (res.data.data.isEmergencyActive) {
          setIsSosTriggered(true);
          if (!gpsIntervalRef.current) {
            startGpsTracking();
          }
          if (!audioLoopTimeoutRef.current && (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive')) {
            startAudioRecording();
          }
        }
      }
    } catch (err) {
      console.error('Error fetching risk score:', err);
    }
  };

  // Battery Status API Setup
  const setupBatteryAPI = async () => {
    try {
      if (navigator.getBattery) {
        const batteryObj = await navigator.getBattery();
        const updateBatteryInfo = () => {
          const level = Math.round(batteryObj.level * 100);
          const isCharging = batteryObj.charging;
          setBattery({ level, isCharging });

          // Send telemetry to backend
          axios.post('/api/location/update', { batteryLevel: level, isCharging });

          // Broadcast alert below 15%
          if (level <= 15 && !isCharging) {
            setSuccessMsg('Low Battery Warning! Your guardians have been alerted.');
          }
        };

        updateBatteryInfo();
        batteryObj.addEventListener('levelchange', updateBatteryInfo);
        batteryObj.addEventListener('chargingchange', updateBatteryInfo);

        // Keep a poll fallback
        batteryIntervalRef.current = setInterval(async () => {
          const updated = await navigator.getBattery();
          setBattery({
            level: Math.round(updated.level * 100),
            isCharging: updated.charging,
          });
        }, 60000);
      }
    } catch (err) {
      console.warn('Battery API not supported on this device/browser');
    }
  };

  // Speech Recognition API Setup
  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported on this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const text = event.results[lastResultIndex][0].transcript.toLowerCase();
      console.log('Voice heard:', text);

      if (text.includes('help me') || text.includes('emergency') || text.includes('save me')) {
        setSuccessMsg(`Speech trigger detected keyword in phrase: "${text}". Triggering SOS...`);
        triggerSosAction();
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e);
    };

    recognition.onend = () => {
      // Re-enable if listening state is active
      if (isSpeechListening) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      setErrorMsg('Web Speech API is not supported on this device');
      return;
    }

    if (isSpeechListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const startSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsSpeechListening(true);
        setSuccessMsg('Voice listening active (triggers: Help Me, Emergency, Save Me)');
      } catch (err) {
        console.error('Error starting speech:', err);
      }
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsSpeechListening(false);
      } catch (err) {}
    }
  };

  // Link a guardian email
  const handleAddGuardian = async (e) => {
    e.preventDefault();
    if (!guardianEmail) return;

    try {
      setErrorMsg('');
      setSuccessMsg('');
      const res = await axios.post('/api/guardian/add', {
        email: guardianEmail,
        relationship: guardianRelationship,
      });

      if (res.data.success) {
        setSuccessMsg('Guardian linked successfully!');
        setGuardianEmail('');
        setGuardianRelationship('');
        fetchGuardians();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add guardian');
    }
  };

  // Delete a guardian link
  const handleRemoveGuardian = async (guardianId) => {
    try {
      const res = await axios.delete(`/api/guardian/remove/${guardianId}`);
      if (res.data.success) {
        setSuccessMsg('Guardian removed');
        fetchGuardians();
      }
    } catch (err) {
      setErrorMsg('Failed to remove guardian link');
    }
  };

  // SOS Action triggers
  const triggerSosAction = async () => {
    if (isSosTriggered || isSosTriggeringRef.current) return;
    isSosTriggeringRef.current = true;

    // Get current GPS coords
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ latitude, longitude });

        try {
          setErrorMsg('');
          const res = await axios.post('/api/emergency/trigger', {
            latitude,
            longitude,
            batteryLevel: battery.level,
            riskScore: riskData.score,
          });

          if (res.data.success) {
            setIsSosTriggered(true);
            currentEmergencyIdRef.current = res.data.data._id;

            // Broadcast socket event
            if (socket) {
              socket.emit('sosTriggered', {
                userId: user._id,
                userName: user.name,
                latitude,
                longitude,
                batteryLevel: battery.level,
                riskScore: riskData.score + 50, // Active emergency adds +50
              });
            }

            // Start Geolocation looping updates (every 10s)
            startGpsTracking();

            // Start Audio Evidence loop
            startAudioRecording();

            // Re-fetch risk
            fetchRiskScore();
            fetchEmergencyHistory();
          }
        } catch (err) {
          setErrorMsg('Failed to initiate SOS alert. Please try again.');
        } finally {
          isSosTriggeringRef.current = false;
        }
      },
      (error) => {
        setErrorMsg('GPS location access denied. Please grant location permissions to trigger SOS.');
        isSosTriggeringRef.current = false;
      },
      { enableHighAccuracy: true }
    );
  };

  // Resolve active SOS
  const resolveSosAction = async () => {
    try {
      const res = await axios.post('/api/emergency/resolve');
      if (res.data.success) {
        setIsSosTriggered(false);
        currentEmergencyIdRef.current = null;
        isSosTriggeringRef.current = false;
        setSuccessMsg('SOS alert resolved safely');

        // Stop tracking & recording loop
        stopTracking();

        // Broadcast socket resolution
        if (socket) {
          socket.emit('sosResolved', {
            userId: user._id,
            userName: user.name,
          });
        }

        fetchRiskScore();
        fetchEmergencyHistory();
      }
    } catch (err) {
      setErrorMsg('Failed to resolve emergency.');
    }
  };

  // Looping coordinates tracking
  const startGpsTracking = () => {
    if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);

    gpsIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setGpsCoords({ latitude, longitude });

          // Send update to database
          await axios.post('/api/location/update', {
            latitude,
            longitude,
            batteryLevel: battery.level,
          });

          // Broadcast to socket
          if (socket) {
            socket.emit('locationUpdated', {
              userId: user._id,
              latitude,
              longitude,
              timestamp: new Date(),
            });
          }
        },
        (err) => console.error('GPS update failed:', err),
        { enableHighAccuracy: true }
      );
    }, 10000); // 10 seconds interval
  };

  // Audio recording media recorder loop
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Upload audio chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'evidence.webm', { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append('audio', audioFile);

        try {
          const res = await axios.post('/api/audio/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (res.data.success && socket) {
            socket.emit('audioUploaded', {
              userId: user._id,
              audioUrl: res.data.data.audioUrl,
            });
          }
        } catch (err) {
          console.error('Audio upload failed:', err);
        }

        // Loop again if SOS remains active
        if (isSosTriggered) {
          startAudioRecording();
        }
      };

      mediaRecorder.start();
      console.log('Audio recording started...');

      // Record in 30 seconds increments
      audioLoopTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, 30000);

    } catch (err) {
      console.error('Failed to access microphone for recording:', err);
    }
  };

  const stopTracking = () => {
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
    if (audioLoopTimeoutRef.current) {
      clearTimeout(audioLoopTimeoutRef.current);
      audioLoopTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-24 pb-12 px-6">
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-500" />
          <span className="font-extrabold text-lg bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
            Naari Shield AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-semibold bg-white/5 px-3 py-1.5 rounded-full">
            Logged in as: <strong className="text-purple-300">{user?.name}</strong> (User)
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

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column: Big SOS button, voice activator, telemetry */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main SOS Trigger Module */}
          <div className="glass-premium p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-3xl rounded-full" />
            
            <h2 className="text-xl font-bold tracking-tight text-slate-200 mb-2">Emergency Assistance Trigger</h2>
            <p className="text-slate-400 text-sm max-w-sm mb-8">
              Press the SOS button or speak one of the voice command keywords to transmit live tracking.
            </p>

            {/* Big pulsating button */}
            <div className="relative mb-8">
              {isSosTriggered && (
                <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping-slow scale-150" />
              )}
              <button
                onClick={isSosTriggered ? resolveSosAction : triggerSosAction}
                className={`h-48 w-48 rounded-full border-4 font-black text-xl flex flex-col items-center justify-center shadow-2xl transition-all duration-500 active:scale-95 ${
                  isSosTriggered
                    ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white animate-pulse'
                    : 'bg-gradient-to-tr from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 border-purple-500/50 text-slate-100 hover:shadow-purple-500/10'
                }`}
              >
                <Radio className={`h-8 w-8 mb-2 ${isSosTriggered ? 'animate-bounce' : ''}`} />
                {isSosTriggered ? 'ACTIVE: SOS' : 'TRIGGER SOS'}
                <span className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-70">
                  {isSosTriggered ? 'Press to Resolve' : 'Click to Alert'}
                </span>
              </button>
            </div>

            {/* Dynamic Status Notifications */}
            {successMsg && (
              <div className="mb-6 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs w-full max-w-md animate-fade-in flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-purple-400" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs w-full max-w-md animate-fade-in flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Voice Trigger toggle */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/5 w-full justify-between">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-400 block">VOICE TRIGGER ACTIVATION</span>
                <span className="text-[10px] text-slate-500">Listen for "Help Me", "Emergency", "Save Me"</span>
              </div>
              <button
                onClick={toggleSpeechRecognition}
                className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all ${
                  isSpeechListening
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {isSpeechListening ? (
                  <>
                    <Mic className="h-3.5 w-3.5 animate-pulse text-purple-300" /> Speech Listening Active
                  </>
                ) : (
                  <>
                    <MicOff className="h-3.5 w-3.5" /> Speech Recognition Off
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Core Telemetry Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Card */}
            <div className="glass p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Risk Profile</span>
                <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full ${
                  riskData.level === 'High Risk' 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                    : riskData.level === 'Moderate'
                    ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                    : 'bg-green-500/10 border border-green-500/30 text-green-400'
                }`}>
                  {riskData.level}
                </span>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-3xl font-extrabold text-white font-mono">{riskData.score}</span>
                  <span className="text-xs text-slate-500">Maximum: 100</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      riskData.score > 60 ? 'bg-red-500' : riskData.score > 30 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${riskData.score}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Active Factors:</span>
                {riskData.reasons.length > 0 ? (
                  riskData.reasons.map((r, idx) => (
                    <span key={idx} className="text-xs text-slate-400 block">• {r}</span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 block">No safety risks currently detected</span>
                )}
              </div>
            </div>

            {/* Battery Telemetry Card */}
            <div className="glass p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Battery Telemetry</span>
                {battery.isCharging ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <BatteryCharging className="h-3 w-3" /> Charging
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full">
                    Discharging
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-4xl font-extrabold text-white font-mono">{battery.level}%</span>
                  <span className="text-xs text-slate-500 block">Status: {battery.level > 15 ? 'Healthy' : 'Critical Warning'}</span>
                </div>
                <div className="h-14 w-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                  <Battery className={`h-7 w-7 ${battery.level <= 15 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`} />
                </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      battery.level <= 15 ? 'bg-red-500' : battery.level <= 40 ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${battery.level}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Updates Details */}
          {gpsCoords && (
            <div className="glass p-6 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase">Broadcasting Coordinates</span>
                  <span className="text-xs text-slate-300 block font-mono">
                    Lat: {gpsCoords.latitude.toFixed(6)}° , Lon: {gpsCoords.longitude.toFixed(6)}°
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 animate-pulse flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active GPS Uplink
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Guardian settings & history */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Linked Guardians */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" /> Linked Guardians
              </h3>
              <p className="text-xs text-slate-500">Guardians will receive live websocket SOS updates.</p>
            </div>

            <form onSubmit={handleAddGuardian} className="space-y-3">
              <input
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="Guardian's Registered Email"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/5 rounded-xl focus:border-purple-500/50 focus:outline-none placeholder:text-slate-600 text-xs"
                required
              />
              <input
                type="text"
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
                placeholder="Relationship (e.g. Mother, Friend)"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/5 rounded-xl focus:border-purple-500/50 focus:outline-none placeholder:text-slate-600 text-xs"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 transition-all text-xs flex items-center justify-center gap-1 text-white"
              >
                <Plus className="h-4 w-4" /> Link Guardian
              </button>
            </form>

            <div className="space-y-3 pt-4 border-t border-white/5">
              {guardians.length === 0 ? (
                <span className="text-xs text-slate-500 italic block text-center py-4">No guardians added yet.</span>
              ) : (
                guardians.map((item) => (
                  <div key={item.mappingId} className="bg-slate-900/60 border border-white/5 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{item.guardian?.name}</span>
                      <span className="text-[10px] text-slate-400 block">{item.relationship} • {item.guardian?.phoneNumber}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveGuardian(item.guardian?._id)}
                      className="p-2 hover:bg-red-500/15 hover:text-red-400 rounded-lg border border-transparent hover:border-red-500/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emergency Logs History */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <History className="h-5 w-5 text-purple-400" /> SOS Alert History
            </h3>
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              {history.length === 0 ? (
                <span className="text-xs text-slate-500 italic block text-center py-6">No emergency records yet.</span>
              ) : (
                history.map((h) => (
                  <div key={h._id} className="border-l-2 border-slate-700 pl-4 space-y-1 relative">
                    <div className={`absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ${
                      h.emergencyStatus === 'active' ? 'bg-red-500 animate-ping' : 'bg-slate-500'
                    }`} />
                    <div className="flex justify-between items-baseline">
                      <span className={`text-xs font-bold ${h.emergencyStatus === 'active' ? 'text-red-400' : 'text-slate-300'}`}>
                        {h.emergencyStatus === 'active' ? 'SOS Active' : 'SOS Resolved'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      GPS Coords: {h.latitude.toFixed(4)}°, {h.longitude.toFixed(4)}°
                    </div>
                    {h.resolvedAt && (
                      <div className="text-[10px] text-slate-500 italic">
                        Resolved: {new Date(h.resolvedAt).toLocaleTimeString()}
                      </div>
                    )}
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
