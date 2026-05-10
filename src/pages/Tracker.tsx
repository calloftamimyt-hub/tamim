import React, { useState, useEffect, useMemo } from 'react';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Check, Circle, Trophy, Calendar as CalendarIcon, Activity, 
  ChevronLeft, ChevronRight, Moon, Sun, BookOpen, Hash, Flame,
  TrendingUp, Award, Star, Zap, Info, Loader2, X, Clock, ChevronDown,
  Droplets, Bed, HeartHandshake, Smile, Meh, Frown, MessageSquare,
  Smartphone, Dumbbell, ShieldCheck, Heart, Coffee, Book, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { Capacitor } from '@capacitor/core';

const toBengaliDigits = (str: string) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/\d/g, d => bengaliDigits[parseInt(d)]);
};

const formatPrayerTime = (timeStr: string, language: string) => {
  if (language !== 'bn') return timeStr;
  return toBengaliDigits(timeStr);
};

import { getFriendlyErrorMessage } from '@/lib/errorUtils';

import { useLocation } from '@/hooks/useLocation';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';

const PRAYERS_CONFIG = [
  { id: 'fajr', labelKey: 'fajr', type: 'fard' },
  { id: 'dhuhr', labelKey: 'dhuhr', type: 'fard' },
  { id: 'asr', labelKey: 'asr', type: 'fard' },
  { id: 'maghrib', labelKey: 'maghrib', type: 'fard' },
  { id: 'isha', labelKey: 'isha', type: 'fard' },
  { id: 'tahajjud', labelKey: 'tahajjud', type: 'nafl' },
  { id: 'ishraq', labelKey: 'ishraq', type: 'nafl' },
  { id: 'duha', labelKey: 'duha', type: 'nafl' },
  { id: 'awwabin', labelKey: 'awwabin', type: 'nafl' },
];

