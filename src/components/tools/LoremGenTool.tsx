import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { AlignJustify, ArrowLeft, Copy, Check } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export const LoremGenTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [type, setType] = useState<'paragraphs' | 'words'>('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Simple Lorem Ipsum generator
  const wordsList = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'curabitur', 
    'vel', 'hendrerit', 'libero', 'eleifend', 'blandit', 'nunc', 'ornare', 'odio', 'ut', 
    'orci', 'gravida', 'imperdiet', 'nullam', 'purus', 'lacinia', 'a', 'pretium', 'quis', 
    'congue', 'praesent', 'sagittis', 'laoreet', 'auctor', 'mauris', 'non', 'velit', 'eros', 
    'dictum', 'proin', 'accumsan', 'sapien', 'nec', 'massa', 'volutpat', 'venenatis', 'sed', 
    'eu', 'molestie', 'lacus', 'quisque', 'porttitor', 'ligula', 'dui', 'mollis', 'tempus', 
    'at', 'magna', 'vestibulum', 'turpis', 'ac', 'diam', 'tincidunt', 'id', 'condimentum', 
    'enim', 'sodales', 'in', 'hac', 'habitasse', 'platea', 'dictumst', 'aenean', 'neque', 
    'fusce', 'augue', 'leo', 'eget', 'semper', 'mattis', 'tortor', 'scelerisque', 'nulla'
  ];

  const generateLorem = () => {
    const num = Math.min(Math.max(count, 1), 100);
    
    if (type === 'words') {
       let result = '';
       for(let i=0; i<num; i++) {
         const word = wordsList[Math.floor(Math.random() * wordsList.length)];
         result += (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word) + ' ';
       }
       setOutput(result.trim() + '.');
    } else {
       // Paragraphs
       let result = [];
       for (let p=0; p<num; p++) {
         const numWords = Math.floor(Math.random() * 20) + 20; // 20-40 words per paragraph
         let paragraph = '';
         for (let i=0; i<numWords; i++) {
            const word = wordsList[Math.floor(Math.random() * wordsList.length)];
            paragraph += (i === 0 || i % 8 === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
            if (i === numWords - 1 || i % 8 === 7) {
                paragraph += '. ';
            } else {
                paragraph += ' ';
            }
         }
         result.push(paragraph.trim());
       }
       setOutput(result.join('\n\n'));
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'লোরেম ইপসাম জেনারেটর', en: 'Lorem Ipsum Generator' }} description={{ bn: 'ডামি টেক্সট তৈরি করুন', en: 'Generate placeholder dummy text' }} Icon={AlignJustify} bgGradient="bg-gradient-to-br from-stone-400 to-stone-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col max-w-4xl mx-auto w-full">
        
        {/* Settings Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-end gap-4">
           
           <div className="flex-1 w-full">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-2 block">
                 {language === 'bn' ? 'সংখ্যা (Count)' : 'Count'}
              </label>
              <input 
                type="number" min="1" max="100"
                value={count} 
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none dark:text-slate-200"
              />
           </div>

           <div className="flex-1 w-full">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-2 block">
                 {language === 'bn' ? 'ধরন' : 'Type'}
              </label>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                 <button onClick={() => setType('paragraphs')} className={cn("flex-1 py-1.5 rounded-md text-xs font-bold transition-all", type === 'paragraphs' ? "bg-white dark:bg-slate-700 shadow text-stone-700 dark:text-stone-300" : "text-slate-500")}>
                    Paragraphs
                 </button>
                 <button onClick={() => setType('words')} className={cn("flex-1 py-1.5 rounded-md text-xs font-bold transition-all", type === 'words' ? "bg-white dark:bg-slate-700 shadow text-stone-700 dark:text-stone-300" : "text-slate-500")}>
                    Words
                 </button>
              </div>
           </div>

           <button 
             onClick={generateLorem}
             className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-stone-700 hover:bg-stone-800 text-white font-bold transition-all shadow-sm active:scale-95 shrink-0"
           >
             {language === 'bn' ? 'জেনারেট করুন' : 'Generate'}
           </button>
        </div>

        {/* Output Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 min-h-[300px]">
           <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                 <AlignJustify className="w-4 h-4 text-stone-500" />
                 {language === 'bn' ? 'ফলাফল' : 'Result Text'}
              </label>
              <button 
                  onClick={handleCopy}
                  disabled={!output}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 border",
                    copied ? "bg-stone-50 border-stone-200 text-stone-700 dark:bg-stone-500/20 dark:border-stone-500/30 dark:text-stone-400" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:text-slate-700 dark:hover:bg-slate-700"
                  )}
               >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}
               </button>
           </div>
           <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-5 overflow-auto">
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                 {output || (language === 'bn' ? 'জেনারেট বাটনে ক্লিক করুন...' : 'Click generate button to create text...')}
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};
