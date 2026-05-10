import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Percent, ArrowLeft, Calculator, ArrowRight } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const PercentageCalcTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();

  // Mode 1: What is X% of Y?
  const [val1A, setVal1A] = useState('');
  const [val1B, setVal1B] = useState('');
  const res1 = (parseFloat(val1A) && parseFloat(val1B)) ? ((parseFloat(val1A) / 100) * parseFloat(val1B)).toFixed(2) : '0.00';

  // Mode 2: X is what percent of Y?
  const [val2A, setVal2A] = useState('');
  const [val2B, setVal2B] = useState('');
  const res2 = (parseFloat(val2A) && parseFloat(val2B)) ? ((parseFloat(val2A) / parseFloat(val2B)) * 100).toFixed(2) : '0.00';

  // Mode 3: Increase/Decrease from X to Y
  const [val3A, setVal3A] = useState('');
  const [val3B, setVal3B] = useState('');
  let res3 = '0.00';
  let isIncrease = true;
  if (parseFloat(val3A) && parseFloat(val3B)) {
    const diff = parseFloat(val3B) - parseFloat(val3A);
    isIncrease = diff >= 0;
    res3 = ((Math.abs(diff) / parseFloat(val3A)) * 100).toFixed(2);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'শতকরা ক্যালকুলেটর', en: 'Percentage Calc' }} description={{ bn: 'যেকোনো পার্সেন্টেজ হিসাব করুন', en: 'Calculate percentages easily' }} Icon={Percent} bgGradient="bg-gradient-to-br from-blue-500 to-indigo-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 max-w-4xl mx-auto w-full">

        {/* What is X% of Y? */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
           <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-blue-500" />
              {language === 'bn' ? '১. X এর Y% কত?' : '1. What is X% of Y?'}
           </h3>
           <div className="flex items-center gap-3">
              <input 
                type="number" value={val1B} onChange={(e) => setVal1B(e.target.value)} placeholder="Y (নাম্বার)"
                className="w-full flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
              />
              <span className="font-bold text-slate-400 text-sm">এর</span>
              <input 
                type="number" value={val1A} onChange={(e) => setVal1A(e.target.value)} placeholder="X (%)"
                className="w-full flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
              />
              <span className="font-bold text-slate-400 text-sm">%</span>
           </div>
           <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center justify-between border border-blue-100 dark:border-blue-800">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{language === 'bn' ? 'ফলাফল:' : 'Result:'}</span>
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300">{res1}</span>
           </div>
        </div>

        {/* X is what percent of Y? */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
           <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              {language === 'bn' ? '২. Y এর কত শতাংশ X?' : '2. X is what percent of Y?'}
           </h3>
           <div className="flex items-center gap-3">
              <input 
                type="number" value={val2A} onChange={(e) => setVal2A(e.target.value)} placeholder="X"
                className="w-full flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
              />
              <span className="font-bold text-slate-400 text-sm">হতে</span>
              <input 
                type="number" value={val2B} onChange={(e) => setVal2B(e.target.value)} placeholder="Y"
                className="w-full flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
              />
           </div>
           <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 flex items-center justify-between border border-emerald-100 dark:border-emerald-800">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{language === 'bn' ? 'ফলাফল:' : 'Result:'}</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{res2}%</span>
           </div>
        </div>

        {/* Increase/Decrease */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
           <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
              <ArrowRight className="w-4 h-4 text-rose-500" />
              {language === 'bn' ? '৩. X থেকে Y তে কত শতাংশ পরিবর্তন?' : '3. Percentage change from X to Y?'}
           </h3>
           <div className="flex items-center gap-3">
              <input 
                type="number" value={val3A} onChange={(e) => setVal3A(e.target.value)} placeholder="X (আগের)"
                className="w-full flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all dark:text-white"
              />
              <span className="font-bold text-slate-400 text-sm">থেকে</span>
              <input 
                type="number" value={val3B} onChange={(e) => setVal3B(e.target.value)} placeholder="Y (নতুন)"
                className="w-full flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all dark:text-white"
              />
           </div>
           <div className="mt-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-rose-100 dark:border-rose-800 gap-2">
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{language === 'bn' ? 'ফলাফল:' : 'Result:'}</span>
              <div className="flex items-center gap-2 font-black text-rose-700 dark:text-rose-300">
                 {parseFloat(val3A) && parseFloat(val3B) ? (
                    isIncrease ? (
                      <span className="text-emerald-500 text-sm bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">{language === 'bn' ? 'বৃদ্ধি' : 'Increase'}</span>
                    ) : (
                      <span className="text-rose-500 text-sm bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 rounded uppercase tracking-wider">{language === 'bn' ? 'হ্রাস' : 'Decrease'}</span>
                    )
                 ) : null}
                 <span className="text-2xl">{res3}%</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
