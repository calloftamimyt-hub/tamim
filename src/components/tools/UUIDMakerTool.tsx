import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Fingerprint, ArrowLeft, Copy, Check, SlidersHorizontal, RefreshCw } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const UUIDMakerTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState<number>(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateUUIDs = () => {
    const newUuids = Array.from({ length: count }, () => {
      // standard randomUUID if available, else fallback
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
         return crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      });
    });
    setUuids(newUuids);
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyAll = async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedIndex(-1); // -1 means copy all
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy all', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'ইউইউআইডি মেকার', en: 'UUID Generator' }} description={{ bn: 'ইউনিক আইডেন্টিফায়ার (v4) জেনারেট করুন', en: 'Generate unique identifiers (v4)' }} Icon={Fingerprint} bgGradient="bg-gradient-to-br from-gray-600 to-gray-800" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col max-w-3xl mx-auto w-full">
          
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
           <div className="flex items-center gap-4 justify-between">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                 <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                 {language === 'bn' ? 'পরিমাণ (১-৫০)' : 'Count (1-50)'}
              </label>
              <span className="text-lg font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg">
                 {count}
              </span>
           </div>
           
           <input 
              type="range" 
              min="1" max="50" step="1"
              value={count} 
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-slate-800 dark:accent-white h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
           />

           <button 
             onClick={generateUUIDs}
             className="w-full py-4 rounded-xl font-black text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-md"
           >
             <RefreshCw className="w-5 h-5" />
             {language === 'bn' ? 'জেনারেট করুন' : 'Generate UUIDs'}
           </button>
        </div>

        {uuids.length > 0 && (
           <div className="space-y-3">
              <AnimatePresence>
                 {uuids.map((id, index) => (
                    <motion.div 
                       key={id + index}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: index * 0.02 }}
                       className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm group"
                    >
                       <span className="font-mono text-sm sm:text-base text-slate-700 dark:text-slate-200 font-bold break-all pr-4">
                          {id}
                       </span>
                       <button
                         onClick={() => handleCopy(id, index)}
                         className={cn(
                            "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all",
                            copiedIndex === index 
                              ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" 
                              : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 dark:bg-slate-800 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-300"
                         )}
                       >
                         {copiedIndex === index ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                       </button>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        )}

      </div>
    </div>
  );
};
