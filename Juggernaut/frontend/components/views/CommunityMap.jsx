import React, { useState } from 'react';
import { Map as MapIcon, MapPin, Plus, Minus, Navigation, Filter, AlertTriangle, Bug, CloudLightning, ChevronRight, Search, X, ShieldAlert, Clock, User, CheckCircle, ThumbsUp, Flag, Camera, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../../translations';

// Initial Mock Data
const INITIAL_REPORTS = [
  { id: 1, type: 'pest', title: 'Fall Armyworm', reporter: 'Rajesh K.', time: '2h ago', severity: 'high', x: 25, y: 35, description: 'Large cluster found in maize field. Larvae visible eating through whorls. Immediate spraying recommended.' },
  { id: 2, type: 'disease', title: 'Leaf Rust', reporter: 'Amit Singh', time: '5h ago', severity: 'medium', x: 45, y: 60, description: 'Yellow spots appearing on lower leaves of wheat crop. Spreading slowly.' },
  { id: 3, type: 'weather', title: 'Hailstorm Alert', reporter: 'Met Dept', time: '1h ago', severity: 'high', x: 70, y: 20, description: 'Heavy hail predicted in the northern sector within the next 4 hours. Cover sensitive nurseries.' },
  { id: 4, type: 'healthy', title: 'Certified Safe Zone', reporter: 'Agri-Sentry', time: '1d ago', severity: 'low', x: 55, y: 45, description: 'Area verified pest-free by drone survey. Safe for sowing.' },
  { id: 5, type: 'pest', title: 'Aphid Swarm', reporter: 'Priya M.', time: '30m ago', severity: 'medium', x: 30, y: 40, description: 'Spreading rapidly towards the west. Monitor border crops closely.' },
];

export const CommunityMap = ({ language }) => {
  const t = translations[language];
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReporting, setIsReporting] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Reporting Form State
  const [newReportType, setNewReportType] = useState('pest');
  const [newReportDescription, setNewReportDescription] = useState('');

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.8));

  const filteredReports = activeFilter === 'all' 
    ? reports 
    : reports.filter(r => r.type === activeFilter);

  const handleSubmitReport = () => {
    if (!newReportDescription.trim()) return;

    const newReport = {
      id: Date.now(),
      type: newReportType,
      title: `${newReportType.charAt(0).toUpperCase() + newReportType.slice(1)} Alert`,
      reporter: 'You',
      time: 'Just now',
      severity: 'medium',
      // Simulate user location (randomized near center for demo)
      x: 50 + (Math.random() * 20 - 10), 
      y: 50 + (Math.random() * 20 - 10),
      description: newReportDescription
    };

    setReports([newReport, ...reports]);
    setIsReporting(false);
    setNewReportDescription('');
    setNewReportType('pest');
    setActiveFilter('all'); // Reset filter to show new report
    setSelectedReport(newReport); // Auto-select the new report
    setZoomLevel(1.5);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'pest': return <Bug size={16} />;
      case 'disease': return <AlertTriangle size={16} />;
      case 'weather': return <CloudLightning size={16} />;
      default: return <ShieldAlert size={16} />;
    }
  };

  const getColor = (type, opacity = false) => {
    switch(type) {
      case 'pest': return opacity ? 'bg-red-500/20 text-red-600' : 'bg-red-500';
      case 'disease': return opacity ? 'bg-amber-500/20 text-amber-600' : 'bg-amber-500';
      case 'weather': return opacity ? 'bg-blue-500/20 text-blue-600' : 'bg-blue-500';
      case 'healthy': return opacity ? 'bg-emerald-500/20 text-emerald-600' : 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <MapIcon className="text-emerald-600" size={36} />
            {t.mapHeader}
          </h2>
          <p className="text-slate-500 mt-2 text-lg">
            {t.mapSub}
          </p>
        </div>
        <button 
          onClick={() => setIsReporting(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Report Issue
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* Left Panel: Feed & Filters */}
        <div className="lg:col-span-4 bg-white rounded-3xl shadow-md shadow-emerald-900/5 border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search alerts..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {['all', 'pest', 'disease', 'weather'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all whitespace-nowrap ${
                    activeFilter === filter 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {filteredReports.map(report => (
              <div 
                key={report.id}
                onClick={() => { setSelectedReport(report); setZoomLevel(1.5); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedReport?.id === report.id 
                    ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200' 
                    : 'bg-white border-slate-100 hover:border-emerald-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 ${getColor(report.type, true)}`}>
                    {getIcon(report.type)}
                    {report.type}
                  </span>
                  <span className="text-xs text-slate-400">{report.time}</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{report.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{report.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-medium border-t border-slate-100 pt-2">
                   <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                      {report.reporter.charAt(0)}
                   </div>
                   {report.reporter}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Interactive Map */}
        <div className="lg:col-span-8 bg-slate-100 rounded-3xl overflow-hidden relative shadow-inner border border-slate-200 group">
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
             <button onClick={handleZoomIn} className="p-3 bg-white text-slate-700 rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50"><Plus size={20}/></button>
             <button onClick={handleZoomOut} className="p-3 bg-white text-slate-700 rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50"><Minus size={20}/></button>
             <button onClick={() => {setZoomLevel(1); setSelectedReport(null);}} className="p-3 bg-white text-emerald-600 rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50"><Navigation size={20}/></button>
          </div>

          {/* Map Surface */}
          <motion.div 
            className="w-full h-full relative cursor-grab active:cursor-grabbing bg-emerald-50/30"
            animate={{ scale: zoomLevel }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            drag
            dragConstraints={{ left: -200, right: 0, top: -200, bottom: 0 }}
          >
             {/* Map Grid Texture */}
             <div 
                className="absolute inset-0 opacity-10" 
                style={{ 
                  backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', 
                  backgroundSize: '40px 40px' 
                }} 
             />
             
             {/* Heatmap/Danger Zones - Simulated with gradients */}
             <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
             <div className="absolute top-[50%] left-[50%] w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

             {/* Render Pins */}
             {filteredReports.map(report => (
               <motion.div
                 key={report.id}
                 className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                 style={{ left: `${report.x}%`, top: `${report.y}%` }}
                 whileHover={{ scale: 1.2, zIndex: 20 }}
                 onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
               >
                  <div className={`relative flex items-center justify-center w-10 h-10 transition-all ${selectedReport?.id === report.id ? 'scale-125' : ''}`}>
                     {/* Pulse Effect for High Severity */}
                     {report.severity === 'high' && (
                       <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${getColor(report.type)}`} />
                     )}
                     
                     <div className={`w-10 h-10 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white ${getColor(report.type)}`}>
                        {getIcon(report.type)}
                     </div>
                     
                     {/* Label on hover */}
                     <div className="absolute top-full mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-slate-700 shadow-md whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                       {report.title}
                     </div>
                  </div>
               </motion.div>
             ))}

             {/* "You Are Here" Marker */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md z-10 relative"></div>
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div>
                </div>
             </div>

          </motion.div>

          {/* Floating Detail Card */}
          <AnimatePresence>
            {selectedReport && !isDetailsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-5 z-30"
              >
                 <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getColor(selectedReport.type, true)}`}>
                      {selectedReport.type}
                    </span>
                    <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">
                      <X size={18} />
                    </button>
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{selectedReport.title}</h3>
                 <p className="text-xs text-slate-500 mb-4">{selectedReport.time} • {selectedReport.severity.toUpperCase()} Severity</p>
                 
                 <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 border border-slate-100 mb-4">
                   {selectedReport.description}
                 </div>

                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {selectedReport.reporter.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Reported by {selectedReport.reporter}</p>
                      <p className="text-[10px] text-slate-400">Verified Community Member</p>
                    </div>
                 </div>

                 <button 
                   onClick={() => setIsDetailsOpen(true)}
                   className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                 >
                   View Full Details <ChevronRight size={16} />
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Full Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedReport && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
             >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl ${getColor(selectedReport.type, true)}`}>
                        {getIcon(selectedReport.type)}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <h3 className="text-xl font-bold text-slate-800">{selectedReport.title}</h3>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              selectedReport.severity === 'high' ? 'bg-red-50 text-red-600 border-red-200' :
                              selectedReport.severity === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-emerald-50 text-emerald-600 border-emerald-200'
                           }`}>
                             {selectedReport.severity} Severity
                           </span>
                        </div>
                        <p className="text-sm text-slate-500">Report ID: #{202400 + selectedReport.id}</p>
                     </div>
                  </div>
                  <button onClick={() => setIsDetailsOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left: Imagery & Map Info */}
                      <div className="lg:col-span-1 space-y-6">
                         <div className="bg-slate-100 rounded-2xl aspect-video relative overflow-hidden flex items-center justify-center group">
                            <img 
                              src={`https://picsum.photos/seed/${selectedReport.id}/400/300`} 
                              alt="Field Condition" 
                              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                               <p className="text-white text-xs font-bold flex items-center gap-1">
                                  <Camera size={14} className="text-lime-400" /> Attached Evidence
                               </p>
                            </div>
                         </div>

                         <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Location Data</h4>
                            <div className="flex items-center justify-between text-sm">
                               <span className="text-slate-500">Coordinates</span>
                               <span className="font-mono text-slate-700">20.59° N, 78.96° E</span>
                            </div>
                             <div className="flex items-center justify-between text-sm">
                               <span className="text-slate-500">Sector</span>
                               <span className="font-medium text-slate-700">North-East Quadrant</span>
                            </div>
                         </div>
                      </div>

                      {/* Right: Details & Timeline */}
                      <div className="lg:col-span-2 space-y-6">
                         <div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Description</h4>
                            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                               {selectedReport.description}
                            </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Reporter Profile</h4>
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                      {selectedReport.reporter.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="font-bold text-slate-800">{selectedReport.reporter}</p>
                                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                                         <CheckCircle size={12} /> Trusted Member
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Community Validation</h4>
                                <div className="flex items-center gap-4">
                                   <div className="flex flex-col items-center">
                                      <span className="text-xl font-bold text-slate-800">12</span>
                                      <span className="text-[10px] text-slate-400">Confirmations</span>
                                   </div>
                                   <div className="h-8 w-px bg-slate-100"></div>
                                   <div className="flex flex-col items-center">
                                      <span className="text-xl font-bold text-slate-800">2h</span>
                                      <span className="text-[10px] text-slate-400">Active Time</span>
                                   </div>
                                </div>
                             </div>
                         </div>

                         <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3">Status Timeline</h4>
                            <div className="space-y-4 border-l-2 border-slate-100 ml-2 pl-6 relative">
                               <div className="relative">
                                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                                  <p className="text-xs font-bold text-slate-400">{selectedReport.time}</p>
                                  <p className="text-sm font-medium text-slate-800">Report Submitted</p>
                               </div>
                               <div className="relative">
                                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                                  <p className="text-xs font-bold text-slate-400">10 mins ago</p>
                                  <p className="text-sm font-medium text-slate-800">Verified by Community Algorithm</p>
                               </div>
                               <div className="relative opacity-50">
                                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                                  <p className="text-xs font-bold text-slate-400">Upcoming</p>
                                  <p className="text-sm font-medium text-slate-800">Expert Review Pending</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row gap-3 justify-end">
                   <button 
                     onClick={() => setIsDetailsOpen(false)}
                     className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                   >
                     Close
                   </button>
                   <button className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold border border-red-100 transition-colors flex items-center justify-center gap-2">
                     <Flag size={18} /> Report as False
                   </button>
                   <button className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-colors flex items-center justify-center gap-2">
                     <ThumbsUp size={18} /> Confirm Sighting
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {isReporting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl"
             >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Report Issue</h3>
                  <button onClick={() => setIsReporting(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Issue Type</label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                       <button 
                          onClick={() => setNewReportType('pest')}
                          className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                             newReportType === 'pest' 
                               ? 'bg-red-50 border-red-500 ring-1 ring-red-500' 
                               : 'hover:bg-slate-50'
                          }`}
                       >
                          <Bug className={newReportType === 'pest' ? 'text-red-600' : 'text-slate-400'} />
                          <span className={`text-sm font-medium ${newReportType === 'pest' ? 'text-red-700' : 'text-slate-600'}`}>Pest</span>
                       </button>
                       <button 
                          onClick={() => setNewReportType('disease')}
                          className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                             newReportType === 'disease' 
                               ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' 
                               : 'hover:bg-slate-50'
                          }`}
                       >
                          <AlertTriangle className={newReportType === 'disease' ? 'text-amber-600' : 'text-slate-400'} />
                          <span className={`text-sm font-medium ${newReportType === 'disease' ? 'text-amber-700' : 'text-slate-600'}`}>Disease</span>
                       </button>
                       <button 
                          onClick={() => setNewReportType('weather')}
                          className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                             newReportType === 'weather' 
                               ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                               : 'hover:bg-slate-50'
                          }`}
                       >
                          <CloudLightning className={newReportType === 'weather' ? 'text-blue-600' : 'text-slate-400'} />
                          <span className={`text-sm font-medium ${newReportType === 'weather' ? 'text-blue-700' : 'text-slate-600'}`}>Weather</span>
                       </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                    <textarea 
                       className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 min-h-[100px]" 
                       rows={3} 
                       placeholder="Describe the issue, location details, and urgency..."
                       value={newReportDescription}
                       onChange={(e) => setNewReportDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <button 
                    onClick={handleSubmitReport}
                    disabled={!newReportDescription.trim()}
                    className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                       !newReportDescription.trim() 
                         ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                         : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                    }`}
                  >
                    <Send size={18} />
                    Submit Report
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};