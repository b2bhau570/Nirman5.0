import React, { useState, useEffect } from 'react';
import { FileUpload } from '../FileUpload';
import { ScanEye, Drone, AlertTriangle, Check, Loader2, FileCheck, Upload, Map as MapIcon, Layers, Activity, Droplets, Wind, MousePointer2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../../translations';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet markers in React
const sensorIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const alertIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Map Click Handler Component for Drawing
const MapClickEvents = ({ active, onClick }) => {
  useMapEvents({
    click(e) {
      if (active) onClick(e.latlng);
    },
  });
  return null;
};

// Mock Sensor Data
const SENSORS = [
  { id: 1, lat: 51.505, lng: -0.09, moisture: 64, nitrogen: 'High', status: 'optimal' },
  { id: 2, lat: 51.508, lng: -0.095, moisture: 45, nitrogen: 'Med', status: 'warning' },
  { id: 3, lat: 51.503, lng: -0.085, moisture: 72, nitrogen: 'Good', status: 'optimal' },
];

export const FieldMonitor = ({ language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('map');
  
  // Drone State
  const [connectingDrone, setConnectingDrone] = useState(false);
  const [droneConnected, setDroneConnected] = useState(false);
  
  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Map State
  const [isDrawing, setIsDrawing] = useState(false);
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  
  const handleDroneConnect = () => {
    setConnectingDrone(true);
    setTimeout(() => {
      setConnectingDrone(false);
      setDroneConnected(true);
    }, 2000);
  };

  const handleAnalysis = () => {
    setAnalyzing(true);
    setAnalysisDone(false);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setAnalyzing(false);
      setAnalysisDone(true);
    }, 2500);
  };

  const handleMapClick = (latlng) => {
    setBoundaryPoints([...boundaryPoints, latlng]);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <ScanEye className="text-blue-600" size={36} />
            {t.monitorHeader}
          </h2>
          <p className="text-slate-500 mt-2 text-lg">
            {t.monitorSub}
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex gap-1">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'map' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <MapIcon size={16} /> Live Map
          </button>
          <button 
             onClick={() => setActiveTab('analysis')}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'analysis' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Activity size={16} /> AI Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
         {/* Left Panel: Status & Controls (Always Visible) */}
         <div className="lg:col-span-1 space-y-6">
            
            {/* Alerts */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md shadow-emerald-900/5">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">{t.recentAlerts}</h3>
               <div className="space-y-4">
                 <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors cursor-pointer group">
                    <div className="p-2 bg-red-100 text-red-500 rounded-lg group-hover:bg-red-200 transition-colors">
                       <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-900">{t.pestDetected}</p>
                      <p className="text-xs text-red-600/70 mt-1">Sensor #2 • High Risk</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 hover:bg-amber-100 transition-colors cursor-pointer group">
                    <div className="p-2 bg-amber-100 text-amber-500 rounded-lg group-hover:bg-amber-200 transition-colors">
                       <Droplets size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900">{t.lowMoisture}</p>
                      <p className="text-xs text-amber-600/70 mt-1">Sensor #3 • Moderate</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Drone Status */}
            <div className={`transition-all duration-500 rounded-3xl p-6 text-white shadow-lg border relative overflow-hidden ${droneConnected ? 'bg-emerald-800 border-emerald-700' : 'bg-blue-800 border-blue-700'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <Drone size={24} className={droneConnected ? "text-emerald-300" : "text-blue-300"} />
                <h3 className="font-bold text-lg">{droneConnected ? t.droneLinked : t.droneLink}</h3>
              </div>
              <p className="text-white/80 text-sm mb-6 relative z-10">
                {droneConnected 
                  ? 'DJI Mavic 3 Enterprise connected. Telemetry active. Battery: 84%' 
                  : 'Connect your DJI or custom drone for real-time feed analysis.'}
              </p>
              <button 
                onClick={handleDroneConnect}
                disabled={connectingDrone || droneConnected}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${
                  droneConnected 
                    ? 'bg-emerald-900/30 text-emerald-100 cursor-default border border-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white'
                }`}
              >
                {connectingDrone && <Loader2 size={16} className="animate-spin" />}
                {connectingDrone ? t.searching : droneConnected ? t.connected : t.connectDevice}
                {droneConnected && <Check size={16} />}
              </button>
            </div>
         </div>

         {/* Right Panel: Map or Analysis */}
         <div className="lg:col-span-2 h-full min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'map' ? (
                <motion.div 
                  key="map"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl shadow-md shadow-emerald-900/5 border border-slate-200 h-full overflow-hidden relative flex flex-col"
                >
                  {/* Map Toolbar */}
                  <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                     <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-lg flex flex-col gap-2">
                        <button 
                          onClick={() => setIsDrawing(!isDrawing)}
                          className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase ${
                            isDrawing ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Draw Polygon"
                        >
                          <MousePointer2 size={18} />
                        </button>
                        <button 
                          onClick={() => setBoundaryPoints([])}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-500 transition-colors"
                          title="Clear Boundary"
                        >
                          <Trash2 size={18} />
                        </button>
                     </div>
                  </div>

                  {isDrawing && (
                    <div className="absolute top-4 left-16 right-4 z-[400] bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                      <span className="text-sm font-bold flex items-center gap-2">
                        <MousePointer2 size={16} /> Click on map to add points
                      </span>
                      <button 
                        onClick={() => setIsDrawing(false)}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-bold uppercase"
                      >
                        Finish
                      </button>
                    </div>
                  )}

                  {/* React Leaflet Map */}
                  <div className="flex-1 w-full h-full relative z-0">
                    <MapContainer 
                      center={[51.505, -0.09]} 
                      zoom={15} 
                      scrollWheelZoom={true} 
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      <MapClickEvents active={isDrawing} onClick={handleMapClick} />

                      {/* Field Boundary Polygon */}
                      {boundaryPoints.length > 2 && (
                         <Polygon positions={boundaryPoints} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }} />
                      )}

                      {/* Render Markers for Boundary Points while drawing */}
                      {isDrawing && boundaryPoints.map((pos, idx) => (
                        <Marker key={`pt-${idx}`} position={pos} icon={new L.DivIcon({ className: 'bg-blue-500 w-3 h-3 rounded-full border-2 border-white', iconSize: [12, 12] })} />
                      ))}

                      {/* Sensors */}
                      {SENSORS.map(sensor => (
                        <Marker 
                          key={sensor.id} 
                          position={[sensor.lat, sensor.lng]}
                          icon={sensor.status === 'warning' ? alertIcon : sensorIcon}
                        >
                          <Popup className="custom-popup">
                            <div className="p-1">
                               <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                                 <Activity size={14} className={sensor.status === 'warning' ? 'text-red-500' : 'text-blue-500'} />
                                 Sensor #{sensor.id}
                               </h4>
                               <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                     <span className="text-slate-500 block">Moisture</span>
                                     <span className="font-bold text-blue-700">{sensor.moisture}%</span>
                                  </div>
                                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                     <span className="text-slate-500 block">Nitrogen</span>
                                     <span className="font-bold text-emerald-700">{sensor.nitrogen}</span>
                                  </div>
                               </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                    </MapContainer>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl shadow-md shadow-emerald-900/5 border border-slate-200 p-8 h-full flex flex-col relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {analyzing ? (
                       <motion.div 
                         key="analyzing"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="flex-1 flex flex-col items-center justify-center"
                       >
                         <div className="w-full max-w-sm">
                           <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                             <span>Uploading Data</span>
                             <span>{uploadProgress}%</span>
                           </div>
                           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                               className="h-full bg-blue-500"
                               initial={{ width: 0 }}
                               animate={{ width: `${uploadProgress}%` }}
                             />
                           </div>
                           <p className="text-center text-slate-400 text-sm mt-4 animate-pulse">Running AI Segmentation Models...</p>
                         </div>
                       </motion.div>
                    ) : analysisDone ? (
                       <motion.div 
                         key="results"
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="h-full flex flex-col"
                       >
                          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                            <h4 className="font-bold text-slate-800 text-xl flex items-center gap-3">
                              <FileCheck className="text-emerald-500" size={24} />
                              {t.analysisResults}
                            </h4>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200">Complete</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Nitrogen Levels</p>
                              <div className="flex items-end gap-3 h-24">
                                 <div className="w-full bg-blue-100 rounded-t-lg relative group h-[40%]">
                                    <div className="absolute bottom-0 w-full h-full bg-blue-500 rounded-t-lg opacity-60"></div>
                                 </div>
                                 <div className="w-full bg-blue-100 rounded-t-lg relative group h-[60%]">
                                    <div className="absolute bottom-0 w-full h-full bg-blue-500 rounded-t-lg opacity-80"></div>
                                 </div>
                                 <div className="w-full bg-blue-100 rounded-t-lg relative group h-[80%]">
                                    <div className="absolute bottom-0 w-full h-full bg-blue-500 rounded-t-lg"></div>
                                 </div>
                              </div>
                              <p className="text-right text-2xl font-bold text-slate-800 mt-2">High</p>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">{t.estYield}</p>
                               <div className="flex items-center justify-center h-24">
                                 <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="50" className="text-emerald-500" />
                                    </svg>
                                    <span className="absolute text-xl font-bold text-slate-800">+12%</span>
                                 </div>
                               </div>
                            </div>
                          </div>

                          <div className="space-y-4 mb-6">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{t.recommendations}</p>
                            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                               <p className="text-sm text-blue-900 font-medium">
                                 Irrigation levels are optimal. Consider reducing nitrogen input in Sector 3.
                               </p>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <button 
                              onClick={() => setAnalysisDone(false)}
                              className="w-full py-3 border border-slate-200 text-slate-500 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                            >
                              {t.startNew}
                            </button>
                          </div>
                       </motion.div>
                    ) : (
                      <div className="flex flex-col h-full">
                         <div className="mb-6 relative z-10">
                            <h3 className="text-xl font-bold text-slate-800 mb-1">{t.newAnalysis}</h3>
                            <p className="text-slate-500 text-sm">Upload a high-res image for best results.</p>
                          </div>
                          
                          <div className="flex-1 relative z-10">
                             <FileUpload label={t.monitorSub} />
                          </div>

                          <div className="mt-8 flex justify-end gap-3 relative z-10">
                            <button 
                              onClick={handleAnalysis}
                              disabled={analyzing}
                              className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                               <Upload size={18} />
                               {t.runAnalysis}
                            </button>
                          </div>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};