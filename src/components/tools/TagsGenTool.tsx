import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Hash, ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const TagsGenTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = () => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) {
      setGeneratedTags([]);
      return;
    }

    const year = new Date().getFullYear();
    const parts = trimmed.split(' ').filter(p => p.length > 0);
    
    // Core variations
    let tags = [
      trimmed,
      `${trimmed} ${year}`,
      `${trimmed} bangla`,
      `${trimmed} tutorial`,
      `how to ${trimmed}`,
      `${trimmed} in bengali`,
      `best ${trimmed}`,
      `${trimmed} guide`,
      `${trimmed} step by step`,
      `${trimmed} tips and tricks`,
      `${trimmed} explained`
    ];

    // Add multi-word variations if applicable
    if (parts.length > 1) {
      tags.push(parts.join('')); // nospace
      tags.push(`${parts[0]} ${parts[1]}`); // first two words
    }

    // Add some generic high-volume suffixes
    tags.push(`${trimmed} review`);
    tags.push(`what is ${trimmed}`);
    tags.push(`${trimmed} for beginners`);

    // Remove duplicates and empty
    const uniqueTags = Array.from(new Set(tags)).filter(t => t.length > 2);
    setGeneratedTags(uniqueTags);
    setIsCopied(false);
  };

  const handleCopy = async () => {
    if (generatedTags.length === 0) return;
    const tagsString = generatedTags.join(', ');
    try {
      await navigator.clipboard.writeText(tagsString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy tags', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: 'ট্যাগ জেনারেটর', en: 'Tags Generator' }} description={{ bn: 'ইউটিউবের জন্য ভাইরাল ট্যাগ খুঁজুন', en: 'Find viral tags for YouTube' }} Icon={Hash} bgGradient="bg-gradient-to-br from-emerald-400 to-teal-500" onBack={onBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        {/* Input Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Hash className="w-32 h-32" />
          </div>
          
          <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 relative z-10">
             {language === 'bn' ? 'ভিডিওর মূল বিষয় (কিবোর্ড)' : 'Main Topic (Keyword)'}
          </label>
          <div className="flex flex-col gap-3 relative z-10">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder={language === 'bn' ? 'যেমন: অনলাইন ইনকাম' : 'e.g. online income'}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
            />
            
            <button 
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-2"
            >
              <Sparkles className="w-5 h-5" />
              {language === 'bn' ? 'ট্যাগ তৈরি করুন' : 'Generate Tags'}
            </button>
          </div>
        </div>

        {/* Results */}
        {generatedTags.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                 <Hash className="w-4 h-4 text-emerald-500" />
                 {language === 'bn' ? 'ফলাফল' : 'Results'}
                 <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full ml-1">
                   {generatedTags.length}
                 </span>
              </h3>
              
              <button 
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  isCopied 
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied 
                  ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') 
                  : (language === 'bn' ? 'সব কপি করুন' : 'Copy All')}
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mb-4 font-mono text-sm text-slate-600 dark:text-slate-400 leading-relaxed overflow-hidden break-words selection:bg-emerald-200 selection:text-emerald-900">
               {generatedTags.join(', ')}
            </div>

            <div className="flex flex-wrap gap-2">
              {generatedTags.map((tag, i) => (
                <span 
                  key={i} 
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold px-2.5 py-1.5 rounded-lg hover:border-emerald-500 hover:text-emerald-600 cursor-default transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