export function Tracker() {
  const { t, language } = useLanguage();
  const { latitude, longitude } = useLocation(language);
  const { data: prayerTimesData } = usePrayerTimes(latitude, longitude);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Get current day's timings
  const todayTimings = useMemo(() => {
    if (!prayerTimesData) return null;
    const targetStr = format(selectedDate, 'dd-MM-yyyy');
    return prayerTimesData.find((d: any) => d.date.gregorian.date === targetStr)?.timings;
  }, [prayerTimesData, selectedDate]);

  const PRAYERS = useMemo(() => {
    return PRAYERS_CONFIG.map(p => {
      let time = '00:00';
      if (todayTimings) {
        const key = (p.id.charAt(0).toUpperCase() + p.id.slice(1)) as keyof typeof todayTimings;
        // Handle special cases
        if (p.id === 'fajr') time = todayTimings.Fajr;
        else if (p.id === 'dhuhr') time = todayTimings.Dhuhr;
        else if (p.id === 'asr') time = todayTimings.Asr;
        else if (p.id === 'maghrib') time = todayTimings.Maghrib;
        else if (p.id === 'isha') time = todayTimings.Isha;
        else if (p.id === 'tahajjud') {
            // Approx 1 hour before Fajr
            const [h, m] = todayTimings.Fajr.split(':').map(Number);
            const d = new Date();
            d.setHours(h - 1, m, 0, 0);
            time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        }
        else if (p.id === 'ishraq') {
            const [h, m] = todayTimings.Sunrise.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m + 15, 0, 0);
            time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        }
        else if (p.id === 'duha') {
            const [h, m] = todayTimings.Sunrise.split(':').map(Number);
            const d = new Date();
            d.setHours(h + 1, m, 0, 0);
            time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        }
        else if (p.id === 'awwabin') {
            const [h, m] = todayTimings.Maghrib.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m + 20, 0, 0);
            time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        }
      }
      return { ...p, time };
    });
  }, [todayTimings]);

  // Update current time every minute for tracker logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const [trackerData, setTrackerData] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('prayerTracker');
    return saved ? JSON.parse(saved) : {};
  });

  const dayData = trackerData[dateStr] || {
    prayers: {},
    fasting: false,
    quran: 0,
    zikr: 0,
    qaza: 0,
    water: 0,
    sleep: 0,
    sadaqah: false,
    mood: '',
    reflection: '',
    exercise: 0,
    screenTime: 0,
    socialMediaLimit: false,
    goodDeeds: 0,
    badHabitQuit: false,
    readingTime: 0
  };

  const prayerProgress = useMemo(() => {
    const fardPrayers = PRAYERS.filter(p => p.type === 'fard');
    const completed = fardPrayers.filter(p => dayData.prayers?.[p.id] === 'prayed').length;
    return (completed / fardPrayers.length) * 100;
  }, [dayData.prayers]);

  useEffect(() => {
    localStorage.setItem('prayerTracker', JSON.stringify(trackerData));
  }, [trackerData]);

  const toggleItem = (id: string, category: 'prayers' | 'fasting' | 'quran' | 'zikr' | 'qaza' | 'water' | 'sleep' | 'sadaqah' | 'mood' | 'reflection' | 'exercise' | 'screenTime' | 'socialMediaLimit' | 'goodDeeds' | 'badHabitQuit' | 'readingTime', value?: any) => {
    // Only apply restriction for current date and prayers category
    if (category === 'prayers' && isSameDay(selectedDate, new Date())) {
      const activePrayer = currentPrayer;
      if (activePrayer && activePrayer.id !== id) {
        alert(language === 'bn' 
          ? `এখন শুধুমাত্র ${t(activePrayer.labelKey as any)} এর ওয়াক্ত চলছে। অন্য ওয়াক্ত ট্রাক করা যাবে না।`
          : `Only ${t(activePrayer.labelKey as any)} time is active now. Other prayers cannot be tracked.`
        );
        return;
      }
    }

    setTrackerData(prev => {
      const currentDay = prev[dateStr] || { 
        prayers: {}, fasting: false, quran: 0, zikr: 0, qaza: 0, water: 0, sleep: 0, sadaqah: false, mood: '', reflection: '',
        exercise: 0, screenTime: 0, socialMediaLimit: false, goodDeeds: 0, badHabitQuit: false, readingTime: 0
      };
      let newValue;
      
      if (category === 'prayers') {
        const currentStatus = currentDay.prayers[id];
        if (value !== undefined) {
          newValue = { ...currentDay.prayers, [id]: value };
        } else {
          // 3-state toggle: None -> Prayed -> Missed -> None
          let nextStatus;
          if (!currentStatus) nextStatus = 'prayed';
          else if (currentStatus === 'prayed') nextStatus = 'missed';
          else nextStatus = null;
          newValue = { ...currentDay.prayers, [id]: nextStatus };
        }
      } else if (category === 'fasting' || category === 'sadaqah' || category === 'socialMediaLimit' || category === 'badHabitQuit') {
        newValue = value !== undefined ? value : !currentDay[category];
      } else {
        newValue = value;
      }

      const updatedDay = {
        ...currentDay,
        [category]: newValue
      };

      const newState = {
        ...prev,
        [dateStr]: updatedDay
      };

      return newState;
    });
  };

  const completedFard = Object.entries(dayData.prayers || {})
    .filter(([id, val]) => val === 'prayed' && PRAYERS.find(p => p.id === id)?.type === 'fard').length;
  
  const progressPercentage = (completedFard / 5) * 100;

  // Weekly report data
  const start = startOfWeek(new Date(), { weekStartsOn: 6 });
  const end = endOfWeek(new Date(), { weekStartsOn: 6 });
  const weekDays = eachDayOfInterval({ start, end });

  const currentStreak = useMemo(() => {
    let streak = 0;
    let curr = new Date();
    // Safety limit to avoid infinite loops or excessive history check
    let iterations = 0;
    const maxDays = 365; 
    
    while (iterations < maxDays) {
      const dStr = format(curr, 'yyyy-MM-dd');
      const dData = trackerData[dStr];
      if (!dData) break;
      const completed = Object.entries(dData.prayers || {})
        .filter(([id, val]) => val === 'prayed' && PRAYERS.find(p => p.id === id)?.type === 'fard').length;
      if (completed === 5) {
        streak++;
        curr = subDays(curr, 1);
      } else {
        break;
      }
      iterations++;
    }
    return streak;
  }, [trackerData]);

  const currentPrayer = useMemo(() => {
    const now = currentTime;
    const sortedPrayers = [...PRAYERS].sort((a, b) => {
      const [hA, mA] = a.time.split(':').map(Number);
      const [hB, mB] = b.time.split(':').map(Number);
      return (hA * 60 + mA) - (hB * 60 + mB);
    });

    for (let i = 0; i < sortedPrayers.length; i++) {
      const [h, m] = sortedPrayers[i].time.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(h, m, 0, 0);
      
      const nextPrayerDate = i < sortedPrayers.length - 1 
        ? (() => {
            const [nh, nm] = sortedPrayers[i+1].time.split(':').map(Number);
            const d = new Date();
            d.setHours(nh, nm, 0, 0);
            return d;
          })()
        : (() => {
            const d = new Date();
            d.setHours(23, 59, 59, 999);
            return d;
          })();

      if (now >= prayerDate && now <= nextPrayerDate) {
        return sortedPrayers[i];
      }
    }
    
    return sortedPrayers[0];
  }, [currentTime]);

  const isCurrentPrayerDone = useMemo(() => dayData.prayers?.[currentPrayer.id] === 'prayed', [dayData.prayers, currentPrayer.id]);

  const chartData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 6 });
    const end = endOfWeek(new Date(), { weekStartsOn: 6 });
    const weekDays = eachDayOfInterval({ start, end });

    return weekDays.map(day => {
      const dStr = format(day, 'yyyy-MM-dd');
      const dData = trackerData[dStr] || { prayers: {} };
      const completed = Object.entries(dData.prayers || {})
        .filter(([id, val]) => val === 'prayed' && PRAYERS.find(p => p.id === id)?.type === 'fard').length;
      return {
        name: format(day, 'EEE'),
        completed,
        isToday: isSameDay(day, new Date())
      };
    });
  }, [trackerData]);

  const navigateDate = (days: number) => {
    setSelectedDate(prev => addDays(prev, days));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 pb-2 shadow-sm",
        Capacitor.isNativePlatform() ? "pt-12" : "pt-safe pt-4"
      )}>
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center whitespace-nowrap">
              <Activity className="w-5 h-5 mr-2 text-primary dark:text-primary-light" />
              {t('worship-tracker')}
            </h1>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] -mt-1 hidden sm:block">
              {t('track-everything')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {currentStreak > 0 && (
              <div className="flex items-center bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-orange-600 mr-1.5 fill-orange-600" />
                <span className="text-xs font-black text-orange-700 dark:text-orange-400">{currentStreak}</span>
              </div>
            )}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 shadow-inner">
              <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 font-black text-[10px] min-w-[80px] text-center uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {isSameDay(selectedDate, new Date()) ? t('today') : format(selectedDate, 'dd MMM')}
              </div>
              <button 
                onClick={() => navigateDate(1)} 
                disabled={isSameDay(selectedDate, new Date())}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-[calc(6rem+env(safe-area-inset-top))] p-4 md:p-8 max-w-3xl mx-auto space-y-4 pb-24">
        {/* Daily Summary & Streak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {t('daily-summary')}
              </h3>
              <div className="flex -space-x-1">
                {dayData.fasting && <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900 flex items-center justify-center"><Sun className="w-2.5 h-2.5 text-white" /></div>}
                {dayData.exercise > 0 && <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center"><Dumbbell className="w-2.5 h-2.5 text-white" /></div>}
                {dayData.water >= 8 && <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center"><Droplets className="w-2.5 h-2.5 text-white" /></div>}
              </div>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-[11px] font-black mb-1.5 uppercase tracking-wide">
                  <span className="text-slate-500">{t('prayers')}</span>
                  <span className="text-primary">{Math.round(prayerProgress)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${prayerProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: t('water-intake'), val: `${dayData.water}g`, icon: Droplets, color: 'text-blue-500' },
                  { label: t('exercise'), val: `${dayData.exercise}m`, icon: Dumbbell, color: 'text-emerald-500' },
                  { label: t('quran'), val: `${dayData.quran}p`, icon: BookOpen, color: 'text-indigo-500' },
                  { label: t('zikr'), val: dayData.zikr, icon: Hash, color: 'text-amber-500' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 text-center border border-slate-100/50 dark:border-slate-700/50">
                    <item.icon className={cn("w-3.5 h-3.5 mx-auto mb-1", item.color)} />
                    <span className="block text-[9px] font-black text-slate-900 dark:text-white">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-5 text-white flex items-center justify-between relative overflow-hidden shadow-lg shadow-orange-500/20 group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-orange-100 uppercase tracking-[0.2em] mb-1.5 opacity-80">{t('current-streak')}</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black tracking-tighter group-hover:scale-110 transition-transform">{currentStreak}</span>
                <span className="text-sm font-black text-orange-100 uppercase">{t('days')}</span>
              </div>
              <p className="text-[10px] font-bold text-orange-100 mt-2 opacity-70 italic">"{t('keep-it-up')}"</p>
            </div>
            <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl group-hover:rotate-12 transition-transform">
              <Flame className="w-10 h-10 text-white fill-white drop-shadow-lg" />
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-12 -mb-12 blur-2xl" />
          </div>
        </div>

        {/* Quick Log Section */}
        <div className="space-y-3">
          <div 
            onClick={() => toggleItem(currentPrayer.id, 'prayers', isCurrentPrayerDone ? null : 'prayed')}
            className={cn(
              "relative overflow-hidden rounded-lg p-4 border transition-all cursor-pointer group active:scale-[0.98]",
              isCurrentPrayerDone 
                ? "bg-primary border-primary-dark text-white" 
                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
            )}
          >
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isCurrentPrayerDone ? "text-primary-light/80" : "text-slate-500")}>
                  {t('current-prayer')}
                </p>
                <h2 className="text-xl font-black">{currentPrayer.id === 'dhuhr' && selectedDate.getDay() === 5 ? t('jumuah') : t(currentPrayer.labelKey as any)}</h2>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={cn("text-xs font-bold", isCurrentPrayerDone ? "text-primary-light" : "text-primary")}>
                    {isCurrentPrayerDone ? t('completed') : t('mark-as-done')}
                  </span>
                  <Clock className={cn("w-3 h-3", isCurrentPrayerDone ? "text-primary-light" : "text-slate-400")} />
                  <span className={cn("text-[10px]", isCurrentPrayerDone ? "text-primary-light" : "text-slate-400")}>{currentPrayer.time}</span>
                </div>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500",
                isCurrentPrayerDone ? "bg-white text-primary rotate-12" : "bg-primary/10 dark:bg-primary-dark/10 text-primary"
              )}>
                {isCurrentPrayerDone ? <Check className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
              </div>
            </div>
            {!isCurrentPrayerDone && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-primary/10 transition-colors" />
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {/* Fard Prayers */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('fard-prayers')}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {PRAYERS.filter(p => p.type === 'fard').map((prayer) => (
                <PrayerItem 
                  key={prayer.id}
                  label={prayer.id === 'dhuhr' && selectedDate.getDay() === 5 ? t('jumuah') : t(prayer.labelKey as any)}
                  time={formatPrayerTime(prayer.time, language)}
                  status={dayData.prayers?.[prayer.id]}
                  onToggle={() => toggleItem(prayer.id, 'prayers')}
                  onStatusChange={(status: string) => toggleItem(prayer.id, 'prayers', status)}
                  isActive={isSameDay(selectedDate, new Date()) && currentPrayer.id === prayer.id}
                  disabled={isSameDay(selectedDate, new Date()) && currentPrayer.id !== prayer.id}
                />
              ))}
            </div>
          </section>

          {/* Nafl Prayers */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('nafl-sunnah')}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {PRAYERS.filter(p => p.type === 'nafl').map((prayer) => (
                <PrayerItem 
                  key={prayer.id}
                  label={t(prayer.labelKey as any)}
                  time={formatPrayerTime(prayer.time, language)}
                  status={dayData.prayers?.[prayer.id]}
                  onToggle={() => toggleItem(prayer.id, 'prayers')}
                  onStatusChange={(status: string) => toggleItem(prayer.id, 'prayers', status)}
                  isActive={isSameDay(selectedDate, new Date()) && currentPrayer.id === prayer.id}
                  disabled={isSameDay(selectedDate, new Date()) && currentPrayer.id !== prayer.id}
                  isNafl
                />
              ))}
            </div>
          </section>

          {/* Fasting & Others */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('spiritual') || 'Spiritual Growth'}</h3>
              <Sparkles className="w-3.5 h-3.5 text-primary opacity-50" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Fasting */}
              <div className={cn(
                "flex items-center justify-between p-4 transition-all",
                dayData.fasting ? "bg-orange-50/50 dark:bg-orange-900/10" : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <Sun className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-bold text-sm">{t('todays-fasting')}</span>
                </div>
                <button 
                  onClick={() => toggleItem('roza', 'fasting')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm",
                    dayData.fasting ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  {dayData.fasting ? t('fasted') : t('not-fasted')}
                </button>
              </div>

              {/* Quran */}
              <CounterItem 
                icon={BookOpen} 
                color="blue" 
                label={t('quran-recitation')} 
                sublabel={t('page-count')} 
                value={dayData.quran} 
                onValueChange={(val) => toggleItem('quran', 'quran', val)} 
                unit="p"
              />

              {/* Zikr */}
              <CounterItem 
                icon={Hash} 
                color="amber" 
                label={t('zikr-tasbih')} 
                sublabel={t('times-count')} 
                value={dayData.zikr} 
                onValueChange={(val) => toggleItem('zikr', 'zikr', val)} 
              />

              {/* Qaza */}
              <CounterItem 
                icon={Activity} 
                color="rose" 
                label={t('qaza-prayers')} 
                sublabel={t('waqt-count')} 
                value={dayData.qaza} 
                onValueChange={(val) => toggleItem('qaza', 'qaza', val)} 
              />

              {/* Sadaqah */}
              <div className={cn(
                "flex items-center justify-between p-4 transition-all",
                dayData.sadaqah ? "bg-rose-50/50 dark:bg-rose-900/10" : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="font-bold text-sm">{t('sadaqah-charity')}</span>
                </div>
                <button 
                  onClick={() => toggleItem('sadaqah', 'sadaqah')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm",
                    dayData.sadaqah ? "bg-rose-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  {dayData.sadaqah ? t('donated') : t('not-donated')}
                </button>
              </div>
            </div>
          </section>

          {/* New Health & Wellness Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('well-being') || 'Health & Wellness'}</h3>
              <Heart className="w-3.5 h-3.5 text-rose-500 opacity-50" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <CounterItem 
                icon={Droplets} 
                color="blue" 
                label={t('water-intake')} 
                sublabel={t('glasses')} 
                value={dayData.water} 
                onValueChange={(val) => toggleItem('water', 'water', val)} 
              />
              <CounterItem 
                icon={Bed} 
                color="indigo" 
                label={t('sleep-tracker')} 
                sublabel={t('hours')} 
                value={dayData.sleep} 
                onValueChange={(val) => toggleItem('sleep', 'sleep', val)} 
              />
              <CounterItem 
                icon={Dumbbell} 
                color="emerald" 
                label={t('exercise')} 
                sublabel={t('minutes')} 
                value={dayData.exercise} 
                onValueChange={(val) => toggleItem('exercise', 'exercise', val)} 
                step={5}
              />
            </div>
          </section>

          {/* New Digital Wellbeing Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('digital-detox')}</h3>
              <Smartphone className="w-3.5 h-3.5 text-indigo-500 opacity-50" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <CounterItem 
                icon={Clock} 
                color="violet" 
                label={t('screen-time-less')} 
                sublabel={t('hours')} 
                value={dayData.screenTime} 
                onValueChange={(val) => toggleItem('screenTime', 'screenTime', val)} 
              />
              <CounterItem 
                icon={Book} 
                color="cyan" 
                label={t('reading-time')} 
                sublabel={t('minutes')} 
                value={dayData.readingTime} 
                onValueChange={(val) => toggleItem('readingTime', 'readingTime', val)} 
                step={5}
              />
              <div className={cn(
                "flex items-center justify-between p-4 transition-all",
                dayData.socialMediaLimit ? "bg-indigo-50/50 dark:bg-indigo-900/10" : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="font-bold text-sm">{t('social-media-limit')}</span>
                </div>
                <button 
                  onClick={() => toggleItem('socialMediaLimit', 'socialMediaLimit')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm",
                    dayData.socialMediaLimit ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  {dayData.socialMediaLimit ? t('on') : t('off')}
                </button>
              </div>
            </div>
          </section>

          {/* New Self Improvement Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('productivity') || 'Self Improvement'}</h3>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 opacity-50" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <CounterItem 
                icon={Star} 
                color="yellow" 
                label={t('good-deeds')} 
                sublabel={t('times-count')} 
                value={dayData.goodDeeds} 
                onValueChange={(val) => toggleItem('goodDeeds', 'goodDeeds', val)} 
              />
              <div className={cn(
                "flex items-center justify-between p-4 transition-all",
                dayData.badHabitQuit ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-bold text-sm">{t('bad-habit')}</span>
                </div>
                <button 
                  onClick={() => toggleItem('badHabitQuit', 'badHabitQuit')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm",
                    dayData.badHabitQuit ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  {dayData.badHabitQuit ? t('completed') : t('mark-as-done')}
                </button>
              </div>
            </div>
          </section>

          {/* Mood Tracker Card */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('mood') || 'Daily Mood'}</h3>
              <Smile className="w-3.5 h-3.5 text-primary opacity-50" />
            </div>
            <div className="p-5">
              <div className="flex justify-around items-center bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                {[
                  { icon: Frown, mood: 'sad', color: 'text-rose-500' },
                  { icon: Meh, mood: 'neutral', color: 'text-slate-500' },
                  { icon: Smile, mood: 'happy', color: 'text-emerald-500' }
                ].map((item) => (
                  <button
                    key={item.mood}
                    onClick={() => toggleItem('mood', 'mood', item.mood)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-2xl transition-all",
                      dayData.mood === item.mood 
                        ? "scale-110 shadow-lg ring-2 ring-primary bg-white dark:bg-slate-800" 
                        : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                    )}
                  >
                    <item.icon className={cn("w-8 h-8 mb-1", item.color)} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t(item.mood as any)}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Daily Reflection Card */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('todays-reflection')}</h3>
              <MessageSquare className="w-3.5 h-3.5 text-primary opacity-50" />
            </div>
            <div className="p-5">
              <div className="relative">
                <div className="absolute top-3 left-3">
                  <MessageSquare className="w-4 h-4 text-slate-300" />
                </div>
                <textarea
                  placeholder={t('reflection-placeholder') || 'Write your daily reflection...'}
                  value={dayData.reflection}
                  onChange={(e) => toggleItem('reflection', 'reflection', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 pl-9 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[100px] resize-none dark:text-white"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Weekly Report */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{t('weekly-report')}</h3>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t('last-7-days') || 'Last 7 Days'}
            </div>
          </div>
          
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ 
                     borderRadius: '12px', 
                     border: 'none', 
                     boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
                     backgroundColor: '#1e293b', 
                     color: '#fff', 
                     fontSize: '11px',
                     fontWeight: '700'
                   }}
                />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isToday ? 'var(--color-primary)' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}

const CounterItem = React.memo(({ icon: Icon, color, label, sublabel, value, onValueChange, unit, step = 1 }: any) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/30",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/30",
    cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
  };

  return (
    <div className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-4 flex items-center justify-between transition-all">
      <div className="flex items-center space-x-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color] || colors.blue)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold block text-sm">{label}</span>
          <span className="text-[10px] text-slate-500">{sublabel}</span>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => onValueChange(Math.max(0, (value || 0) - step))}
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >-</button>
        <div className="w-10 text-center flex flex-col justify-center">
          <span className="font-black text-sm text-slate-900 dark:text-white leading-none">
            {value || 0}{unit && <span className="text-[8px] ml-0.5 opacity-50 uppercase">{unit}</span>}
          </span>
        </div>
        <button 
          onClick={() => onValueChange((value || 0) + step)}
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >+</button>
      </div>
    </div>
  );
});

const PrayerItem = React.memo(({ label, time, status, onToggle, onStatusChange, isNafl, isActive, disabled }: any) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const getStatusLabel = () => {
    if (status === 'prayed') return t('prayed');
    if (status === 'missed') return t('missed');
    return t('select');
  };

  const getStatusColor = () => {
    if (status === 'prayed') return isNafl ? 'text-indigo-600' : 'text-primary';
    if (status === 'missed') return 'text-rose-600';
    return disabled ? 'text-slate-300' : 'text-slate-400';
  };

  return (
    <div className="relative">
      <div className={cn("flex items-center", disabled && "opacity-50 pointer-events-none grayscale-[0.5]")}>
        <button
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            "flex-1 flex items-center justify-between p-3 transition-all relative overflow-hidden",
            isActive && "bg-primary/5 dark:bg-primary/10",
            status === 'prayed'
              ? isNafl ? "bg-indigo-50/50 dark:bg-indigo-900/10" : "bg-primary/5 dark:bg-primary-dark/10"
              : status === 'missed'
                ? "bg-rose-50/50 dark:bg-rose-900/10"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900"
          )}
        >
          {isActive && (
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 pointer-events-none" />
          )}

          <div className="flex items-center space-x-3 relative z-10">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              status === 'prayed'
                ? isNafl ? "bg-indigo-500 text-white" : "bg-primary text-white"
                : status === 'missed'
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100/50 dark:bg-slate-800/50 text-slate-400"
            )}>
              {status === 'prayed' ? <Check className="w-5 h-5" /> : status === 'missed' ? <X className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <span className={cn(
                "font-bold block text-sm",
                status === 'prayed'
                  ? isNafl ? "text-indigo-700 dark:text-indigo-400" : "text-primary dark:text-primary-light"
                  : status === 'missed'
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-slate-700 dark:text-slate-300",
                isActive && "text-primary font-black"
              )}>
                {label}
                {isActive && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-primary text-white uppercase tracking-tighter">
                    {t('active') || 'Active'}
                  </span>
                )}
              </span>
              <div className="flex items-center space-x-2">
                <span className={cn("text-[10px] font-medium", getStatusColor())}>
                  {getStatusLabel()}
                </span>
                {time && (
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                    {time}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div 
            onClick={(e) => {
              if (disabled) return;
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-1 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors ml-2 relative z-10"
          >
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden"
          >
            <button
              onClick={() => {
                onStatusChange('prayed');
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 p-3.5 hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center text-primary dark:text-primary-light">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('prayed')}</span>
            </button>
            <button
              onClick={() => {
                onStatusChange('missed');
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 p-3.5 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors text-left border-t border-slate-100 dark:border-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                <X className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('missed')}</span>
            </button>
            <button
              onClick={() => {
                onStatusChange(null);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-t border-slate-100 dark:border-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                <Circle className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('reset')}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
PrayerItem.displayName = 'PrayerItem';
