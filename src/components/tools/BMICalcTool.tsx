import React, { useState, useEffect } from 'react';
import { ToolHero } from './ToolHero';
import { Activity, ArrowLeft, Heart, Scale } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const BMICalcTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>(''); // in CM
  
  const [bmi, setBmi] = useState<number | null>(null);

  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // to meters
    
    if (w > 0 && h > 0) {
      const calculated = w / (h * h);
      setBmi(parseFloat(calculated.toFixed(1)));
    } else {
      setBmi(null);
    }
  }, [weight, height]);

  const getCategory = (b: number) => {
    if (b < 18.5) return { en: 'Underweight', bn: 'ওজন কম', color: 'text-blue-500', barCol: 'bg-blue-500' };
    if (b < 25) return { en: 'Normal', bn: 'স্বাভাবিক', color: 'text-emerald-500', barCol: 'bg-emerald-500' };
    if (b < 30) return { en: 'Overweight', bn: 'ওজন বেশি', color: 'text-amber-500', barCol: 'bg-amber-500' };
    return { en: 'Obese', bn: 'অতিরিক্ত স্থূল', color: 'text-rose-500', barCol: 'bg-rose-500' };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: '', en: '' }} description={{ bn: 'আপনার শারীরিক সুস্থতার ব্যাপ্তি জানুন', en: 'Check your Body Mass Index' }} Icon={Activity} bgGradient="bg-gradient-to-br from-rose-400 to-red-500" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        
        {/* Input Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                   <Scale className="w-4 h-4 text-rose-500" />
                   {language === 'bn' ? 'ওজন (Weight - KG)' : 'Weight (KG)'}
                </label>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 70"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                   <ArrowLeft className="w-4 h-4 text-rose-500 rotate-90" />
                   {language === 'bn' ? 'উচ্চতা (Height - CM)' : 'Height (CM)'}
                </label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all dark:text-white"
                />
              </div>
           </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {bmi !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden"
            >
               <div className="absolute top-0 inset-x-0 h-1.5 flex">
                  <div className="h-full bg-blue-500 w-1/4"></div>
                  <div className="h-full bg-emerald-500 w-1/4"></div>
                  <div className="h-full bg-amber-500 w-1/4"></div>
                  <div className="h-full bg-rose-500 w-1/4"></div>
               </div>

               <span className="text-sm font-bold text-slate-500 block mb-2 mt-4">
                 {language === 'bn' ? 'আপনার বিএমআই স্কোর' : 'Your BMI Score'}
               </span>
               
               <div className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter mb-2">
                 {bmi}
               </div>

               <div className="flex items-center justify-center gap-2">
                 <Heart className={cn("w-5 h-5 fill-current", getCategory(bmi).color)} />
                 <span className={cn("text-lg font-black uppercase tracking-wide", getCategory(bmi).color)}>
                   {language === 'bn' ? getCategory(bmi).bn : getCategory(bmi).en}
                 </span>
               </div>

               {/* Indicator Bar */}
               <div className="mt-8 relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min((bmi / 40) * 100, 100)}%` }}
                   transition={{ type: "spring", stiffness: 50 }}
                   className={cn("absolute top-0 left-0 h-full rounded-full w-full", getCategory(bmi).barCol)}
                 />
               </div>
               
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
