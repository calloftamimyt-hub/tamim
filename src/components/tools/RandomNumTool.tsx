import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Dices, ArrowLeft, RefreshCw } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const RandomNumTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [result, setResult] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const generate = () => {
    if (min >= max) return;
    setIsAnimating(true);
    
    // Simulate spinning effect
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * (max - min + 1)) + min);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const finalResult = Math.floor(Math.random() * (max - min + 1)) + min;
        setResult(finalResult);
        setIsAnimating(false);
      }
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'র‍্যান্ডম নাম্বার', en: 'Random Number Generator' }} description={{ bn: 'যেকোনো রেঞ্জের নাম্বার জেনারেট করুন', en: 'Generate numbers within a specific range' }} Icon={Dices} bgGradient="bg-gradient-to-br from-violet-500 to-purple-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col max-w-sm mx-auto w-full justify-center text-center">

        {/* Output Display */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-8 shadow-lg shadow-purple-500/20 relative overflow-hidden text-white flex flex-col items-center justify-center min-h-[220px]">
           <Dices className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
           <p className="relative z-10 text-purple-100 text-sm font-bold mb-2">
              {language === 'bn' ? 'ফলাফল' : 'Result'}
           </p>
           <div className="relative z-10 h-32 flex items-center justify-center">
              <AnimatePresence mode="wait">
                 {result !== null ? (
                    <motion.span 
                      key={result + isAnimating.toString()}
                      initial={{ opacity: 0, y: isAnimating ? 10 : -20, scale: isAnimating ? 0.9 : 1.2 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: isAnimating ? -10 : 20, scale: 0.9 }}
                      className={cn("text-7xl font-black tracking-tighter", isAnimating ? "blur-[1px]" : "")}
                    >
                      {result}
                    </motion.span>
                 ) : (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-7xl font-black tracking-tighter opacity-30"
                    >
                      ?
                    </motion.span>
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* Input Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 text-left">
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'bn' ? 'সর্বনিম্ন' : 'Minimum'}
                 </label>
                 <input 
                   type="number" 
                   value={min}
                   onChange={(e) => setMin(Number(e.target.value))}
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:text-white"
                 />
              </div>
              <div>
                 <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'bn' ? 'সর্বোচ্চ' : 'Maximum'}
                 </label>
                 <input 
                   type="number" 
                   value={max}
                   onChange={(e) => setMax(Number(e.target.value))}
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:text-white"
                 />
              </div>
           </div>
           
           {min >= max && (
              <p className="text-rose-500 text-xs font-bold text-center">
                 {language === 'bn' ? 'সর্বনিম্ন মান সর্বোচ্চ মানের চেয়ে ছোট হতে হবে' : 'Min valid must be smaller than Max value'}
              </p>
           )}

           <button 
             onClick={generate}
             disabled={isAnimating || min >= max}
             className="w-full py-4 rounded-xl font-black text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
           >
             <RefreshCw className={cn("w-5 h-5", isAnimating && "animate-spin")} />
             {language === 'bn' ? 'জেনারেট করুন' : 'Generate'}
           </button>
        </div>

      </div>
    </div>
  );
};
