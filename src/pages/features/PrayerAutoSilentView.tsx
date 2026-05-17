import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, VolumeX, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocation } from '../../hooks/useLocation';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';

export interface PrayerAutoSilentPlugin {
  getPermissionStatus(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<void>;
  setAutoSilent(options: { 
      prayerName: string, 
      isEnabled: boolean, 
      startHour: number, 
      startMinute: number, 
      durationMinutes: number 
  }): Promise<void>;
}

const PrayerAutoSilent = registerPlugin<PrayerAutoSilentPlugin>('PrayerAutoSilent');

interface PrayerAutoSilentProps {
  onBack: () => void;
}

export const PrayerAutoSilentView = ({ onBack }: PrayerAutoSilentProps) => {
  const { language } = useLanguage();
  const { latitude, longitude, country, city } = useLocation(language);
  const { data: prayerTimesData } = usePrayerTimes(latitude, longitude);

  const [hasPermission, setHasPermission] = useState(false);
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({});
  const [durations, setDurations] = useState<Record<string, number>>({
      'Fajr': 30,
      'Dhuhr': 45,
      'Asr': 30,
      'Maghrib': 20,
      'Isha': 45
  });

  const [localMadhab, setLocalMadhab] = useState(localStorage.getItem('islamic_app_madhab') || 'Shafi');
  const [localCalc, setLocalCalc] = useState(localStorage.getItem('islamic_app_calc_method') || 'University of Islamic Sciences, Karachi');

  const calcMethods = [
    'University of Islamic Sciences, Karachi',
    'Muslim World League',
    'Islamic Society of North America',
    'Umm Al-Qura University, Makkah',
    'Egyptian General Authority of Survey',
    'Institute of Geophysics, University of Tehran',
    'Shia Ithna-Ashari, Leva Institute, Qum'
  ];

  const madhabs = ['Hanafi', 'Maliki', 'Shafi', 'Hanbali'];

  useEffect(() => {
     checkPermission();
  }, []);

  const checkPermission = async () => {
      if (Capacitor.isNativePlatform()) {
          const res = await PrayerAutoSilent.getPermissionStatus();
          setHasPermission(res.granted);
      }
  };

  const requestPermission = async () => {
      if (Capacitor.isNativePlatform()) {
          await PrayerAutoSilent.requestPermission();
          setTimeout(() => checkPermission(), 3000);
      }
  };

  const handleMadhabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocalMadhab(val);
    localStorage.setItem('islamic_app_madhab', val);
    window.dispatchEvent(new Event('madhab-changed'));
  };

