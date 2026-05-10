import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Shuffle, ArrowLeft, Copy, Check } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const WordScramblerTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [text, setText] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [copied, setCopied] = useState(false);

  const shuffleWord = (word: string) => {
    const chars = word.split('');
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  };

  const handleScrambleChars = () => {
    // Keep words in order, but shuffle characters inside words
    const res = text.split(/\s+/).map(w => shuffleWord(w)).join(' ');
    setScrambled(res);
  };

  const handleScrambleWords = () => {
    // Shuffle the order of words
    const words = text.split(/\s+/).filter(Boolean);
    const res = shuffleWord(words.join('::SPLIT::')).split('::SPLIT::'); // Not a great way. Let's do array shuffle
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
    setScrambled(words.join(' '));
  };

  const handleCopy = async () => {
    if (!scrambled) return;
    try {
      await navigator.clipboard.writeText(scrambled);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'ওয়ার্ড স্ক্র্যাম্বলার', en: 'Word Scrambler' }} description={{ bn: 'শব্দ বা অক্ষরগুলো এলোমেলো করুন', en: 'Shuffle words or characters randomly' }} Icon={Shuffle} bgGradient="bg-gradient-to-br from-rose-400 to-red-500" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col max-w-4xl mx-auto w-full">
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-h-[150px]">
           <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-3 block">
              {language === 'bn' ? 'মূল লেখা' : 'Original String'}
           </label>
           <textarea 
             value={text}
             onChange={(e) => setText(e.target.value)}
             placeholder={language === 'bn' ? 'এখানে কিছু লিখুন...' : 'Write something here...'}
             className="flex-1 w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all dark:text-slate-200 resize-none font-medium leading-relaxed"
           />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
           <button 
             onClick={handleScrambleChars}
             disabled={!text}
             className="flex-1 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-rose-500/20"
           >
             <Shuffle className="w-5 h-5" />
             {language === 'bn' ? 'অক্ষর এলোমেলো করুন' : 'Scramble Characters'}
           </button>
           <button 
             onClick={handleScrambleWords}
             disabled={!text}
             className="flex-1 py-4 rounded-2xl font-black text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md"
           >
             <Shuffle className="w-5 h-5" />
             {language === 'bn' ? 'শব্দ এলোমেলো করুন' : 'Scramble Words'}
           </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-h-[150px]">
           <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300">
                 {language === 'bn' ? 'স্ক্র্যাম্বলড লেখা' : 'Scrambled Result'}
              </label>
              <button 
                onClick={handleCopy}
                disabled={!scrambled}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50",
                  copied ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
             >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}
             </button>
           </div>
           <textarea 
             readOnly
             value={scrambled}
             placeholder={language === 'bn' ? 'ফলাফল এখানে আসবে...' : 'Result will appear here...'}
             className="flex-1 w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all dark:text-slate-200 resize-none font-medium leading-relaxed"
           />
        </div>

      </div>
    </div>
  );
};
