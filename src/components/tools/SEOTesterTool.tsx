import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Zap, ArrowLeft, Search, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const SEOTesterTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ status: 'good' | 'bad' | 'warning', text: string }[]>([]);

  const handleTest = () => {
    let currentScore = 100;
    const newFeedback: { status: 'good' | 'bad' | 'warning', text: string }[] = [];

    // Title Checks
    const titleLen = title.trim().length;
    if (titleLen === 0) {
      currentScore -= 30;
      newFeedback.push({ status: 'bad', text: language === 'bn' ? 'টাইটেল দেয়া হয়নি।' : 'Title is missing.' });
    } else if (titleLen < 20) {
      currentScore -= 10;
      newFeedback.push({ status: 'warning', text: language === 'bn' ? 'টাইটেল খুব ছোট। (অন্তত ২০-৬০ অক্ষর ব্যবহার করুন)' : 'Title is too short. (Aim for 20-60 chars)' });
    } else if (titleLen > 70) {
      currentScore -= 10;
      newFeedback.push({ status: 'warning', text: language === 'bn' ? 'টাইটেল বড় হতে পারে, ৬০ অক্ষরের মধ্যে রাখা ভালো।' : 'Title is a bit long, keep under 60 chars for best visibility.' });
    } else {
      newFeedback.push({ status: 'good', text: language === 'bn' ? 'টাইটেলের দৈর্ঘ্য চমৎকার।' : 'Title length is perfect (20-60 chars).' });
    }

    // Description Checks
    const descLen = description.trim().length;
    if (descLen === 0) {
      currentScore -= 30;
      newFeedback.push({ status: 'bad', text: language === 'bn' ? 'ডেসক্রিপশন দেয়া হয়নি।' : 'Description is missing.' });
    } else if (descLen < 150) {
      currentScore -= 15;
      newFeedback.push({ status: 'warning', text: language === 'bn' ? 'ডেসক্রিপশন অনেক ছোট। বিস্তারিত লিখুন।' : 'Description is too short. Try to explain more.' });
    } else {
      newFeedback.push({ status: 'good', text: language === 'bn' ? 'ডেসক্রিপশনের সাইজ ভালো আছে।' : 'Description length is good.' });
    }

    // Tags Checks
    const tagList = tags.split(',').filter(t => t.trim().length > 0);
    if (tagList.length === 0) {
      currentScore -= 20;
      newFeedback.push({ status: 'bad', text: language === 'bn' ? 'কোনো ট্যাগ দেয়া হয়নি।' : 'No tags provided.' });
    } else if (tagList.length < 5) {
      currentScore -= 5;
      newFeedback.push({ status: 'warning', text: language === 'bn' ? 'আরও কিছু প্রাসঙ্গিক ট্যাগ ব্যবহার করুন।' : 'Try to add a few more relevant tags.' });
    } else {
      newFeedback.push({ status: 'good', text: language === 'bn' ? 'পর্যাপ্ত ট্যাগ ব্যবহার করা হয়েছে।' : 'Sufficient amount of tags used.' });
    }

    // Keyword in Title & Desc check (simplified)
    if (titleLen > 0 && descLen > 0) {
      const firstWord = title.split(' ')[0]?.toLowerCase();
      if (firstWord && firstWord.length > 3 && !description.toLowerCase().includes(firstWord)) {
         currentScore -= 10;
         newFeedback.push({ status: 'warning', text: language === 'bn' ? 'টাইটেলের মূল কিওয়ার্ড ডেসক্রিপশনের শুরুতে ব্যবহার করুন।' : 'Try to include the main keywords from title in your description.' });
      }
    }

    setScore(Math.max(0, currentScore));
    setFeedback(newFeedback);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: 'এসইও টেস্টার', en: 'SEO Tester' }} description={{ bn: 'আপনার ভিডিও এসইও স্কোর চেক করুন', en: 'Check your video SEO score' }} Icon={Zap} bgGradient="bg-gradient-to-br from-slate-600 to-slate-800" onBack={onBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        
        {/* Input Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                 {language === 'bn' ? 'ভিডিও টাইটেল' : 'Video Title'}
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How to make money online 2026"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                 {language === 'bn' ? 'ভিডিও ডেসক্রিপশন' : 'Video Description'}
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your video description..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all dark:text-white h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                 {language === 'bn' ? 'ভিডিও ট্যাগ (কমা দিয়ে লিখুন)' : 'Tags (comma separated)'}
              </label>
              <input 
                type="text" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. online income, tutorial, 2026"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all dark:text-white"
              />
            </div>

            <button 
              onClick={handleTest}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-4"
            >
              <Search className="w-5 h-5" />
              {language === 'bn' ? 'স্কোর চেক করুন' : 'Test SEO Score'}
            </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {score !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-800" />
                    <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray={351.8} strokeDashoffset={351.8 - (351.8 * score) / 100} className={cn(
                      "transition-all duration-1000 ease-out",
                      score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500"
                    )} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{score}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {feedback.map((item, i) => (
                  <div key={i} className={cn(
                    "p-4 rounded-xl border flex items-start gap-3",
                    item.status === 'good' ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" :
                    item.status === 'warning' ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20" :
                    "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20"
                  )}>
                    <div className="shrink-0 mt-0.5">
                      {item.status === 'good' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                       item.status === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-500" /> :
                       <Zap className="w-4 h-4 text-rose-500" />}
                    </div>
                    <p className={cn(
                      "text-xs font-bold leading-relaxed",
                      item.status === 'good' ? "text-emerald-700 dark:text-emerald-400" :
                      item.status === 'warning' ? "text-amber-700 dark:text-amber-400" :
                      "text-rose-700 dark:text-rose-400"
                    )}>
                      {item.text}
                    </p>
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
