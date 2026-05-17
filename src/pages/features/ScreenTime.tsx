import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Globe, Video, MessageCircle, PlaySquare, Settings, Smartphone, ChevronDown, BarChart2, Activity, Settings as SettingsIcon, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ScreenTimeProps {
  onBack: () => void;
  language: string;
}

const allChartData = {
  today: [
    { time: '12 AM', value: 30 }, { time: '3 AM', value: 10 }, { time: '6 AM', value: 5 }, { time: '9 AM', value: 45 },
    { time: '12 PM', value: 120 }, { time: '3 PM', value: 85 }, { time: '6 PM', value: 60 }, { time: '9 PM', value: 90 },
  ],
  yesterday: [
    { time: '12 AM', value: 20 }, { time: '3 AM', value: 0 }, { time: '6 AM', value: 15 }, { time: '9 AM', value: 80 },
    { time: '12 PM', value: 90 }, { time: '3 PM', value: 110 }, { time: '6 PM', value: 40 }, { time: '9 PM', value: 70 },
  ],
  days3: [
    { time: 'Day 1', value: 4.5 }, { time: 'Day 2', value: 5.2 }, { time: 'Today', value: 3.8 },
  ],
  days7: [
    { time: 'Mon', value: 4.5 }, { time: 'Tue', value: 5.2 }, { time: 'Wed', value: 3.8 }, { time: 'Thu', value: 6.1 },
    { time: 'Fri', value: 5.5 }, { time: 'Sat', value: 7.2 }, { time: 'Sun', value: 6.8 },
  ],
  days15: [
    { time: '1-3', value: 15 }, { time: '4-6', value: 18 }, { time: '7-9', value: 14 }, { time: '10-12', value: 22 }, { time: '13-15', value: 20 }
  ],
  days28: [
    { time: 'Week 1', value: 35 }, { time: 'Week 2', value: 42 }, { time: 'Week 3', value: 38 }, { time: 'Week 4', value: 45 }
  ]
};

const mockAppsData = [
  { id: 'tiktok', name: 'TikTok', time: '55m 31s', percentage: 38.1, color: 'bg-black dark:bg-white', progressColor: 'bg-orange-500', icon: <PlaySquare className="w-6 h-6 text-white dark:text-black" />, category: 'social' },
  { id: 'chrome', name: 'Chrome', time: '21m 43s', percentage: 14.9, color: 'bg-white border border-slate-200', progressColor: 'bg-indigo-500', icon: <Globe className="w-6 h-6 text-blue-500" />, category: 'other' },
  { id: 'clock', name: 'Clock', time: '19m 18s', percentage: 13.2, color: 'bg-slate-100', progressColor: 'bg-indigo-600', icon: <Clock className="w-6 h-6 text-slate-700" />, category: 'other' },
  { id: 'imo', name: 'imo', time: '12m 49s', percentage: 8.8, color: 'bg-blue-50', progressColor: 'bg-blue-500', icon: <MessageCircle className="w-6 h-6 text-blue-600" />, category: 'social' },
  { id: 'google', name: 'Google', time: '9m 55s', percentage: 6.8, color: 'bg-white border border-slate-200', progressColor: 'bg-indigo-500', icon: <Settings className="w-6 h-6 text-slate-600" />, category: 'other' },
  { id: 'youtube', name: 'YouTube', time: '8m 47s', percentage: 5.5, color: 'bg-red-50', progressColor: 'bg-red-500', icon: <Video className="w-6 h-6 text-red-600" />, category: 'social' },
  { id: 'facebook', name: 'Facebook', time: '5m 12s', percentage: 3.2, color: 'bg-blue-50', progressColor: 'bg-blue-600', icon: <MessageCircle className="w-6 h-6 text-blue-600" />, category: 'social' },
];

