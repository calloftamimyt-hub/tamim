import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Link, ArrowLeft, Link as LinkIcon, Copy, Check, Lock, Unlock } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const UrlEncodeTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInput = (val: string) => {
    setInput(val);
    setError('');
    
    if (!val) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(val));
      } else {
        setOutput(decodeURIComponent(val));
      }
    } catch (err) {
      setError(language === 'bn' ? 'ভুল ইউআরএল ফরম্যাট' : 'Invalid URL format');
      setOutput('');
    }
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    setInput('');
    setOutput('');
    setError('');
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
      <ToolHero title={{ bn: 'ইউআরএল এনকোডার', en: 'URL Encoder' }} description={{ bn: 'ইউআরএল এনকোড বা ডিকোড করুন', en: 'Encode or decode URL strings safely' }} Icon={Link} bgGradient="bg-gradient-to-br from-cyan-400 to-blue-500" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col">
          
        {/* Mode Toggles */}
        <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mx-auto w-full max-w-sm">
          <button
            onClick={() => handleModeChange('encode')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all",
              mode === 'encode' 
                ? "bg-slate-800 text-white shadow-md dark:bg-slate-700" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            <Lock className="w-4 h-4" /> {language === 'bn' ? 'এনকোড' : 'Encode'}
          </button>
          <button
            onClick={() => handleModeChange('decode')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all",
              mode === 'decode' 
                ? "bg-slate-800 text-white shadow-md dark:bg-slate-700" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            <Unlock className="w-4 h-4" /> {language === 'bn' ? 'ডিকোড' : 'Decode'}
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-h-[200px]">
          <div className="flex justify-between items-center mb-3">
             <span className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-cyan-500" />
                {mode === 'encode' 
                  ? (language === 'bn' ? 'সাধারণ ইউআরএল দিন' : 'Enter URL')
                  : (language === 'bn' ? 'এনকোডেড ইউআরএল দিন' : 'Enter Encoded URL')}
             </span>
          </div>
          <textarea 
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={mode === 'encode' ? 'https://example.com/search?q=hello world' : 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world'}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all dark:text-slate-200 resize-none"
          />
        </div>

        {/* Output Area */}
        <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-5 shadow-lg flex flex-col min-h-[200px] relative overflow-hidden">
          <LinkIcon className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 text-white" />
          
          <div className="relative z-10 flex justify-between items-center mb-4">
             <span className="text-sm font-black text-cyan-50">
                {language === 'bn' ? 'ফলাফল' : 'Result'}
             </span>
             <button 
                onClick={handleCopy}
                disabled={!output}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50",
                  copied ? "bg-white text-cyan-700" : "bg-white/10 text-white hover:bg-white/20"
                )}
             >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}
             </button>
          </div>

          <div className="relative z-10 flex-1 bg-black/20 rounded-xl p-4 border border-white/10 overflow-auto">
             {error ? (
                <p className="text-rose-300 text-sm font-bold">{error}</p>
             ) : (
                <p className="text-cyan-50 text-sm font-mono break-all whitespace-pre-wrap">{output || '...'}</p>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};
