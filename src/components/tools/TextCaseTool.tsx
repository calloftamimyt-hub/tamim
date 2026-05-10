import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Type, ArrowLeft, Copy, Check } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const TextCaseTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const applyCase = (type: string) => {
    if (!text) return;
    let newText = text;
    
    switch(type) {
      case 'UPPERCASE':
        newText = text.toUpperCase();
        break;
      case 'lowercase':
        newText = text.toLowerCase();
        break;
      case 'Title Case':
        newText = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
      case 'camelCase':
        newText = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '');
        break;
      case 'PascalCase':
        newText = text.replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase()).replace(/\s+/g, '');
        break;
      case 'snake_case':
        newText = text.trim().replace(/\s+/g, '_').toLowerCase();
        break;
      case 'kebab-case':
        newText = text.trim().replace(/\s+/g, '-').toLowerCase();
        break;
    }
    setText(newText);
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const cases = ['UPPERCASE', 'lowercase', 'Title Case', 'camelCase', 'PascalCase', 'snake_case', 'kebab-case'];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'টেক্সট কেস', en: 'Text Case Converter' }} description={{ bn: 'সহজেই লেখার ফরম্যাট পাল্টান', en: 'Convert text between different cases' }} Icon={Type} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col">
          
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center mb-3">
             <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-500" />
                {language === 'bn' ? 'আপনার টেক্সট' : 'Your Text'}
             </label>
             <button 
                onClick={handleCopy}
                disabled={!text}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50",
                  copied ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
             >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}
             </button>
          </div>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={language === 'bn' ? 'এখানে টাইপ করুন বা পেস্ট করুন...' : 'Type or paste your text here...'}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-slate-200 resize-none font-medium"
            spellCheck="false"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
           {cases.map(c => (
              <button
                key={c}
                onClick={() => applyCase(c)}
                disabled={!text}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95"
              >
                 {c}
              </button>
           ))}
        </div>

      </div>
    </div>
  );
};
