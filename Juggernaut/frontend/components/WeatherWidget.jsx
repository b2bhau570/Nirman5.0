import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Wind, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const WeatherWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-3xl p-6 shadow-xl shadow-blue-900/10 relative overflow-hidden group w-full md:w-80 border border-blue-400/20"
    >
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 bg-white/20 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-700" />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-100 text-[10px] font-bold uppercase tracking-widest border border-blue-400/50 px-2 py-0.5 rounded-full bg-blue-900/20">Local Weather</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-5xl font-bold tracking-tighter drop-shadow-md">28°</span>
          </div>
          <p className="text-sm text-blue-100 font-medium mt-1">Sunny & Clear</p>
        </div>
        <div className="flex flex-col items-end gap-3">
           <div className="bg-gradient-to-b from-yellow-300 to-amber-500 p-3 rounded-2xl shadow-[0_4px_15px_rgba(252,211,77,0.4)]">
             <Sun size={28} className="text-white animate-spin-slow" />
           </div>
           <div className="flex items-center gap-1.5 text-xs text-blue-100 font-mono bg-black/10 px-2 py-1 rounded-lg">
              <Clock size={12} />
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/20 flex justify-between text-xs text-blue-100">
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
          <Wind size={14} className="text-blue-100" />
          <span>4 km/h</span>
        </div>
         <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
          <CloudRain size={14} className="text-blue-100" />
          <span>10%</span>
        </div>
      </div>
    </motion.div>
  );
};