export function ScreenTime({ onBack, language }: ScreenTimeProps) {
  const [filter, setFilter] = useState('today');
  const [category, setCategory] = useState('all');
  
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // In a real Android app, you would check for ACTION_USAGE_ACCESS_SETTINGS permission here.
    // If not granted, we show the permission prompt.
    setHasPermission(false);
  }, []);

  const requestPermission = () => {
    // Android Implementation Note for App Usage Stats:
    // -------------------------------------------------------------
    // You need to add to AndroidManifest.xml:
    // <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" tools:ignore="ProtectedPermissions"/>
    // 
    // And to check/request:
    // Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
    // startActivity(intent);
    
    window.location.href = "intent:#Intent;action=android.settings.USAGE_ACCESS_SETTINGS;end";
    setHasPermission(true);
  };

  const chartData = allChartData[filter as keyof typeof allChartData] || allChartData.today;
  const isHourly = filter === 'today' || filter === 'yesterday';
  
  const appsToDisplay = category === 'all' 
    ? mockAppsData 
    : mockAppsData.filter(app => app.category === category);

  // Time formatting based on filter (mock)
  const totalTime = filter === 'today' ? "2h 25m" : filter === 'yesterday' ? "3h 10m" : filter === 'days7' ? "32h 15m" : "14h 50m";

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between p-4 pt-safe bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          {language === 'bn' ? 'অ্যাপ ব্যবহারের পরিসংখ্যান' : 'App Usage Statistics'}
        </h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 content-area space-y-4">
        {/* Filters */}
        <div className="flex gap-3 text-sm relative z-20">
          <div className="relative flex-1">
            <button 
              onClick={() => {setShowFilterMenu(!showFilterMenu); setShowCategoryMenu(false);}}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between shadow-sm"
            >
              <span className="truncate">
                {filter === 'today' ? (language === 'bn' ? 'আজ' : 'Today') : 
                 filter === 'yesterday' ? (language === 'bn' ? 'গতকাল' : 'Yesterday') :
                 filter === 'days3' ? (language === 'bn' ? 'গত ৩ দিন' : 'Last 3 Days') :
                 filter === 'days7' ? (language === 'bn' ? 'গত ৭ দিন' : 'Last 7 Days') :
                 filter === 'days15' ? (language === 'bn' ? 'গত ১৫ দিন' : 'Last 15 Days') :
                 (language === 'bn' ? 'গত ২৮ দিন' : 'Last 28 Days')}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            {showFilterMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden py-1">
                {[
                  { id: 'today', name: language === 'bn' ? 'আজ' : 'Today' },
                  { id: 'yesterday', name: language === 'bn' ? 'গতকাল' : 'Yesterday' },
                  { id: 'days3', name: language === 'bn' ? 'গত ৩ দিন' : 'Last 3 Days' },
                  { id: 'days7', name: language === 'bn' ? 'গত ৭ দিন' : 'Last 7 Days' },
                  { id: 'days15', name: language === 'bn' ? 'গত ১৫ দিন' : 'Last 15 Days' },
                  { id: 'days28', name: language === 'bn' ? 'গত ২৮ দিন' : 'Last 28 Days' },
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setFilter(opt.id); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${filter === opt.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex-1">
            <button 
              onClick={() => {setShowCategoryMenu(!showCategoryMenu); setShowFilterMenu(false);}}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between shadow-sm"
            >
              <span className="truncate">
                {category === 'all' ? (language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories') : 
                 (language === 'bn' ? 'সোশ্যাল' : 'Social')}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
            </button>
            {showCategoryMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden py-1">
                {[
                  { id: 'all', name: language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories' },
                  { id: 'social', name: language === 'bn' ? 'সোশ্যাল' : 'Social' },
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setCategory(opt.id); setShowCategoryMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${category === opt.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalTime}</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</p>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button className="p-1.5 px-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center gap-1 shadow-sm">
                <BarChart2 className="w-4 h-4" />
              </button>
              <button className="p-1.5 px-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  tickFormatter={isHourly ? (val) => `${val}m` : (val) => `${val}h`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Apps List */}
        <div className="space-y-3 pb-8">
          {appsToDisplay.map((app, i) => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${app.color}`}>
                {app.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate pr-2">{app.name}</h3>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{app.time}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${app.progressColor}`} 
                      style={{ width: `${app.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10 text-right">
                    {app.percentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {appsToDisplay.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              {language === 'bn' ? 'কোনো ডেটা পাওয়া যায়নি' : 'No apps found'}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!hasPermission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={onBack}
                  className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4 pt-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <SettingsIcon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {language === 'bn' ? 'ব্যবহারের অনুমতি প্রয়োজন' : 'Usage Access Required'}
                </h3>
                
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <p>
                    {language === 'bn' 
                      ? 'কোন অ্যাপ কতক্ষণ ব্যবহৃত হচ্ছে তা দেখতে "Usage Access" বা ব্যবহারের অনুমতি প্রয়োজন।' 
                      : 'To track screen time, "Usage Access" permission is required.'}
                  </p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {language === 'bn' 
                      ? 'অনুমতি দিতে Settings এ যান' 
                      : 'Go to Settings to grant permission'}
                  </p>
                </div>

                <div className="w-full flex gap-3 pt-4">
                  <button 
                    onClick={onBack}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    {language === 'bn' ? 'ফিরে যান' : 'Go Back'}
                  </button>
                  <button 
                    onClick={requestPermission}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                  >
                    {language === 'bn' ? 'ওপেন সেটিংস' : 'Open Settings'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
