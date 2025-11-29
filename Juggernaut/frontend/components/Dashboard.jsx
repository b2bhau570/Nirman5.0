import React from 'react';
import { ViewType } from '../types'; // Assuming ViewType exists in your JS setup
import { WeatherWidget } from './WeatherWidget';
import { ActionCard } from './ActionCard';
import { ScanEye, Droplets, Sprout, TrendingUp, ShieldCheck, Stethoscope, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '../translations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock Data for Charts
const yieldData = [
  { month: 'Jan', yield: 45, projected: 48 },
  { month: 'Feb', yield: 52, projected: 55 },
  { month: 'Mar', yield: 48, projected: 60 },
  { month: 'Apr', yield: 61, projected: 65 },
  { month: 'May', yield: 55, projected: 68 },
  { month: 'Jun', yield: 67, projected: 72 },
  { month: 'Jul', yield: 70, projected: 75 },
];

const moistureData = [
  { time: '6am', value: 68 },
  { time: '9am', value: 65 },
  { time: '12pm', value: 58 },
  { time: '3pm', value: 54 },
  { time: '6pm', value: 62 },
  { time: '9pm', value: 66 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 border border-slate-200 rounded-xl shadow-lg">
        <p className="text-slate-500 text-xs font-bold uppercase mb-1">{label}</p>
        {payload.map((p, index) => (
          <p key={index} className="text-sm font-bold flex items-center gap-2" style={{ color: p.color }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard = ({ onViewChange, user, language }) => {
  const t = translations[language];

  return (
    <div className="space-y-8">
      {/* Welcome & Weather Header */}
      <div className="flex flex-col xl:flex-row gap-8 justify-between items-start xl:items-end">
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
             <h2 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight">
              {t.goodMorning}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800">
                {user.name}
              </span>
            </h2>
            <div className="flex items-center gap-3 mt-4">
               <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">
                 System Status: <span className="text-emerald-600 font-bold">{t.protectionActive}</span>
               </p>
            </div>
          </motion.div>
        </div>
        <div className="w-full xl:w-auto">
          <WeatherWidget />
        </div>
      </div>

      {/* Quick Stats Grid - Light Theme */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md shadow-emerald-900/5 relative overflow-hidden group hover:shadow-lg transition-shadow">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Sprout size={24} />
              </div>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg text-xs font-bold">+2.4%</span>
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t.fieldHealth}</p>
             <p className="text-3xl font-bold text-slate-800 mt-1">98%</p>
           </div>
        </div>

         <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md shadow-emerald-900/5 relative overflow-hidden group hover:shadow-lg transition-shadow">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Droplets size={24} />
              </div>
              <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded-lg text-xs font-bold">Optimal</span>
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t.soilMoisture}</p>
             <div className="flex items-end gap-2 mt-1">
               <p className="text-3xl font-bold text-slate-800">64%</p>
               <span className="text-xs text-slate-400 mb-1">Avg Today</span>
             </div>
           </div>
        </div>

         <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md shadow-emerald-900/5 relative overflow-hidden group hover:shadow-lg transition-shadow">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-lime-50 rounded-2xl text-lime-600">
                <ScanEye size={24} />
              </div>
              <span className="text-lime-700 bg-lime-100 px-2 py-1 rounded-lg text-xs font-bold">On Track</span>
           </div>
           <div>
             <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t.nextHarvest}</p>
             <p className="text-3xl font-bold text-slate-800 mt-1">14 Days</p>
           </div>
        </div>
      </motion.div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Yield Forecast Graph - Recharts Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-md shadow-emerald-900/5"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              {t.estYield} History
            </h3>
            <div className="flex gap-2">
               <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Actual</span>
               <span className="text-xs font-bold text-emerald-400 bg-emerald-50/50 px-2 py-1 rounded-lg">Projected</span>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Area 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#34d399" 
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorProjected)" 
                  name="Projected"
                />
                <Area 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#059669" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorYield)" 
                  name="Yield"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Soil Moisture Trend - Recharts Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-md shadow-emerald-900/5 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" />
              Moisture Trend
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-bold">Today</span>
          </div>

          <div className="flex-1 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moistureData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                   dataKey="time" 
                   axisLine={false} 
                   tickLine={false}
                   tick={{ fill: '#94a3b8', fontSize: 10 }}
                   interval="preserveStartEnd"
                />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Moisture"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
             <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
               <Droplets size={16} />
             </div>
             <div>
               <p className="text-xs font-bold text-blue-900">Optimal Range</p>
               <p className="text-[10px] text-blue-700 mt-0.5">Moisture levels holding steady. No irrigation needed tonight.</p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Action Cards Grid */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-900 mb-6 flex items-center gap-3">
          {t.coreActions}
          <div className="h-px bg-slate-200 flex-1" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title={t.verifyTitle}
            description={t.verifyDesc}
            icon={<ShieldCheck size={32} />}
            buttonText={t.scanNow}
            onClick={() => onViewChange(ViewType.VERIFY)}
            delay={0.3}
            color="emerald"
          />
          <ActionCard
            title={t.monitorTitle}
            description={t.monitorDesc}
            icon={<ScanEye size={32} />}
            buttonText={t.uploadPhoto}
            onClick={() => onViewChange(ViewType.MONITOR)}
            delay={0.4}
            color="blue"
          />
          <ActionCard
            title={t.diagnoseTitle}
            description={t.diagnoseDesc}
            icon={<Stethoscope size={32} />}
            buttonText={t.diagnoseLeaf}
            onClick={() => onViewChange(ViewType.DIAGNOSE)}
            delay={0.5}
            color="lime"
          />
        </div>
      </div>
    </div>
  );
};