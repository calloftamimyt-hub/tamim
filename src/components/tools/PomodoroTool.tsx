import React, { useState, useEffect, useRef } from 'react';
import { ToolHero } from './ToolHero';
import { Clock, ArrowLeft, Play, Pause, RotateCcw, Coffee, Briefcase } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const PomodoroTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // In seconds
  const [isRunning, setIsRunning] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const workTime = 25 * 60;
  const breakTime = 5 * 60;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleComplete = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(breakTime);
    } else {
      setMode('work');
      setTimeLeft(workTime);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? workTime : breakTime);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? workTime : breakTime);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = mode === 'work' ? workTime : breakTime;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'পোমোডোরো ক্লক', en: 'Pomodoro Timer' }} description={{ bn: 'ফোকাস ধরে রাখুন', en: 'Stay focused & productive' }} Icon={Clock} bgGradient="bg-gradient-to-br from-rose-500 to-pink-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 flex flex-col items-center justify-center space-y-12">
        
        {/* Mode Toggle */}
        <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl">
          <button
            onClick={() => switchMode('work')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all",
              mode === 'work' ? "bg-rose-500 shadow-md text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            <Briefcase className="w-4 h-4" /> {language === 'bn' ? 'ওয়ার্ক' : 'Work'}
          </button>
          <button
            onClick={() => switchMode('break')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all",
              mode === 'break' ? "bg-emerald-500 shadow-md text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            <Coffee className="w-4 h-4" /> {language === 'bn' ? 'ব্রেক' : 'Break'}
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative flex justify-center items-center">
            {/* Progress Circle SVG */}
            <svg width="280" height="280" className="transform -rotate-90">
               <circle cx="140" cy="140" r="130" fill="transparent" strokeWidth="8" className="stroke-slate-200 dark:stroke-slate-800" />
               <circle 
                  cx="140" cy="140" r="130" 
                  fill="transparent" 
                  strokeWidth="8" 
                  strokeDasharray="816.8" 
                  strokeDashoffset={816.8 - (816.8 * progress) / 100} 
                  strokeLinecap="round"
                  className={cn("transition-all duration-1000 ease-linear", mode === 'work' ? "stroke-rose-500" : "stroke-emerald-500")}
               />
            </svg>

            <div className="absolute text-center">
               <div className="text-7xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter tabular-nums">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
               </div>
               <div className={cn("text-xs font-bold uppercase tracking-wider", mode === 'work' ? "text-rose-500" : "text-emerald-500")}>
                  {mode === 'work' 
                    ? (language === 'bn' ? 'কাজে ফোকাস করুন' : 'Focus Time') 
                    : (language === 'bn' ? 'বিশ্রাম নিন' : 'Relax Time')}
               </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
           <button 
             onClick={resetTimer}
             className="w-14 h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
           >
             <RotateCcw className="w-6 h-6" />
           </button>
           
           <button 
             onClick={toggleTimer}
             className={cn(
               "w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95",
               mode === 'work' ? "bg-rose-500 shadow-rose-500/20" : "bg-emerald-500 shadow-emerald-500/20"
             )}
           >
             {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
           </button>
        </div>

      </div>
    </div>
  );
};