  const handleCalcChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocalCalc(val);
    localStorage.setItem('islamic_app_calc_method', val);
    window.dispatchEvent(new Event('calc-changed'));
  };

  const getPrayersList = () => {
    // Determine today's times
    if (!prayerTimesData) {
        return [
          { id: 'Fajr', bn: 'ফজর', start: '03:51 AM', end: '05:14 AM', startH: 3, startM: 51 },
          { id: 'Dhuhr', bn: 'যোহর', start: '11:57 AM', end: '04:33 PM', startH: 11, startM: 57 },
          { id: 'Asr', bn: 'আসর', start: '04:34 PM', end: '06:34 PM', startH: 16, startM: 34 },
          { id: 'Maghrib', bn: 'মাগরিব', start: '06:35 PM', end: '07:58 PM', startH: 18, startM: 35 },
          { id: 'Isha', bn: 'এশা', start: '07:58 PM', end: '03:51 AM', startH: 19, startM: 58 }
        ];
    }
    const todayData = prayerTimesData[new Date().getDate() - 1]?.timings;
    if (!todayData) return [];

    const formatAMPM = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedH = h % 12 || 12;
        return `${formattedH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const getH = (timeStr: string) => parseInt(timeStr.split(':')[0], 10);
    const getM = (timeStr: string) => parseInt(timeStr.split(':')[1], 10);

    return [
      { id: 'Fajr', bn: 'ফজর', start: formatAMPM(todayData.Fajr), end: formatAMPM(todayData.Sunrise), startH: getH(todayData.Fajr), startM: getM(todayData.Fajr) },
      { id: 'Dhuhr', bn: 'যোহর', start: formatAMPM(todayData.Dhuhr), end: formatAMPM(todayData.Asr), startH: getH(todayData.Dhuhr), startM: getM(todayData.Dhuhr) },
      { id: 'Asr', bn: 'আসর', start: formatAMPM(todayData.Asr), end: formatAMPM(todayData.Sunset), startH: getH(todayData.Asr), startM: getM(todayData.Asr) },
      { id: 'Maghrib', bn: 'মাগরিব', start: formatAMPM(todayData.Maghrib), end: formatAMPM(todayData.Isha), startH: getH(todayData.Maghrib), startM: getM(todayData.Maghrib) },
      { id: 'Isha', bn: 'এশা', start: formatAMPM(todayData.Isha), end: formatAMPM(todayData.Midnight), startH: getH(todayData.Isha), startM: getM(todayData.Isha) }
    ];
  };

  const currentPrayers = getPrayersList();

  const handleToggle = async (prayer: any, isEnabled: boolean) => {
      if (!hasPermission && isEnabled) {
          requestPermission();
          return;
      }
      setActiveToggles(prev => ({ ...prev, [prayer.id]: isEnabled }));

      if (Capacitor.isNativePlatform()) {
          try {
              await PrayerAutoSilent.setAutoSilent({
                  prayerName: prayer.id,
                  isEnabled: isEnabled,
                  startHour: prayer.startH,
                  startMinute: prayer.startM,
                  durationMinutes: durations[prayer.id]
              });
          } catch(e) {
              console.error(e);
          }
      }
  };

  const adjustDuration = (id: string, amount: number) => {
      setDurations(prev => {
          const newVal = Math.max(5, Math.min(180, prev[id] + amount));
          return { ...prev, [id]: newVal };
      });
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden">
      <header className="flex items-center p-4 pt-safe bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="text-xl font-bold ml-2 text-slate-800 dark:text-white">
          {language === 'bn' ? 'অটো সাইলেন্ট' : 'Auto Silent'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Location Selection Card */}
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 shadow-sm relative mb-2">
          <h2 className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-2 text-sm text-emerald-700 dark:text-emerald-400">
             {language === 'bn' ? 'লোকেশন নির্বাচন করুন' : 'Select Location'}
          </h2>
          
          <div className="space-y-4 mt-2">
            <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-1 text-xs text-slate-500">
                {language === 'bn' ? 'দেশ' : 'Country'}
              </span>
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-white">{country || (language === 'bn' ? 'বাংলাদেশ' : 'Bangladesh')}</span>
                <Search className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-1 text-xs text-slate-500">
                {language === 'bn' ? 'শহর' : 'City'}
              </span>
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-white">{city || (language === 'bn' ? 'ঢাকা' : 'Dhaka')}</span>
                <Search className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-1 text-xs text-slate-500">
                {language === 'bn' ? 'মাযহাব' : 'Madhab'}
              </span>
              <select value={localMadhab} onChange={handleMadhabChange} className="bg-transparent border-none outline-none w-full font-medium dark:text-white text-slate-800 appearance-none">
                {madhabs.map(m => (
                    <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="relative border border-emerald-500 rounded-xl p-3 bg-emerald-50 dark:bg-emerald-900/10">
              <span className="absolute -top-3 left-4 bg-emerald-50 dark:bg-slate-900 px-1 text-xs text-emerald-700 dark:text-emerald-400">
                {language === 'bn' ? 'ক্যালকুলেশন পদ্ধতি (লোকেশন ভিত্তিক)' : 'Calculation Method'}
              </span>
              <select value={localCalc} onChange={handleCalcChange} className="bg-transparent border-none outline-none w-full font-medium text-slate-800 dark:text-white appearance-none mt-1">
                {calcMethods.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prayer Toggles */}
        {currentPrayers.map((prayer) => (
            <div key={prayer.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-400">{language === 'bn' ? prayer.bn : prayer.id}</h3>
                        <p className="text-slate-500 text-sm mt-1">{prayer.start} &rarr; {prayer.end}</p>
                    </div>
                    <button 
                        onClick={() => handleToggle(prayer, !activeToggles[prayer.id])}
                        className={`w-12 h-7 rounded-full transition-colors relative ${activeToggles[prayer.id] ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${activeToggles[prayer.id] ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>

                {/* Duration Slider (visible when active) */}
                {activeToggles[prayer.id] && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800"
                    >
                        <div className="flex flex-col items-center">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 mb-4">
                                <VolumeX className="w-4 h-4" />
                                {durations[prayer.id]} {language === 'bn' ? 'মিনিট' : 'minutes'}
                            </div>

                            <div className="w-full flex items-center gap-4 text-slate-400">
                                <div className="text-xs text-center flex-1 whitespace-nowrap">
                                    {prayer.start}
                                </div>

                                <div className="flex-[2] relative flex items-center justify-center h-8">
                                    <div className="absolute h-2 bg-slate-200 dark:bg-slate-700 w-full rounded-full"></div>
                                    <div className="absolute h-2 bg-indigo-500 rounded-full" style={{ width: '50%' }}></div>
                                    <div className="flex justify-between w-full z-10 px-2 mt-4 text-slate-300">
                                        ••••••
                                    </div>
                                </div>

                                <div className="text-xs text-center flex-1 whitespace-nowrap">
                                    {prayer.end}
                                </div>
                            </div>

                            <div className="flex items-center justify-between w-full mt-6 px-4">
                                <button onClick={() => adjustDuration(prayer.id, -5)} className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl transition-colors hover:bg-indigo-100 font-medium">
                                    <Minus className="w-4 h-4" /> {language === 'bn' ? 'কমান' : 'Decrease'}
                                </button>
                                <button onClick={() => adjustDuration(prayer.id, 5)} className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl transition-colors hover:bg-indigo-100 font-medium">
                                    {language === 'bn' ? 'বাড়ান' : 'Increase'} <Plus className="w-4 h-4" /> 
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        ))}
        <div className="h-10"></div>
      </div>
    </div>
  );
};
