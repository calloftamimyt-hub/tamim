import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Key, ArrowLeft, Search, Flame, BarChart3, TrendingUp } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface KwResult {
  kw: string;
  vol: 'High' | 'Medium' | 'Low';
  comp: 'High' | 'Medium' | 'Low';
}

export const KeywordResTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<KwResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    setIsLoading(true);
    setResults(null);
    
    setTimeout(() => {
      const kw = keyword.trim().toLowerCase();
      const year = new Date().getFullYear();
      
      const generated: KwResult[] = [
        { kw: `${kw}`, vol: 'High', comp: 'High' },
        { kw: `how to ${kw}`, vol: 'High', comp: 'Medium' },
        { kw: `${kw} tutorial ${year}`, vol: 'Medium', comp: 'Low' },
        { kw: `best ${kw}`, vol: 'High', comp: 'High' },
        { kw: `${kw} for beginners`, vol: 'Medium', comp: 'Low' },
        { kw: `${kw} bangla`, vol: 'Medium', comp: 'Low' },
        { kw: `what is ${kw}`, vol: 'Medium', comp: 'Medium' },
      ];
      
      setResults(generated);
      setIsLoading(false);
    }, 800); // simulate API loading
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: 'কিওয়ার্ড রিসার্চ', en: 'Keyword Research' }} description={{ bn: 'লো-কম্পিটিশন কিওয়ার্ড খুঁজুন', en: 'Find low-competition keywords' }} Icon={Key} bgGradient="bg-gradient-to-br from-amber-500 to-orange-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Key className="w-32 h-32" />
          </div>
          
          <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 relative z-10 flex items-center gap-2">
             <Search className="w-4 h-4 text-amber-500" />
             {language === 'bn' ? 'যেকোনো টপিক লিখুন' : 'Enter any topic'}
          </label>
          <div className="flex flex-col gap-3 relative z-10">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={language === 'bn' ? 'যেমন: video editing' : 'e.g. video editing'}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-white"
            />
            
            <button 
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-2 disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Search className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  {language === 'bn' ? 'রিসার্চ করুন' : 'Research'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-1 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 grid grid-cols-12 gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                 <div className="col-span-6">{language === 'bn' ? 'কিওয়ার্ড' : 'Keyword'}</div>
                 <div className="col-span-3 text-center">{language === 'bn' ? 'সার্চ ভলিউম' : 'Volume'}</div>
                 <div className="col-span-3 text-center">{language === 'bn' ? 'কম্পিটিশন' : 'Comp.'}</div>
              </div>
              
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {results.map((r, i) => (
                  <div key={i} className="px-5 py-4 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="col-span-6 font-bold text-sm text-slate-700 dark:text-slate-300 truncate pr-2">
                       {r.kw}
                    </div>
                    {/* Volume */}
                    <div className="col-span-3 flex justify-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                        r.vol === 'High' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        r.vol === 'Medium' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {r.vol === 'High' && language === 'bn' ? 'বেশি' : r.vol === 'High' ? 'High' : r.vol === 'Medium' && language === 'bn' ? 'মাঝারি' : r.vol === 'Medium' ? 'Med' : language === 'bn' ? 'কম' : 'Low'}
                      </span>
                    </div>
                    {/* Competition */}
                    <div className="col-span-3 flex justify-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1",
                        r.comp === 'High' ? "text-rose-600 dark:text-rose-400" :
                        r.comp === 'Medium' ? "text-amber-600 dark:text-amber-400" :
                        "text-emerald-600 dark:text-emerald-400"
                      )}>
                        <Flame className={cn("w-3 h-3", r.comp === 'Low' && "opacity-0 hidden sm:block")} />
                        {r.comp === 'High' && language === 'bn' ? 'বেশি' : r.comp === 'High' ? 'High' : r.comp === 'Medium' && language === 'bn' ? 'মাঝারি' : r.comp === 'Medium' ? 'Med' : language === 'bn' ? 'কম' : 'Low'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
