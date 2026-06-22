import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { 
  Shield, Navigation, MapPin, Eye, Search, AlertCircle, Clock, 
  Map, ThumbsUp, HelpCircle, ArrowLeft, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const startIcon = L.divIcon({
  html: `<div class="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-emerald-500/20">A</div>`,
  className: '',
  iconSize: [24, 24],
});

const endIcon = L.divIcon({
  html: `<div class="h-6 w-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-red-500/20">B</div>`,
  className: '',
  iconSize: [24, 24],
});

// Fit map to contain path coordinates
function FitRouteBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(pt => [pt[0], pt[1]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coords, map]);
  return null;
}

export default function RouteScreen() {
  const [source, setSource] = useState('Mumbai Airport');
  const [destination, setDestination] = useState('Gateway of India');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [routeData, setRouteData] = useState(null); // { distance, duration, coords, startCoords, endCoords }
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // Future-ready mock safety rankings comparing route options
  const safetyRoutes = [
    {
      name: 'Highway Route (Recommended)',
      distance: '21.4 km',
      duration: '45 mins',
      safetyScore: 92,
      safetyBadge: 'Highly Lit, CCTV Covered, Patrol Areas',
      attributes: {
        lighting: 'Excellent',
        cameras: 'High density',
        patrols: 'Regular police presence',
        safetyFactor: 'High traffic, secure commercial hubs',
      }
    },
    {
      name: 'Alternative Shortcut Lane',
      distance: '18.2 km',
      duration: '38 mins',
      safetyScore: 54,
      safetyBadge: 'Poor Lighting, Low Traffic',
      attributes: {
        lighting: 'Sparse/Dim',
        cameras: 'None/Unmonitored',
        patrols: 'Rare patrol schedules',
        safetyFactor: 'Secluded residential alleys, dark segments',
      }
    }
  ];

  const handleSearchRoute = async (e) => {
    if (e) e.preventDefault();
    if (!source || !destination) return;

    try {
      setLoading(true);
      setError('');
      setRouteData(null);

      // 1. Resolve source coordinates using Nominatim API
      const sourceUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(source)}&limit=1`;
      const sourceRes = await axios.get(sourceUrl);
      if (sourceRes.data.length === 0) {
        setError(`Could not find coordinate data for source address: "${source}"`);
        setLoading(false);
        return;
      }
      const sLat = parseFloat(sourceRes.data[0].lat);
      const sLon = parseFloat(sourceRes.data[0].lon);

      // 2. Resolve destination coordinates
      const destUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`;
      const destRes = await axios.get(destUrl);
      if (destRes.data.length === 0) {
        setError(`Could not find coordinate data for destination address: "${destination}"`);
        setLoading(false);
        return;
      }
      const dLat = parseFloat(destRes.data[0].lat);
      const dLon = parseFloat(destRes.data[0].lon);

      // 3. Request route coordinates from open OSRM API
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sLon},${sLat};${dLon},${dLat}?overview=full&geometries=geojson`;
      const osrmRes = await axios.get(osrmUrl);

      if (osrmRes.data.code !== 'Ok' || !osrmRes.data.routes || osrmRes.data.routes.length === 0) {
        setError('Failed to calculate driving path coordinates.');
        setLoading(false);
        return;
      }

      const route = osrmRes.data.routes[0];
      const geoCoords = route.geometry.coordinates.map(pair => [pair[1], pair[0]]); // Swap Lon,Lat -> Lat,Lon for Leaflet

      // Convert distance to km, duration to mins
      const finalDistance = (route.distance / 1000).toFixed(1); // km
      const finalDuration = Math.round(route.duration / 60); // mins

      setRouteData({
        distance: finalDistance,
        duration: finalDuration,
        coords: geoCoords,
        startCoords: [sLat, sLon],
        endCoords: [dLat, dLon],
      });

    } catch (err) {
      console.error('Routing calculations error:', err);
      setError('Connection timeout or geocoding API error. Please try different addresses.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial route load
  useEffect(() => {
    handleSearchRoute();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-24 pb-12 px-6">
      
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-500" />
          <span className="font-extrabold text-lg bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
            Naari Shield
          </span>
        </div>
        <Link 
          to="/dashboard" 
          className="px-4 py-2 border border-white/5 hover:border-purple-500/20 text-xs font-semibold rounded-xl hover:bg-purple-500/10 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </header>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Column: Form and Route Ranking widgets */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Navigation className="h-5 w-5 text-purple-400" /> Smart Route Finder
              </h3>
              <p className="text-xs text-slate-500">Calculate distances and compare route safety parameters.</p>
            </div>

            <form onSubmit={handleSearchRoute} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Starting Point (Source)
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl focus:border-purple-500/50 focus:outline-none placeholder:text-slate-600 text-xs"
                  placeholder="e.g. Central Station"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Destination Point
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl focus:border-purple-500/50 focus:outline-none placeholder:text-slate-600 text-xs"
                  placeholder="e.g. City Mall"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 transition-all text-xs flex items-center justify-center gap-1.5 text-white disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Resolving maps...
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" /> Calculate Route
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-start gap-1.5 animate-pulse">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Safe Route Rankings comparative view */}
          {routeData && (
            <div className="glass p-6 rounded-2xl space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Safe Routes</h4>
                <p className="text-[10px] text-slate-500">Intelligent safe ranking comparisons.</p>
              </div>

              <div className="space-y-3">
                {safetyRoutes.map((r, idx) => {
                  const isSelected = selectedRouteIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedRouteIndex(idx)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all space-y-2 ${
                        isSelected
                          ? 'bg-purple-500/10 border-purple-500/50 shadow-md shadow-purple-500/5'
                          : 'bg-slate-900/50 border-white/5 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white block">{r.name}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                          r.safetyScore >= 80 
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                            : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                        }`}>
                          Score: {r.safetyScore}/100
                        </span>
                      </div>
                      
                      <div className="flex gap-4 text-[10px] text-slate-400 font-mono">
                        <span>Dist: {idx === 0 ? routeData.distance : r.distance}</span>
                        <span>Time: {idx === 0 ? routeData.duration : r.duration} mins</span>
                      </div>

                      <div className="text-[9px] text-purple-300 font-medium bg-purple-500/5 border border-purple-500/10 px-2 py-1 rounded">
                        ★ {r.safetyBadge}
                      </div>

                      {/* Display breakdown attributes when selected */}
                      {isSelected && (
                        <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] text-slate-400">
                          <div>📍 <strong>Lighting:</strong> {r.attributes.lighting}</div>
                          <div>🎥 <strong>CCTV Coverage:</strong> {r.attributes.cameras}</div>
                          <div>🚨 <strong>Police Patrols:</strong> {r.attributes.patrols}</div>
                          <div className="text-slate-300 italic mt-1 font-semibold">{r.attributes.safetyFactor}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Leaflet Maps Viewer */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[480px]">
          <div className="glass p-6 rounded-2xl flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Map className="h-5 w-5 text-purple-400" /> Route Path Mapping
                </h3>
                <p className="text-xs text-slate-500">Visual mapping projection showing geocoding coords.</p>
              </div>

              {routeData && (
                <div className="text-xs font-mono bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl flex items-center gap-4">
                  <span>Distance: <strong className="text-purple-400">{routeData.distance} km</strong></span>
                  <span className="h-3 w-px bg-white/10" />
                  <span>Time: <strong className="text-indigo-400">{routeData.duration} mins</strong></span>
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-900 border border-white/5 rounded-xl relative overflow-hidden min-h-[380px] h-[380px]">
              <MapContainer 
                center={routeData ? routeData.startCoords : [20.5937, 78.9629]} 
                zoom={routeData ? 12 : 5} 
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {routeData && (
                  <>
                    {/* Draw markers */}
                    <Marker position={routeData.startCoords} icon={startIcon}>
                      <Popup><span className="text-xs">Source: {source}</span></Popup>
                    </Marker>

                    <Marker position={routeData.endCoords} icon={endIcon}>
                      <Popup><span className="text-xs">Destination: {destination}</span></Popup>
                    </Marker>

                    {/* Draw route line */}
                    <Polyline 
                      positions={routeData.coords} 
                      color="#8b5cf6" 
                      weight={5}
                      opacity={0.85}
                    />

                    <FitRouteBounds coords={routeData.coords} />
                  </>
                )}
              </MapContainer>

              {!routeData && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 bg-slate-950/80 backdrop-blur-sm">
                  <Map className="h-10 w-10 text-slate-700 animate-bounce mb-3" />
                  <span className="text-sm font-semibold text-slate-400 block">No active search route rendered.</span>
                  <span className="text-xs text-slate-600 block mt-1">Enter your departure and destination points on the left panel.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
