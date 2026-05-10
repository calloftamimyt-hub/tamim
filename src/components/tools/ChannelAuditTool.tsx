import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { BarChart, ArrowLeft, CheckCircle2, Circle, Trophy, ShieldCheck, PlayCircle } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const AUDIT_QUESTIONS = [
  { id: 'q1', text: { en: 'Channel Banner is Professional & High Quality', bn: 'চ্যানেল ব্যানার প্রফেশনাল এবং হাই কোয়ালিটি' } },
  { id: 'q2', text: { en: 'Profile Picture / Logo is clear', bn: 'প্রোফাইল পিকচার / লোগো পরিষ্কার' } },
  { id: 'q3', text: { en: 'Channel Keywords added in settings', bn: 'সেটিংসে চ্যানেল কিওয়ার্ড যুক্ত করা হয়েছে' } },
  { id: 'q4', text: { en: 'About Section is properly filled with SEO', bn: 'অ্যাবাউট সেকশনে এসইও মেনে বিবরণ দেওয়া হয়েছে' } },
  { id: 'q5', text: { en: 'Social Media links are connected', bn: 'সোশ্যাল মিডিয়া লিংক যুক্ত করা হয়েছে' } },
  { id: 'q6', text: { en: 'Custom URL / Handle is claimed', bn: 'কাস্টম ইউআরএল / হ্যান্ডেল নেওয়া হয়েছে' } },
  { id: 'q7', text: { en: 'Videos are sorted into Playlists', bn: 'ভিডিওগুলো প্লেলিস্টে সাজানো আছে' } },
  { id: 'q8', text: { en: 'Thumbnails have a consistent branding', bn: 'থাম্বনেইলগুলোতে একটি নির্দিষ্ট ব্র্যান্ডিং আছে' } },
];

export const ChannelAuditTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const score = Math.round((Object.values(checkedItems).filter(Boolean).length / AUDIT_QUESTIONS.length) * 100);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: 'চ্যানেল অডিট', en: 'Channel Audit' }} description={{ bn: 'নিজে নিজে চ্যানেল চেক করুন', en: 'Self-audit your YouTube channel' }} Icon={BarChart} bgGradient="bg-gradient-to-br from-fuchsia-400 to-pink-500" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        {/* Score Header */}
        <div className="bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg shadow-fuchsia-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-fuchsia-100 mb-1">
              {language === 'bn' ? 'আপনার চ্যানেল স্কোর' : 'Channel Health Score'}
            </h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black tracking-tight">{score}</span>
              <span className="text-sm font-bold text-fuchsia-200 mb-1">/ 100</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
             {score >= 80 ? <Trophy className="w-8 h-8 text-yellow-300" /> : 
              score >= 50 ? <ShieldCheck className="w-8 h-8 text-fuchsia-200" /> :
              <PlayCircle className="w-8 h-8 text-fuchsia-200" />}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
               <BarChart className="w-4 h-4 text-fuchsia-500" />
               {language === 'bn' ? 'চেকলিস্ট (যেগুলো আছে টিক দিন)' : 'Audit Checklist (Tick what you have)'}
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {AUDIT_QUESTIONS.map((q) => {
              const isChecked = !!checkedItems[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => toggleCheck(q.id)}
                  className="w-full flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="shrink-0 mt-0.5">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-bold transition-all",
                    isChecked ? "text-slate-500 dark:text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
                  )}>
                    {language === 'bn' ? q.text.bn : q.text.en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
