import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Braces, ArrowLeft, Copy, Check, FileJson, AlertCircle } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const JSONFormatTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'জেসন ফরম্যাট', en: 'JSON Formatter' }} description={{ bn: 'অগোছালো জেসনকে সুন্দর করুন', en: 'Beautify messy JSON data' }} Icon={Braces} bgGradient="bg-gradient-to-br from-amber-500 to-yellow-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 flex flex-col gap-6">
        
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
          <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Braces className="w-4 h-4 text-amber-500" />
            {language === 'bn' ? 'আপনার জেসন দিন' : 'Enter your JSON'}
          </label>
          <textarea
            value={input}
            onChange={(e) => {
               setInput(e.target.value);
               if (error) setError(null);
            }}
            placeholder='{"key": "value"}'
            className="w-full h-32 md:h-48 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-white resize-none"
          />
          <button
            onClick={handleFormat}
            className="mt-3 w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            {language === 'bn' ? 'ফরম্যাট করুন' : 'Format JSON'}
          </button>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 flex gap-3 text-rose-600 dark:text-rose-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output */}
        <AnimatePresence>
          {output && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-sm flex flex-col flex-1"
            >
               <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                     <FileJson className="w-4 h-4 text-emerald-400" />
                     <span className="text-sm font-bold text-slate-300">
                        {language === 'bn' ? 'আউটপুট' : 'Output'}
                     </span>
                  </div>
                  <button 
                     onClick={handleCopy}
                     className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        copied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-300 hover:bg-white/20"
                     )}
                  >
                     {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                     {copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}
                  </button>
               </div>
               <div className="bg-[#0f172a] rounded-xl p-4 overflow-auto flex-1 border border-white/5">
                  <pre className="text-xs md:text-sm text-amber-200 font-mono">
                     {output}
                  </pre>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
