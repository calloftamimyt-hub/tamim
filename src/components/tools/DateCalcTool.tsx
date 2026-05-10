import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { CalendarClock, ArrowLeft, CalendarDays, Plus, Minus } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const DateCalcTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [mode, setMode] = useState<'diff' | 'add'>('diff');
  
  // Diff Mode State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Add Mode State
  const [baseDate, setBaseDate] = useState('');
  const [daysToAdd, setDaysToAdd] = useState('0');
  const [op, setOp] = useState<'add' | 'sub'>('add');

  const getDiffResult = () => {
    if(!startDate || !endDate) return null;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAddResult = () => {
    if(!baseDate) return null;
    const date = new Date(baseDate);
    const days = parseInt(daysToAdd) || 0;
    
    if (op === 'add') {
      date.setDate(date.getDate() + days);
    } else {
      date.setDate(date.getDate() - days);
    }
    
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'দিন গণনা', en: 'Date Calculator' }} description={{ bn: 'দুই তারিখের মাঝে পার্থক্য বের করুন', en: 'Calculate days & find dates' }} Icon={CalendarClock} bgGradient="bg-gradient-to-br from-cyan-500 to-blue-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        
        {/* Toggle Mode */}
        <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mx-auto w-full max-w-sm">
          <button
            onClick={() => setMode('diff')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all",
              mode === 'diff' 
                ? "bg-slate-800 text-white shadow-md dark:bg-slate-700" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            <CalendarDays className="w-4 h-4" /> {language === 'bn' ? 'পার্থক্য' : 'Difference'}
          </button>
          <button
            onClick={() => setMode('add')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all",
              mode === 'add' 
                ? "bg-slate-800 text-white shadow-md dark:bg-slate-700" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            <CalendarClock className="w-4 h-4" /> {language === 'bn' ? 'যোগ/বিয়োগ' : 'Add/Sub'}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          
          {mode === 'diff' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
               <div>
                  <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                     {language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}
                  </label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all dark:text-white appearance-none"
                  />
               </div>
               <div>
                  <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                     {language === 'bn' ? 'শেষ তারিখ' : 'End Date'}
                  </label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all dark:text-white appearance-none"
                  />
               </div>

               {getDiffResult() !== null && (
                 <div className="mt-6 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-2xl p-4 text-center">
                    <span className="block text-sm font-bold text-cyan-600 dark:text-cyan-400 mb-1">{language === 'bn' ? 'পার্থক্য' : 'Difference is'}</span>
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{getDiffResult()}</span>
                    <span className="text-sm font-bold text-slate-500 ml-1">{language === 'bn' ? 'দিন' : 'Days'}</span>
                 </div>
               )}
            </motion.div>
          )}

          {mode === 'add' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
               <div>
                  <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                     {language === 'bn' ? 'বেস তারিখ' : 'Base Date'}
                  </label>
                  <input 
                    type="date" 
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all dark:text-white appearance-none"
                  />
               </div>
               
               <div className="grid grid-cols-[auto_1fr] gap-3">
                  <div>
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 opacity-0">Op</label>
                    <button 
                      onClick={() => setOp(op === 'add' ? 'sub' : 'add')}
                      className="h-[52px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      {op === 'add' ? <Plus className="w-5 h-5 text-emerald-500" /> : <Minus className="w-5 h-5 text-rose-500" />}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                       {language === 'bn' ? 'দিন (Days)' : 'Days'}
                    </label>
                    <input 
                      type="number" 
                      value={daysToAdd}
                      onChange={(e) => setDaysToAdd(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all dark:text-white"
                    />
                  </div>
               </div>

               {getAddResult() !== null && (
                 <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 text-center">
                    <span className="block text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">{language === 'bn' ? 'ফলাফল তারিখ' : 'Result Date'}</span>
                    <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{getAddResult()}</span>
                 </div>
               )}
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
};
