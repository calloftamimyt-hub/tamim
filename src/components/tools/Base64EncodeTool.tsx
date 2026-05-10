import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Binary, ArrowLeft, Copy, Check, Lock, Unlock } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const Base64EncodeTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync processing
  const handleInput = (val: string) => {
    setInput(val);
    setError('');
    
    if (!val) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(val)));
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(val)));
        setOutput(decoded);
      }
    } catch (err) {
      setError(language === 'bn' ? 'ভুল ইনপুট ফরম্যাট' : 'Invalid input format');
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
      <ToolHero title={{ bn: 'বেস৬৪ এনকোড/ডিকোড', en: 'Base64 Enc/Dec' }} description={{ bn: 'টেক্সট থেকে Base64 কনভার্ট করুন', en: 'Convert text and base64 strings' }} Icon={Binary} bgGradient="bg-gradient-to-br from-slate-500 to-slate-700" onBack={onBack} />

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
                <Binary className="w-4 h-4 text-slate-500" />
                {mode === 'encode' 
                  ? (language === 'bn' ? 'সাধারণ টেক্সট দিন' : 'Enter Plain Text')
                  : (language === 'bn' ? 'Base64 স্ট্রিং দিন' : 'Enter Base64 String')}
             </span>
          </div>
          <textarea 
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Hello World' : 'SGVsbG8gV29ybGQ='}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all dark:text-slate-200 resize-none"
          />
        </div>

        {/* Output Area */}
        <div className="bg-slate-800 rounded-3xl p-5 shadow-lg flex flex-col min-h-[200px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-center mb-4">
             <span className="text-sm font-black text-slate-300">
                {language === 'bn' ? 'ফলাফল' : 'Result'}
             </span>
             <button 
                onClick={handleCopy}
                disabled={!output}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50",
                  copied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white hover:bg-white/20"
                )}
             >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}
             </button>
          </div>

          <div className="relative z-10 flex-1 bg-black/30 rounded-xl p-4 border border-white/5 overflow-auto">
             {error ? (
                <p className="text-rose-400 text-sm font-bold">{error}</p>
             ) : (
                <p className="text-emerald-300 text-sm font-mono break-all whitespace-pre-wrap">{output || '...'}</p>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};
