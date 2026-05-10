import React, { useState, useEffect } from 'react';
import { ToolHero } from './ToolHero';
import { Calculator, ArrowLeft, DollarSign, Activity, Eye, BarChart3 } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const EarnCalcTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [dailyViews, setDailyViews] = useState<string>('10000');
  const [rpm, setRpm] = useState<string>('1.5');

  const [earnings, setEarnings] = useState({
    daily: 0,
    monthly: 0,
    yearly: 0,
  });

  useEffect(() => {
    const views = parseFloat(dailyViews) || 0;
    const rate = parseFloat(rpm) || 0;

    const dailyEarn = (views / 1000) * rate;
    
    setEarnings({
      daily: dailyEarn,
      monthly: dailyEarn * 30,
      yearly: dailyEarn * 365,
    });
  }, [dailyViews, rpm]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: 'আর্নিং হিসাব', en: 'Earnings Calculator' }} description={{ bn: 'ইউটিউব আয়ের অনুমান করুন', en: 'Estimate your YouTube revenue' }} Icon={Calculator} bgGradient="bg-gradient-to-br from-cyan-400 to-blue-500" onBack={onBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        {/* Input Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Calculator className="w-32 h-32" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                 <Eye className="w-4 h-4 text-cyan-500" />
                 {language === 'bn' ? 'দৈনিক ভিউ (Daily Views)' : 'Daily Views'}
              </label>
              <input 
                type="number" 
                value={dailyViews}
                onChange={(e) => setDailyViews(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-cyan-500" />
                 {language === 'bn' ? 'আনুমানিক  RPM ($)' : 'Estimated RPM ($)'}
              </label>
              <input 
                type="number" 
                value={rpm}
                step="0.1"
                onChange={(e) => setRpm(e.target.value)}
                placeholder="e.g. 1.5"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all dark:text-white"
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400">
              * RPM (Revenue Per Mille) {language === 'bn' ? 'হলো প্রতি ১০০০ ভিউতে আপনার আনুমানিক আয়।' : 'is the estimated earnings per 1000 views.'}
            </p>
          </div>
        </div>

        {/* Results */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-cyan-500/20">
            <h3 className="text-sm font-bold text-cyan-100 flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4" />
              {language === 'bn' ? 'মাসিক আনুমানিক আয়' : 'Estimated Monthly Earnings'}
            </h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black tracking-tight">${earnings.monthly.toFixed(2)}</span>
              <span className="text-sm font-bold text-cyan-200 mb-1">/ {language === 'bn' ? 'মাস' : 'mo'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'দৈনিক আয়' : 'Daily Earnings'}
              </span>
              <span className="text-xl font-black text-slate-800 dark:text-white">
                ${earnings.daily.toFixed(2)}
              </span>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'বাৎসরিক আয়' : 'Yearly Earnings'}
              </span>
              <span className="text-xl font-black text-slate-800 dark:text-white">
                ${earnings.yearly.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
