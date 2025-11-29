import React from 'react';
import { ViewType } from '../types'; // Assuming types/enums are still used in JS or this import can be removed if ViewType is purely TS enum logic
import { LayoutDashboard, ShieldCheck, ScanEye, Stethoscope, Map, CalendarDays } from 'lucide-react';
import { translations } from '../translations';
import { motion } from 'framer-motion';

export const BottomNav = ({ currentView, onViewChange, language }) => {
  const t = translations[language];

  // If ViewType is not available in JS environment, replace these with string literals or constants
  const navItems = [
    { id: ViewType.DASHBOARD, icon: <LayoutDashboard size={20} />, label: t.dashboard },
    { id: ViewType.VERIFY, icon: <ShieldCheck size={20} />, label: t.verifySupply },
    { id: ViewType.MONITOR, icon: <ScanEye size={20} />, label: t.monitorField },
    { id: ViewType.DIAGNOSE, icon: <Stethoscope size={20} />, label: t.diagnoseDisease },
    { id: ViewType.CALENDAR, icon: <CalendarDays size={20} />, label: t.smartCalendar },
    { id: ViewType.MAP, icon: <Map size={20} />, label: t.communityMap },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-50 pb-safe">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="relative flex flex-col items-center justify-center py-2 px-1 min-w-[3.5rem]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-b-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              )}
              <div
                className={`transition-colors duration-300 ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {item.icon}
              </div>
              <span className={`text-[9px] font-bold mt-1 transition-colors truncate max-w-[60px] ${
                  isActive ? 'text-emerald-800' : 'text-slate-400'
              }`}>
                {item.label.split(' ')[0]} {/* Show first word only to save space */}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};