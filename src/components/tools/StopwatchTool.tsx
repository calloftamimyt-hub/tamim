import React, { useState, useEffect, useRef } from 'react';
import { ToolHero } from './ToolHero';
import { Timer, ArrowLeft, Play, Pause, RotateCcw, Flag } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const StopwatchTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<{ id: number, time: number }[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const addLap = () => {
    setLaps(prev => [{ id: Date.now(), time }, ...prev]);
  };

  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const centi = Math.floor((ms % 1000) / 10);
    return {
      min: min.toString().padStart(2, '0'),
      sec: sec.toString().padStart(2, '0'),
      ms: centi.toString().padStart(2, '0')
    };
  };

  const formatted = formatTime(time);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'স্টপওয়াচ', en: 'Stopwatch' }} description={{ bn: 'সময় ট্র্যাক করুন নিখুঁতভাবে', en: 'Track time accurately' }} Icon={Timer} bgGradient="bg-gradient-to-br from-slate-700 to-slate-900" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24 flex flex-col gap-6 text-slate-900 dark:text-white">
        
        {/* Main Display Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[340px] py-10 px-4">
          <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-[8px] border-slate-100 dark:border-slate-800/80"></div>
            {/* Active Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle 
                cx="50%" cy="50%" r="calc(50% - 4px)" 
                fill="transparent" 
                strokeWidth="8"
                className={cn("transition-all duration-100", isRunning ? "text-emerald-500" : "text-slate-300 dark:text-slate-600")}
                stroke="currentColor"
                strokeDasharray="1000"
                strokeDashoffset={1000 - (1000 * ((time % 60000) / 60000))}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="flex flex-col items-center z-10">
              <div className="text-5xl md:text-6xl font-black font-mono tracking-tighter tabular-nums flex items-end">
                <span>{formatted.min}:</span>
                <span>{formatted.sec}</span>
                <span className="text-2xl md:text-3xl text-emerald-500 mb-1.5 ml-1">.{formatted.ms}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-12">
             <button 
                onClick={resetTimer}
                disabled={time === 0}
                className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-50 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
             >
                <RotateCcw className="w-5 h-5" />
             </button>

             <button 
                onClick={toggleTimer}
                className={cn(
                   "w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95",
                   isRunning ? "bg-rose-500 shadow-rose-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                )}
             >
                {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
             </button>

             <button 
                onClick={addLap}
                disabled={!isRunning}
                className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-50 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
             >
                <Flag className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Laps List */}
        <div className="w-full max-w-md mx-auto space-y-3">
           <AnimatePresence>
              {laps.map((lap, idx) => {
                 const fLap = formatTime(lap.time);
                 const lapNum = laps.length - idx;
                 return (
                   <motion.div
                      key={lap.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
                   >
                     <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? 'ল্যাপ' : 'Lap'} {lapNum.toString().padStart(2, '0')}
                     </span>
                     <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200">
                        {fLap.min}:{fLap.sec}.<span className="text-slate-500 text-sm">{fLap.ms}</span>
                     </span>
                   </motion.div>
                 )
              })}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
