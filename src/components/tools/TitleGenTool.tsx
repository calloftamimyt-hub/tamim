import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Type, ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const TitleGenTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [topic, setTopic] = useState('');
  const [titles, setTitles] = useState<{ category: string, text: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    const trimmed = topic.trim();
    if (!trimmed) {
      setTitles([]);
      return;
    }

    const year = new Date().getFullYear();
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    
    const newTitles = [
      { category: language === 'bn' ? 'আকর্ষণীয়' : 'Catchy', text: `🔥 The Ultimate Secret to ${capitalized} You Must Know!` },
      { category: language === 'bn' ? 'আকর্ষণীয়' : 'Catchy', text: `I Tried ${capitalized} and THIS Happened 😱` },
      { category: language === 'bn' ? 'টিউটোরিয়াল' : 'Tutorial', text: `How to Master ${capitalized} in ${year} (Step by Step)` },
      { category: language === 'bn' ? 'টিউটোরিয়াল' : 'Tutorial', text: `The ONLY ${capitalized} Guide You Will Ever Need!` },
      { category: language === 'bn' ? 'বাংলা (Bangla)' : 'Bangla', text: `[${year}] ${capitalized} এর গোপন রহস্য! কেউ বলবে না 🔥` },
      { category: language === 'bn' ? 'বাংলা (Bangla)' : 'Bangla', text: `${capitalized} কীভাবে করবেন? বেস্ট উপায়! 😱` },
      { category: language === 'bn' ? 'প্রশ্নমূলক' : 'Question', text: `Is ${capitalized} Really Worth It in ${year}?` },
      { category: language === 'bn' ? 'রিভিউ' : 'Review', text: `Truth About ${capitalized} | Watch Before You Try!` },
    ];

    setTitles(newTitles);
    setCopiedIndex(null);
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

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: 'টাইটেল জেনারেটর', en: 'Title Generator' }} description={{ bn: 'ইউটিউবের জন্য ভাইরাল টাইটেল খুঁজুন', en: 'Find viral titles for your videos' }} Icon={Type} bgGradient="bg-gradient-to-br from-amber-400 to-orange-500" onBack={onBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        {/* Input Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Type className="w-32 h-32" />
          </div>
          
          <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 relative z-10">
             {language === 'bn' ? 'ভিডিওর মূল বিষয়' : 'Video Topic'}
          </label>
          <div className="flex flex-col gap-3 relative z-10">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder={language === 'bn' ? 'যেমন: অনলাইন ইনকাম' : 'e.g. online income'}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-white"
            />
            
            <button 
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-2"
            >
              <Sparkles className="w-5 h-5" />
              {language === 'bn' ? 'টাইটেল তৈরি করুন' : 'Generate Titles'}
            </button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {titles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                 <Type className="w-4 h-4 text-amber-500" />
                 {language === 'bn' ? 'ফলাফল' : 'Results'}
                 <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full ml-1">
                   {titles.length}
                 </span>
              </h3>

              {titles.map((item, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2 relative group hover:border-amber-200 dark:hover:border-amber-800/50 transition-colors">
                  <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                    {item.category}
                  </span>
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      {item.text}
                    </p>
                    <button 
                      onClick={() => handleCopy(item.text, i)}
                      className={cn(
                        "p-2 rounded-xl transition-all shrink-0",
                        copiedIndex === i 
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" 
                          : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700"
                      )}
                    >
                      {copiedIndex === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
