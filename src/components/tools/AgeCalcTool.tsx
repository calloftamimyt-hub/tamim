import React, { useState, useEffect } from 'react';
import { ToolHero } from './ToolHero';
import { CalendarDays, ArrowLeft, Clock } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const AgeCalcTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [dob, setDob] = useState<string>('');
  
  const [age, setAge] = useState<{ years: number, months: number, days: number } | null>(null);

  useEffect(() => {
    if (!dob) {
      setAge(null);
      return;
    }
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (birthDate > today) {
      setAge(null);
      return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      // get days in previous month
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    setAge({ years, months, days });
  }, [dob]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: 'বয়স ক্যালকুলেটর', en: 'Age Calculator' }} description={{ bn: 'আপনার সঠিক বয়স বের করুন', en: 'Calculate your exact age' }} Icon={CalendarDays} bgGradient="bg-gradient-to-br from-indigo-500 to-blue-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <CalendarDays className="w-32 h-32" />
          </div>
          
          <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 relative z-10 flex items-center gap-2">
             <Clock className="w-4 h-4 text-indigo-500" />
             {language === 'bn' ? 'আপনার জন্ম তারিখ সিলেক্ট করুন' : 'Select your Date of Birth'}
          </label>
          <div className="relative z-10">
            <input 
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none"
            />
          </div>
        </div>

        {/* Results */}
        {age && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
             <div className="col-span-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 text-center">
                <span className="text-sm font-bold text-indigo-200 mb-1 block">
                  {language === 'bn' ? 'আপনার মোট বয়স' : 'Your Total Age is'}
                </span>
                <span className="text-4xl font-black tracking-tight">{age.years}</span>
                <span className="text-sm font-bold text-indigo-100 ml-1">
                  {language === 'bn' ? 'বছর' : 'Years'}
                </span>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30 text-center shadow-sm">
                <span className="block text-3xl font-black text-slate-800 dark:text-white">{age.years}</span>
                <span className="text-xs font-bold text-slate-500">{language === 'bn' ? 'বছর' : 'Years'}</span>
             </div>
             
             <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 text-center shadow-sm">
                <span className="block text-3xl font-black text-slate-800 dark:text-white">{age.months}</span>
                <span className="text-xs font-bold text-slate-500">{language === 'bn' ? 'মাস' : 'Months'}</span>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-cyan-100 dark:border-cyan-900/30 text-center shadow-sm">
                <span className="block text-3xl font-black text-slate-800 dark:text-white">{age.days}</span>
                <span className="text-xs font-bold text-slate-500">{language === 'bn' ? 'দিন' : 'Days'}</span>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
