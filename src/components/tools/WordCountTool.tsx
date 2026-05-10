import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Edit3, ArrowLeft, Type, Hash, AlignLeft } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const WordCountTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [text, setText] = useState('');

  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const lineCount = text.split(/\r\n|\r|\n/).filter(line => line.length > 0).length;
  
  // Roughly 200 words per minute speaking time
  const readingTime = Math.ceil(wordCount / 200) || 0;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: 'ওয়ার্ড কাউন্ট', en: 'Word Count' }} description={{ bn: 'ক্যারেক্টার ও ওয়ার্ড বিশ্লেষণ', en: 'Analyze characters & words' }} Icon={Edit3} bgGradient="bg-gradient-to-br from-pink-400 to-rose-500" onBack={onBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1">
                <Type className="w-3.5 h-3.5 text-rose-500" /> 
                {language === 'bn' ? 'ওয়ার্ড' : 'Words'}
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{wordCount}</span>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1">
                <Hash className="w-3.5 h-3.5 text-pink-500" /> 
                {language === 'bn' ? 'ক্যারেক্টার' : 'Characters'}
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{charCount}</span>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-fuchsia-100 dark:border-fuchsia-900/30 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1">
                <AlignLeft className="w-3.5 h-3.5 text-fuchsia-500" /> 
                {language === 'bn' ? 'লাইন' : 'Lines'}
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{lineCount}</span>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1">
                <Edit3 className="w-3.5 h-3.5 text-purple-500" /> 
                {language === 'bn' ? 'পড়ার সময়' : 'Reading Time'}
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{readingTime} <span className="text-sm font-bold text-slate-400">m</span></span>
           </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={language === 'bn' ? 'এখানে আপনার টেক্সট লিখুন বা পেস্ট করুন...' : 'Type or paste your text here...'}
            className="w-full bg-transparent border-none px-5 py-4 text-sm font-bold resize-none h-64 focus:ring-0 outline-none dark:text-white text-slate-700 leading-relaxed"
          ></textarea>
          
          <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex justify-between items-center rounded-b-xl">
             <span className="text-[10px] font-bold text-slate-400">
               {language === 'bn' ? 'ইউটিউব টাইটেল লিমিট: ১০০ ক্যারেক্টার' : 'YT Title Limit: 100 characters'}
             </span>
             <button 
                onClick={() => setText('')}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
              >
               {language === 'bn' ? 'মুছে ফেলুন' : 'Clear All'}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};
