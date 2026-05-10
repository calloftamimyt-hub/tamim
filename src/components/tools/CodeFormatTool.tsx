import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Code, ArrowLeft, FileCode, Check, Copy } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import beautify from 'js-beautify';

export const CodeFormatTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'html' | 'js' | 'css'>('html');
  const [copied, setCopied] = useState(false);

  const formatCode = () => {
    if (!input) return;
    try {
      let result = '';
      if (lang === 'html') {
          result = beautify.html(input, { indent_size: 2, wrap_line_length: 80 });
      } else if (lang === 'js') {
          result = beautify.js(input, { indent_size: 2, space_in_empty_paren: true });
      } else if (lang === 'css') {
          result = beautify.css(input, { indent_size: 2 });
      }
      setInput(result);
    } catch(e) {
      console.error('Format failed', e);
    }
  };

  const handleCopy = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'কোড ফরম্যাটার', en: 'Code Formatter' }} description={{ bn: 'এইচটিএমএল, সিএসএস, জেএস', en: 'Format HTML, CSS, JavaScript' }} Icon={Code} bgGradient="bg-gradient-to-br from-blue-500 to-indigo-600" onBack={onBack} />

      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden max-w-5xl mx-auto w-full">
         <div className="flex gap-2 mb-4 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
            {(['html', 'css', 'js'] as const).map(l => (
               <button
                 key={l}
                 onClick={() => setLang(l)}
                 className={cn(
                   "px-4 py-2 rounded-xl text-sm font-black transition-all uppercase tracking-wide",
                   lang === l 
                     ? "bg-white shadow text-indigo-600 dark:bg-slate-700 dark:text-indigo-400" 
                     : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                 )}
               >
                 {l}
               </button>
            ))}
         </div>
         
         <div className="flex-1 relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex flex-col">
            <textarea 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={language === 'bn' ? 'আপনার কোড এখানে পেস্ট করুন...' : 'Paste your code here...'}
               className="flex-1 bg-transparent w-full h-full p-6 font-mono text-sm outline-none resize-none text-slate-800 dark:text-slate-200 leading-relaxed"
               spellCheck="false"
            />
            <Code className="absolute bottom-6 right-6 w-32 h-32 text-slate-900 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
         </div>
      </div>
    </div>
  );
};
