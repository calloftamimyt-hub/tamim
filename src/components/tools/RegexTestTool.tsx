import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Terminal, ArrowLeft, AlertCircle } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const RegexTestTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');

  let regExp: RegExp | null = null;
  let error = '';

  try {
    if (pattern) {
      regExp = new RegExp(pattern, flags);
    }
  } catch (err: any) {
    error = err.message;
  }

  // Calculate matches
  let highlightedText: React.ReactNode = testString || <span className="opacity-50 italic">{language === 'bn' ? 'টেস্ট করার জন্য কিছু লিখুন...' : 'Type something to test...'}</span>;
  let matchesCount = 0;

  if (regExp && testString && !error) {
    const matches = [];
    let match;
    let counter = 0;

    if (regExp.global) {
      // Loop over global matches to prevent infinite loop on empty regex
      if (pattern === '') {
          // Do nothing if pattern is empty
      } else {
        const tempMatches = [...testString.matchAll(regExp)];
        matchesCount = tempMatches.length;
        
        let lastIndex = 0;
        const parts = [];

        tempMatches.forEach((m, idx) => {
          if (m.index !== undefined) {
             // Add preceding un-matched text
             parts.push(testString.substring(lastIndex, m.index));
             // Add matched text
             parts.push(
               <mark key={idx} className="bg-amber-300 dark:bg-amber-500/40 text-amber-900 dark:text-amber-100 px-0.5 rounded-sm">
                 {m[0]}
               </mark>
             );
             lastIndex = m.index + m[0].length;
          }
        });
        // Add trailing un-matched text
        parts.push(testString.substring(lastIndex));
        highlightedText = parts;
      }
    } else {
      match = testString.match(regExp);
      if (match && match.index !== undefined) {
         matchesCount = 1;
         const m = match;
         highlightedText = (
           <>
             {testString.substring(0, m.index)}
             <mark className="bg-amber-300 dark:bg-amber-500/40 text-amber-900 dark:text-amber-100 px-0.5 rounded-sm">
               {m[0]}
             </mark>
             {testString.substring(m.index + m[0].length)}
           </>
         );
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'রেজেক্স টেস্টার', en: 'Regex Tester' }} description={{ bn: 'রেগুলার এক্সপ্রেশন টেস্ট করুন', en: 'Test regular expressions in real-time' }} Icon={Terminal} bgGradient="bg-gradient-to-br from-slate-600 to-slate-800" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col">
        
        {/* Regex Input Card */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
           
           <div className="flex bg-[#0f172a] rounded-xl border border-white/10 overflow-hidden focus-within:border-cyan-500 transition-colors">
              <div className="px-4 flex items-center justify-center text-cyan-400 font-black font-mono select-none border-r border-white/10">
                 /
              </div>
              <input 
                 type="text" 
                 value={pattern}
                 onChange={(e) => setPattern(e.target.value)}
                 className="flex-1 bg-transparent px-4 py-3.5 text-slate-200 font-mono outline-none placeholder:text-slate-600"
                 placeholder="[a-zA-Z0-9]+"
                 spellCheck="false"
              />
              <div className="px-4 flex items-center justify-center text-cyan-400 font-black font-mono select-none border-x border-white/10">
                 /
              </div>
              <input 
                 type="text" 
                 value={flags}
                 onChange={(e) => setFlags(e.target.value)}
                 className="w-16 bg-transparent px-3 py-3.5 text-cyan-400 font-mono outline-none placeholder:text-slate-600 text-center"
                 placeholder="gim"
                 spellCheck="false"
              />
           </div>

           {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-rose-400 text-xs font-bold pl-2">
                 <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
           )}
        </div>

        {/* Test String Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex-1 flex flex-col min-h-[300px]">
           <div className="flex justify-between items-end mb-4">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300">
                 {language === 'bn' ? 'টেস্ট স্ট্রিং' : 'Test String'}
              </label>
              {pattern && !error && (
                 <span className={cn(
                    "px-3 py-1 text-xs font-black rounded-lg",
                    matchesCount > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                 )}>
                    {matchesCount} {language === 'bn' ? 'ম্যাচ পাওয়া গেছে' : 'Matches'}
                 </span>
              )}
           </div>
           
           <div className="relative flex-1 group">
              <textarea 
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-slate-800 dark:caret-white resize-none outline-none font-mono text-sm leading-relaxed z-10 p-4 rounded-xl"
                spellCheck="false"
              />
              <div 
                 className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 group-focus-within:border-cyan-500 transition-colors font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-hidden p-4 text-slate-800 dark:text-slate-200 pointer-events-none"
                 aria-hidden="true"
              >
                 {highlightedText}
              </div>
           </div>
           
           <p className="text-xs font-bold text-slate-400 mt-4 text-center">
              {language === 'bn' ? 'লুকানো টেক্সট এরিয়া ব্যবহার করে ম্যাজিক হাইলাইট করা হয়েছে' : 'Powered by underlying transparent textarea & magic highlights'}
           </p>
        </div>

      </div>
    </div>
  );
};
