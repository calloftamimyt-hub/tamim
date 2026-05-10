import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { RefreshCcw, ArrowLeft, Copy, Check } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export const TextReverserTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'chars' | 'words'>('chars');

  const reversed = () => {
    if (!text) return '';
    if (mode === 'chars') {
      return text.split('').reverse().join('');
    } else {
      return text.split(' ').reverse().join(' ');
    }
  };

  const result = reversed();

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'টেক্সট রিভার্সার', en: 'Text Reverser' }} description={{ bn: 'যেকোনো লেখা উল্টে ফেলুন', en: 'Reverse text characters or words' }} Icon={RefreshCcw} bgGradient="bg-gradient-to-br from-amber-400 to-orange-500" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col max-w-4xl mx-auto w-full">
        
        {/* Toggle Mode */}
        <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mx-auto w-full max-w-sm">
          <button
            onClick={() => setMode('chars')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all",
              mode === 'chars' 
                ? "bg-slate-800 text-white shadow-md dark:bg-slate-700" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
             {language === 'bn' ? 'অক্ষর উল্টান' : 'Reverse Chars'}
          </button>
          <button
            onClick={() => setMode('words')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all",
              mode === 'words' 
                ? "bg-slate-800 text-white shadow-md dark:bg-slate-700" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
             {language === 'bn' ? 'শব্দ উল্টান' : 'Reverse Words'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[300px]">
           {/* Input */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
             <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-3 block">
                {language === 'bn' ? 'মূল লেখা' : 'Original String'}
             </label>
             <textarea 
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder={language === 'bn' ? 'এখানে টাইপ করুন...' : 'Type here...'}
               className="flex-1 w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-slate-200 resize-none font-medium leading-relaxed"
             />
           </div>

           {/* Output */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300">
                   {language === 'bn' ? 'রিভার্সড লেখা' : 'Reversed Result'}
                </label>
                <button 
                  onClick={handleCopy}
                  disabled={!result}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50",
                    copied ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
               >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}
               </button>
             </div>
             <textarea 
               readOnly
               value={result}
               placeholder={language === 'bn' ? 'ফলাফল এখানে আসবে...' : 'Result will appear here...'}
               className="flex-1 w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-slate-200 resize-none font-medium leading-relaxed"
             />
           </div>
        </div>

      </div>
    </div>
  );
};
