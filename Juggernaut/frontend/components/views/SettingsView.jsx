import React, { useState } from 'react';
import { Settings, User, Bell, Drone, Save, Check, Battery, Wifi, WifiOff, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../../translations';

export const SettingsView = ({ language, user }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form States
  const [farmName, setFarmName] = useState('Green Valley Estate');
  const [cropTypes, setCropTypes] = useState('Rice, Wheat, Cotton');
  
  // Notification States
  const [notifications, setNotifications] = useState({
    storm: true,
    pest: true,
    market: false
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Mock Drones
  const drones = [
    { id: 1, name: 'Agri-Wing X1', status: 'online', battery: 85, firmware: 'v2.4.1' },
    { id: 2, name: 'Scout Mini', status: 'charging', battery: 12, firmware: 'v2.3.9' },
    { id: 3, name: 'Sprayer Pro', status: 'offline', battery: 0, firmware: 'v2.0.0' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
          <Settings className="text-slate-600" size={36} />
          {t.settingsHeader}
        </h2>
        <p className="text-slate-500 mt-2 text-lg max-w-2xl">
          {t.settingsSub}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Sidebar Navigation for Settings */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full p-4 rounded-xl flex items-center gap-3 font-medium transition-all ${
              activeTab === 'profile' ? 'bg-white text-emerald-700 shadow-md border border-emerald-100' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <User size={20} /> {t.profileSettings}
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full p-4 rounded-xl flex items-center gap-3 font-medium transition-all ${
              activeTab === 'notifications' ? 'bg-white text-emerald-700 shadow-md border border-emerald-100' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Bell size={20} /> {t.notifications}
          </button>
          <button 
            onClick={() => setActiveTab('drones')}
            className={`w-full p-4 rounded-xl flex items-center gap-3 font-medium transition-all ${
              activeTab === 'drones' ? 'bg-white text-emerald-700 shadow-md border border-emerald-100' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Drone size={20} /> {t.droneManagement}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-md shadow-emerald-900/5 p-6 lg:p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold border-2 border-white shadow-lg">
                      {user.name.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-slate-800 text-white rounded-full hover:bg-slate-700 shadow-md">
                      <Settings size={12} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
                    <p className="text-slate-500 text-sm">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-lime-100 text-lime-700 text-xs font-bold rounded-full">Pro Member</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.farmName}</label>
                    <input 
                      type="text" 
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.cropTypes}</label>
                    <input 
                      type="text" 
                      value={cropTypes}
                      onChange={(e) => setCropTypes(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <p className="text-xs text-slate-400">Comma separated</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-6">{t.notifications}</h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'storm', label: t.stormAlerts, desc: 'Get alerts about heavy rain, hail, or strong winds.' },
                    { key: 'pest', label: t.pestWarnings, desc: 'Real-time notifications about local pest outbreaks.' },
                    { key: 'market', label: t.marketFluctuations, desc: 'Daily updates on crop prices in your local mandi.' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-800">{item.label}</h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <button 
                        onClick={() => toggleNotification(item.key)}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${notifications[item.key] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <motion.div 
                          className="w-6 h-6 bg-white rounded-full shadow-sm"
                          animate={{ x: notifications[item.key] ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'drones' && (
              <motion.div 
                key="drones"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">{t.droneManagement}</h3>
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                    + Pair New Device
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {drones.map((drone) => (
                    <div key={drone.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          drone.status === 'online' ? 'bg-emerald-100 text-emerald-600' :
                          drone.status === 'charging' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-200 text-slate-500'
                        }`}>
                          {drone.status === 'charging' ? <Zap size={24} /> : <Drone size={24} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{drone.name}</h4>
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <span className={`flex items-center gap-1 ${
                              drone.status === 'online' ? 'text-emerald-600' :
                              drone.status === 'charging' ? 'text-blue-600' :
                              'text-slate-500'
                            }`}>
                              {drone.status === 'online' ? <Wifi size={12} /> : 
                               drone.status === 'charging' ? <Zap size={12} /> : <WifiOff size={12} />}
                              {drone.status === 'online' ? t.statusOnline : 
                               drone.status === 'charging' ? t.statusCharging : t.statusOffline}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500">{t.firmware} {drone.firmware}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                           <p className={`text-sm font-bold ${drone.battery < 20 ? 'text-red-500' : 'text-slate-700'}`}>
                             {drone.battery}%
                           </p>
                           <Battery size={16} className={`ml-auto ${drone.battery < 20 ? 'text-red-500' : 'text-slate-400'}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-lg ${
                saved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isSaving ? (
                <>Saving...</>
              ) : saved ? (
                <><Check size={18} /> {t.saved}</>
              ) : (
                <><Save size={18} /> {t.saveChanges}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};