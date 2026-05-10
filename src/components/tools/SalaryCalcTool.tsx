import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Banknote, ArrowLeft, Briefcase, Calendar as CalendarIcon, Clock } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const SalaryCalcTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [baseAmount, setBaseAmount] = useState<string>('');
  const [basePeriod, setBasePeriod] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);

  const calculateRates = () => {
    let amount = parseFloat(baseAmount) || 0;
    let hourly = 0;

    // Convert base inputs to an hourly rate to extrapolate
    switch (basePeriod) {
      case 'hourly': hourly = amount; break;
      case 'daily': hourly = amount / (hoursPerWeek / daysPerWeek); break;
      case 'weekly': hourly = amount / hoursPerWeek; break;
      case 'monthly': hourly = amount / (hoursPerWeek * 52 / 12); break;
      case 'yearly': hourly = amount / (hoursPerWeek * 52); break;
    }

    const daily = hourly * (hoursPerWeek / daysPerWeek);
    const weekly = hourly * hoursPerWeek;
    const monthly = weekly * 52 / 12;
    const yearly = weekly * 52;

    return { hourly, daily, weekly, monthly, yearly };
  };

  const results = calculateRates();

  const periods = [
    { id: 'hourly', label: { en: 'Hourly', bn: 'ঘন্টায়' } },
    { id: 'daily', label: { en: 'Daily', bn: 'দৈনিক' } },
    { id: 'weekly', label: { en: 'Weekly', bn: 'সাপ্তাহিক' } },
    { id: 'monthly', label: { en: 'Monthly', bn: 'মাসিক' } },
    { id: 'yearly', label: { en: 'Yearly', bn: 'বাৎসরিক' } }
  ] as const;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'বেতন ক্যালকুলেটর', en: 'Salary Calculator' }} description={{ bn: 'আপনার আয় কনভার্ট করুন', en: 'Convert your income across periods' }} Icon={Banknote} bgGradient="bg-gradient-to-br from-green-500 to-emerald-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col max-w-4xl mx-auto w-full">
        
        {/* Input Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'bn' ? 'বেতন / মজুরি' : 'Salary / Wage'}
                 </label>
                 <div className="relative flex items-center">
                    <span className="absolute left-4 font-black text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={baseAmount}
                      onChange={(e) => setBaseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-l-xl pl-8 pr-4 py-3.5 text-lg font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                    <select 
                      value={basePeriod}
                      onChange={(e) => setBasePeriod(e.target.value as any)}
                      className="bg-slate-100 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-xl px-4 py-3.5 text-sm font-black text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {periods.map(p => (
                        <option key={p.id} value={p.id}>{language === 'bn' ? p.label.bn : p.label.en}</option>
                      ))}
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                       {language === 'bn' ? 'ঘন্টা/সপ্তাহ' : 'Hours/Week'}
                    </label>
                    <input 
                      type="number" 
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-lg font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                       {language === 'bn' ? 'দিন/সপ্তাহ' : 'Days/Week'}
                    </label>
                    <input 
                      type="number" 
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-lg font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* Yearly */}
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-lg shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-center items-center text-center">
               <Banknote className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 text-white" />
               <p className="text-emerald-100 text-sm font-bold block mb-1 z-10">{language === 'bn' ? 'বাৎসরিক ইনকাম' : 'Yearly Income'}</p>
               <h3 className="text-4xl md:text-5xl font-black text-white z-10 tracking-tight">${results.yearly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
           </motion.div>

           {/* Breakdowns */}
           {[
             { label: { en: 'Monthly', bn: 'মাসিক' }, val: results.monthly, icon: CalendarIcon },
             { label: { en: 'Weekly', bn: 'সাপ্তাহিক' }, val: results.weekly, icon: Briefcase },
             { label: { en: 'Daily', bn: 'দৈনিক' }, val: results.daily, icon: CalendarIcon },
             { label: { en: 'Hourly', bn: 'ঘন্টায়' }, val: results.hourly, icon: Clock }
           ].map((item, idx) => {
             const Icon = item.icon;
             return (
               <motion.div 
                 key={item.label.en}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.05 }}
                 className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4"
               >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center shrink-0">
                     <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-slate-500 mb-0.5">{language === 'bn' ? item.label.bn : item.label.en}</p>
                     <p className="text-xl font-black text-slate-800 dark:text-white">${item.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
               </motion.div>
             )
           })}
        </div>

      </div>
    </div>
  );
};
